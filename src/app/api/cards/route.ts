// src/app/api/cards/route.ts
// ─────────────────────────────────────────────────────────────────────────────
//  GET  /api/cards  — list the authenticated user's own cards
//  POST /api/cards  — create a new card (with plan enforcement)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cardCreateSchema } from "@/lib/validation";
import { sanitizeCardContent } from "@/lib/sanitize";


// ── Plan limits ───────────────────────────────────────────────────────────────
// ONE_TIME: 1 card per purchase (creator pays once, gets one permanent card).
// PREMIUM : unlimited cards, no cap.
const PLAN_CARD_LIMITS: Record<string, number | null> = {
  ONE_TIME: 1,
  PREMIUM: null, // null = unlimited
};

// ── Helpers ───────────────────────────────────────────────────────────────────

import { randomBytes } from "crypto";

/** Generate a URL-safe slug that is guaranteed unique in the DB.
 *  Uses Node's built-in crypto — no extra dependency needed.
 */
async function generateUniqueSlug(): Promise<string> {
  const MAX_ATTEMPTS = 8;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    // e.g. "eid-a3f8bc2d"  — lowercase hex, 8 chars
    const suffix = randomBytes(5).toString("hex").slice(0, 8);
    const slug = `eid-${suffix}`;
    const existing = await prisma.card.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  // Extremely unlikely fallback — 16-char hex for near-zero collision odds
  return `eid-${randomBytes(8).toString("hex")}`;
}

/**
 * Re-fetch the user's live plan & expiry from the DB on every request.
 * This prevents the JWT stale-plan bug: a user whose plan expired or was
 * downgraded would otherwise keep their old JWT claims until re-login.
 */
async function getLivePlan(
  userId: string
): Promise<{ plan: string; planExpiresAt: Date | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  });
  if (!user) throw new Error("User not found");
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/cards
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Optional ?page= & ?limit= for pagination (dashboard uses defaults)
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip  = (page - 1) * limit;

    const [cards, total] = await prisma.$transaction([
      prisma.card.findMany({
        where:   { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id:            true,
          slug:          true,
          eidType:       true,
          theme:         true,
          recipientName: true,
          customMessage: true,
          isPublished:   true,
          isActive:      true,
          viewCount:     true,
          createdAt:     true,
          updatedAt:     true,
          // Exclude phone — privacy; exclude audio (large if stored inline)
        },
      }),
      prisma.card.count({ where: { userId } }),
    ]);

    // Also return live plan info so the dashboard always shows the correct state
    const { plan, planExpiresAt } = await getLivePlan(userId);

    return NextResponse.json({
      cards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
      plan,
      planExpiresAt,
    });
  } catch (error) {
    console.error("[GET /api/cards] error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/cards
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ── 2. Live plan check (never trust JWT alone) ────────────────────────────
    const { plan, planExpiresAt } = await getLivePlan(userId);

    // Check plan expiry for ONE_TIME plans (PREMIUM has no expiry)
    if (plan === "ONE_TIME" && planExpiresAt) {
      const now = new Date();
      if (planExpiresAt < now) {
        return NextResponse.json(
          {
            error: "Your plan has expired. Please renew to create more cards.",
            code:  "PLAN_EXPIRED",
          },
          { status: 403 }
        );
      }
    }

    // ── 3. Card count gate ────────────────────────────────────────────────────
    const cardLimit = PLAN_CARD_LIMITS[plan];
    if (cardLimit !== null) {
      const existingCount = await prisma.card.count({ where: { userId } });
      if (existingCount >= cardLimit) {
        return NextResponse.json(
          {
            error: `Your ${plan === "ONE_TIME" ? "One-Time" : plan} plan allows ${cardLimit} card${cardLimit === 1 ? "" : "s"}. Upgrade to Premium for unlimited cards.`,
            code:  "CARD_LIMIT_REACHED",
            limit: cardLimit,
            current: existingCount,
          },
          { status: 403 }
        );
      }
    }

    // ── 4. Parse & validate body ──────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = cardCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:  "Validation failed",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { eidType, theme, audio, phone, customMessage, recipientName } =
      parsed.data;

    // ── 5. Server-side sanitization (DOMPurify via jsdom) ─────────────────────
    // Strips ALL HTML/script from user-supplied free-text fields before DB write.
    const safe = sanitizeCardContent({ customMessage, recipientName });

    // Sanitize phone separately (digits + leading + only)
    const safePhone = phone.trim().replace(/[^\d+\-\s]/g, "").slice(0, 15);

    // ── 6. Generate unique slug ───────────────────────────────────────────────
    const slug = await generateUniqueSlug();

    // ── 7. Write to DB ────────────────────────────────────────────────────────
    // isPublished: true  ← fixes the bug where cards were never publicly visible
    // isActive:    true  ← default; admin can deactivate via dashboard
    const card = await prisma.card.create({
      data: {
        userId,
        slug,
        eidType,
        theme,
        audio,
        phone:         safePhone,
        customMessage: safe.customMessage,
        recipientName: safe.recipientName,
        isPublished:   true,   // BUG FIX: was defaulting to false, cards never visible
        isActive:      true,
      },
      select: {
        id:            true,
        slug:          true,
        eidType:       true,
        theme:         true,
        recipientName: true,
        isPublished:   true,
        createdAt:     true,
      },
    });

    // ── 8. Return 201 with card + share URL ───────────────────────────────────
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://eidcard.vercel.app";

    return NextResponse.json(
      {
        card,
        shareUrl: `${baseUrl}/card/${slug}`,
        message:  "Card created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/cards] error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

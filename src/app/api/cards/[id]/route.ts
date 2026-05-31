// src/app/api/cards/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
//  GET    /api/cards/:id  — fetch one of the user's own cards (for edit prefill)
//  PATCH  /api/cards/:id  — update a card's editable fields
//  DELETE /api/cards/:id  — hard-delete a card (existing, kept + fixed)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sanitizeCardContent } from "@/lib/sanitize";
import { z } from "zod";

// Only these fields can be patched by the owner.
// Theme, eidType, audio are immutable after creation (prevents abuse of
// ONE_TIME plan — user cannot swap to an entirely new card by editing).
const cardPatchSchema = z.object({
  customMessage: z.string().min(1).max(500).optional(),
  recipientName: z.string().max(100).optional(),
  phone:         z.string().min(11).max(15).optional(),
});

type RouteContext = { params: { id: string } };

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/cards/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const card = await prisma.card.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Ownership check — users may only read their own cards via this route.
    // Public card view goes through /card/[slug] instead.
    if (card.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error("[GET /api/cards/:id] error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/cards/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ── Live plan check before edit ───────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ONE_TIME expired users cannot edit cards
    if (user.plan === "ONE_TIME" && user.planExpiresAt) {
      if (user.planExpiresAt < new Date()) {
        return NextResponse.json(
          { error: "Your plan has expired. Renew to edit cards.", code: "PLAN_EXPIRED" },
          { status: 403 }
        );
      }
    }

    // ── Ownership ─────────────────────────────────────────────────────────────
    const card = await prisma.card.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (card.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Validate ──────────────────────────────────────────────────────────────
    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

    const parsed = cardPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { customMessage, recipientName, phone } = parsed.data;

    // ── Sanitize ──────────────────────────────────────────────────────────────
    const safe = sanitizeCardContent({
      customMessage: customMessage ?? "",
      recipientName,
    });

    // Build only the fields the user sent
    const updateData: Record<string, unknown> = {};
    if (customMessage !== undefined) updateData.customMessage = safe.customMessage;
    if (recipientName !== undefined) updateData.recipientName = safe.recipientName;
    if (phone         !== undefined) updateData.phone = phone.trim().replace(/[^\d+\-\s]/g, "").slice(0, 15);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.card.update({
      where: { id: params.id },
      data:  updateData,
      select: {
        id:            true,
        slug:          true,
        customMessage: true,
        recipientName: true,
        updatedAt:     true,
      },
    });

    return NextResponse.json({ card: updated, message: "Card updated" });
  } catch (error) {
    console.error("[PATCH /api/cards/:id] error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/cards/:id  (existing route — kept + ownership hardened)
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const card = await prisma.card.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Ownership check — admins use a separate admin route, not this one
    if (card.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.card.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Card deleted" });
  } catch (error) {
    console.error("[DELETE /api/cards/:id] error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

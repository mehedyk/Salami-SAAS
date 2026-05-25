import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cardCreateSchema } from "@/lib/validation";
import { generateSlug } from "@/lib/utils";
// FIX: Import sanitizeInput so user-supplied text is stripped of any HTML/script
// before it is written to the database and later rendered on card pages.
import { sanitizeInput } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = cardCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { eidType, theme, audio, phone, customMessage, recipientName } =
      validation.data;

    // FIX: Sanitize all free-text fields that come from the user.
    // Zod validates length/format but does NOT strip HTML tags or scripts.
    // sanitizeInput() runs DOMPurify with ALLOWED_TAGS:[] — strips everything.
    const safeMessage = sanitizeInput(customMessage);
    const safeName = recipientName ? sanitizeInput(recipientName) : recipientName;

    let slug = generateSlug();
    let existingSlug = await prisma.card.findUnique({ where: { slug } });
    while (existingSlug) {
      slug = generateSlug();
      existingSlug = await prisma.card.findUnique({ where: { slug } });
    }

    const card = await prisma.card.create({
      data: {
        userId: session.user.id,
        slug,
        eidType,
        theme,
        audio,
        phone,
        customMessage: safeMessage,
        recipientName: safeName,
        isPublished: true,
      },
    });

    return NextResponse.json({ slug: card.slug, id: card.id }, { status: 201 });
  } catch (error) {
    console.error("Card creation error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cards = await prisma.card.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Get cards error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

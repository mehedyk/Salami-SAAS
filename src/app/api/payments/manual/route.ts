import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { manualPaymentSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = manualPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { plan, amount, transactionId, senderNumber } = validation.data;

    // Check if transaction ID already exists
    const existingRequest = await prisma.paymentRequest.findUnique({
      where: { transactionId },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "This Transaction ID has already been submitted" },
        { status: 400 }
      );
    }

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId: session.user.id,
        plan,
        amount,
        transactionId,
        senderNumber,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { message: "Payment request submitted successfully. Please wait for admin approval.", id: paymentRequest.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Manual payment submission error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/payments/manual?latest=1
//  Returns the most recent payment request for the authenticated user.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payment = await prisma.paymentRequest.findFirst({
      where:   { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id:            true,
        plan:          true,
        amount:        true,
        transactionId: true,
        status:        true,
        adminNote:     true,
        createdAt:     true,
      },
    });

    return NextResponse.json({ payment: payment ?? null });
  } catch (error) {
    console.error("[GET /api/payments/manual] error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

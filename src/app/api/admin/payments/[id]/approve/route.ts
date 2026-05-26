import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, adminNote } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!paymentRequest) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }

    if (paymentRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Payment request already processed" }, { status: 400 });
    }

    // Start a transaction to update payment request and user plan
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedRequest = await tx.paymentRequest.update({
        where: { id: params.id },
        data: {
          status,
          adminNote,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      if (status === "APPROVED") {
        await tx.user.update({
          where: { id: paymentRequest.userId },
          data: {
            plan: paymentRequest.plan,
            planExpiresAt: paymentRequest.plan === "PREMIUM" ? null : new Date(Date.now() + 11 * 30 * 24 * 60 * 60 * 1000), // 11 months
          },
        });

        // Create notification for user
        await tx.notification.create({
          data: {
            userId: paymentRequest.userId,
            type: "USER",
            title: "Payment Approved!",
            message: `Your payment for ${paymentRequest.plan} plan has been approved. Enjoy your premium features!`,
          },
        });
      } else {
        // Create notification for user about rejection
        await tx.notification.create({
          data: {
            userId: paymentRequest.userId,
            type: "USER",
            title: "Payment Rejected",
            message: `Your payment request was rejected. Note: ${adminNote || "No reason provided."}`,
          },
        });
      }

      return updatedRequest;
    });

    return NextResponse.json({ message: `Payment request ${status.toLowerCase()}` });
  } catch (error) {
    console.error("Payment approval error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

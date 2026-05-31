// src/app/api/admin/payments/[id]/approve/route.ts
// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/admin/payments/:id/approve  — approve or reject a payment request
//
//  BUG FIX: The original file was an exact duplicate of the root route's broken
//  code. This is now the single correct home for approve/reject logic, with:
//    - Proper `params.id` usage (this is [id], not root)
//    - Idempotency guard (cannot re-process an already-processed request)
//    - Prisma transaction: update payment + update user plan + notification
//    - 11-month expiry for ONE_TIME, null (lifetime) for PREMIUM
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const ONE_TIME_EXPIRY_MS = 11 * 30 * 24 * 60 * 60 * 1000; // 11 months in ms

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ── Auth — admin or moderator only ────────────────────────────────────────
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    let body: { status?: unknown; adminNote?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { status, adminNote } = body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        { error: 'status must be "APPROVED" or "REJECTED"' },
        { status: 400 }
      );
    }

    const noteText =
      typeof adminNote === "string" ? adminNote.trim().slice(0, 500) : undefined;

    // ── Fetch payment request ─────────────────────────────────────────────────
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where:   { id: params.id },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!paymentRequest) {
      return NextResponse.json(
        { error: "Payment request not found" },
        { status: 404 }
      );
    }

    // ── Idempotency guard ─────────────────────────────────────────────────────
    if (paymentRequest.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Payment request is already ${paymentRequest.status.toLowerCase()}. It cannot be processed again.`,
          currentStatus: paymentRequest.status,
        },
        { status: 409 }
      );
    }

    // ── Transaction: update request + user plan + notification ─────────────────
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Stamp the payment request
      await tx.paymentRequest.update({
        where: { id: params.id },
        data: {
          status:     status as "APPROVED" | "REJECTED",
          adminNote:  noteText,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      if (status === "APPROVED") {
        // 2a. Upgrade user's plan
        await tx.user.update({
          where: { id: paymentRequest.userId },
          data: {
            plan: paymentRequest.plan,
            // PREMIUM → lifetime (null expiry); ONE_TIME → 11 months from now
            planExpiresAt:
              paymentRequest.plan === "PREMIUM"
                ? null
                : new Date(Date.now() + ONE_TIME_EXPIRY_MS),
          },
        });

        // 2b. Success notification
        await tx.notification.create({
          data: {
            userId:  paymentRequest.userId,
            type:    "USER",
            title:   "🎉 Payment Approved!",
            message: `Your ${paymentRequest.plan === "PREMIUM" ? "Premium (lifetime)" : "One-Time"} plan is now active. Start creating your Eid cards!`,
          },
        });
      } else {
        // 3. Rejection notification
        await tx.notification.create({
          data: {
            userId:  paymentRequest.userId,
            type:    "USER",
            title:   "Payment Not Approved",
            message: `Your payment request (${paymentRequest.transactionId}) was not approved.${noteText ? ` Reason: ${noteText}` : " Please contact support if you believe this is an error."}`,
          },
        });
      }
    });

    return NextResponse.json({
      message: `Payment request ${status.toLowerCase()} successfully`,
      status,
      paymentRequestId: params.id,
      userId: paymentRequest.userId,
    });
  } catch (error) {
    console.error("[POST /api/admin/payments/:id/approve] error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

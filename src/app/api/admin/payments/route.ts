// src/app/api/admin/payments/route.ts
// ─────────────────────────────────────────────────────────────────────────────
//  GET  /api/admin/payments  — list all payment requests (admin/mod only)
//
//  BUG FIX: The original file exported a POST handler that tried to use
//  `params.id` — but this is the ROOT route (/admin/payments), which receives
//  no URL params. That handler would crash on every call with "Cannot read
//  properties of undefined (reading 'id')".
//
//  The actual approve/reject action belongs in /admin/payments/[id]/approve,
//  which already has its own correct file. This file is now a clean GET-only
//  list endpoint.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "PENDING" | "APPROVED" | "REJECTED" | null (all)
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip   = (page - 1) * limit;

    const where =
      status && ["PENDING", "APPROVED", "REJECTED"].includes(status)
        ? { status: status as "PENDING" | "APPROVED" | "REJECTED" }
        : {};

    const [requests, total] = await prisma.$transaction([
      prisma.paymentRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id:    true,
              name:  true,
              email: true,
              plan:  true,
            },
          },
          reviewer: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.paymentRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/payments] error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalCards,
      totalViews,
      recentUsers,
      topCards,
      themeStats,
      planStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.card.count(),
      prisma.card.aggregate({ _sum: { viewCount: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, plan: true, createdAt: true },
      }),
      prisma.card.findMany({
        orderBy: { viewCount: "desc" },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.card.groupBy({
        by: ["theme"],
        _count: true,
        orderBy: { _count: { theme: "desc" } },
      }),
      prisma.user.groupBy({
        by: ["plan"],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalCards,
      totalViews: totalViews._sum.viewCount || 0,
      recentUsers,
      topCards,
      themeStats,
      planStats,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

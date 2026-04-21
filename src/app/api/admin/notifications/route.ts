import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notificationSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = notificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userId, type, title, message } = validation.data;

    if (type === "ALL_USERS") {
      const users = await prisma.user.findMany({ select: { id: true } });
      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type: "BROADCAST",
          title,
          message,
        })),
      });
    } else if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          type: "USER",
          title,
          message,
        },
      });
    }

    return NextResponse.json({ message: "Notification sent" }, { status: 201 });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

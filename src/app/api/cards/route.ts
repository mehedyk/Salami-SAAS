import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the card and verify it belongs to this user
    const card = await prisma.card.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (card.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.card.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Card deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete card error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

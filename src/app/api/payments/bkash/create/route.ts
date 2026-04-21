import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !["ONE_TIME", "PREMIUM"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = plan === "PREMIUM" ? 99 : 49;

    const mockPaymentUrl = `https://sandbox.bkash.com/payment/mock?amount=${amount}&plan=${plan}&userId=${session.user.id}`;

    return NextResponse.json({
      paymentUrl: mockPaymentUrl,
      trxId: `MOCK_${Date.now()}`,
      message: "This is a mock payment URL. bKash integration pending merchant account setup.",
    });
  } catch (error) {
    console.error("bKash create error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

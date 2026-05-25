import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return the same message — prevents email enumeration attacks
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, a reset email has been sent" },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry,
      },
    });

    // FIX 1: Removed console.log that was leaking the reset token to server logs.
    // FIX 2: Now actually sends the email via Resend instead of doing nothing.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set — cannot send password reset email.");
      // Still return success to avoid leaking config info to the caller
      return NextResponse.json(
        { message: "If an account exists, a reset email has been sent" },
        { status: 200 }
      );
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `EidCard <noreply@${new URL(appUrl!).hostname}>`,
        to: email,
        subject: "Reset your EidCard password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name ?? "there"},</p>
            <p>Someone requested a password reset for your EidCard account. 
               If that was you, click the button below. The link expires in 1 hour.</p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 24px;background:#16a34a;
                      color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
              Reset Password
            </a>
            <p style="margin-top:24px;color:#6b7280;font-size:14px;">
              If you didn't request this, you can safely ignore this email. 
              Your password will not change.
            </p>
            <p style="color:#6b7280;font-size:12px;">
              Or copy this link into your browser:<br/>
              <span style="word-break:break-all;">${resetUrl}</span>
            </p>
          </div>
        `,
      }),
    });

    return NextResponse.json(
      { message: "If an account exists, a reset email has been sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

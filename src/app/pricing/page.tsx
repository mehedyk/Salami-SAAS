"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import {
  Loader2,
  Check,
  Copy,
  AlertCircle,
  CheckCheck,
  QrCode,
  X,
} from "lucide-react";
import Image from "next/image";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Replace with your real personal bKash number and QR image path.
// Generate your personal bKash QR from the bKash app:
//   App → More → My QR Code → Save/Screenshot
// Then put the image in /public/bkash-qr.png
const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || "01XXXXXXXXX";
const BKASH_QR_IMAGE = "/bkash-qr.png"; // put your saved QR image here
// ─────────────────────────────────────────────────────────────────────────────

interface Plan {
  id: "ONE_TIME" | "PREMIUM";
  price: number;
}

export default function PricingPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [numberCopied, setNumberCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCopyNumber = async () => {
    await navigator.clipboard.writeText(BKASH_NUMBER);
    setNumberCopied(true);
    setTimeout(() => setNumberCopied(false), 2500);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan.id,
          amount: selectedPlan.price,
          transactionId: transactionId.trim(),
          senderNumber: senderNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({
          title: "Error",
          description: data.error || "Failed to submit payment request",
          variant: "destructive",
        });
      } else {
        setSubmitted(true);
      }
    } catch {
      addToast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-2 border-primary">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Payment Submitted!</h2>
            <p className="text-muted-foreground">
              We received your request. An admin will verify your bKash
              transaction and activate your plan — usually within{" "}
              <strong>1–12 hours</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll get a notification in your dashboard once it's approved.
            </p>
            <Button className="w-full" onClick={() => (window.location.href = "/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock premium features and share Eid joy without limits
          </p>
        </div>

        {!selectedPlan ? (
          // ── Plan cards ─────────────────────────────────────────────────────
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* One-Time */}
            <Card className="border-2 border-muted flex flex-col">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">One-Time</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="pt-4">
                  <span className="text-5xl font-bold">49</span>
                  <span className="text-muted-foreground ml-2">TK</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-3">
                  {["Create Eid cards", "All 10 themes", "Shareable links", "Valid for 11 months"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-auto"
                  variant="outline"
                  onClick={() => setSelectedPlan({ id: "ONE_TIME", price: 49 })}
                >
                  Choose One-Time
                </Button>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="border-2 border-primary relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Recommended
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>For unlimited Eid sharing</CardDescription>
                <div className="pt-4">
                  <span className="text-5xl font-bold">99</span>
                  <span className="text-muted-foreground ml-2">TK</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-3">
                  {[
                    { text: "Everything in One-Time", bold: true },
                    { text: "Lifetime access", bold: true },
                    { text: "Unlimited card editing" },
                    { text: "Priority support" },
                  ].map((f) => (
                    <li key={f.text} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className={f.bold ? "font-semibold" : ""}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-auto"
                  onClick={() => setSelectedPlan({ id: "PREMIUM", price: 99 })}
                >
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // ── Payment flow ───────────────────────────────────────────────────
          <Card className="max-w-md mx-auto border-2 border-primary">
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit mb-2"
                onClick={() => setSelectedPlan(null)}
              >
                ← Back to plans
              </Button>
              <CardTitle>Pay with bKash</CardTitle>
              <CardDescription>
                Send <strong>{selectedPlan.price} TK</strong> to our bKash
                Personal number, then submit your transaction ID below.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* ── Step 1: bKash number + QR ── */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-pink-800">
                  Step 1 — Send{" "}
                  <span className="text-pink-600 font-bold">
                    {selectedPlan.price} TK
                  </span>{" "}
                  via bKash Send Money
                </p>

                {/* Number row */}
                <div className="flex items-center justify-between bg-white border border-pink-200 rounded-md px-3 py-2">
                  <code className="font-bold text-lg tracking-wider text-pink-700">
                    {BKASH_NUMBER}
                  </code>
                  <div className="flex gap-1">
                    {/* Copy button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-pink-600 hover:text-pink-800 hover:bg-pink-100"
                      onClick={handleCopyNumber}
                      title="Copy number"
                    >
                      {numberCopied ? (
                        <CheckCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>

                    {/* QR button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-pink-600 hover:text-pink-800 hover:bg-pink-100"
                      onClick={() => setShowQR(true)}
                      title="Show QR code"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-pink-700 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  Use &apos;Send Money&apos; in bKash app. Do NOT use Request Money.
                </p>
              </div>

              {/* ── Step 2: submit TrxID ── */}
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  Step 2 — Enter your transaction details
                </p>
                <p className="text-xs text-muted-foreground">
                  After sending, bKash shows a confirmation with a TrxID (e.g.{" "}
                  <code className="bg-muted px-1 rounded">8AB1CD2EFG</code>).
                  Enter it below.
                </p>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senderNumber">Your bKash Number</Label>
                  <Input
                    id="senderNumber"
                    placeholder="01XXXXXXXXX"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    required
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID (TrxID)</Label>
                  <Input
                    id="transactionId"
                    placeholder="8AB1CD2EFG"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.trim())}
                    required
                    minLength={8}
                    maxLength={50}
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          Manual verification usually takes 1–12 hours.
        </p>
      </div>

      {/* ── QR Modal ── */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-7 w-7"
              onClick={() => setShowQR(false)}
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-pink-700">bKash QR Code</h3>
              <p className="text-xs text-muted-foreground">
                Open bKash → Scan QR → enter{" "}
                <strong>{selectedPlan?.price ?? ""} TK</strong> → Send Money
              </p>
            </div>

            {/* QR image — replace /public/bkash-qr.png with your screenshot */}
            <div className="border-2 border-pink-200 rounded-xl overflow-hidden bg-pink-50 flex items-center justify-center aspect-square">
              <Image
                src={BKASH_QR_IMAGE}
                alt="bKash QR Code"
                width={260}
                height={260}
                className="object-contain"
                onError={(e) => {
                  // Fallback if image not yet added
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex flex-col items-center gap-3 text-center p-6 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                        <p class="text-sm font-medium">QR image not added yet</p>
                        <p class="text-xs">Save your bKash QR from the app and put it at<br/><code class="bg-muted px-1 rounded">/public/bkash-qr.png</code></p>
                      </div>`;
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between bg-pink-50 border border-pink-200 rounded-lg px-3 py-2">
              <code className="font-bold text-pink-700">{BKASH_NUMBER}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-pink-600"
                onClick={handleCopyNumber}
              >
                {numberCopied ? (
                  <CheckCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

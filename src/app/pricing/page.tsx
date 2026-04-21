"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { Loader2, Check, Copy, AlertCircle } from "lucide-react";

const BKASH_NUMBER = "01XXXXXXXXX"; // Change this to your actual bKash number

export default function PricingPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: "ONE_TIME" | "PREMIUM", price: number } | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(BKASH_NUMBER);
    addToast({ title: "Copied!", description: "bKash number copied to clipboard." });
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
          transactionId,
          senderNumber,
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
        addToast({
          title: "Success!",
          description: "Your payment request has been submitted. An admin will verify it shortly.",
        });
        setSelectedPlan(null);
        setTransactionId("");
        setSenderNumber("");
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* One-Time Plan */}
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
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Create Eid cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>All 10 themes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Shareable links</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Valid for 11 months</span>
                  </li>
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

            {/* Premium Plan */}
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
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span><strong>Everything in One-Time</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span><strong>Lifetime access</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Unlimited card editing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Priority support</span>
                  </li>
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
          <Card className="max-w-md mx-auto border-2 border-primary animate-fade-in">
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
                Follow the instructions below to complete your payment for the {selectedPlan.id.replace("_", " ")} plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg space-y-3">
                <p className="text-sm font-medium">1. Send <span className="text-primary font-bold">{selectedPlan.price} TK</span> to this bKash Personal number:</p>
                <div className="flex items-center justify-between bg-background border rounded-md p-2">
                  <code className="font-bold text-lg">{BKASH_NUMBER}</code>
                  <Button variant="ghost" size="icon" onClick={handleCopyNumber}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Use &quot;Send Money&quot; option in your bKash app.
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID (TrxID)</Label>
                  <Input
                    id="transactionId"
                    placeholder="8X7Y6Z..."
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          Manual verification usually takes 1-12 hours.
        </p>
      </div>
    </div>
  );
}

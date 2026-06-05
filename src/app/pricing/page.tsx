// src/app/pricing/page.tsx
import Link from "next/link";
import { Check, Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  const plans = [
    { name: "One-Time", price: 49, highlight: false, desc: "Perfect for a single Eid", badge: null,
      features: ["Create 1 Eid card","All 10 stunning themes","Shareable link","Curated duas included","Valid 11 months"] },
    { name: "Premium",  price: 99, highlight: true,  desc: "Unlimited Eid sharing",   badge: "Most Popular",
      features: ["Everything in One-Time","Lifetime access","Unlimited cards","Edit cards anytime","Priority support"] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl">🌙</Link>
          <Link href="/" className="font-display font-bold text-lg text-foreground">EidCard</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-5 py-16">
        <div className="text-center mb-14">
          <h1 className="font-display font-bold text-5xl text-foreground mb-4">Simple Pricing</h1>
          <p className="font-body text-muted-foreground text-lg">Pay once with bKash. No subscriptions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {plans.map(p => (
            <div key={p.name} className={`relative rounded-3xl border p-8 flex flex-col ${p.highlight ? "border-amber-400/50 bg-gradient-to-b from-amber-400/5 to-transparent" : "border-border bg-card"}`}>
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="badge-premium px-5 py-1.5 text-xs"><Star className="w-3 h-3 fill-current" /> {p.badge}</span>
                </div>
              )}
              <h2 className="font-display font-bold text-2xl text-foreground mb-1">{p.name}</h2>
              <p className="font-body text-muted-foreground text-sm mb-5">{p.desc}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-display font-bold text-5xl text-foreground leading-none">{p.price}</span>
                <span className="font-mono text-amber-500 font-bold pb-1">TK</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-3 font-body text-sm">
                    <Check className={`w-4 h-4 shrink-0 ${p.highlight ? "text-amber-500" : "text-emerald-500"}`} />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`w-full text-center py-4 rounded-2xl font-display font-bold block transition-all ${p.highlight ? "btn-primary shadow-glow-gold" : "btn-ghost"}`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-5 flex gap-4 items-start">
          <span className="text-2xl shrink-0">💳</span>
          <div>
            <p className="font-display font-semibold text-foreground mb-1">Pay with bKash</p>
            <p className="font-body text-sm text-muted-foreground">Send via bKash Send Money, submit your TrxID, and admin verifies within 1–12 hours.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

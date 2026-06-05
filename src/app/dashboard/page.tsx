"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useToast } from "@/components/ui/toaster";
import {
  Plus, Copy, CheckCheck, Trash2, ExternalLink, Eye, Clock,
  Crown, ChevronRight, Moon, Sparkles, RefreshCw, X, CreditCard,
  CheckCircle2, Loader2, TrendingUp, Send, LogOut, Settings,
  Bell, BarChart2, AlertCircle, Menu,
} from "lucide-react";

type Card = {
  id:            string;
  slug:          string;
  eidType:       string;
  theme:         string;
  recipientName?: string;
  customMessage: string;
  isPublished:   boolean;
  isActive:      boolean;
  viewCount:     number;
  createdAt:     string;
};

type DashData = {
  cards:      Card[];
  pagination: { total: number; totalPages: number; page: number };
  plan:       "ONE_TIME" | "PREMIUM";
  planExpiresAt: string | null;
};

type PaymentStatus = {
  id:            string;
  plan:          string;
  amount:        number;
  transactionId: string;
  status:        "PENDING" | "APPROVED" | "REJECTED";
  createdAt:     string;
  adminNote?:    string;
} | null;

const THEME_COLORS: Record<string, { bg: string; accent: string }> = {
  theme1:  { bg: "#1e3a5f", accent: "#fcd34d" },
  theme2:  { bg: "#4a1c00", accent: "#fb923c" },
  theme3:  { bg: "#0f2027", accent: "#a7f3d0" },
  theme4:  { bg: "#064e3b", accent: "#6ee7b7" },
  theme5:  { bg: "#78350f", accent: "#fbbf24" },
  theme6:  { bg: "#f8fafc", accent: "#94a3b8" },
  theme7:  { bg: "#1e1b4b", accent: "#c4b5fd" },
  theme8:  { bg: "#1c1917", accent: "#f59e0b" },
  theme9:  { bg: "#7c2d12", accent: "#fdba74" },
  theme10: { bg: "#042f2e", accent: "#2dd4bf" },
};

const THEME_NAMES: Record<string, string> = {
  theme1: "🌙 Starlit Night", theme2: "🏮 Lantern Glow", theme3: "🕌 Sacred Mosque",
  theme4: "🌿 Green Paradise", theme5: "✨ Golden Elegance", theme6: "🤍 Minimalist White",
  theme7: "🌙 Crescent Dreams", theme8: "⬡ Geometric", theme9: "🌅 Sunset Harmony", theme10: "🕌 Modern Islamic",
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

// ── Payment modal ──────────────────────────────────────────────────────────
function PaymentModal({ onClose }: { onClose: () => void }) {
  const { addToast } = useToast();
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ plan: "PREMIUM", transactionId: "", senderNumber: "" });

  const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER ?? "01XXXXXXXXX";
  const AMOUNTS = { PREMIUM: 99, ONE_TIME: 49 };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.transactionId.trim() || form.transactionId.length < 8) {
      addToast({ title: "Invalid TrxID", description: "Transaction ID must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (!form.senderNumber.trim() || form.senderNumber.length < 11) {
      addToast({ title: "Invalid number", description: "Enter your full bKash number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: form.plan, amount: AMOUNTS[form.plan as keyof typeof AMOUNTS], transactionId: form.transactionId, senderNumber: form.senderNumber }),
      });
      const data = await res.json();
      if (!res.ok) { addToast({ title: "Error", description: data.error ?? "Something went wrong.", variant: "destructive" }); return; }
      setSubmitted(true);
      addToast({ title: "Payment submitted!", description: "Admin will verify within 1–12 hours.", variant: "success" });
    } catch {
      addToast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm">
      <div className="glass-dark rounded-3xl p-8 w-full max-w-md border border-white/10 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-white">Upgrade Plan</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-white mb-2">Payment Submitted!</h3>
            <p className="font-body text-white/55 text-sm mb-6">Your payment request is under review. Admin will activate your plan within 1–12 hours.</p>
            <button onClick={onClose} className="btn-primary rounded-2xl py-3 w-full">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Plan selector */}
            <div className="grid grid-cols-2 gap-3">
              {(["ONE_TIME","PREMIUM"] as const).map(p => (
                <button key={p} type="button" onClick={() => setForm(f => ({ ...f, plan: p }))}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 ${form.plan === p ? "border-amber-400/60 bg-amber-400/8" : "border-white/10 bg-white/3 hover:border-white/20"}`}>
                  <p className="font-display font-bold text-white text-sm">{p === "PREMIUM" ? "Premium" : "One-Time"}</p>
                  <p className="font-mono text-amber-400 font-bold text-lg">{AMOUNTS[p]} TK</p>
                </button>
              ))}
            </div>

            {/* bKash instructions */}
            <div className="bg-pink-500/10 border border-pink-500/25 rounded-2xl p-4">
              <p className="font-body text-sm text-white/80 mb-2 font-semibold">Send Money via bKash:</p>
              <p className="font-mono text-amber-400 font-bold text-lg tracking-wider">{BKASH_NUMBER}</p>
              <p className="font-body text-xs text-white/50 mt-1">Amount: {AMOUNTS[form.plan as keyof typeof AMOUNTS]} TK · Reference: EidCard</p>
            </div>

            <div>
              <label className="block font-body text-sm font-semibold text-white/80 mb-2">Transaction ID (TrxID)</label>
              <input type="text" placeholder="e.g. 8N7K2Q1P" value={form.transactionId}
                     onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-400/60 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)] transition-all" />
            </div>

            <div>
              <label className="block font-body text-sm font-semibold text-white/80 mb-2">Your bKash Number</label>
              <input type="text" placeholder="01XXXXXXXXX" value={form.senderNumber}
                     onChange={e => setForm(f => ({ ...f, senderNumber: e.target.value }))}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-400/60 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)] transition-all" />
            </div>

            <button type="submit" disabled={loading}
                    className="w-full btn-primary rounded-2xl py-4 font-display font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <><Send className="w-5 h-5" /> Submit Payment</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Card tile ──────────────────────────────────────────────────────────────
function CardTile({ card, onDelete, onCopy, copied }: {
  card:     Card;
  onDelete: (id: string) => void;
  onCopy:   (slug: string) => void;
  copied:   string | null;
}) {
  const theme = THEME_COLORS[card.theme] ?? { bg: "#1e3a5f", accent: "#fcd34d" };
  const url   = `${typeof window !== "undefined" ? window.location.origin : ""}/card/${card.slug}`;

  return (
    <div className="group rounded-3xl border border-border bg-card overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-card-hover">
      {/* Colour preview strip */}
      <div className="h-28 relative flex items-center justify-center text-4xl overflow-hidden"
           style={{ background: `linear-gradient(135deg, ${theme.bg}, ${theme.bg}cc)` }}>
        <span className="animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
          {THEME_NAMES[card.theme]?.split(" ")[0] ?? "🌙"}
        </span>
        {/* Status badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-body font-semibold ${card.isPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
          {card.isPublished ? "Published" : "Draft"}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <p className="font-display font-bold text-foreground text-base leading-snug line-clamp-1">
            {card.recipientName ? `For ${card.recipientName}` : "Eid Card"}
          </p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">{THEME_NAMES[card.theme] ?? card.theme}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {card.viewCount} views</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(card.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button onClick={() => onCopy(card.slug)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-500 text-xs font-body font-semibold transition-all">
            {copied === card.slug ? <><CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
          </button>
          <Link href={`/card/${card.slug}`} target="_blank" rel="noopener"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-body font-semibold transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> View
          </Link>
          <button onClick={() => onDelete(card.id)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-body font-semibold transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
function DashboardInner() {
  const { data: session, status } = useSession();
  const router     = useRouter();
  const params     = useSearchParams();
  const { addToast } = useToast();

  const [data,         setData]         = useState<DashData | null>(null);
  const [payment,      setPayment]      = useState<PaymentStatus>(null);
  const [loading,      setLoading]      = useState(true);
  const [copied,       setCopied]       = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [sideOpen,     setSideOpen]     = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchDash = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, payRes] = await Promise.all([
        fetch("/api/cards"),
        fetch("/api/payments/manual?latest=1"),
      ]);
      const [dashJson, payJson] = await Promise.all([dashRes.json(), payRes.json()]);
      if (dashRes.ok)  setData(dashJson);
      if (payRes.ok)   setPayment(payJson.payment);
    } catch {
      addToast({ title: "Error", description: "Failed to load dashboard.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (status === "authenticated") fetchDash();
  }, [status, fetchDash]);

  // Show success toast when card just created
  useEffect(() => {
    if (params.get("created") === "1") {
      addToast({ title: "Card created! 🎉", description: "Your Eid card is live and shareable.", variant: "success" });
      window.history.replaceState({}, "", "/dashboard");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (slug: string) => {
    const url = `${window.location.origin}/card/${slug}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
    addToast({ title: "Link copied!", description: url, variant: "success" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this card? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData(d => d ? { ...d, cards: d.cards.filter(c => c.id !== id) } : d);
        addToast({ title: "Card deleted", variant: "default" });
      } else {
        addToast({ title: "Error", description: "Could not delete the card.", variant: "destructive" });
      }
    } finally {
      setDeleting(null);
    }
  };

  if (status === "loading" || (loading && !data)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-5 py-24">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-border overflow-hidden">
                <Skeleton className="h-28 rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isPremium = data?.plan === "PREMIUM";
  const cardCount = data?.cards.length ?? 0;
  const totalViews = data?.cards.reduce((s, c) => s + c.viewCount, 0) ?? 0;
  const canCreate = isPremium || cardCount === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <span className="font-display font-bold text-lg text-foreground">EidCard</span>
          </Link>
          <div className="flex items-center gap-3">
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className="text-xs font-body font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">Admin</Link>
            )}
            <button onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">

        {/* Welcome */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground mb-1">
              Your Dashboard 🌙
            </h1>
            <p className="font-body text-muted-foreground text-sm">
              {session?.user?.name ? `Welcome back, ${session.user.name.split(" ")[0]}` : "Manage your Eid cards"}
            </p>
          </div>
          {canCreate ? (
            <Link href="/dashboard/card/create"
                  className="btn-primary px-5 py-3 rounded-xl text-sm inline-flex shadow-glow-gold">
              <Plus className="w-4 h-4" /> Create Card
            </Link>
          ) : (
            <button onClick={() => setShowPayModal(true)}
                    className="btn-primary px-5 py-3 rounded-xl text-sm inline-flex shadow-glow-gold">
              <Crown className="w-4 h-4" /> Upgrade for More
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Cards",   value: cardCount,   icon: Sparkles },
            { label: "Views",   value: totalViews,  icon: TrendingUp },
            { label: "Plan",    value: data?.plan === "PREMIUM" ? "Premium" : "One-Time", icon: Crown },
            { label: "Status",  value: "Active",    icon: CheckCircle2 },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-2xl border border-border bg-card p-4">
                <Icon className="w-4 h-4 text-amber-500 mb-2" />
                <p className="font-display font-bold text-xl text-foreground">{s.value}</p>
                <p className="font-body text-xs text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Pending payment alert */}
        {payment?.status === "PENDING" && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-400/8 border border-amber-400/25 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-amber-300 text-sm">Payment under review</p>
              <p className="font-body text-amber-300/60 text-xs mt-0.5">TrxID: {payment.transactionId} · {payment.plan} plan · Admin will activate within 1–12 hours.</p>
            </div>
          </div>
        )}

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-border overflow-hidden">
                <Skeleton className="h-28 rounded-none" />
                <div className="p-5 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : cardCount === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-5 animate-float inline-block">🌙</div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">No cards yet</h2>
            <p className="font-body text-muted-foreground mb-8 max-w-sm mx-auto">Create your first beautiful Eid card and share the joy with your loved ones.</p>
            <Link href="/dashboard/card/create" className="btn-primary px-8 py-4 rounded-2xl text-base inline-flex shadow-glow-gold">
              <Plus className="w-5 h-5" /> Create Your First Card
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data?.cards.map(card => (
              <CardTile key={card.id} card={card} onDelete={handleDelete} onCopy={handleCopy} copied={copied} />
            ))}
            {!canCreate && (
              <button onClick={() => setShowPayModal(true)}
                      className="rounded-3xl border-2 border-dashed border-border hover:border-amber-400/40 bg-transparent hover:bg-amber-400/5 transition-all duration-300 p-8 flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
                <Crown className="w-8 h-8 text-amber-500/60" />
                <p className="font-display font-bold text-foreground">Upgrade to Premium</p>
                <p className="font-body text-sm text-muted-foreground">Create unlimited cards, edit anytime</p>
                <span className="badge-gold text-xs">99 TK one-time</span>
              </button>
            )}
          </div>
        )}

        {/* Upgrade CTA for ONE_TIME users with a card */}
        {!isPremium && cardCount > 0 && (
          <div className="mt-10 rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-transparent p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="font-display font-bold text-xl text-foreground mb-1">Unlock Premium</h3>
              <p className="font-body text-sm text-muted-foreground">Create unlimited cards and edit them anytime. Pay once, use forever.</p>
            </div>
            <button onClick={() => setShowPayModal(true)} className="btn-primary px-6 py-3 rounded-xl shrink-0 shadow-glow-gold">
              <Crown className="w-4 h-4" /> Upgrade — 99 TK
            </button>
          </div>
        )}
      </main>

      {showPayModal && <PaymentModal onClose={() => { setShowPayModal(false); fetchDash(); }} />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>}>
      <DashboardInner />
    </Suspense>
  );
}

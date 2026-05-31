"use client";

import {
  useState, useEffect, useCallback, useRef, Suspense,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toaster";
import { themes } from "@/components/themes";
import {
  Plus, Copy, CheckCheck, Trash2, ExternalLink,
  Eye, Clock, Crown, AlertCircle, ChevronRight,
  Moon, Sparkles, RefreshCw, X, CreditCard,
  CheckCircle2, Loader2, TrendingUp, Send,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Card = {
  id: string;
  slug: string;
  eidType: string;
  theme: string;
  recipientName?: string;
  customMessage: string;
  isPublished: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

type DashData = {
  cards: Card[];
  pagination: { total: number; totalPages: number; page: number };
  plan: "ONE_TIME" | "PREMIUM";
  planExpiresAt: string | null;
};

type PaymentStatus = {
  id: string;
  plan: string;
  amount: number;
  transactionId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  adminNote?: string;
} | null;

// ─── Theme colours map ────────────────────────────────────────────────────────
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

// ─── Skeleton block ───────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`}>&nbsp;</div>;
}

function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Plan badge ───────────────────────────────────────────────────────────────
function PlanBadge({
  plan, expiresAt,
}: {
  plan: string; expiresAt: string | null;
}) {
  const isPremium = plan === "PREMIUM";
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000))
    : null;
  const expiringSoon = daysLeft !== null && daysLeft < 30;

  return (
    <div
      className={`relative flex items-center gap-3 rounded-2xl p-4 border overflow-hidden
                  ${isPremium
                    ? "border-amber-400/40 bg-gradient-to-r from-amber-400/10 to-transparent"
                    : expiringSoon
                    ? "border-rose-400/40 bg-rose-400/5"
                    : "border-border bg-muted/40"}`}
    >
      {/* Animated glow for premium */}
      {isPremium && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-transparent
                        animate-shimmer" style={{ backgroundSize: "200%" }} />
      )}

      <div
        className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center
                    ${isPremium ? "bg-amber-400/20" : "bg-muted"}`}
      >
        <Crown className={`w-5 h-5 ${isPremium ? "text-amber-400 animate-pulse-glow" : "text-muted-foreground"}`} />
      </div>

      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-display font-bold text-sm text-foreground">
            {isPremium ? "Premium" : "One-Time"} Plan
          </p>
          {isPremium && (
            <span className="badge-premium text-[10px] px-2 py-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Lifetime
            </span>
          )}
        </div>
        <p className="font-body text-xs text-muted-foreground">
          {isPremium
            ? "Unlimited cards — forever"
            : daysLeft !== null
            ? expiringSoon
              ? `⚠️ Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
              : `Valid for ${daysLeft} more days`
            : "Active plan"}
        </p>
      </div>

      {!isPremium && (
        <Link
          href="#upgrade"
          className="relative z-10 shrink-0 btn-primary rounded-xl px-3 py-1.5 text-xs"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────
function StatsRow({ cards, plan }: { cards: Card[]; plan: string }) {
  const totalViews = cards.reduce((s, c) => s + c.viewCount, 0);
  const published  = cards.filter(c => c.isPublished && c.isActive).length;

  const stats = [
    { label: "Total Cards",  val: cards.length,  icon: Moon,       color: "text-amber-500" },
    { label: "Total Views",  val: totalViews,    icon: TrendingUp, color: "text-emerald-500" },
    { label: "Live Cards",   val: published,     icon: Eye,        color: "text-blue-500"   },
    { label: "Plan",         val: plan === "PREMIUM" ? "Premium" : "One-Time", icon: Crown, color: "text-purple-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bento-card py-4 reveal"
            style={{ "--i": i } as React.CSSProperties}
          >
            <Icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="font-display font-bold text-2xl text-foreground">{s.val}</p>
            <p className="font-body text-xs text-muted-foreground">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Payment status banner ────────────────────────────────────────────────────
function PaymentBanner({ payment, onDismiss }: { payment: PaymentStatus; onDismiss: () => void }) {
  if (!payment) return null;

  const config = {
    PENDING:  { bg: "bg-amber-400/10  border-amber-400/30",  icon: Clock,         iconCls: "text-amber-500",  label: "Payment Pending Review",    desc: `TrxID ${payment.transactionId} — admin will approve within 1–12 hours.` },
    APPROVED: { bg: "bg-emerald-400/10 border-emerald-400/30", icon: CheckCircle2, iconCls: "text-emerald-500", label: "Payment Approved! 🎉",      desc: "Your plan is now active. Start creating cards!" },
    REJECTED: { bg: "bg-rose-400/10   border-rose-400/30",   icon: AlertCircle,   iconCls: "text-rose-500",   label: "Payment Not Approved",       desc: payment.adminNote ?? "Please contact support for details." },
  }[payment.status];

  const Icon = config.icon;

  return (
    <div className={`relative flex items-start gap-4 rounded-2xl border p-4 mb-6 ${config.bg} animate-fade-up`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconCls}`} />
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm text-foreground">{config.label}</p>
        <p className="font-body text-xs text-muted-foreground mt-0.5">{config.desc}</p>
      </div>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────
function DeleteModal({
  card, onConfirm, onCancel, isDeleting,
}: {
  card: Card; onConfirm: () => void; onCancel: () => void; isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative z-10 glass rounded-3xl p-8 max-w-sm w-full animate-modal-in text-center">
        <div className="text-4xl mb-4">🗑️</div>
        <h3 className="font-display font-bold text-xl text-foreground mb-2">Delete this card?</h3>
        <p className="font-body text-sm text-muted-foreground mb-6">
          <span className="font-semibold text-foreground">
            {card.recipientName ? `Card for ${card.recipientName}` : "This card"}
          </span>{" "}
          will be permanently deleted. Anyone with the link will see a 404.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 btn-ghost rounded-xl py-3 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-rose-500 text-white
                       hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card tile ────────────────────────────────────────────────────────────────
function CardTile({
  card, index, onDelete,
}: {
  card: Card; index: number; onDelete: (card: Card) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const themeColors = THEME_COLORS[card.theme] ?? { bg: "#1e1b4b", accent: "#fcd34d" };
  const themeInfo   = themes.find(t => t.id === card.theme);
  const shareUrl    = `${typeof window !== "undefined" ? window.location.origin : ""}/card/${card.slug}`;
  const isExpired   = !card.isActive;

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="reveal group rounded-3xl border border-border bg-card overflow-hidden
                 transition-all duration-400 ease-spring"
      style={{
        "--i": index,
        transitionDelay: `${index * 60}ms`,
        boxShadow: hovered ? `0 20px 60px ${themeColors.accent}20, 0 8px 20px rgba(0,0,0,0.08)` : undefined,
        transform: hovered ? "translateY(-4px)" : undefined,
      } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Coloured theme preview header */}
      <div
        className="relative h-36 flex items-center justify-center overflow-hidden"
        style={{ background: themeColors.bg }}
      >
        {/* Glow orb */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${themeColors.accent}60 0%, transparent 60%)`,
          }}
        />

        {/* Theme emoji */}
        <span
          className="relative z-10 text-5xl transition-transform duration-400"
          style={{ transform: hovered ? "scale(1.15) translateY(-4px)" : "scale(1)" }}
        >
          {themeInfo?.preview ?? "🌙"}
        </span>

        {/* View count pill */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-medium"
          style={{ background: "rgba(0,0,0,0.4)", color: themeColors.accent, backdropFilter: "blur(8px)" }}
        >
          <Eye className="w-3 h-3" />
          {card.viewCount}
        </div>

        {/* Status pill */}
        <div
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-body font-medium
                      ${card.isPublished && card.isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"}`}
        >
          {card.isPublished && card.isActive ? "● Live" : "● Inactive"}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Title */}
        <div className="mb-3">
          <p className="font-display font-bold text-base text-foreground truncate">
            {card.recipientName ? `For ${card.recipientName}` : "Eid Card"}
          </p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            {themeInfo?.name ?? card.theme}
            {" · "}
            {card.eidType === "eid_al_fitr" ? "Eid Al-Fitr" : "Eid Al-Adha"}
          </p>
        </div>

        {/* Message preview */}
        <p className="font-body text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {card.customMessage}
        </p>

        {/* Created date */}
        <p className="font-body text-[10px] text-muted-foreground/60 mb-4">
          <Clock className="w-3 h-3 inline mr-1" />
          {new Date(card.createdAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Copy link */}
          <button
            onClick={copy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold font-body
                        transition-all duration-300
                        ${copied
                          ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                          : "bg-muted hover:bg-amber-400/10 hover:text-amber-600 border border-border hover:border-amber-400/30"}`}
          >
            {copied
              ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
          </button>

          {/* Open card */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted
                       hover:bg-blue-400/10 hover:text-blue-500 border border-border
                       hover:border-blue-400/30 transition-all duration-300"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Delete */}
          <button
            onClick={() => onDelete(card)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted
                       hover:bg-rose-400/10 hover:text-rose-500 border border-border
                       hover:border-rose-400/30 transition-all duration-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ hasPlan }: { hasPlan: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
      <div className="relative mb-6">
        <div className="text-7xl animate-float">🌙</div>
        {/* Orbiting stars */}
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-amber-400/60 animate-twinkle"
            style={{
              top: `${50 + 55 * Math.sin((i * Math.PI * 2) / 3)}%`,
              left: `${50 + 55 * Math.cos((i * Math.PI * 2) / 3)}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <h3 className="font-display font-bold text-2xl text-foreground mb-2">
        No cards yet
      </h3>
      <p className="font-body text-muted-foreground max-w-xs mb-8">
        {hasPlan
          ? "Create your first Eid card and share the joy with someone special."
          : "Submit a payment to activate your plan and start creating cards."}
      </p>

      {hasPlan ? (
        <Link href="/dashboard/card/create" className="btn-primary btn-morph rounded-2xl px-8 py-4 shadow-glow-gold">
          <Plus className="w-5 h-5" />
          Create Your First Card
        </Link>
      ) : (
        <a href="#upgrade" className="btn-primary btn-morph rounded-2xl px-8 py-4 shadow-glow-gold">
          <CreditCard className="w-5 h-5" />
          Activate Plan
        </a>
      )}
    </div>
  );
}

// ─── Upgrade / bKash panel ────────────────────────────────────────────────────
function UpgradePanel({ currentPlan, onSubmitted }: { currentPlan: string; onSubmitted: () => void }) {
  const { addToast } = useToast();
  const [selected, setSelected]   = useState<"ONE_TIME" | "PREMIUM">("ONE_TIME");
  const [txId, setTxId]           = useState("");
  const [senderNum, setSenderNum] = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const PLANS = [
    { id: "ONE_TIME" as const, name: "One-Time",  price: 49,  desc: "1 card · 11 months",     accent: "emerald" },
    { id: "PREMIUM"  as const, name: "Premium",   price: 99,  desc: "Unlimited · Lifetime",   accent: "gold"    },
  ];

  const amounts = { ONE_TIME: 49, PREMIUM: 99 };

  const handleSubmit = async () => {
    if (!txId.trim() || txId.length < 8) {
      addToast({ title: "Invalid TrxID", description: "Enter a valid bKash Transaction ID (min 8 chars).", variant: "destructive" });
      return;
    }
    if (!senderNum.trim() || senderNum.length < 11) {
      addToast({ title: "Invalid Number", description: "Enter the bKash number you sent from.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan:         selected,
          amount:       amounts[selected],
          transactionId: txId.trim(),
          senderNumber: senderNum.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast({ title: "Submission failed", description: data.error ?? "Try again.", variant: "destructive" });
      } else {
        setSubmitted(true);
        onSubmitted();
        addToast({ title: "Payment submitted! ✅", description: "Admin will approve within 1–12 hours." });
      }
    } catch {
      addToast({ title: "Network error", description: "Check your connection.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div id="upgrade" className="glass rounded-3xl p-8 text-center animate-scale-in">
        <div className="text-5xl mb-4 animate-float">✅</div>
        <h3 className="font-display font-bold text-xl text-foreground mb-2">Payment Submitted!</h3>
        <p className="font-body text-muted-foreground text-sm">
          Your request is under review. You&apos;ll be notified once approved — usually within 1–12 hours.
        </p>
      </div>
    );
  }

  return (
    <section id="upgrade" className="mt-12 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">
            {currentPlan === "PREMIUM" ? "Manage Plan" : "Upgrade Your Plan"}
          </h2>
          <p className="font-body text-xs text-muted-foreground">Pay via bKash · 1–12h activation</p>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 md:p-8">
        {/* Plan picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PLANS.map(plan => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-400
                            ${active
                              ? plan.accent === "gold"
                                ? "border-amber-400 shadow-glow-gold"
                                : "border-emerald-400 shadow-glow-emerald"
                              : "border-border hover:border-amber-400/30"}`}
              >
                {active && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-400
                                  flex items-center justify-center animate-scale-in">
                    <CheckCheck className="w-3.5 h-3.5 text-amber-900" />
                  </div>
                )}
                <p className="font-display font-bold text-lg text-foreground">{plan.name}</p>
                <p className="font-mono font-bold text-3xl text-amber-500 mt-1">৳{plan.price}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{plan.desc}</p>
              </button>
            );
          })}
        </div>

        {/* bKash instructions */}
        <div className="rounded-2xl bg-pink-500/5 border border-pink-500/20 p-5 mb-6">
          <p className="font-body text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            💳 bKash Payment Instructions
          </p>
          <ol className="space-y-2 font-body text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[10px] font-bold">1</span>
              Open bKash app → <strong className="text-foreground">Send Money</strong>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[10px] font-bold">2</span>
              Send{" "}
              <strong className="text-foreground font-mono">৳{amounts[selected]}</strong>
              {" "}to{" "}
              <strong className="text-foreground font-mono">
                {process.env.NEXT_PUBLIC_BKASH_NUMBER ?? "01XXXXXXXXX"}
              </strong>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[10px] font-bold">3</span>
              Copy the <strong className="text-foreground">Transaction ID</strong> and paste below
            </li>
          </ol>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block font-body text-sm font-semibold text-foreground mb-1.5">
              Transaction ID (TrxID)
            </label>
            <input
              type="text"
              placeholder="e.g. ABC12345XY"
              value={txId}
              onChange={e => setTxId(e.target.value.toUpperCase())}
              className="input-field font-mono"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-foreground mb-1.5">
              Your bKash Number (Sender)
            </label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={senderNum}
              onChange={e => setSenderNum(e.target.value)}
              className="input-field"
              maxLength={15}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full btn-primary btn-morph rounded-2xl py-4 text-base font-display font-bold
                       shadow-glow-gold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
              : <><Send className="w-5 h-5" /> Submit Payment Request</>}
          </button>
          <p className="font-body text-xs text-muted-foreground text-center">
            Admin reviews manually · Approval in 1–12 hours
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("revealed"); }),
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── Inner component that uses useSearchParams (must be inside Suspense) ──────
function DashboardSearchParamsHandler({ mounted, addToast }: { mounted: boolean; addToast: ReturnType<typeof useToast>["addToast"] }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const created = searchParams.get("created");
    if (created && mounted) {
      addToast({
        title: "Card created! 🎉",
        description: "Your Eid card is live and ready to share.",
      });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams, mounted, addToast]);

  return null;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router        = useRouter();
  const { data: session, status } = useSession();
  const { addToast }  = useToast();

  const [data, setData]               = useState<DashData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null);
  const [isDeleting, setIsDeleting]   = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [paymentDismissed, setPaymentDismissed] = useState(false);
  const [mounted, setMounted]         = useState(false);

  useReveal();

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res  = await fetch("/api/cards");
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch latest payment status for this user
  const fetchPaymentStatus = useCallback(async () => {
    try {
      const res  = await fetch("/api/payments/manual?latest=1");
      if (res.ok) {
        const json = await res.json();
        if (json.payment) setPaymentStatus(json.payment);
      }
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboard();
      fetchPaymentStatus();
    }
  }, [status, fetchDashboard, fetchPaymentStatus]);

  // Re-run reveal after data loads
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        const els = document.querySelectorAll(".reveal:not(.revealed)");
        const obs = new IntersectionObserver(
          entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("revealed"); }),
          { threshold: 0.08 }
        );
        els.forEach(el => obs.observe(el));
        return () => obs.disconnect();
      }, 100);
    }
  }, [loading]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cards/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setData(prev =>
          prev ? { ...prev, cards: prev.cards.filter(c => c.id !== deleteTarget.id) } : prev
        );
        addToast({ title: "Card deleted", description: "The card has been permanently removed." });
      } else {
        addToast({ title: "Delete failed", description: "Please try again.", variant: "destructive" });
      }
    } catch {
      addToast({ title: "Network error", description: "Check your connection.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (status === "loading" || !mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl animate-float">🌙</div>
          <div className="shimmer w-40 h-3 rounded-full" />
        </div>
      </div>
    );
  }

  const isPremium   = data?.plan === "PREMIUM";
  const canCreate   = isPremium || (data?.cards.length ?? 0) < 1;
  const userName    = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <>
      {/* Search params handler — must be in Suspense for static rendering */}
      <Suspense fallback={null}>
        <DashboardSearchParamsHandler mounted={mounted} addToast={addToast} />
      </Suspense>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          card={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Page */}
      <div className="min-h-screen bg-background">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 glass-dark border-b border-white/5">
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-moon-glow">🌙</span>
              <div>
                <p className="font-display font-bold text-base text-white leading-tight">
                  EidCard
                </p>
                <p className="font-body text-xs text-white/40">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh */}
              <button
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10
                           flex items-center justify-center transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 text-white/60 ${refreshing ? "animate-spin" : ""}`} />
              </button>

              {/* Create button */}
              {canCreate ? (
                <Link
                  href="/dashboard/card/create"
                  className="btn-primary rounded-xl px-4 py-2 text-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Card</span>
                </Link>
              ) : (
                <a
                  href="#upgrade"
                  className="btn-ghost rounded-xl px-4 py-2 text-sm flex items-center gap-1.5
                             text-amber-400 border-amber-400/30 hover:border-amber-400/60"
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">Upgrade</span>
                </a>
              )}

              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600
                              flex items-center justify-center font-bold text-amber-900 text-sm">
                {(session?.user?.name?.[0] ?? "U").toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <main className="max-w-5xl mx-auto px-5 py-10">

          {/* Greeting */}
          <div className="mb-8 animate-fade-up">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-1">
              Assalamu Alaikum, {userName} 👋
            </h1>
            <p className="font-body text-muted-foreground">
              {loading
                ? "Loading your cards…"
                : data?.cards.length
                ? `You have ${data.cards.length} card${data.cards.length === 1 ? "" : "s"} — ${data.cards.reduce((s, c) => s + c.viewCount, 0)} total views`
                : "Create your first Eid card and spread the joy."}
            </p>
          </div>

          {/* Payment banner */}
          {paymentStatus && !paymentDismissed && (
            <PaymentBanner
              payment={paymentStatus}
              onDismiss={() => setPaymentDismissed(true)}
            />
          )}

          {/* Plan badge */}
          {data && (
            <div className="mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <PlanBadge plan={data.plan} expiresAt={data.planExpiresAt} />
            </div>
          )}

          {/* Stats */}
          {data && !loading && <StatsRow cards={data.cards} plan={data.plan} />}

          {/* ── Cards section ─────────────────────────────────────────────── */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-foreground">
              Your Cards
            </h2>
            {data && data.cards.length > 0 && canCreate && (
              <Link
                href="/dashboard/card/create"
                className="flex items-center gap-1.5 text-sm font-body font-semibold
                           text-amber-500 hover:text-amber-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Card
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}

          {/* Card grid — staggered reveal */}
          {!loading && data && data.cards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.cards.map((card, i) => (
                <CardTile
                  key={card.id}
                  card={card}
                  index={i}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && data && data.cards.length === 0 && (
            <EmptyState hasPlan={!!data.plan} />
          )}

          {/* One-time limit warning */}
          {!loading && data && !isPremium && data.cards.length >= 1 && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl
                            bg-amber-400/8 border border-amber-400/20 animate-fade-up">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-bold text-sm text-foreground">
                  One-Time plan — 1 card limit reached
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  Upgrade to Premium for unlimited cards, lifetime access, and priority support.
                </p>
                <a href="#upgrade"
                   className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors">
                  Upgrade now <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* ── Upgrade panel ─────────────────────────────────────────────── */}
          {!loading && (
            <UpgradePanel
              currentPlan={data?.plan ?? "ONE_TIME"}
              onSubmitted={fetchPaymentStatus}
            />
          )}

        </main>
      </div>
    </>
  );
}

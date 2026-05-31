// src/app/card/[slug]/CardShareBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Copy, CheckCheck, Share2, Heart,
  ChevronUp, X, MessageCircle, Facebook,
} from "lucide-react";

interface Props {
  slug: string;
  recipientName?: string;
}

// ─── Heart micro-animation ────────────────────────────────────────────────────
function FloatingHeart({ x, y, id }: { x: number; y: number; id: number }) {
  return (
    <div
      key={id}
      className="pointer-events-none fixed z-[9999] select-none text-rose-400
                 animate-fade-up font-bold text-xl"
      style={{
        left:           x - 10,
        top:            y - 10,
        animationDuration: "0.9s",
        animationFillMode: "forwards",
      }}
    >
      ❤️
    </div>
  );
}

export default function CardShareBar({ slug, recipientName }: Props) {
  const [copied, setCopied]     = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible]   = useState(false);
  const [hearts, setHearts]     = useState<{ id: number; x: number; y: number }[]>([]);
  const [liked, setLiked]       = useState(false);
  const heartId = useRef(0);

  // Slide up after 1.2 s so the card animation plays first
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const cardUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/card/${slug}`
      : `/card/${slug}`;

  const eidMsg = `🌙 Eid Mubarak${recipientName ? ` ${recipientName}` : ""}! I made you a special Eid card 💝 ${cardUrl}`;

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = cardUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Native share ──────────────────────────────────────────────────────────
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `🌙 Eid Mubarak${recipientName ? ` ${recipientName}` : ""}`,
          text:  "I made you a special Eid card! Open it 💝",
          url:   cardUrl,
        });
      } catch { /* dismissed */ }
    } else {
      await handleCopy();
    }
  };

  // ── Heart / like ──────────────────────────────────────────────────────────
  const handleHeart = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id   = ++heartId.current;
    setHearts(prev => [
      ...prev,
      { id, x: rect.left + rect.width / 2, y: rect.top },
    ]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 1000);
    setLiked(true);
  };

  // ── Share targets ─────────────────────────────────────────────────────────
  const shareTargets = [
    {
      label: "WhatsApp",
      icon: "📱",
      href: `https://wa.me/?text=${encodeURIComponent(eidMsg)}`,
      bg: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20",
      text: "text-green-600",
    },
    {
      label: "Facebook",
      icon: "📘",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}`,
      bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
      text: "text-blue-600",
    },
    {
      label: "Messenger",
      icon: "💬",
      href: `https://m.me/?link=${encodeURIComponent(cardUrl)}`,
      bg: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
      text: "text-purple-600",
    },
    {
      label: "SMS",
      icon: "📩",
      href: `sms:?body=${encodeURIComponent(eidMsg)}`,
      bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
      text: "text-amber-600",
    },
  ];

  return (
    <>
      {/* Floating hearts */}
      {hearts.map(h => <FloatingHeart key={h.id} {...h} />)}

      {/* ── Main bar ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 transition-all duration-600 ease-spring
                    ${visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
      >
        {/* Expanded share panel — slides up from bar */}
        {expanded && (
          <div className="glass-dark border-t border-white/10 px-5 pt-5 pb-2 animate-slide-in-bottom">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-bold text-sm text-white">Share this card</p>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* URL strip */}
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 mb-4
                              border border-white/10">
                <p className="font-mono text-xs text-white/60 flex-1 truncate">{cardUrl}</p>
                <button
                  onClick={handleCopy}
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg
                              text-xs font-semibold transition-all duration-300
                              ${copied
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-400/20 text-amber-400 hover:bg-amber-400/30"}`}
                >
                  {copied
                    ? <><CheckCheck className="w-3 h-3" /> Copied!</>
                    : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>

              {/* Platform grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {shareTargets.map(t => (
                  <a
                    key={t.label}
                    href={t.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl
                                border transition-all duration-300 ${t.bg}`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className={`font-body text-[10px] font-semibold ${t.text}`}>
                      {t.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Collapsed bar ──────────────────────────────────────────────── */}
        <div className="glass-dark border-t border-white/10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">

            {/* Heart / like */}
            <button
              onClick={handleHeart}
              className={`flex items-center justify-center w-11 h-11 rounded-2xl
                          border transition-all duration-400 active:scale-90 shrink-0
                          ${liked
                            ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
                            : "bg-white/5 border-white/10 text-white/50 hover:text-rose-400 hover:border-rose-400/30"}`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-rose-400" : ""} transition-all duration-300`} />
            </button>

            {/* Copy link — primary pill */}
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
                          font-display font-bold text-sm transition-all duration-350
                          ${copied
                            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                            : "bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25"}`}
            >
              {copied
                ? <><CheckCheck className="w-4 h-4" /> Link Copied!</>
                : <><Copy className="w-4 h-4" /> Copy Link</>}
            </button>

            {/* Share expand toggle */}
            <button
              onClick={() => setExpanded(o => !o)}
              className={`flex items-center justify-center w-11 h-11 rounded-2xl border
                          transition-all duration-400 shrink-0
                          ${expanded
                            ? "bg-amber-400/20 border-amber-400/40 text-amber-400 rotate-180"
                            : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30"}`}
            >
              <ChevronUp className="w-5 h-5 transition-transform duration-400" />
            </button>

            {/* Native share (mobile) */}
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center w-11 h-11 rounded-2xl
                         bg-white/5 border border-white/10 text-white/60
                         hover:text-white hover:border-white/30 transition-all duration-400 shrink-0"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind sticky bar */}
      <div className="h-20" />
    </>
  );
}

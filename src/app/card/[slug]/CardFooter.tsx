// src/app/card/[slug]/CardFooter.tsx
// Minimal branded footer shown beneath every public card — themed for night sky.
"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function CardFooter() {
  return (
    <footer
      className="relative overflow-hidden py-10 px-5 text-center"
      style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(13,11,46,0.95) 40%, #0d0b2e 100%)",
      }}
    >
      {/* Subtle star dots */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-amber-300/40 animate-twinkle"
          style={{
            width:  Math.random() * 2 + 1 + "px",
            height: Math.random() * 2 + 1 + "px",
            top:    `${15 + i * 10}%`,
            left:   `${8 + i * 11}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      <div className="relative z-10">
        {/* Divider line */}
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent
                        mx-auto mb-6" />

        {/* Moon + brand */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl animate-moon-glow">🌙</span>
          <span className="font-display font-bold text-lg text-white/80">EidCard</span>
        </div>

        <p className="font-body text-xs text-white/35 mb-4">
          Spread the joy of Eid with a beautiful personalised card.
        </p>

        {/* CTA */}
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full
                     bg-amber-400/15 border border-amber-400/25 text-amber-300
                     font-body text-xs font-semibold
                     hover:bg-amber-400/25 hover:border-amber-400/45
                     transition-all duration-300 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create your own Eid card — free
        </Link>

        <p className="font-body text-[10px] text-white/20">
          © {new Date().getFullYear()} EidCard · Made with ❤️ for Bangladesh
        </p>
      </div>
    </footer>
  );
}

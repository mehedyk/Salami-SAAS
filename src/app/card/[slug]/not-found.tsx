// src/app/card/[slug]/not-found.tsx
// Shown when a card slug doesn't exist or the card is unpublished/inactive.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function CardNotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Starfield */}
      <div className="starfield absolute inset-0 pointer-events-none" />

      {/* Soft glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-amber-400/8 blur-3xl animate-float-slow pointer-events-none" />

      {/* Content */}
      <div
        className={`relative z-10 text-center transition-all duration-700
                    ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Broken moon */}
        <div className="relative mb-8 inline-block">
          <div className="text-8xl animate-float select-none">🌙</div>
          {/* Crack effect */}
          <div
            className="absolute inset-0 flex items-center justify-center
                       text-8xl opacity-20 select-none"
            style={{ filter: "blur(4px)" }}
          >
            🌙
          </div>
        </div>

        <div
          className={`transition-all duration-700 delay-150
                      ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <p className="font-body text-amber-400/70 text-sm font-semibold tracking-widest uppercase mb-3">
            404 · Card Not Found
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            This card has<br />
            <span className="text-gradient-hero">flown away 🕊️</span>
          </h1>
          <p className="font-body text-white/50 text-base max-w-sm mx-auto mb-10 leading-relaxed">
            The Eid card you&apos;re looking for doesn&apos;t exist,
            may have been deleted, or is no longer active.
          </p>
        </div>

        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center
                      transition-all duration-700 delay-300
                      ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <Link href="/" className="btn-primary btn-morph px-8 py-4 rounded-2xl shadow-glow-gold">
            <Sparkles className="w-5 h-5" />
            Create Your Own Card
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-ghost px-8 py-4 rounded-2xl text-white border-white/20 hover:border-white/40"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

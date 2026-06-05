// src/app/about/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "About" };
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl">🌙</Link>
          <Link href="/" className="font-display font-bold text-lg text-foreground">EidCard</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="font-display font-bold text-5xl text-foreground mb-6">About EidCard</h1>
        <div className="prose font-body text-muted-foreground space-y-5 leading-relaxed">
          <p className="text-lg text-foreground">EidCard is a platform made with love for Bangladeshis everywhere — to share the joy of Eid in a beautiful, meaningful way.</p>
          <p>We believe Eid greetings deserve more than a forwarded WhatsApp image. EidCard lets you create a stunning, personalised card with your own message, a handpicked Quranic dua, and a unique shareable link that works on any device.</p>
          <p>Our 10 themes are crafted with Islamic artistry — from serene night skies to warm lanterns, sacred mosque architecture to contemporary geometric patterns. Every card is designed to impress.</p>
          <h2 className="font-display font-bold text-2xl text-foreground mt-10 mb-4">Our Mission</h2>
          <p>To make Eid greetings feel personal, beautiful, and effortless — for everyone, everywhere.</p>
          <div className="mt-12">
            <Link href="/register" className="btn-primary px-8 py-4 rounded-2xl text-base inline-flex shadow-glow-gold">Create your first card</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

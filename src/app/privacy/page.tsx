// src/app/privacy/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl">🌙</Link>
          <Link href="/" className="font-display font-bold text-lg text-foreground">EidCard</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="font-display font-bold text-4xl text-foreground mb-8">Privacy Policy</h1>
        <div className="font-body text-muted-foreground space-y-6 leading-relaxed">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
          <section>
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">Data We Collect</h2>
            <p>We collect the information you provide when creating an account (name, email) and when creating cards (message, phone number, recipient name). We also store technical data such as your IP address for security purposes.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">How We Use Your Data</h2>
            <p>Your data is used solely to provide the EidCard service — to authenticate you, render your cards, and process payments. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">Third-Party Services</h2>
            <p>We use Google OAuth for authentication and MongoDB Atlas for database storage. Each has their own privacy policy. We integrate bKash for payment verification (manual process).</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">Your Rights</h2>
            <p>You may request deletion of your account and associated data at any time by contacting us. Published cards will be deactivated immediately upon account deletion.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">Contact</h2>
            <p>For privacy concerns, please reach out via the dashboard contact form or email us directly.</p>
          </section>
        </div>
      </main>
    </div>
  );
}

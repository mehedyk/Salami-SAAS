// src/app/terms/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service" };

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl">🌙</Link>
          <Link href="/" className="font-display font-bold text-lg text-foreground">EidCard</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="font-display font-bold text-4xl text-foreground mb-8">{title}</h1>
        <div className="font-body text-muted-foreground space-y-6 leading-relaxed">{children}</div>
      </main>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Page title="Terms of Service">
      <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
      <section>
        <h2 className="font-display font-bold text-2xl text-foreground mb-3">1. Acceptance</h2>
        <p>By using EidCard, you agree to these Terms. If you disagree, please do not use our service.</p>
      </section>
      <section>
        <h2 className="font-display font-bold text-2xl text-foreground mb-3">2. Account</h2>
        <p>You are responsible for maintaining the security of your account credentials. Please use a strong password and do not share your account.</p>
      </section>
      <section>
        <h2 className="font-display font-bold text-2xl text-foreground mb-3">3. Cards</h2>
        <p>You may only create cards containing lawful, respectful content. Cards with offensive, illegal, or harmful content will be removed and the account suspended.</p>
      </section>
      <section>
        <h2 className="font-display font-bold text-2xl text-foreground mb-3">4. Payments</h2>
        <p>Payments are processed manually via bKash. Refunds are not available once a plan is activated. Fraudulent payment submissions will result in permanent account termination.</p>
      </section>
      <section>
        <h2 className="font-display font-bold text-2xl text-foreground mb-3">5. Limitation of Liability</h2>
        <p>EidCard is provided as-is. We are not liable for any indirect, incidental, or consequential damages arising from use of the service.</p>
      </section>
    </Page>
  );
}

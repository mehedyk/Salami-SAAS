"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toaster";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [mounted,  setMounted]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [email,    setEmail]    = useState("");
  const [error,    setError]    = useState("");

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await res.json();
      // Always show success to prevent email enumeration
      setSent(true);
    } catch {
      addToast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12 relative overflow-hidden"
         style={{ background: "linear-gradient(135deg, #07061a 0%, #0d0b2e 40%, #1a1040 70%, #0a1628 100%)" }}>
      <div className="starfield absolute inset-0 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-amber-400/8 blur-3xl animate-float pointer-events-none" />

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <Link href="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors font-body text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        <div className="text-center mb-8">
          <div className="text-5xl mb-4 animate-float inline-block">🌙</div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Forgot password?</h1>
          <p className="font-body text-white/50 text-sm">We'll send a reset link to your email address.</p>
        </div>

        <div className="glass-dark rounded-3xl p-8 border border-white/10">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="font-display font-bold text-xl text-white mb-3">Check your email</h2>
              <p className="font-body text-white/55 text-sm leading-relaxed mb-6">
                If an account exists for <span className="text-amber-400 font-medium">{email}</span>, we've sent a password reset link. It may take a few minutes to arrive.
              </p>
              <Link href="/login" className="btn-primary w-full py-3 rounded-2xl text-base font-display font-bold text-center block">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block font-body text-sm font-semibold text-white/80 mb-2">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (error) setError(""); }}
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 font-body text-sm text-white placeholder:text-white/25 transition-all duration-200 outline-none
                      ${error ? "border-rose-500/60 focus:border-rose-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : "border-white/10 focus:border-amber-400/60 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)]"}`}
                  />
                </div>
                {error && <p className="font-body text-xs text-rose-400 mt-1.5 animate-fade-up">{error}</p>}
              </div>
              <button type="submit" disabled={loading}
                      className="w-full btn-primary rounded-2xl py-4 text-base font-display font-bold shadow-glow-gold flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending…</> : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

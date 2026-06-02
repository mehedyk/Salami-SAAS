// src/app/(auth)/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/ui/toaster";
import {
  Eye, EyeOff, Loader2, ArrowRight,
  Mail, Lock, Sparkles,
} from "lucide-react";

function LoginInner() {
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const { addToast }   = useToast();
  const [mounted, setMounted]           = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [showPw, setShowPw]             = useState(false);
  const [formData, setFormData]         = useState({ email: "", password: "" });
  const [errors, setErrors]             = useState<Record<string, string>>({});

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  // Show meaningful error when NextAuth redirects back with ?error=
  useEffect(() => {
    const err = searchParams.get("error");
    if (!err) return;
    const msg =
      err === "OAuthAccountNotLinked"
        ? "This email is linked to a different sign-in method. Try Google or use your password."
        : err === "CredentialsSignin"
        ? "Invalid email or password."
        : "Sign-in failed. Please try again.";
    addToast({ title: "Sign-in error", description: msg, variant: "destructive" });
    // Clean up the URL
    window.history.replaceState({}, "", "/login");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email)                        e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.password)                     e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email:    formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        addToast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
        setErrors({ password: "Invalid email or password" });
      } else {
        addToast({ title: "Welcome back! 🌙", description: "Redirecting to your dashboard…" });
        router.push("/dashboard");
      }
    } catch {
      addToast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const set = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-5 py-12 relative overflow-hidden">
      {/* Starfield */}
      <div className="starfield absolute inset-0 pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/5 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/5 w-64 h-64 rounded-full bg-amber-400/8 blur-3xl animate-float-slow pointer-events-none" />

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700
                    ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 animate-float inline-block">🌙</div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            Welcome back
          </h1>
          <p className="font-body text-white/50 text-sm">
            Sign in to create and share your Eid cards
          </p>
        </div>

        {/* Glass form card */}
        <div className="glass-dark rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label className="block font-body text-sm font-semibold text-white/80 mb-2">
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                 text-white/30 group-focus-within:text-amber-400 transition-colors duration-200" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={set("email")}
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3
                              font-body text-sm text-white placeholder:text-white/25
                              transition-all duration-250 outline-none
                              ${errors.email
                                ? "border-rose-500/60 focus:border-rose-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                                : "border-white/10 focus:border-amber-400/60 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)]"}`}
                />
              </div>
              {errors.email && (
                <p className="font-body text-xs text-rose-400 mt-1.5 animate-fade-up">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-body text-sm font-semibold text-white/80">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="font-body text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                 text-white/30 group-focus-within:text-amber-400 transition-colors duration-200" />
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={set("password")}
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-11 py-3
                              font-body text-sm text-white placeholder:text-white/25
                              transition-all duration-250 outline-none
                              ${errors.password
                                ? "border-rose-500/60 focus:border-rose-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                                : "border-white/10 focus:border-amber-400/60 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)]"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30
                             hover:text-white/60 transition-colors duration-200"
                >
                  {showPw
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye    className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="font-body text-xs text-rose-400 mt-1.5 animate-fade-up">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary btn-morph rounded-2xl py-4 text-base font-display font-bold
                         shadow-glow-gold flex items-center justify-center gap-2
                         disabled:opacity-60 disabled:pointer-events-none mt-2"
            >
              {isLoading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0d0b2e] px-3 font-body text-xs text-white/30">
                or continue with
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl
                       bg-white/5 border border-white/10 text-white/70
                       hover:bg-white/10 hover:text-white hover:border-white/20
                       font-body text-sm font-medium transition-all duration-300"
          >
            {/* Google G icon (inline SVG — no extra dep) */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer link */}
        <p className="text-center font-body text-sm text-white/40 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

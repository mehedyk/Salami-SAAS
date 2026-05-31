// src/app/(auth)/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/ui/toaster";
import {
  Eye, EyeOff, Loader2, ArrowRight,
  Mail, Lock, User, Check, X,
} from "lucide-react";

// Password strength rules
const PW_RULES = [
  { label: "At least 8 characters",    test: (p: string) => p.length >= 8       },
  { label: "One uppercase letter",      test: (p: string) => /[A-Z]/.test(p)    },
  { label: "One number",               test: (p: string) => /\d/.test(p)        },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed  = PW_RULES.filter(r => r.test(password)).length;
  const pct     = (passed / PW_RULES.length) * 100;
  const color   = pct === 100 ? "bg-emerald-500" : pct >= 66 ? "bg-amber-400" : "bg-rose-500";

  return (
    <div className="mt-2 space-y-2 animate-fade-up">
      {/* Bar */}
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Rules */}
      <div className="space-y-1">
        {PW_RULES.map(rule => {
          const ok = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-2">
              {ok
                ? <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                : <X     className="w-3 h-3 text-rose-400/60 shrink-0" />}
              <span className={`font-body text-xs ${ok ? "text-emerald-400" : "text-white/35"}`}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router       = useRouter();
  const { addToast } = useToast();
  const [mounted, setMounted]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [showCPw, setShowCPw]     = useState(false);
  const [formData, setFormData]   = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim())                         e.name    = "Full name is required";
    if (!formData.email)                               e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))    e.email   = "Enter a valid email";
    if (!formData.password)                            e.password = "Password is required";
    else if (formData.password.length < 8)             e.password = "Password must be at least 8 characters";
    if (!formData.confirmPassword)                     e.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:     formData.name.trim(),
          email:    formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: "An account with this email already exists" });
          addToast({ title: "Email taken", description: "Try signing in instead.", variant: "destructive" });
        } else {
          addToast({ title: "Registration failed", description: data.error ?? "Please try again.", variant: "destructive" });
        }
        return;
      }

      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        addToast({ title: "Welcome to EidCard! 🌙", description: "Your account is ready. Let's create your first card!" });
        router.push("/dashboard");
      } else {
        addToast({ title: "Account created!", description: "Please sign in to continue." });
        router.push("/login");
      }
    } catch {
      addToast({ title: "Network error", description: "Check your connection and try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const set = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  };

  const inputCls = (field: string) =>
    `w-full bg-white/5 border rounded-xl py-3 font-body text-sm text-white
     placeholder:text-white/25 transition-all duration-250 outline-none
     ${errors[field]
       ? "border-rose-500/60 focus:border-rose-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
       : "border-white/10 focus:border-amber-400/60 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)]"}`;

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-5 py-12 relative overflow-hidden">
      <div className="starfield absolute inset-0 pointer-events-none" />
      <div className="absolute top-1/3 left-1/5 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-400/8 blur-3xl animate-float-slow pointer-events-none" />

      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700
                    ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 animate-float inline-block">✨</div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            Create your account
          </h1>
          <p className="font-body text-white/50 text-sm">
            Free to start — your first card is on us
          </p>
        </div>

        {/* Glass form */}
        <div className="glass-dark rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Name */}
            <div>
              <label className="block font-body text-sm font-semibold text-white/80 mb-2">
                Full name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                 text-white/30 group-focus-within:text-amber-400 transition-colors duration-200" />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Fatima Rahman"
                  value={formData.name}
                  onChange={set("name")}
                  className={`${inputCls("name")} pl-10 pr-4`}
                />
              </div>
              {errors.name && <p className="font-body text-xs text-rose-400 mt-1.5 animate-fade-up">{errors.name}</p>}
            </div>

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
                  className={`${inputCls("email")} pl-10 pr-4`}
                />
              </div>
              {errors.email && <p className="font-body text-xs text-rose-400 mt-1.5 animate-fade-up">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block font-body text-sm font-semibold text-white/80 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                 text-white/30 group-focus-within:text-amber-400 transition-colors duration-200" />
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={set("password")}
                  className={`${inputCls("password")} pl-10 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30
                             hover:text-white/60 transition-colors duration-200"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password
                ? <p className="font-body text-xs text-rose-400 mt-1.5 animate-fade-up">{errors.password}</p>
                : <PasswordStrength password={formData.password} />}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block font-body text-sm font-semibold text-white/80 mb-2">
                Confirm password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                 text-white/30 group-focus-within:text-amber-400 transition-colors duration-200" />
                <input
                  type={showCPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Same password again"
                  value={formData.confirmPassword}
                  onChange={set("confirmPassword")}
                  className={`${inputCls("confirmPassword")} pl-10 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowCPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30
                             hover:text-white/60 transition-colors duration-200"
                >
                  {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="font-body text-xs text-rose-400 mt-1.5 animate-fade-up">
                  {errors.confirmPassword}
                </p>
              )}
              {/* Match indicator */}
              {formData.confirmPassword && !errors.confirmPassword && (
                <p className={`font-body text-xs mt-1.5 flex items-center gap-1 animate-fade-up
                               ${formData.password === formData.confirmPassword ? "text-emerald-400" : "text-rose-400"}`}>
                  {formData.password === formData.confirmPassword
                    ? <><Check className="w-3 h-3" /> Passwords match</>
                    : <><X className="w-3 h-3" /> Passwords don&apos;t match</>}
                </p>
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
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account…</>
                : <>Create Account <ArrowRight className="w-5 h-5" /></>}
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
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Terms note */}
          <p className="text-center font-body text-[11px] text-white/25 mt-4">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">
              Terms of Service
            </Link>
          </p>
        </div>

        {/* Footer link */}
        <p className="text-center font-body text-sm text-white/40 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

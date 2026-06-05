"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { THEME_CONFIGS } from "@/components/themes";
import { useToast } from "@/components/ui/toaster";
import {
  Moon, Star, Music, MessageSquare, Check, Loader2,
  ArrowLeft, ArrowRight, ChevronRight, Sparkles, Copy, CheckCheck,
} from "lucide-react";
import Link from "next/link";

const EID_TYPES = [
  { id: "eid_al_fitr", label: "Eid Al-Fitr", emoji: "🌙", desc: "End of Ramadan — celebration of fasting" },
  { id: "eid_al_adha",  label: "Eid Al-Adha",  emoji: "🐑", desc: "Festival of Sacrifice — honouring Ibrahim (AS)" },
];

const AUDIO_OPTIONS = [
  { id: "audio1", name: "Islamic Nasheed",    emoji: "🎵", desc: "Uplifting vocal harmony" },
  { id: "audio2", name: "Traditional Darbar", emoji: "🥁", desc: "Classic Eid percussion" },
  { id: "audio3", name: "Soft Ambient",       emoji: "🌙", desc: "Peaceful atmospheric tones" },
  { id: "audio4", name: "Quranic Recitation", emoji: "📖", desc: "Blessed Quranic verses" },
];

const STEPS = [
  { n: 1, label: "Eid Type",  icon: Moon },
  { n: 2, label: "Theme",     icon: Star },
  { n: 3, label: "Audio",     icon: Music },
  { n: 4, label: "Message",   icon: MessageSquare },
  { n: 5, label: "Review",    icon: Check },
];

type FormData = {
  eidType:       string;
  theme:         string;
  audio:         string;
  phone:         string;
  customMessage: string;
  recipientName: string;
};

const INITIAL: FormData = {
  eidType: "", theme: "", audio: "", phone: "", customMessage: "", recipientName: "",
};

export default function CreateCardPage() {
  const { data: session, status } = useSession();
  const router     = useRouter();
  const { addToast } = useToast();

  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState<FormData>(INITIAL);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [cardSlug, setCardSlug] = useState<string | null>(null);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const set = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  }, [errors]);

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1 && !form.eidType)        e.eidType       = "Please select an Eid type";
    if (s === 2 && !form.theme)          e.theme         = "Please select a theme";
    if (s === 3 && !form.audio)          e.audio         = "Please select audio";
    if (s === 4) {
      if (!form.customMessage.trim())    e.customMessage = "A personal message is required";
      if (form.customMessage.length > 500) e.customMessage = "Message too long (max 500 chars)";
      if (!form.phone.trim())            e.phone         = "Your phone number is required";
      if (form.phone.length < 11)        e.phone         = "Enter a valid phone number";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (!validateStep(step)) return;
    if (step < 5) setStep(s => s + 1);
  };

  const back = () => { if (step > 1) setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validateStep(4)) { setStep(4); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast({ title: "Error", description: data.error ?? "Could not create card.", variant: "destructive" });
        return;
      }
      setCardSlug(data.card.slug);
      addToast({ title: "Card created! 🎉", description: "Your Eid card is ready to share!", variant: "success" });
    } catch {
      addToast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!cardSlug) return;
    navigator.clipboard.writeText(`${window.location.origin}/card/${cardSlug}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activeTheme = THEME_CONFIGS.find(t => t.id === form.theme);

  // ── Success screen ───────────────────────────────────────────────────────
  if (cardSlug) {
    const cardUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/card/${cardSlug}`;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5 py-12">
        <div className="text-center max-w-md w-full">
          <div className="text-7xl mb-6 animate-float inline-block">🎉</div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-3">Your card is live!</h1>
          <p className="font-body text-muted-foreground mb-8 leading-relaxed">
            Share the link below with your loved ones. They can open it on any device — no app required.
          </p>
          {/* Link box */}
          <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex items-center gap-3">
            <p className="font-mono text-sm text-muted-foreground flex-1 truncate">{cardUrl}</p>
            <button onClick={copyLink} className="btn-primary px-4 py-2 rounded-xl text-sm shrink-0">
              {copied ? <><CheckCheck className="w-4 h-4 text-emerald-400" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/card/${cardSlug}`} target="_blank" className="flex-1 btn-ghost py-3 rounded-2xl text-sm">
              Preview Card
            </Link>
            <Link href="/dashboard" className="flex-1 btn-primary py-3 rounded-2xl text-sm shadow-glow-gold">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <span className="font-display font-semibold text-foreground text-sm">Create Card</span>
          <span className="font-body text-xs text-muted-foreground">Step {step}/5</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Progress steps */}
        <div className="flex items-center gap-1 mb-10">
          {STEPS.map((s, i) => {
            const Icon   = s.icon;
            const active = step === s.n;
            const done   = step > s.n;
            return (
              <div key={s.n} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 transition-all duration-300 ${active ? "opacity-100" : done ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${done ? "bg-emerald-500" : active ? "bg-amber-400" : "bg-muted"}`}>
                    {done ? <Check className="w-4 h-4 text-white" /> : <Icon className={`w-4 h-4 ${active ? "text-night-950" : "text-muted-foreground"}`} />}
                  </div>
                  <span className={`hidden sm:block font-body text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 transition-all duration-300 ${done ? "bg-emerald-500/40" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Eid Type ── */}
        {step === 1 && (
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">Which Eid?</h2>
            <p className="font-body text-muted-foreground mb-6 text-sm">Choose the occasion for your card.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EID_TYPES.map(e => (
                <button key={e.id} onClick={() => set("eidType", e.id)}
                        className={`p-6 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 ${form.eidType === e.id ? "border-amber-400/60 bg-amber-400/8 shadow-glow-gold" : "border-border bg-card hover:border-amber-400/30"}`}>
                  <span className="text-4xl block mb-3">{e.emoji}</span>
                  <h3 className="font-display font-bold text-foreground text-base mb-1">{e.label}</h3>
                  <p className="font-body text-muted-foreground text-sm">{e.desc}</p>
                  {form.eidType === e.id && <div className="mt-3 badge-gold text-xs inline-flex">Selected ✓</div>}
                </button>
              ))}
            </div>
            {errors.eidType && <p className="font-body text-xs text-rose-400 mt-3 animate-fade-up">{errors.eidType}</p>}
          </div>
        )}

        {/* ── Step 2: Theme ── */}
        {step === 2 && (
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">Choose a Theme</h2>
            <p className="font-body text-muted-foreground mb-6 text-sm">Pick the visual style for your card.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEME_CONFIGS.map(t => (
                <button key={t.id} onClick={() => set("theme", t.id)}
                        className={`rounded-2xl border overflow-hidden text-left transition-all duration-200 hover:-translate-y-0.5 ${form.theme === t.id ? "border-amber-400/60 shadow-glow-gold ring-2 ring-amber-400/30" : "border-border hover:border-amber-400/30"}`}>
                  <div className="h-20 flex items-center justify-center text-3xl" style={{ background: `linear-gradient(135deg, ${t.containerGrad.match(/#[a-f0-9]{6}/i)?.[0] ?? "#0d0b2e"}, ${t.containerGrad.match(/#[a-f0-9]{6}/gi)?.[1] ?? "#1a1040"})` }}>
                    {t.preview}
                  </div>
                  <div className="p-2.5 bg-card">
                    <p className="font-display font-semibold text-xs text-foreground">{t.name}</p>
                    {form.theme === t.id && <span className="text-amber-400 text-xs">✓</span>}
                  </div>
                </button>
              ))}
            </div>
            {errors.theme && <p className="font-body text-xs text-rose-400 mt-3 animate-fade-up">{errors.theme}</p>}
          </div>
        )}

        {/* ── Step 3: Audio ── */}
        {step === 3 && (
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">Background Audio</h2>
            <p className="font-body text-muted-foreground mb-6 text-sm">Choose the mood-setting audio for your card.</p>
            <div className="space-y-3">
              {AUDIO_OPTIONS.map(a => (
                <button key={a.id} onClick={() => set("audio", a.id)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 ${form.audio === a.id ? "border-amber-400/60 bg-amber-400/8 shadow-glow-gold" : "border-border bg-card hover:border-amber-400/30"}`}>
                  <span className="text-2xl shrink-0">{a.emoji}</span>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-foreground text-sm">{a.name}</p>
                    <p className="font-body text-muted-foreground text-xs">{a.desc}</p>
                  </div>
                  {form.audio === a.id && <Check className="w-5 h-5 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
            {errors.audio && <p className="font-body text-xs text-rose-400 mt-3 animate-fade-up">{errors.audio}</p>}
          </div>
        )}

        {/* ── Step 4: Message ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">Personalise Your Card</h2>
              <p className="font-body text-muted-foreground text-sm">Add your heartfelt message and details.</p>
            </div>

            {/* Recipient */}
            <div>
              <label className="block font-body text-sm font-semibold text-foreground mb-2">Recipient name <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input type="text" placeholder="e.g. Mama, Fatima, Uncle Karim…" value={form.recipientName}
                     onChange={e => set("recipientName", e.target.value)}
                     className="w-full bg-muted border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-amber-400/60 transition-all" />
            </div>

            {/* Message */}
            <div>
              <label className="block font-body text-sm font-semibold text-foreground mb-2">
                Your message <span className="text-muted-foreground font-normal">({form.customMessage.length}/500)</span>
              </label>
              <textarea placeholder="Write a heartfelt Eid message…" value={form.customMessage}
                        onChange={e => set("customMessage", e.target.value)} rows={5}
                        className={`w-full bg-muted border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-amber-400/60 transition-all resize-none leading-relaxed ${errors.customMessage ? "border-rose-500/60" : "border-border"}`} />
              {errors.customMessage && <p className="font-body text-xs text-rose-400 mt-1 animate-fade-up">{errors.customMessage}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-body text-sm font-semibold text-foreground mb-2">Your phone number</label>
              <input type="tel" placeholder="01XXXXXXXXX" value={form.phone}
                     onChange={e => set("phone", e.target.value)}
                     className={`w-full bg-muted border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-amber-400/60 transition-all ${errors.phone ? "border-rose-500/60" : "border-border"}`} />
              {errors.phone && <p className="font-body text-xs text-rose-400 mt-1 animate-fade-up">{errors.phone}</p>}
            </div>
          </div>
        )}

        {/* ── Step 5: Review ── */}
        {step === 5 && (
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">Review & Create</h2>
            <p className="font-body text-muted-foreground mb-6 text-sm">Everything looks good? Hit create and your card goes live.</p>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 mb-6">
              {[
                { label: "Eid Type", value: EID_TYPES.find(e => e.id === form.eidType)?.label },
                { label: "Theme",    value: THEME_CONFIGS.find(t => t.id === form.theme)?.name },
                { label: "Audio",    value: AUDIO_OPTIONS.find(a => a.id === form.audio)?.name },
                { label: "Recipient",value: form.recipientName || "—" },
                { label: "Phone",    value: form.phone },
                { label: "Message",  value: form.customMessage.slice(0, 80) + (form.customMessage.length > 80 ? "…" : "") },
              ].map(r => (
                <div key={r.label} className="flex gap-4">
                  <span className="font-body text-sm text-muted-foreground w-24 shrink-0">{r.label}</span>
                  <span className="font-body text-sm text-foreground">{r.value}</span>
                </div>
              ))}
            </div>
            {/* Theme preview */}
            {activeTheme && (
              <div className="rounded-2xl overflow-hidden mb-6 h-32 flex items-center justify-center text-5xl relative"
                   style={{ background: `linear-gradient(135deg, ${activeTheme.containerGrad.match(/#[a-f0-9]{6}/i)?.[0] ?? "#0d0b2e"}, ${activeTheme.containerGrad.match(/#[a-f0-9]{6}/gi)?.[1] ?? "#1a1040"})` }}>
                <span className="animate-float">{activeTheme.preview}</span>
                <div className="absolute bottom-3 right-3 badge-gold text-xs">{activeTheme.name}</div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button onClick={back} disabled={step === 1}
                  className={`flex items-center gap-2 font-body text-sm font-semibold transition-all ${step === 1 ? "opacity-30 pointer-events-none" : "text-muted-foreground hover:text-foreground"}`}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {step < 5 ? (
            <button onClick={next} className="btn-primary px-6 py-3 rounded-xl text-sm shadow-glow-gold">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
                    className="btn-primary px-8 py-3 rounded-xl text-sm shadow-glow-gold disabled:opacity-60 disabled:pointer-events-none">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Sparkles className="w-4 h-4" /> Create Card</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

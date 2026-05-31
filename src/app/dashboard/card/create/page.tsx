"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { themes } from "@/components/themes";
import { useToast } from "@/components/ui/toaster";
import {
  Moon, Sun, ArrowLeft, ArrowRight, Check, Loader2,
  Sparkles, Music, MessageSquare, User, Phone,
  Star, Copy, CheckCheck, X,
} from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────
const AUDIO_OPTIONS = [
  { id: "audio1", name: "Islamic Nasheed",      emoji: "🎵", desc: "Uplifting vocal harmony"      },
  { id: "audio2", name: "Traditional Darbar",   emoji: "🥁", desc: "Classic Eid percussion"       },
  { id: "audio3", name: "Soft Ambient",         emoji: "🌙", desc: "Peaceful atmospheric tones"   },
  { id: "audio4", name: "Quranic Recitation",   emoji: "📖", desc: "Blessed Quranic verses"       },
];

const THEME_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  theme1:  { bg: "#1e3a5f", accent: "#fcd34d", text: "#e0f2fe" },
  theme2:  { bg: "#4a1c00", accent: "#fb923c", text: "#fff7ed" },
  theme3:  { bg: "#0f2027", accent: "#a7f3d0", text: "#ecfdf5" },
  theme4:  { bg: "#064e3b", accent: "#6ee7b7", text: "#d1fae5" },
  theme5:  { bg: "#78350f", accent: "#fbbf24", text: "#fffbeb" },
  theme6:  { bg: "#f8fafc", accent: "#94a3b8", text: "#1e293b" },
  theme7:  { bg: "#1e1b4b", accent: "#c4b5fd", text: "#ede9fe" },
  theme8:  { bg: "#1c1917", accent: "#f59e0b", text: "#fef9c3" },
  theme9:  { bg: "#7c2d12", accent: "#fdba74", text: "#fff7ed" },
  theme10: { bg: "#042f2e", accent: "#2dd4bf", text: "#f0fdfa" },
};

const STEPS = [
  { n: 1, label: "Eid Type", icon: Moon      },
  { n: 2, label: "Theme",    icon: Star      },
  { n: 3, label: "Audio",    icon: Music     },
  { n: 4, label: "Message",  icon: MessageSquare },
  { n: 5, label: "Review",   icon: Check     },
];

type FormData = {
  eidType: string;
  theme: string;
  audio: string;
  phone: string;
  customMessage: string;
  recipientName: string;
};

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d")!;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#fbbf24","#f59e0b","#10b981","#6ee7b7","#c4b5fd","#fb923c","#fcd34d","#fff"];
    const pieces = Array.from({ length: 140 }, () => ({
      x:   Math.random() * canvas.width,
      y:   -Math.random() * canvas.height * 0.5,
      r:   Math.random() * 8 + 3,
      d:   Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.1 + 0.05,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      w: Math.random() * 12 + 4,
      h: Math.random() * 6  + 2,
    }));

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      pieces.forEach(p => {
        p.tiltAngle += p.tiltSpeed;
        p.y += p.d + Math.sin(frame * 0.02) * 0.5;
        p.x += Math.sin(p.tiltAngle) * 1.5;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / (canvas.height * 1.1));
        if (p.shape === "rect") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.tilt * Math.PI) / 180);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        } else {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    const stop = setTimeout(() => cancelAnimationFrame(rafRef.current), 4500);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(stop); };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[200]"
    />
  );
}

// ─── Live preview card ────────────────────────────────────────────────────────
function LivePreview({ formData }: { formData: FormData }) {
  const theme      = THEME_COLORS[formData.theme] ?? { bg: "#1e1b4b", accent: "#fcd34d", text: "#fff" };
  const themeInfo  = themes.find(t => t.id === formData.theme);
  const audioInfo  = AUDIO_OPTIONS.find(a => a.id === formData.audio);
  const hasContent = formData.theme || formData.eidType;

  return (
    <div className="sticky top-24 h-fit">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-widest">
          Live Preview
        </span>
      </div>

      {/* Card mockup */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 aspect-[9/16] max-h-[520px] gpu"
        style={{ background: theme.bg }}
      >
        {/* Animated background decoration */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 30% 20%, ${theme.accent}60 0%, transparent 60%),
                         radial-gradient(ellipse 50% 40% at 80% 80%, ${theme.accent}30 0%, transparent 50%)`,
          }}
        />

        {/* Stars (tiny dots) */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-twinkle"
            style={{
              width:  Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              background: theme.accent,
              top:  `${10 + i * 7}%`,
              left: `${5 + (i * 17) % 85}%`,
              animationDelay: `${i * 0.25}s`,
              opacity: 0.6,
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 gap-3">
          {/* Theme icon */}
          <div
            className="text-5xl animate-float mb-2"
            style={{ filter: `drop-shadow(0 0 12px ${theme.accent}80)` }}
          >
            {hasContent ? (themeInfo?.preview ?? "🌙") : "🌙"}
          </div>

          {/* Eid type */}
          <div
            className="px-4 py-1 rounded-full text-xs font-body font-semibold tracking-wider uppercase"
            style={{ background: `${theme.accent}25`, color: theme.accent, border: `1px solid ${theme.accent}40` }}
          >
            {formData.eidType === "eid_al_fitr"
              ? "Eid Al-Fitr Mubarak"
              : formData.eidType === "eid_al_adha"
              ? "Eid Al-Adha Mubarak"
              : "Eid Mubarak"}
          </div>

          {/* Recipient */}
          {formData.recipientName && (
            <p
              className="font-display text-base font-semibold text-center animate-fade-in"
              style={{ color: theme.accent }}
            >
              Dear {formData.recipientName},
            </p>
          )}

          {/* Message */}
          <div
            className="text-center px-2"
            style={{ color: theme.text }}
          >
            {formData.customMessage ? (
              <p className="font-body text-xs leading-relaxed line-clamp-5 animate-fade-in">
                {formData.customMessage}
              </p>
            ) : (
              <p className="font-body text-xs opacity-40 italic">
                Your message will appear here...
              </p>
            )}
          </div>

          {/* Audio pill */}
          {formData.audio && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body animate-fade-in"
              style={{ background: `${theme.accent}20`, color: theme.accent }}
            >
              <span>{audioInfo?.emoji}</span>
              <span>{audioInfo?.name}</span>
            </div>
          )}

          {/* Separator + dua placeholder */}
          <div
            className="w-16 h-px my-1"
            style={{ background: `${theme.accent}40` }}
          />
          <p
            className="font-arabic text-sm text-center opacity-60"
            style={{ color: theme.accent }}
          >
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>

          {/* Phone */}
          {formData.phone && (
            <p
              className="font-mono text-xs opacity-50 mt-1"
              style={{ color: theme.text }}
            >
              {formData.phone}
            </p>
          )}
        </div>

        {/* Theme name chip */}
        {themeInfo && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full
                       text-xs font-body font-medium animate-fade-in"
            style={{ background: `${theme.accent}20`, color: theme.accent, backdropFilter: "blur(8px)" }}
          >
            {themeInfo.name}
          </div>
        )}
      </div>

      {/* Preview meta */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { label: "Theme",   val: themeInfo?.name  ?? "—" },
          { label: "Audio",   val: audioInfo?.name  ?? "—" },
          { label: "Eid",     val: formData.eidType === "eid_al_fitr" ? "Al-Fitr" : formData.eidType === "eid_al_adha" ? "Al-Adha" : "—" },
          { label: "Message", val: formData.customMessage ? `${formData.customMessage.length}/500` : "—" },
        ].map(({ label, val }) => (
          <div key={label} className="glass rounded-xl p-2.5 text-center">
            <p className="text-xs text-muted-foreground font-body">{label}</p>
            <p className="text-xs font-semibold text-foreground font-body truncate">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function StepProgress({ step, total }: { step: number; total: number }) {
  const pct = ((step - 1) / (total - 1)) * 100;
  return (
    <div className="mb-8">
      {/* Step labels */}
      <div className="flex justify-between mb-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const done    = step > s.n;
          const current = step === s.n;
          return (
            <div
              key={s.n}
              className={`flex flex-col items-center gap-1.5 transition-all duration-500
                          ${current ? "scale-110" : "scale-100"}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center
                            border-2 transition-all duration-400
                            ${done    ? "bg-emerald-500 border-emerald-500 shadow-glow-emerald"
                                      : current
                                      ? "bg-amber-400 border-amber-400 shadow-glow-gold"
                                      : "bg-muted border-border"}`}
              >
                {done
                  ? <Check className="w-4 h-4 text-white" />
                  : <Icon className={`w-4 h-4 ${current ? "text-amber-900" : "text-muted-foreground"}`} />}
              </div>
              <span
                className={`text-[10px] font-body font-semibold hidden md:block
                            ${current ? "text-amber-500" : done ? "text-emerald-500" : "text-muted-foreground"}`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Track */}
      <div className="progress-bar mx-4">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-center text-xs text-muted-foreground font-body mt-2">
        Step {step} of {total}
      </p>
    </div>
  );
}

// ─── Step 1: Eid Type ────────────────────────────────────────────────────────
function StepEidType({ formData, setFormData }: { formData: FormData; setFormData: (d: FormData) => void }) {
  return (
    <div className="animate-scale-in">
      <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
        Which Eid are you celebrating?
      </h2>
      <p className="font-body text-muted-foreground mb-8">
        Choose the type of Eid card — the dua and greeting will match automatically.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[
          {
            id: "eid_al_fitr",
            emoji: "🌙",
            name: "Eid Al-Fitr",
            arabic: "عيد الفطر",
            desc: "Celebrate the joyful end of Ramadan — the month of fasting and reflection.",
            color: "#1e3a5f",
            accent: "#fcd34d",
          },
          {
            id: "eid_al_adha",
            emoji: "🐑",
            name: "Eid Al-Adha",
            arabic: "عيد الأضحى",
            desc: "Commemorate the festival of sacrifice — faith, devotion, and gratitude.",
            color: "#064e3b",
            accent: "#6ee7b7",
          },
        ].map((type) => {
          const selected = formData.eidType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setFormData({ ...formData, eidType: type.id })}
              className={`relative p-8 rounded-3xl border-2 text-left
                          transition-all duration-400 ease-spring group overflow-hidden
                          ${selected
                            ? "border-amber-400 shadow-glow-gold scale-[1.02]"
                            : "border-border hover:border-amber-400/40 hover:scale-[1.01]"}`}
            >
              {/* Background gradient */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `linear-gradient(135deg, ${type.color}20, transparent)` }}
              />
              {selected && (
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{ background: `linear-gradient(135deg, ${type.color}30, transparent)` }}
                />
              )}

              {/* Check badge */}
              {selected && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-amber-400
                                flex items-center justify-center animate-scale-in z-10">
                  <Check className="w-4 h-4 text-amber-900" />
                </div>
              )}

              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:animate-float inline-block">
                  {type.emoji}
                </div>
                <div className="flex items-baseline gap-3 mb-1">
                  <h3 className="font-display font-bold text-xl text-foreground">{type.name}</h3>
                </div>
                <p className="font-arabic text-sm text-muted-foreground mb-3">{type.arabic}</p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{type.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Theme ────────────────────────────────────────────────────────────
function StepTheme({ formData, setFormData }: { formData: FormData; setFormData: (d: FormData) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="animate-fade-right">
      <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
        Choose your card theme
      </h2>
      <p className="font-body text-muted-foreground mb-8">
        Each theme is hand-crafted with Islamic artistry. Hover to preview, click to select.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {themes.map((theme) => {
          const colors  = THEME_COLORS[theme.id] ?? { bg: "#1e1b4b", accent: "#fcd34d", text: "#fff" };
          const selected = formData.theme === theme.id;
          const isHov   = hovered === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => setFormData({ ...formData, theme: theme.id })}
              onMouseEnter={() => setHovered(theme.id)}
              onMouseLeave={() => setHovered(null)}
              className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-400
                          flex flex-col items-center aspect-[3/4] group
                          ${selected
                            ? "border-amber-400 shadow-glow-gold scale-105"
                            : "border-border hover:border-amber-400/50 hover:scale-[1.03]"}`}
            >
              {/* Coloured preview pane */}
              <div
                className="w-full flex-1 flex items-center justify-center transition-all duration-400"
                style={{ background: colors.bg }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, ${colors.accent}50 0%, transparent 60%)`,
                  }}
                />
                <span
                  className={`text-3xl relative z-10 transition-transform duration-400
                               ${isHov || selected ? "scale-125 animate-float" : ""}`}
                >
                  {theme.preview}
                </span>
                {selected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400
                                  flex items-center justify-center animate-scale-in">
                    <Check className="w-3 h-3 text-amber-900" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="w-full px-2 py-2 bg-card border-t border-border text-center">
                <p className="font-body text-xs font-semibold text-foreground truncate">{theme.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Audio ────────────────────────────────────────────────────────────
function StepAudio({ formData, setFormData }: { formData: FormData; setFormData: (d: FormData) => void }) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="animate-fade-right">
      <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
        Pick a background audio
      </h2>
      <p className="font-body text-muted-foreground mb-8">
        Your recipient will hear this when they open the card.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AUDIO_OPTIONS.map((audio) => {
          const selected = formData.audio === audio.id;
          const isPlaying = playing === audio.id;

          return (
            <button
              key={audio.id}
              onClick={() => {
                setFormData({ ...formData, audio: audio.id });
                setPlaying(isPlaying ? null : audio.id);
              }}
              className={`relative flex items-center gap-5 p-6 rounded-2xl border-2 text-left
                          transition-all duration-400 ease-spring group overflow-hidden
                          ${selected
                            ? "border-amber-400 shadow-glow-gold"
                            : "border-border hover:border-amber-400/40"}`}
            >
              {/* Animated wave bars (when selected) */}
              {selected && (
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                     style={{ background: "linear-gradient(135deg, #fbbf24, transparent)" }} />
              )}

              {/* Emoji icon with pulse ring */}
              <div className="relative shrink-0">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
                               transition-all duration-400
                               ${selected ? "bg-amber-400/20 scale-110" : "bg-muted group-hover:bg-amber-400/10"}`}
                >
                  {audio.emoji}
                </div>
                {selected && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/60 animate-ping opacity-40" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="font-display font-bold text-base text-foreground mb-0.5">{audio.name}</p>
                <p className="font-body text-sm text-muted-foreground">{audio.desc}</p>

                {/* Fake waveform bars */}
                {selected && (
                  <div className="flex items-end gap-0.5 mt-2 h-5">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-amber-400 animate-bounce"
                        style={{
                          height: `${30 + Math.sin(i) * 50}%`,
                          animationDelay: `${i * 0.08}s`,
                          animationDuration: "0.8s",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Check */}
              {selected && (
                <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shrink-0 animate-scale-in">
                  <Check className="w-4 h-4 text-amber-900" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4: Message ──────────────────────────────────────────────────────────
function StepMessage({ formData, setFormData }: { formData: FormData; setFormData: (d: FormData) => void }) {
  const msgLen   = formData.customMessage.length;
  const maxMsg   = 500;
  const pctMsg   = (msgLen / maxMsg) * 100;

  return (
    <div className="animate-fade-right">
      <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
        Write your message
      </h2>
      <p className="font-body text-muted-foreground mb-8">
        Make it personal. A heartfelt message means everything.
      </p>

      <div className="space-y-5">
        {/* Recipient name */}
        <div className="group">
          <label className="block font-body text-sm font-semibold text-foreground mb-2">
            <User className="w-4 h-4 inline mr-1.5 text-amber-500" />
            Recipient Name
            <span className="text-muted-foreground font-normal ml-1">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Who is this card for? e.g. Amma, Uncle Karim…"
            value={formData.recipientName}
            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            maxLength={100}
            className="input-field"
          />
        </div>

        {/* Phone */}
        <div className="group">
          <label className="block font-body text-sm font-semibold text-foreground mb-2">
            <Phone className="w-4 h-4 inline mr-1.5 text-amber-500" />
            Your Phone Number
            <span className="text-rose-500 ml-1">*</span>
          </label>
          <input
            type="tel"
            placeholder="+880 1XXX XXXXXX"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            maxLength={15}
            className="input-field"
          />
          <p className="font-body text-xs text-muted-foreground mt-1.5">
            Shown on the card so recipients can reach you.
          </p>
        </div>

        {/* Custom message */}
        <div className="group">
          <label className="block font-body text-sm font-semibold text-foreground mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1.5 text-amber-500" />
            Your Message
            <span className="text-rose-500 ml-1">*</span>
          </label>
          <div className="relative">
            <textarea
              placeholder="Write your heartfelt Eid wishes here… e.g. 'May Allah bless you and your family with joy, health, and peace this Eid.'"
              value={formData.customMessage}
              onChange={(e) => setFormData({ ...formData, customMessage: e.target.value.slice(0, maxMsg) })}
              rows={5}
              className="input-field resize-none font-body leading-relaxed pr-4"
            />
            {/* Character counter ring */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
              <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
                <circle cx="12" cy="12" r="10" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle
                  cx="12" cy="12" r="10" fill="none"
                  stroke={pctMsg > 90 ? "#ef4444" : pctMsg > 70 ? "#f59e0b" : "#10b981"}
                  strokeWidth="2.5"
                  strokeDasharray={`${2 * Math.PI * 10}`}
                  strokeDashoffset={`${2 * Math.PI * 10 * (1 - pctMsg / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
              <span className={`font-mono text-xs ${pctMsg > 90 ? "text-rose-500" : "text-muted-foreground"}`}>
                {maxMsg - msgLen}
              </span>
            </div>
          </div>
        </div>

        {/* Quick inserts */}
        <div>
          <p className="font-body text-xs text-muted-foreground mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Eid Mubarak! 🌙",
              "May Allah accept our prayers and fasting.",
              "Wishing you joy, peace, and barakah this Eid.",
              "Taqabbal Allahu Minna Wa Minkum 🤲",
            ].map((phrase) => (
              <button
                key={phrase}
                onClick={() =>
                  setFormData({
                    ...formData,
                    customMessage: (formData.customMessage
                      ? formData.customMessage + " " + phrase
                      : phrase).slice(0, maxMsg),
                  })
                }
                className="text-xs font-body px-3 py-1.5 rounded-full border border-border
                           hover:border-amber-400/50 hover:bg-amber-400/5
                           transition-all duration-200 text-muted-foreground hover:text-foreground"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────
function StepReview({
  formData,
  isLoading,
  onSubmit,
}: {
  formData: FormData;
  isLoading: boolean;
  onSubmit: () => void;
}) {
  const themeInfo = themes.find(t => t.id === formData.theme);
  const audioInfo = AUDIO_OPTIONS.find(a => a.id === formData.audio);

  const rows = [
    { label: "Eid Type",   val: formData.eidType === "eid_al_fitr" ? "🌙 Eid Al-Fitr" : "🐑 Eid Al-Adha" },
    { label: "Theme",      val: `${themeInfo?.preview ?? ""} ${themeInfo?.name ?? "—"}` },
    { label: "Audio",      val: `${audioInfo?.emoji ?? ""} ${audioInfo?.name ?? "—"}` },
    { label: "Recipient",  val: formData.recipientName || "—" },
    { label: "Phone",      val: formData.phone },
    { label: "Message",    val: formData.customMessage },
  ];

  return (
    <div className="animate-scale-in">
      <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
        Everything looks good?
      </h2>
      <p className="font-body text-muted-foreground mb-8">
        Review your card details before creating. You can go back to change anything.
      </p>

      {/* Review list */}
      <div className="space-y-3 mb-8">
        {rows.map(({ label, val }) => (
          <div
            key={label}
            className="flex gap-4 p-4 rounded-2xl bg-muted/60 border border-border"
          >
            <span className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20 shrink-0 pt-0.5">
              {label}
            </span>
            <span className={`font-body text-sm text-foreground ${label === "Message" ? "leading-relaxed" : ""}`}>
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* Submit CTA */}
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full btn-primary btn-morph py-5 text-lg rounded-2xl shadow-glow-gold
                   disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating your card…
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Create & Get My Link
          </>
        )}
      </button>

      <p className="text-center font-body text-xs text-muted-foreground mt-3">
        Your card will be instantly shareable via a unique link 🔗
      </p>
    </div>
  );
}

// ─── Success modal ────────────────────────────────────────────────────────────
function SuccessModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/card/${slug}`;

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 glass rounded-3xl p-8 max-w-md w-full animate-modal-in text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="text-6xl mb-4 animate-float inline-block">🎉</div>
        <h3 className="font-display font-bold text-2xl text-foreground mb-2">
          Card Created!
        </h3>
        <p className="font-body text-muted-foreground mb-6">
          Your Eid card is live and ready to share. Copy your unique link below.
        </p>

        {/* URL box */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border mb-4">
          <p className="font-mono text-xs text-foreground flex-1 truncate text-left">
            {shareUrl}
          </p>
          <button
            onClick={copy}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        transition-all duration-300
                        ${copied ? "bg-emerald-500 text-white" : "btn-primary"}`}
          >
            {copied
              ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>

        {/* Share actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={`https://wa.me/?text=${encodeURIComponent("Eid Mubarak! 🌙 View my card: " + shareUrl)}`}
            target="_blank" rel="noreferrer"
            className="btn-secondary rounded-xl py-3 text-sm flex items-center justify-center gap-2"
          >
            📱 WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noreferrer"
            className="btn-ghost rounded-xl py-3 text-sm flex items-center justify-center gap-2 border-border"
          >
            📘 Facebook
          </a>
        </div>

        <button onClick={onClose} className="btn-ghost w-full rounded-xl py-3 text-sm">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CardCreatePage() {
  const router         = useRouter();
  const { data: session, status } = useSession();
  const { addToast }   = useToast();

  const [step, setStep]           = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [confetti, setConfetti]   = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [slideKey, setSlideKey]   = useState(0);

  const [formData, setFormData] = useState<FormData>({
    eidType: "", theme: "", audio: "",
    phone: "", customMessage: "", recipientName: "",
  });

  const TOTAL_STEPS = 5;

  // Redirect if not authed
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return !!formData.eidType;
      case 2: return !!formData.theme;
      case 3: return !!formData.audio;
      case 4: return !!formData.phone && !!formData.customMessage;
      case 5: return true;
      default: return false;
    }
  }, [step, formData]);

  const goNext = useCallback(() => {
    if (!canProceed || step >= TOTAL_STEPS) return;
    setDirection("forward");
    setSlideKey(k => k + 1);
    setStep(s => s + 1);
  }, [canProceed, step]);

  const goBack = useCallback(() => {
    if (step <= 1) return;
    setDirection("back");
    setSlideKey(k => k + 1);
    setStep(s => s - 1);
  }, [step]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res  = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.code === "PLAN_EXPIRED"       ? "Your plan has expired. Please renew to create cards."
          : data.code === "CARD_LIMIT_REACHED" ? "You've reached your card limit. Upgrade to Premium for unlimited cards."
          : data.error ?? "Failed to create card";

        addToast({ title: "Could not create card", description: msg, variant: "destructive" });
      } else {
        setConfetti(true);
        setCreatedSlug(data.card.slug);
        setTimeout(() => setConfetti(false), 5000);
      }
    } catch {
      addToast({ title: "Network error", description: "Check your connection and try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl animate-float">🌙</div>
          <div className="shimmer w-48 h-4 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Confetti active={confetti} />

      {createdSlug && (
        <SuccessModal
          slug={createdSlug}
          onClose={() => router.push("/dashboard")}
        />
      )}

      {/* Page background */}
      <div className="min-h-screen bg-background">
        {/* Top progress stripe */}
        <div
          className="fixed top-0 left-0 z-50 h-[3px] transition-all duration-600 ease-spring"
          style={{
            width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%`,
            background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fcd34d)",
          }}
        />

        {/* Sticky mini header */}
        <header className="sticky top-0 z-40 glass-dark border-b border-white/5 px-5 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm font-body text-muted-foreground
                         hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌙</span>
              <span className="font-display font-bold text-base text-white">Create Card</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              {step}/{TOTAL_STEPS}
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">

            {/* ── Left: Wizard ─────────────────────────────────────────────── */}
            <div>
              <StepProgress step={step} total={TOTAL_STEPS} />

              {/* Step panel with slide transition */}
              <div
                key={slideKey}
                className={direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"}
              >
                {step === 1 && <StepEidType   formData={formData} setFormData={setFormData} />}
                {step === 2 && <StepTheme     formData={formData} setFormData={setFormData} />}
                {step === 3 && <StepAudio     formData={formData} setFormData={setFormData} />}
                {step === 4 && <StepMessage   formData={formData} setFormData={setFormData} />}
                {step === 5 && (
                  <StepReview
                    formData={formData}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                  />
                )}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                <button
                  onClick={goBack}
                  disabled={step === 1}
                  className="btn-ghost rounded-xl px-6 py-3 flex items-center gap-2
                             disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                {step < TOTAL_STEPS && (
                  <button
                    onClick={goNext}
                    disabled={!canProceed}
                    className="btn-primary btn-morph rounded-xl px-8 py-3 flex items-center gap-2
                               disabled:opacity-40 disabled:pointer-events-none shadow-glow-gold"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Right: Live preview ───────────────────────────────────────── */}
            <div className="hidden lg:block">
              <LivePreview formData={formData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

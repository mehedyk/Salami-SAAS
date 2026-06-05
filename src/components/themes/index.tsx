"use client";

import { useEffect, useState } from "react";
import type { Dua } from "@/lib/duas";

// ── Theme configuration ────────────────────────────────────────────────────
export interface ThemeConfig {
  id:            string;
  name:          string;
  description:   string;
  preview:       string;
  // Container
  containerGrad: string;
  // Card
  cardBg:        string;
  cardBorder:    string;
  cardShadow:    string;
  // Text
  titleColor:    string;
  subtitleColor: string;
  messageColor:  string;
  recipientColor:string;
  phoneColor:    string;
  // Dua box
  duaBg:         string;
  duaBorder?:    string;
  duaArabicColor:string;
  duaTransColor: string;
  duaSourceColor:string;
  // Decoration
  decoration: "stars" | "lanterns" | "mosque-circles" | "geometric" | "none";
  decorationColor: string;
  // Icon
  icon: string;
}

export const THEME_CONFIGS: ThemeConfig[] = [
  {
    id: "theme1", name: "Starlit Night", description: "Night sky with crescent moon", preview: "🌙",
    containerGrad: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c1929 100%)",
    cardBg: "rgba(255,255,255,0.05)", cardBorder: "rgba(255,255,255,0.10)",
    cardShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    titleColor: "#fef3c7", subtitleColor: "#fcd34d99", messageColor: "rgba(255,255,255,0.85)",
    recipientColor: "#fcd34d", phoneColor: "rgba(255,255,255,0.4)",
    duaBg: "rgba(252,211,77,0.08)", duaBorder: "rgba(252,211,77,0.20)",
    duaArabicColor: "#fcd34d", duaTransColor: "rgba(255,255,255,0.65)", duaSourceColor: "rgba(255,255,255,0.35)",
    decoration: "stars", decorationColor: "#fff",
    icon: "🌙",
  },
  {
    id: "theme2", name: "Lantern Glow", description: "Warm traditional lanterns", preview: "🏮",
    containerGrad: "linear-gradient(135deg, #1a0a00 0%, #4a1c00 50%, #2d1000 100%)",
    cardBg: "rgba(255,200,100,0.10)", cardBorder: "rgba(255,180,50,0.30)",
    cardShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
    titleColor: "#fef3c7", subtitleColor: "#fb923c99", messageColor: "rgba(255,255,255,0.85)",
    recipientColor: "#fb923c", phoneColor: "rgba(255,255,255,0.4)",
    duaBg: "rgba(251,146,60,0.10)", duaBorder: "rgba(251,146,60,0.25)",
    duaArabicColor: "#fbbf24", duaTransColor: "rgba(255,255,255,0.65)", duaSourceColor: "rgba(255,255,255,0.35)",
    decoration: "lanterns", decorationColor: "#fb923c",
    icon: "🏮",
  },
  {
    id: "theme3", name: "Sacred Mosque", description: "Elegant mosque architecture", preview: "🕌",
    containerGrad: "linear-gradient(135deg, #0c4a3e 0%, #1a7a64 50%, #0c4a3e 100%)",
    cardBg: "rgba(255,255,255,0.97)", cardBorder: "rgba(255,255,255,0.5)",
    cardShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    titleColor: "#0c4a3e", subtitleColor: "#666", messageColor: "#333",
    recipientColor: "#047857", phoneColor: "#aaa",
    duaBg: "#ecfdf5", duaBorder: "rgba(16,185,129,0.2)",
    duaArabicColor: "#065f46", duaTransColor: "#555", duaSourceColor: "#aaa",
    decoration: "mosque-circles", decorationColor: "rgba(255,255,255,0.08)",
    icon: "🕌",
  },
  {
    id: "theme4", name: "Green Paradise", description: "Islamic garden vibes", preview: "🌿",
    containerGrad: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #064e3b 100%)",
    cardBg: "rgba(255,255,255,0.97)", cardBorder: "transparent",
    cardShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    titleColor: "#064e3b", subtitleColor: "#666", messageColor: "#333",
    recipientColor: "#064e3b", phoneColor: "#aaa",
    duaBg: "#ecfdf5", duaBorder: undefined,
    duaArabicColor: "#064e3b", duaTransColor: "#555", duaSourceColor: "#aaa",
    decoration: "none", decorationColor: "",
    icon: "🌿",
  },
  {
    id: "theme5", name: "Golden Elegance", description: "Luxurious gold accents", preview: "✨",
    containerGrad: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
    cardBg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    cardBorder: "#d4af37",
    cardShadow: "0 0 60px rgba(212,175,55,0.3)",
    titleColor: "#d4af37", subtitleColor: "rgba(255,255,255,0.7)", messageColor: "rgba(255,255,255,0.9)",
    recipientColor: "#d4af37", phoneColor: "rgba(255,255,255,0.5)",
    duaBg: "rgba(212,175,55,0.10)", duaBorder: "rgba(212,175,55,0.30)",
    duaArabicColor: "#d4af37", duaTransColor: "rgba(255,255,255,0.7)", duaSourceColor: "rgba(255,255,255,0.4)",
    decoration: "stars", decorationColor: "#d4af37",
    icon: "✨",
  },
  {
    id: "theme6", name: "Minimalist White", description: "Clean and modern", preview: "🤍",
    containerGrad: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 50%, #eeeeee 100%)",
    cardBg: "#ffffff", cardBorder: "#e0e0e0",
    cardShadow: "0 10px 40px rgba(0,0,0,0.08)",
    titleColor: "#1a1a1a", subtitleColor: "#888", messageColor: "#444",
    recipientColor: "#222", phoneColor: "#aaa",
    duaBg: "#f5f5f5", duaBorder: undefined,
    duaArabicColor: "#333", duaTransColor: "#666", duaSourceColor: "#aaa",
    decoration: "none", decorationColor: "",
    icon: "🤍",
  },
  {
    id: "theme7", name: "Crescent Dreams", description: "Soft pastel crescent", preview: "🌙",
    containerGrad: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)",
    cardBg: "rgba(255,255,255,0.97)", cardBorder: "rgba(190,24,93,0.12)",
    cardShadow: "0 25px 50px -12px rgba(190,24,93,0.12)",
    titleColor: "#be185d", subtitleColor: "#888", messageColor: "#444",
    recipientColor: "#be185d", phoneColor: "#aaa",
    duaBg: "#fdf2f8", duaBorder: "rgba(190,24,93,0.12)",
    duaArabicColor: "#be185d", duaTransColor: "#666", duaSourceColor: "#aaa",
    decoration: "none", decorationColor: "",
    icon: "🌙",
  },
  {
    id: "theme8", name: "Geometric Pattern", description: "Islamic geometry", preview: "⬡",
    containerGrad: "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 50%, #1e1e2e 100%)",
    cardBg: "rgba(255,255,255,0.05)", cardBorder: "rgba(139,92,246,0.30)",
    cardShadow: "0 0 60px rgba(139,92,246,0.20)",
    titleColor: "#a78bfa", subtitleColor: "rgba(255,255,255,0.7)", messageColor: "rgba(255,255,255,0.9)",
    recipientColor: "#a78bfa", phoneColor: "rgba(255,255,255,0.5)",
    duaBg: "rgba(139,92,246,0.10)", duaBorder: "rgba(139,92,246,0.30)",
    duaArabicColor: "#a78bfa", duaTransColor: "rgba(255,255,255,0.7)", duaSourceColor: "rgba(255,255,255,0.4)",
    decoration: "geometric", decorationColor: "rgba(167,139,250,0.08)",
    icon: "⬡",
  },
  {
    id: "theme9", name: "Sunset Harmony", description: "Warm sunset colours", preview: "🌅",
    containerGrad: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
    cardBg: "rgba(255,255,255,0.97)", cardBorder: "transparent",
    cardShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    titleColor: "#7c2d12", subtitleColor: "#888", messageColor: "#444",
    recipientColor: "#9a3412", phoneColor: "#aaa",
    duaBg: "#fff7ed", duaBorder: "rgba(124,45,18,0.15)",
    duaArabicColor: "#7c2d12", duaTransColor: "#666", duaSourceColor: "#aaa",
    decoration: "none", decorationColor: "",
    icon: "🌅",
  },
  {
    id: "theme10", name: "Modern Islamic", description: "Contemporary Islamic design", preview: "🕌",
    containerGrad: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    cardBg: "rgba(255,255,255,0.97)", cardBorder: "transparent",
    cardShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    titleColor: "#0f172a", subtitleColor: "#888", messageColor: "#444",
    recipientColor: "#0f172a", phoneColor: "#aaa",
    duaBg: "#f8fafc", duaBorder: undefined,
    duaArabicColor: "#0f172a", duaTransColor: "#666", duaSourceColor: "#aaa",
    decoration: "mosque-circles", decorationColor: "rgba(255,255,255,0.04)",
    icon: "🕌",
  },
];

// ── Helper to find config by id ────────────────────────────────────────────
export function getThemeConfig(id: string): ThemeConfig {
  return THEME_CONFIGS.find((t) => t.id === id) ?? THEME_CONFIGS[0];
}

// ── Theme list for selectors ───────────────────────────────────────────────
export const themes = THEME_CONFIGS.map((t) => ({
  id:          t.id,
  name:        t.name,
  description: t.description,
  preview:     t.preview,
}));

// ── Decoration renderers ───────────────────────────────────────────────────
function StarsDecoration({ color }: { color: string }) {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    left:  `${(i * 13 + 7) % 100}%`,
    top:   `${(i * 17 + 3) % 100}%`,
    delay: `${(i * 0.09) % 2}s`,
    dur:   `${2 + (i * 0.07) % 2}s`,
    size:  i % 5 === 0 ? "4px" : "2px",
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <div
          key={i}
          className="ec-star-dot"
          style={{
            left: s.left, top: s.top,
            animationDelay: s.delay, animationDuration: s.dur,
            width: s.size, height: s.size, background: color,
          }}
        />
      ))}
    </div>
  );
}

function LanternDecoration({ color }: { color: string }) {
  const lanterns = [
    { top: "10%", left: "5%",  delay: "0s",   size: "3rem" },
    { top: "20%", right: "8%", delay: "1.2s", size: "2rem" },
    { top: "70%", left: "3%",  delay: "0.6s", size: "2.5rem" },
    { top: "80%", right: "5%", delay: "1.8s", size: "3rem" },
  ];
  return (
    <>
      {lanterns.map((l, i) => (
        <div
          key={i}
          className="ec-lantern"
          style={{ ...l, color, fontSize: l.size }}
        >
          🏮
        </div>
      ))}
    </>
  );
}

function MosqueCircles({ color }: { color: string }) {
  return (
    <>
      {[200, 350, 500].map((size, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: size, height: size,
            borderRadius: "50%",
            border: `1px solid ${color}`,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

function GeometricDecoration({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 120, height: 120,
            background: color,
            top:  `${10 + i * 15}%`,
            left: `${5  + i * 17}%`,
            transform: `rotate(${i * 30}deg)`,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
      ))}
    </div>
  );
}

// ── Main ThemeCard component ───────────────────────────────────────────────
interface ThemeCardProps {
  themeId:        string;
  eidType:        string;
  recipientName?: string;
  customMessage:  string;
  phone:          string;
  duas:           Dua[];
}

export function ThemeCard({
  themeId, eidType, recipientName, customMessage, phone, duas,
}: ThemeCardProps) {
  const cfg = getThemeConfig(themeId);
  const [duaIdx, setDuaIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setDuaIdx((p) => (p + 1) % duas.length), 8000);
    return () => clearInterval(id);
  }, [duas.length]);

  const eidTitle  = eidType === "eid_al_fitr" ? "Eid Al-Fitr" : "Eid Al-Adha";
  const eidSuffix = eidType === "eid_al_fitr" ? " Mubarak!" : " Kareem!";
  const dua       = duas[duaIdx];

  return (
    <div className="ec-theme-container" style={{ background: cfg.containerGrad }}>
      {/* Decorations */}
      {cfg.decoration === "stars"          && <StarsDecoration   color={cfg.decorationColor} />}
      {cfg.decoration === "lanterns"       && <LanternDecoration color={cfg.decorationColor} />}
      {cfg.decoration === "mosque-circles" && <MosqueCircles     color={cfg.decorationColor} />}
      {cfg.decoration === "geometric"      && <GeometricDecoration color={cfg.decorationColor} />}

      {/* Card */}
      <div
        className="ec-theme-card"
        style={{
          background:  cfg.cardBg,
          border:      `1px solid ${cfg.cardBorder}`,
          boxShadow:   cfg.cardShadow,
        }}
      >
        {/* Icon / Moon */}
        {themeId === "theme1" ? (
          <div className="ec-moon" />
        ) : (
          <div className="ec-icon">{cfg.icon}</div>
        )}

        <h1 className="ec-eid-title" style={{ color: cfg.titleColor }}>
          {eidTitle}
        </h1>
        <p className="ec-subtitle" style={{ color: cfg.subtitleColor }}>
          {eidSuffix}
        </p>

        {recipientName && (
          <p className="ec-recipient" style={{ color: cfg.recipientColor }}>
            Dear {recipientName}
          </p>
        )}

        <p className="ec-message" style={{ color: cfg.messageColor }}>
          {customMessage}
        </p>

        <p className="ec-phone" style={{ color: cfg.phoneColor }}>
          {phone}
        </p>

        {/* Dua */}
        {dua && (
          <div
            className="ec-dua-box"
            style={{
              background: cfg.duaBg,
              border: cfg.duaBorder ? `1px solid ${cfg.duaBorder}` : undefined,
            }}
          >
            <p className="ec-dua-arabic arabic" style={{ color: cfg.duaArabicColor }}>
              {dua.arabic}
            </p>
            <p className="ec-dua-trans" style={{ color: cfg.duaTransColor }}>
              "{dua.translation}"
            </p>
            <p className="ec-dua-source" style={{ color: cfg.duaSourceColor }}>
              {dua.source}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── renderTheme: drop-in replacement for old themes/index.tsx ─────────────
interface RenderThemeProps {
  themeId:        string;
  eidType:        string;
  recipientName?: string;
  customMessage:  string;
  phone:          string;
  duas:           Dua[];
}

export function renderTheme(props: RenderThemeProps) {
  return <ThemeCard {...props} />;
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles, Star, ArrowRight, Check, Copy, CheckCheck,
  Moon, Zap, Shield, Heart, Globe, ChevronDown, Menu, X,
  QrCode, AlertCircle, Loader2,
} from "lucide-react";

// ─── Theme data (mirrors /components/themes/index.tsx) ───────────────────────
const THEMES = [
  { id: "theme1",  emoji: "🌙", name: "Starlit Night",      color: "#1e3a5f", accent: "#fcd34d", desc: "Night sky with crescent moon"   },
  { id: "theme2",  emoji: "🏮", name: "Lantern Glow",       color: "#4a1c00", accent: "#fb923c", desc: "Warm traditional lanterns"       },
  { id: "theme3",  emoji: "🕌", name: "Sacred Mosque",      color: "#0f2027", accent: "#a7f3d0", desc: "Elegant mosque architecture"     },
  { id: "theme4",  emoji: "🌿", name: "Green Paradise",     color: "#064e3b", accent: "#6ee7b7", desc: "Islamic garden vibes"            },
  { id: "theme5",  emoji: "✨", name: "Golden Elegance",    color: "#78350f", accent: "#fbbf24", desc: "Luxurious gold accents"          },
  { id: "theme6",  emoji: "🤍", name: "Minimalist White",   color: "#f8fafc", accent: "#94a3b8", desc: "Clean and modern"               },
  { id: "theme7",  emoji: "🌙", name: "Crescent Dreams",    color: "#1e1b4b", accent: "#c4b5fd", desc: "Soft pastel crescent"           },
  { id: "theme8",  emoji: "⬡",  name: "Geometric Pattern",  color: "#1c1917", accent: "#f59e0b", desc: "Islamic geometry"               },
  { id: "theme9",  emoji: "🌅", name: "Sunset Harmony",     color: "#7c2d12", accent: "#fdba74", desc: "Warm sunset colours"            },
  { id: "theme10", emoji: "🕌", name: "Modern Islamic",     color: "#042f2e", accent: "#2dd4bf", desc: "Contemporary Islamic design"    },
];

const FEATURES = [
  { icon: Moon,    title: "10 Stunning Themes",      desc: "From Starlit Night to Modern Islamic — every aesthetic covered.",          span: "col-span-2" },
  { icon: Zap,     title: "Instant Sharing",         desc: "One link. Anyone can open it — no app, no account needed.",                span: "col-span-1" },
  { icon: Shield,  title: "Secure & Private",        desc: "Your data never sold. Cards belong to you.",                               span: "col-span-1" },
  { icon: Heart,   title: "Personalised Duas",       desc: "Curated Quranic duas attach automatically to every card.",                 span: "col-span-1" },
  { icon: Globe,   title: "Shareable Worldwide",     desc: "WhatsApp, Facebook, email — share anywhere in one tap.",                   span: "col-span-1" },
  { icon: Star,    title: "Beautiful by Default",    desc: "Every card is designed to impress. No design skills needed.",              span: "col-span-2" },
];

const TESTIMONIALS = [
  { name: "Fatima R.",    role: "Dhaka",          text: "My family in London opened the card and called me crying — it was so beautiful. JazakAllah Khair!",     avatar: "F", stars: 5 },
  { name: "Karim H.",     role: "Chittagong",     text: "Sent 30 cards in under 10 minutes. The Golden Elegance theme is absolutely gorgeous.",                   avatar: "K", stars: 5 },
  { name: "Nusrat B.",    role: "Sylhet",         text: "The Arabic duas on every card are such a lovely touch. Worth every taka.",                              avatar: "N", stars: 5 },
  { name: "Imran A.",     role: "Rajshahi",       text: "Even my dad who doesn't use smartphones was impressed. The link just works perfectly.",                   avatar: "I", stars: 5 },
  { name: "Sumaiya K.",   role: "Khulna",         text: "I upgraded to Premium after the first card. Unlimited editing is a game changer.",                       avatar: "S", stars: 5 },
  { name: "Tariq M.",     role: "Barisal",        text: "Starlit Night theme gave me chills. I've never seen anything this elegant for Eid.",                    avatar: "T", stars: 5 },
];

const TRUST_ITEMS = [
  "🌙 10 Unique Themes", "🔒 Secure Payments", "⚡ Instant Delivery",
  "❤️ 10,000+ Cards Sent", "🌍 Worldwide Sharing", "✅ Verified bKash",
  "📱 Mobile-First Design", "🤲 Authentic Duas Included",
];

const STEPS = [
  { n: "01", title: "Pick a Theme",      desc: "Choose from 10 beautifully crafted Eid themes — night sky, lanterns, mosque, and more."  },
  { n: "02", title: "Add Your Message",  desc: "Type a personal message, add the recipient's name, and choose your Eid type."              },
  { n: "03", title: "Get Your Link",     desc: "We generate a unique, beautiful shareable link in seconds."                                },
  { n: "04", title: "Share the Joy",     desc: "Send it over WhatsApp, Facebook, email — anywhere. They open it and feel the magic."       },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
function useIntersection(ref: React.RefObject<Element | null>, opts?: IntersectionObserverInit) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15, ...opts });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, opts]);
  return visible;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CustomCursor() {
  const dot  = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const trail = useRef<{ x: number; y: number; t: number }[]>([]);
  const raf  = useRef<number>(0);
  const pos  = useRef({ x: -100, y: -100 });
  const ring_pos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      ring_pos.current.x += (pos.current.x - ring_pos.current.x) * 0.12;
      ring_pos.current.y += (pos.current.y - ring_pos.current.y) * 0.12;
      if (dot.current) {
        dot.current.style.left = pos.current.x + "px";
        dot.current.style.top  = pos.current.y + "px";
      }
      if (ring.current) {
        ring.current.style.left = ring_pos.current.x + "px";
        ring.current.style.top  = ring_pos.current.y + "px";
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dot}  className="cursor-dot  hidden md:block" />
      <div ref={ring} className="cursor-ring hidden md:block" />
    </>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Themes",   href: "#themes"   },
    { label: "How it Works", href: "#how"  },
    { label: "Pricing",  href: "#pricing"  },
  ];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-400 ${
      scrolled ? "glass-dark border-b border-white/10 py-3" : "py-5"
    }`}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl animate-moon-glow rounded-full">🌙</span>
          <span className="font-display font-bold text-xl text-gradient-hero">EidCard</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.href} href={l.href}
               className="text-sm font-body font-medium text-white/70 hover:text-white
                          transition-colors duration-200 relative group">
              {l.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r
                               from-yellow-400 to-amber-300
                               group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5">
            Sign In
          </Link>
          <Link href="/register"
                className="btn-primary btn-morph text-sm px-5 py-2 rounded-xl">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(o => !o)}
                className="md:hidden text-white/80 hover:text-white transition-colors p-1">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-dark border-t border-white/10 mt-2 mx-4 rounded-2xl p-4
                        animate-scale-in">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
               className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5
                          rounded-xl transition-all duration-200 font-medium">
              {l.label}
            </a>
          ))}
          <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2">
            <Link href="/login"
                  className="block text-center py-2.5 px-4 text-white/70 hover:text-white
                             rounded-xl border border-white/10 hover:border-white/30 transition-all">
              Sign In
            </Link>
            <Link href="/register"
                  className="btn-primary text-center rounded-xl py-2.5">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center
                        hero-gradient overflow-hidden px-5 pt-24 pb-16">
      {/* Starfield */}
      <div className="starfield absolute inset-0 pointer-events-none" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full opacity-10
                      bg-purple-500 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/5 w-72 h-72 rounded-full opacity-10
                      bg-amber-400 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[600px] rounded-full opacity-5
                      bg-indigo-500 blur-3xl pointer-events-none" />

      {/* Moon */}
      <div className={`relative mb-8 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full animate-moon-glow animate-float
                        bg-gradient-to-br from-amber-100 via-yellow-300 to-amber-400
                        relative flex items-center justify-center text-5xl md:text-6xl
                        shadow-glow-gold">
          🌙
          {/* Crater details */}
          <div className="absolute top-5 left-7 w-4 h-4 rounded-full bg-amber-500/30" />
          <div className="absolute top-12 left-14 w-2.5 h-2.5 rounded-full bg-amber-500/20" />
        </div>
        {/* Orbit ring */}
        <div className="absolute inset-[-20px] rounded-full border border-amber-400/20 animate-spin-slow" />
        <div className="absolute inset-[-35px] rounded-full border border-amber-400/10 animate-spin-reverse" />
        {/* Stars around moon */}
        {[...Array(6)].map((_, i) => (
          <div key={i}
               className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 animate-twinkle"
               style={{
                 top: `${50 + 55 * Math.sin((i * Math.PI * 2) / 6)}%`,
                 left: `${50 + 55 * Math.cos((i * Math.PI * 2) / 6)}%`,
                 animationDelay: `${i * 0.4}s`,
               }} />
        ))}
      </div>

      {/* Badge */}
      <div className={`mb-6 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <span className="badge-gold text-xs px-4 py-1.5 animate-pulse-glow">
          <Sparkles className="w-3.5 h-3.5" />
          Beautiful Eid Cards for Bangladesh
        </span>
      </div>

      {/* Headline */}
      <div className={`text-center max-w-4xl transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <h1 className="font-display font-bold leading-tight mb-4"
            style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}>
          <span className="text-white">Share the </span>
          <span className="text-gradient-hero">Joy of Eid</span>
          <br />
          <span className="text-white">with the World</span>
        </h1>
        <p className="font-body text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Create stunning, personalised Eid greeting cards in seconds.
          Choose from 10 beautiful themes, add a heartfelt message, and
          share a magical link with anyone — no app required.
        </p>
      </div>

      {/* CTAs */}
      <div className={`flex flex-col sm:flex-row gap-4 mt-10 transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <Link href="/register"
              className="btn-primary btn-morph px-8 py-4 text-base rounded-2xl shadow-glow-gold group">
          Create Your Card Free
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <a href="#themes"
           className="btn-ghost px-8 py-4 text-base rounded-2xl text-white border-white/20
                      hover:border-white/40 hover:bg-white/5">
          See Themes
          <ChevronDown className="w-5 h-5 animate-bounce-subtle" />
        </a>
      </div>

      {/* Social proof */}
      <div className={`mt-12 flex items-center gap-4 transition-all duration-700 delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="flex -space-x-2">
          {["F","K","N","I","S"].map((l, i) => (
            <div key={i}
                 className="w-8 h-8 rounded-full border-2 border-night-900 flex items-center justify-center
                            text-xs font-bold text-white"
                 style={{ background: ["#7c3aed","#0284c7","#059669","#d97706","#dc2626"][i] }}>
              {l}
            </div>
          ))}
        </div>
        <p className="text-white/50 text-sm font-body">
          <span className="text-white font-semibold">10,000+</span> cards sent this Eid
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <span className="text-white/30 text-xs font-body">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce-subtle" />
      </div>
    </section>
  );
}

function MarqueeStrip() {
  return (
    <section className="bg-amber-400/10 border-y border-amber-400/20 py-3 overflow-hidden">
      <div className="flex">
        <div className="marquee-track flex gap-8 pr-8">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span key={i} className="whitespace-nowrap text-sm font-body font-medium text-amber-200 shrink-0 px-4">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);
  const vis = useIntersection(ref);

  return (
    <section id="features" ref={ref} className="py-24 px-5 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="badge-emerald mb-4 inline-flex">Features</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
            Everything you need to share<br />
            <span className="text-gradient-gold">joy this Eid</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Thoughtfully designed so anyone can create a card that feels personal, premium, and meaningful.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const colSpan = f.span === "col-span-2" ? "md:col-span-2" : "md:col-span-1";
            return (
              <div key={i}
                   className={`bento-card group ${colSpan}
                               transition-all duration-700
                               ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                   style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10
                                flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">{f.title}</h3>
                <p className="font-body text-muted-foreground leading-relaxed">{f.desc}</p>
                {/* Hover spotlight */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100
                                transition-opacity duration-500 pointer-events-none
                                bg-gradient-to-br from-amber-400/5 to-transparent" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ThemesSection() {
  const ref = useRef<HTMLElement>(null);
  const vis = useIntersection(ref);
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);

  // Auto-advance
  useEffect(() => {
    if (!vis) return;
    const id = setInterval(() => setActive(a => (a + 1) % THEMES.length), 3500);
    return () => clearInterval(id);
  }, [vis]);

  const scrollTo = useCallback((idx: number) => {
    setActive(idx);
    if (trackRef.current) {
      const card = trackRef.current.children[idx] as HTMLElement;
      card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  return (
    <section id="themes" ref={ref} className="py-24 overflow-hidden"
             style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)" }}>
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="badge-gold mb-4 inline-flex">10 Themes</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
            Find your perfect <span className="text-gradient-gold">Eid aesthetic</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Every theme hand-crafted with Islamic artistry. Swipe to explore.
          </p>
        </div>
      </div>

      {/* 3D Carousel */}
      <div className="relative">
        <div ref={trackRef}
             className="flex gap-5 px-[max(2rem,calc(50vw-560px))] overflow-x-auto
                        scrollbar-none scroll-x pb-4"
             onMouseDown={e => { setIsDragging(true); dragStart.current = e.clientX; }}
             onMouseUp={() => setIsDragging(false)}
             onMouseLeave={() => setIsDragging(false)}>
          {THEMES.map((theme, i) => {
            const isActive = i === active;
            const diff = Math.abs(i - active);
            return (
              <div key={theme.id}
                   onClick={() => scrollTo(i)}
                   className="shrink-0 w-64 md:w-72 rounded-3xl cursor-pointer transition-all duration-500"
                   style={{
                     transform: `scale(${isActive ? 1 : Math.max(0.88, 1 - diff * 0.05)})
                                 translateY(${isActive ? "-8px" : `${diff * 4}px`})`,
                     opacity: Math.max(0.5, 1 - diff * 0.15),
                     filter: isActive ? "none" : `blur(${diff * 0.5}px)`,
                   }}>
                {/* Card face */}
                <div className="h-48 rounded-t-3xl flex items-center justify-center text-6xl relative overflow-hidden"
                     style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.color}dd)` }}>
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10"
                       style={{
                         backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.accent}40 0%, transparent 50%),
                                           radial-gradient(circle at 80% 20%, ${theme.accent}20 0%, transparent 40%)`,
                       }} />
                  <span className="relative z-10 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                    {theme.emoji}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-3 right-3 badge-gold text-xs">
                      Active
                    </div>
                  )}
                </div>

                <div className="bg-card border border-border border-t-0 rounded-b-3xl p-5
                                transition-all duration-300"
                     style={{ boxShadow: isActive ? `0 20px 60px ${theme.accent}30` : "none" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: theme.accent }} />
                    <h3 className="font-display font-bold text-base text-foreground">{theme.name}</h3>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">{theme.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {THEMES.map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)}
                    className={`rounded-full transition-all duration-300
                                ${i === active ? "w-6 h-2 bg-amber-400" : "w-2 h-2 bg-border hover:bg-amber-400/50"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const vis = useIntersection(ref);

  return (
    <section id="how" ref={ref} className="py-24 px-5 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="badge-emerald mb-4 inline-flex">How it Works</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
            Four steps to <span className="text-gradient-gold">pure Eid magic</span>
          </h2>
        </div>

        {/* Steps — vertical on mobile, grid on md */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((step, i) => (
            <div key={i}
                 className={`relative glass rounded-3xl p-8 group overflow-hidden
                             transition-all duration-700
                             ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                 style={{ transitionDelay: `${i * 100}ms` }}>
              {/* Step number — large background */}
              <div className="absolute -top-4 -right-2 font-display font-bold text-8xl
                              text-amber-400/8 select-none pointer-events-none leading-none">
                {step.n}
              </div>

              {/* Numbered badge */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600
                              flex items-center justify-center font-display font-bold text-white text-lg
                              mb-5 shadow-glow-gold group-hover:scale-110 transition-transform duration-300">
                {parseInt(step.n)}
              </div>

              <h3 className="font-display font-bold text-xl text-foreground mb-2 relative z-10">
                {step.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed relative z-10">
                {step.desc}
              </p>

              {/* Connecting line (not on last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                  <ArrowRight className="w-6 h-6 text-amber-400/40" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA below steps */}
        <div className={`text-center mt-12 transition-all duration-700 delay-500
                         ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Link href="/register"
                className="btn-primary btn-morph px-10 py-4 text-lg rounded-2xl inline-flex shadow-glow-gold">
            Start Creating — It&apos;s Free
            <Sparkles className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const vis = useIntersection(ref);
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((next: number) => {
    setFading(true);
    setTimeout(() => { setIdx(next); setFading(false); }, 300);
  }, []);

  useEffect(() => {
    const id = setInterval(() => goTo((idx + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(id);
  }, [idx, goTo]);

  const t = TESTIMONIALS[idx];

  return (
    <section ref={ref} className="py-24 px-5"
             style={{ background: "linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)" }}>
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="badge-gold mb-4 inline-flex">Testimonials</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
            What our users <span className="text-gradient-gold">are saying</span>
          </h2>
        </div>

        {/* Featured testimonial */}
        <div className={`glass rounded-3xl p-10 text-center mb-8 transition-all duration-700
                         ${vis ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className={`transition-all duration-300 ${fading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(t.stars)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            {/* Quote */}
            <p className="font-body text-xl md:text-2xl text-foreground leading-relaxed mb-8 italic max-w-2xl mx-auto">
              &ldquo;{t.text}&rdquo;
            </p>
            {/* Author */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600
                              flex items-center justify-center font-bold text-white text-lg shadow-glow-gold">
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-foreground">{t.name}</p>
                <p className="font-body text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* All testimonials as small cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TESTIMONIALS.map((te, i) => (
            <button key={i} onClick={() => goTo(i)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-300
                                ${i === idx
                                  ? "border-amber-400/50 bg-amber-400/5 shadow-glow-gold"
                                  : "border-border bg-card hover:border-amber-400/30"}`}>
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-body text-xs text-muted-foreground line-clamp-2">{te.text}</p>
              <p className="font-display font-semibold text-xs text-foreground mt-2">{te.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef<HTMLElement>(null);
  const vis = useIntersection(ref);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "ONE_TIME",
      name: "One-Time",
      price: 49,
      badge: null,
      desc: "Perfect for getting started",
      features: [
        "Create Eid cards",
        "All 10 stunning themes",
        "Shareable links",
        "Curated duas included",
        "Valid for 11 months",
      ],
      cta: "Get Started",
      href: "/register",
      highlight: false,
    },
    {
      id: "PREMIUM",
      name: "Premium",
      price: 99,
      badge: "Most Popular",
      desc: "For unlimited Eid sharing",
      features: [
        "Everything in One-Time",
        "Lifetime access",
        "Unlimited card editing",
        "Priority support",
        "Early access to new themes",
      ],
      cta: "Go Premium",
      href: "/register",
      highlight: true,
    },
  ];

  return (
    <section id="pricing" ref={ref} className="py-24 px-5 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="badge-emerald mb-4 inline-flex">Pricing</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
            Simple, honest <span className="text-gradient-gold">pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Pay once with bKash. No subscriptions, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, i) => (
            <div key={plan.id}
                 onMouseEnter={() => setHoveredPlan(plan.id)}
                 onMouseLeave={() => setHoveredPlan(null)}
                 className={`relative rounded-3xl p-8 border flex flex-col
                             transition-all duration-500
                             ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
                             ${plan.highlight
                               ? "border-amber-400/50 bg-gradient-to-b from-amber-400/5 to-transparent"
                               : "border-border bg-card"}
                             ${hoveredPlan === plan.id ? "shadow-card-hover -translate-y-2" : ""}`}
                 style={{ transitionDelay: `${i * 120}ms` }}>
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="badge-premium px-5 py-1.5 text-xs">
                    <Star className="w-3 h-3 fill-current" /> {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="font-display font-bold text-2xl text-foreground mb-1">{plan.name}</h3>
                <p className="font-body text-muted-foreground text-sm">{plan.desc}</p>
              </div>

              {/* Price */}
              <div className="flex items-end gap-1 mb-8">
                <span className="font-display font-bold text-6xl text-foreground leading-none">
                  {plan.price}
                </span>
                <div className="pb-2">
                  <p className="font-mono font-semibold text-lg text-amber-500">TK</p>
                  <p className="font-body text-xs text-muted-foreground">one-time</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, fi) => (
                  <li key={fi} className="flex items-center gap-3 font-body text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
                                     ${plan.highlight ? "bg-amber-400/20" : "bg-emerald-400/20"}`}>
                      <Check className={`w-3 h-3 ${plan.highlight ? "text-amber-500" : "text-emerald-500"}`} />
                    </div>
                    <span className={fi === 0 && plan.highlight ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.href}
                    className={`w-full text-center py-4 rounded-2xl font-display font-bold text-base
                                transition-all duration-300 block
                                ${plan.highlight
                                  ? "btn-primary shadow-glow-gold"
                                  : "btn-ghost hover:border-amber-400/40"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* bKash note */}
        <div className={`mt-8 glass rounded-2xl p-5 flex items-start gap-4 transition-all duration-700 delay-300
                         ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0 text-xl">💳</div>
          <div>
            <p className="font-display font-semibold text-foreground mb-1">Pay securely with bKash</p>
            <p className="font-body text-sm text-muted-foreground">
              Send via bKash Send Money, submit your TrxID, and an admin verifies your plan within 1–12 hours.
              Safe, simple, trusted by Bangladeshis.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const vis = useIntersection(ref);

  return (
    <section ref={ref} className="py-24 px-5 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 aurora-bg opacity-90" />
      <div className="starfield absolute inset-0" />

      {/* Morphing blob decorations */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96
                      bg-amber-400/10 blur-3xl morph-blob pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72
                      bg-purple-500/10 blur-3xl morph-blob-2 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className={`transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="text-6xl mb-6 animate-moon-glow animate-float inline-block">🌙</div>
          <h2 className="font-display font-bold text-5xl md:text-6xl text-white mb-6 leading-tight">
            Spread Eid joy<br />
            <span className="text-gradient-hero">the beautiful way</span>
          </h2>
          <p className="font-body text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of Bangladeshis creating memories that last beyond Eid.
            Start free — your first card is on us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
                  className="btn-primary btn-morph px-10 py-4 text-lg rounded-2xl shadow-glow-gold group">
              Create Your Card Now
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </Link>
            <Link href="/login"
                  className="btn-glass px-10 py-4 text-lg rounded-2xl text-white border-white/20">
              Sign In
            </Link>
          </div>
          <p className="mt-6 font-body text-white/40 text-sm">
            Free to start · bKash payment · 1–12h activation
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-night-950 border-t border-white/5 py-12 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌙</span>
              <span className="font-display font-bold text-xl text-white">EidCard</span>
            </div>
            <p className="font-body text-white/40 text-sm leading-relaxed">
              Beautiful, personalised Eid greeting cards for Bangladesh and beyond.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              {[["Features","#features"],["Themes","#themes"],["How it Works","#how"],["Pricing","#pricing"]].map(([l, h]) => (
                <li key={l}>
                  <a href={h} className="font-body text-sm text-white/40 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2">
              {[["Sign In","/login"],["Register","/register"],["Dashboard","/dashboard"]].map(([l, h]) => (
                <li key={l}>
                  <Link href={h} className="font-body text-sm text-white/40 hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="section-divider mb-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-white/30">
            © {new Date().getFullYear()} EidCard. Made with ❤️ for Bangladesh.
          </p>
          <p className="font-body text-sm text-white/20">
            Eid Mubarak 🌙
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  // Scroll progress bar
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setProgress(pct);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 z-[100] h-[2px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 transition-all duration-150"
           style={{ width: `${progress}%` }} />

      <CustomCursor />
      <Navbar />

      <main>
        <HeroSection />
        <MarqueeStrip />
        <FeaturesSection />
        <ThemesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>

      <Footer />

      {/* Back to top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={`fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full
                          btn-primary shadow-glow-gold flex items-center justify-center
                          transition-all duration-300
                          ${progress > 20 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <ChevronDown className="w-5 h-5 rotate-180" />
      </button>
    </>
  );
}

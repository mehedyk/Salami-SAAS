// src/components/layout/navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Moon, Menu, X, LayoutDashboard,
  LogOut, User, Crown, ChevronDown, Sparkles,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Features",    href: "/#features" },
  { label: "Themes",      href: "/#themes"   },
  { label: "How it Works",href: "/#how"      },
  { label: "Pricing",     href: "/#pricing"  },
];

export function Navbar() {
  const { data: session }    = useSession();
  const pathname             = usePathname();
  const [open, setOpen]      = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Hide navbar entirely on card pages and dashboard (they have their own headers)
  const isCardPage      = pathname.startsWith("/card/");
  const isDashboardPage = pathname.startsWith("/dashboard");
  if (isCardPage || isDashboardPage) return null;

  const isHomePage = pathname === "/";

  // Scroll effects
  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement;
      const pct = (el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * 100;
      setScrolled(el.scrollTop > 40);
      setScrollPct(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const userName   = session?.user?.name?.split(" ")[0] ?? "Account";
  const userInitial = (session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "U").toUpperCase();
  const isPremium  = (session?.user as { plan?: string })?.plan === "PREMIUM";

  return (
    <>
      {/* ── Scroll progress bar (only on home, non-intrusive elsewhere) ───── */}
      {isHomePage && (
        <div
          className="fixed top-0 left-0 z-[60] h-[2px] transition-all duration-150 pointer-events-none"
          style={{
            width: `${scrollPct}%`,
            background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fcd34d)",
          }}
        />
      )}

      {/* ── Main nav ─────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-400 ease-spring
                    ${scrolled || !isHomePage
                      ? "glass-dark border-b border-white/8 py-3 shadow-glass-dark"
                      : "py-5 bg-transparent"}`}
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between gap-4">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="text-2xl group-hover:animate-moon-glow transition-all duration-300">
              🌙
            </span>
            <span className="font-display font-bold text-xl text-white leading-none">
              EidCard
            </span>
          </Link>

          {/* ── Desktop nav links (home only) ─────────────────────────────── */}
          {isHomePage && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-body font-medium
                             text-white/65 hover:text-white
                             transition-colors duration-200 rounded-xl
                             hover:bg-white/5 group"
                >
                  {link.label}
                  {/* Animated underline */}
                  <span
                    className="absolute bottom-1.5 left-4 right-4 h-px rounded-full
                               bg-gradient-to-r from-amber-400 to-amber-300
                               scale-x-0 group-hover:scale-x-100
                               transition-transform duration-300 origin-left"
                  />
                </a>
              ))}
            </div>
          )}

          {/* ── Right side ────────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                {/* Dashboard link */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium
                             text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* User menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border
                                transition-all duration-300
                                ${userMenuOpen
                                  ? "bg-white/10 border-white/20"
                                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center
                                  font-bold text-sm
                                  ${isPremium
                                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900 shadow-glow-gold"
                                    : "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"}`}
                    >
                      {userInitial}
                    </div>
                    <span className="text-sm font-body font-medium text-white/80 max-w-[80px] truncate">
                      {userName}
                    </span>
                    {isPremium && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white/40 shrink-0 transition-transform duration-300
                                  ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-52 glass-dark rounded-2xl
                                 border border-white/10 overflow-hidden shadow-glass-dark animate-scale-in"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="font-display font-bold text-sm text-white truncate">
                          {session.user?.name}
                        </p>
                        <p className="font-body text-xs text-white/40 truncate">
                          {session.user?.email}
                        </p>
                        {isPremium && (
                          <span className="badge-premium text-[10px] mt-1 inline-flex">
                            <Sparkles className="w-2.5 h-2.5" /> Premium
                          </span>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                                     text-sm font-body text-white/70 hover:text-white
                                     hover:bg-white/8 transition-all duration-200"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          My Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                     text-sm font-body text-rose-400 hover:text-rose-300
                                     hover:bg-rose-400/10 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/(auth)/login"
                  className="px-4 py-2 text-sm font-body font-medium text-white/65
                             hover:text-white transition-colors duration-200 rounded-xl
                             hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/(auth)/register"
                  className="btn-primary btn-morph rounded-xl px-5 py-2.5 text-sm shadow-glow-gold
                             flex items-center gap-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Hamburger ─────────────────────────────────────────────────── */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl
                       bg-white/5 border border-white/10 text-white/70
                       hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open
              ? <X      className="w-5 h-5 animate-scale-in" />
              : <Menu   className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────────────── */}
        {open && (
          <div
            className="md:hidden glass-dark border-t border-white/8
                       mx-4 mt-2 rounded-2xl overflow-hidden animate-scale-in"
          >
            {/* Nav links */}
            {isHomePage && (
              <div className="px-2 pt-2 pb-1 border-b border-white/8">
                {NAV_LINKS.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body
                               font-medium text-white/70 hover:text-white hover:bg-white/6
                               transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Auth section */}
            <div className="p-2">
              {session ? (
                <>
                  {/* User pill */}
                  <div className="flex items-center gap-3 px-4 py-3 mb-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center
                                  font-bold text-sm shrink-0
                                  ${isPremium
                                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900"
                                    : "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"}`}
                    >
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-white truncate">
                        {session.user?.name}
                      </p>
                      <p className="font-body text-xs text-white/40 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    {isPremium && (
                      <Crown className="w-4 h-4 text-amber-400 shrink-0 ml-auto" />
                    )}
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body
                               font-medium text-white/70 hover:text-white hover:bg-white/6
                               transition-all duration-200"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <button
                    onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body
                               font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-400/8
                               transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/(auth)/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-body
                               font-medium text-white/70 hover:text-white border border-white/10
                               hover:border-white/30 mb-2 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/(auth)/register"
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full text-center rounded-xl py-3 text-sm block"
                  >
                    Get Started — Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer so page content doesn't hide under fixed nav */}
      {!isHomePage && <div className="h-[60px]" />}
    </>
  );
}

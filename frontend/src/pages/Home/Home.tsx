import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { Link } from 'react-router-dom'
import './Home.css'

const FEATURES = [
  {
    icon: '🌙',
    title: 'Your Eid page',
    body: 'One beautiful link with your bKash, Nagad, and Rocket number — ready to share the moment Eid begins.',
  },
  {
    icon: '📋',
    title: 'Full ledger',
    body: 'Every salami logged with sender name, amount, and a note. Your Eid memory, preserved.',
  },
  {
    icon: '🧾',
    title: 'Receipts',
    body: 'Auto-generate a receipt for every gift. Confirm, verify, and keep your records clean.',
  },
  {
    icon: '🎨',
    title: 'Six themes',
    body: 'Noor, Zafran, Layla, Sabz, Qamar, Fajr — each one made for Eid, not just any occasion.',
  },
]

const THEMES = [
  { id: 'noor',   label: 'Noor',   color: '#f5c850', free: true  },
  { id: 'zafran', label: 'Zafran', color: '#e6821e', free: false },
  { id: 'layla',  label: 'Layla',  color: '#d4878a', free: false },
  { id: 'sabz',   label: 'Sabz',   color: '#28c878', free: true  },
  { id: 'qamar',  label: 'Qamar',  color: '#a0b4dc', free: false },
  { id: 'fajr',   label: 'Fajr',   color: '#b8a8e8', free: true  },
]

export default function Home() {
  const featuresRef = useScrollReveal<HTMLDivElement>()
  const pricingRef  = useScrollReveal<HTMLDivElement>()
  const themesRef   = useScrollReveal<HTMLDivElement>()
  return (
    <div className="home">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="home__hero">
        <div className="home__hero-bg" aria-hidden="true">
          <div className="home__hero-orb home__hero-orb--gold" />
          <div className="home__hero-orb home__hero-orb--green" />
        </div>

        <div className="home__hero-content">
          <div className="home__eyebrow">
            <span className="home__eyebrow-dot" />
            Eid Mubarak — your salami page is one click away
          </div>

          <h1 className="home__headline">
            Share your salami page.<br />
            <span className="text-gradient-gold">Collect every gift.</span>
          </h1>

          <p className="home__subhead">
            One link. Your bKash, Nagad, and Rocket number. A full ledger of every salami you receive — with receipts.
          </p>

          <div className="home__cta-row">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-lg">
                  Create your page — free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            </SignedIn>
            <a href="#features" className="btn btn-secondary btn-lg">See how it works</a>
          </div>

          <p className="home__hint">No credit card. No setup fee. Ready in 2 minutes.</p>
        </div>

        {/* Mock page preview */}
        <div className="home__preview" aria-hidden="true">
          <div className="home__preview-card" data-theme="noor">
            <div className="home__preview-avatar" />
            <div className="home__preview-name skeleton" />
            <div className="home__preview-bio skeleton" />
            <div className="home__preview-methods">
              {['bKash', 'Nagad', 'Rocket'].map((m) => (
                <div key={m} className="home__preview-method">{m}</div>
              ))}
            </div>
            <div className="home__preview-btn">Send Salami 💌</div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="home__features" id="features">
        <div className="home__section-inner">
          <h2 className="home__section-title">Everything your Eid needs</h2>

          <div ref={featuresRef} className="home__features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="home__feature-card card scroll-reveal">
                <div className="home__feature-icon">{f.icon}</div>
                <h3 className="home__feature-title">{f.title}</h3>
                <p className="home__feature-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Themes ────────────────────────────────────────────────── */}
      <section className="home__themes">
        <div className="home__section-inner">
          <h2 className="home__section-title">Six themes, made for Eid</h2>
          <p className="home__section-sub">Three free. Three premium. All beautiful.</p>

          <div ref={themesRef} className="home__themes-row">
            {THEMES.map((t) => (
              <div key={t.id} className="home__theme-swatch scroll-reveal">
                <div
                  className="home__theme-dot"
                  style={{ background: t.color, boxShadow: `0 0 16px ${t.color}55` }}
                />
                <span className="home__theme-label">{t.label}</span>
                {t.free
                  ? <span className="badge badge-green">Free</span>
                  : <span className="badge badge-gold">Premium</span>
                }
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <section className="home__pricing" id="pricing">
        <div className="home__section-inner">
          <h2 className="home__section-title">Salami-sized pricing</h2>
          <p className="home__section-sub">We charge salami prices — because that's what this is for.</p>

          <div ref={pricingRef} className="home__pricing-grid">

            {/* Free */}
            <div className="home__plan card scroll-reveal">
              <div className="home__plan-header">
                <h3 className="home__plan-name">Free</h3>
                <div className="home__plan-price">
                  <span className="home__plan-amount">৳0</span>
                </div>
              </div>
              <ul className="home__plan-perks">
                <li>1 salami page</li>
                <li>Ledger (unlimited entries)</li>
                <li>3 free themes</li>
                <li>Basic receipts</li>
              </ul>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    Start free
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Monthly */}
            <div className="home__plan home__plan--featured card scroll-reveal">
              <div className="home__plan-badge badge badge-gold">Most popular</div>
              <div className="home__plan-header">
                <h3 className="home__plan-name">Eid Pass</h3>
                <div className="home__plan-price">
                  <span className="home__plan-amount text-gradient-gold">৳17</span>
                  <span className="home__plan-period">/ 11 months</span>
                </div>
              </div>
              <ul className="home__plan-perks">
                <li>Everything in Free</li>
                <li>All 6 themes</li>
                <li>PDF receipts</li>
                <li>Page analytics</li>
              </ul>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Get Eid Pass
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard/subscribe" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Get Eid Pass
                </Link>
              </SignedIn>
            </div>

            {/* Lifetime */}
            <div className="home__plan card scroll-reveal">
              <div className="home__plan-header">
                <h3 className="home__plan-name">Lifetime</h3>
                <div className="home__plan-price">
                  <span className="home__plan-amount">৳29</span>
                  <span className="home__plan-period">one-time</span>
                </div>
              </div>
              <ul className="home__plan-perks">
                <li>Everything in Eid Pass</li>
                <li>5 years access</li>
                <li>Priority support</li>
                <li>Future features</li>
              </ul>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    Go Lifetime
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard/subscribe" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Go Lifetime
                </Link>
              </SignedIn>
            </div>
          </div>

          <p className="home__pricing-note">
            Pay via bKash, Nagad, or Rocket — confirmed manually within 24h.
          </p>
        </div>
      </section>

    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">

        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="Salami home">
          <span className="navbar__logo-icon">🌙</span>
          <span className="navbar__logo-text">
            Salami<span className="navbar__logo-dot">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar__links">
          <Link to="/#features" className="navbar__link">Features</Link>
          <Link to="/#pricing"  className="navbar__link">Pricing</Link>
        </div>

        {/* Auth area */}
        <div className="navbar__auth">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-secondary btn-sm">Sign in</button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="btn btn-primary btn-sm">Get started</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobile" role="menu">
          <Link to="/#features" className="navbar__mobile-link" role="menuitem">Features</Link>
          <Link to="/#pricing"  className="navbar__mobile-link" role="menuitem">Pricing</Link>
          <div className="navbar__mobile-auth">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-primary">Get started free</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  )
}

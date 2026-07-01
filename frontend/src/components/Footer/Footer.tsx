import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">🌙 Salami<span>.</span></span>
          <p className="footer__tagline">Your Eid gift page — share, collect, remember.</p>
        </div>

        <nav className="footer__nav" aria-label="Footer navigation">
          <Link to="/#features" className="footer__link">Features</Link>
          <Link to="/#pricing"  className="footer__link">Pricing</Link>
          <Link to="/privacy"   className="footer__link">Privacy</Link>
          <Link to="/terms"     className="footer__link">Terms</Link>
        </nav>

        <p className="footer__copy">
          © {year} Salami. Built with <span aria-label="love">❤️</span> in Bangladesh.
        </p>
      </div>
    </footer>
  )
}

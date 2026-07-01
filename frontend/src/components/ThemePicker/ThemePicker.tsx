import type { ThemeId } from '../../types'
import './ThemePicker.css'

interface ThemeDef {
  id:       ThemeId
  label:    string
  arabicLabel: string
  palette:  string[]    // 2 preview colors
  free:     boolean
  desc:     string
}

const THEMES: ThemeDef[] = [
  {
    id: 'noor', label: 'Noor', arabicLabel: 'نور',
    palette: ['#f5c850', '#1a1810'], free: true,
    desc: 'Warm gold on ivory — the classic Eid feel.',
  },
  {
    id: 'sabz', label: 'Sabz', arabicLabel: 'سبز',
    palette: ['#28c878', '#0d1a12'], free: true,
    desc: 'Deep emerald, the colour of celebration.',
  },
  {
    id: 'fajr', label: 'Fajr', arabicLabel: 'فجر',
    palette: ['#b8a8e8', '#12121e'], free: true,
    desc: 'Soft lavender dawn — calm and beautiful.',
  },
  {
    id: 'zafran', label: 'Zafran', arabicLabel: 'زعفران',
    palette: ['#e6821e', '#1d1510'], free: false,
    desc: 'Saffron spice — bold, warm, unforgettable.',
  },
  {
    id: 'layla', label: 'Layla', arabicLabel: 'ليلى',
    palette: ['#d4878a', '#130f1e'], free: false,
    desc: 'Midnight rose gold — elegant and romantic.',
  },
  {
    id: 'qamar', label: 'Qamar', arabicLabel: 'قمر',
    palette: ['#a0b4dc', '#0c1020'], free: false,
    desc: 'Moonlit navy — quiet, refined, striking.',
  },
]

interface Props {
  value:       ThemeId
  onChange:    (id: ThemeId) => void
  isPremium:   boolean
  onUpgrade?:  () => void
}

export default function ThemePicker({ value, onChange, isPremium, onUpgrade }: Props) {
  return (
    <div className="theme-picker">
      <div className="theme-picker__grid">
        {THEMES.map((theme) => {
          const locked    = !theme.free && !isPremium
          const selected  = value === theme.id

          return (
            <button
              key={theme.id}
              type="button"
              className={`theme-card ${selected ? 'theme-card--selected' : ''} ${locked ? 'theme-card--locked' : ''}`}
              onClick={() => {
                if (locked) { onUpgrade?.(); return }
                onChange(theme.id)
              }}
              aria-pressed={selected}
              aria-label={`${theme.label} theme${locked ? ' (premium)' : ''}`}
            >
              {/* Color swatch preview */}
              <div
                className="theme-card__swatch"
                style={{ background: `linear-gradient(135deg, ${theme.palette[0]} 0%, ${theme.palette[1]} 100%)` }}
              >
                {locked && (
                  <span className="theme-card__lock" aria-hidden="true">🔒</span>
                )}
                {selected && !locked && (
                  <span className="theme-card__check" aria-hidden="true">✓</span>
                )}
              </div>

              <div className="theme-card__info">
                <div className="theme-card__names">
                  <span className="theme-card__label">{theme.label}</span>
                  <span className="theme-card__arabic">{theme.arabicLabel}</span>
                </div>
                <p className="theme-card__desc">{theme.desc}</p>
                {!theme.free && (
                  <span className="badge badge-gold" style={{ marginTop: 4 }}>Premium</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

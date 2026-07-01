import './LedgerStats.css'

interface Props {
  totalAmount:   number
  totalEntries:  number
  verifiedCount: number
  pendingCount:  number
  loading:       boolean
}

export default function LedgerStats({ totalAmount, totalEntries, verifiedCount, pendingCount, loading }: Props) {
  const stats = [
    {
      label:    'Total received',
      value:    `৳${totalAmount.toLocaleString()}`,
      icon:     '💰',
      accent:   true,
    },
    {
      label:    'Total gifts',
      value:    totalEntries,
      icon:     '🎁',
      accent:   false,
    },
    {
      label:    'Verified',
      value:    verifiedCount,
      icon:     '✓',
      accent:   false,
      green:    true,
    },
    {
      label:    'Pending',
      value:    pendingCount,
      icon:     '⏳',
      accent:   false,
      amber:    true,
    },
  ]

  return (
    <div className="lstats">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`lstats__item ${s.accent ? 'lstats__item--accent' : ''} ${s.green ? 'lstats__item--green' : ''} ${s.amber ? 'lstats__item--amber' : ''}`}
        >
          <span className="lstats__icon" aria-hidden="true">{s.icon}</span>
          <span className={`lstats__value ${loading ? 'skeleton' : ''}`} style={loading ? { width: 60, height: 28, display: 'block' } : {}}>
            {!loading && s.value}
          </span>
          <span className="lstats__label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

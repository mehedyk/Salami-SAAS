import { useEffect } from 'react'
import { adminApi } from '../../../../utils/api'
import { useApi }   from '../../../../hooks/useApi'
import './AdminStats.css'

export default function AdminStats() {
  const statsState = useApi(
    adminApi.stats as () => Promise<{ success: boolean; data?: { users: number; subscriptions: { pending: number; approved: number; rejected: number; total_revenue: number } }; message?: string }>
  )

  useEffect(() => { statsState.execute() }, []) // eslint-disable-line

  const s = statsState.data

  const cards = [
    { label: 'Total users',    value: s?.users                        ?? '—', icon: '👥', color: 'blue'   },
    { label: 'Total revenue',  value: s ? `৳${s.subscriptions.total_revenue}` : '—', icon: '💰', color: 'gold'   },
    { label: 'Active subs',    value: s?.subscriptions.approved       ?? '—', icon: '⭐', color: 'green'  },
    { label: 'Pending review', value: s?.subscriptions.pending        ?? '—', icon: '⏳', color: 'amber'  },
  ]

  return (
    <div className="astats">
      {cards.map((c) => (
        <div key={c.label} className={`astats__card astats__card--${c.color}`}>
          <span className="astats__icon">{c.icon}</span>
          <span className={`astats__value ${statsState.loading ? 'skeleton' : ''}`}
            style={statsState.loading ? { width: 60, height: 28, display: 'block' } : {}}
          >
            {!statsState.loading && c.value}
          </span>
          <span className="astats__label">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

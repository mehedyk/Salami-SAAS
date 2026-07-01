import { useState } from 'react'
import { useSalamiUser }      from '../../../hooks/useSalamiUser'
import AdminStats             from './AdminStats/AdminStats'
import AdminSubscriptions     from './AdminSubscriptions/AdminSubscriptions'
import AdminUsers             from './AdminUsers/AdminUsers'
import LoadingSpinner         from '../../../components/LoadingSpinner/LoadingSpinner'
import './Admin.css'

type Tab = 'stats' | 'subscriptions' | 'users'

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'stats',         label: 'Overview',      icon: '📊' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '⭐' },
  { id: 'users',         label: 'Users',         icon: '👥' },
]

export default function Admin() {
  const { isAdmin, loading } = useSalamiUser()
  const [tab, setTab]        = useState<Tab>('stats')

  if (loading) return <LoadingSpinner fullPage />

  if (!isAdmin) {
    return (
      <div className="admin__forbidden">
        <span>🚫</span>
        <h2>Access denied</h2>
        <p>This area is for admins only.</p>
      </div>
    )
  }

  return (
    <div className="admin">
      <div className="admin__header">
        <div>
          <h1 className="admin__title">Admin Panel</h1>
          <p className="admin__sub">Manage subscriptions, users, and platform stats.</p>
        </div>
        <span className="badge badge-gold">Admin</span>
      </div>

      {/* ── Tabs ── */}
      <div className="admin__tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`admin__tab ${tab === t.id ? 'admin__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Panels ── */}
      <div className="admin__panel" role="tabpanel">
        {tab === 'stats'         && <AdminStats />}
        {tab === 'subscriptions' && <AdminSubscriptions />}
        {tab === 'users'         && <AdminUsers />}
      </div>
    </div>
  )
}

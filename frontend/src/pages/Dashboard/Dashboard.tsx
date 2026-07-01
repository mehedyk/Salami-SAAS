import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useSalamiUser } from '../../hooks/useSalamiUser'
import DashboardHome from './DashboardHome/DashboardHome'
import PageBuilder   from './PageBuilder/PageBuilder'
import Ledger        from './Ledger/Ledger'
import Subscribe     from './Subscribe/Subscribe'
import Admin         from './Admin/Admin'
import './Dashboard.css'

export default function Dashboard() {
  const { user }    = useUser()
  const { isAdmin } = useSalamiUser()

  const NAV = [
    { to: '',        label: 'Overview',  icon: '📊' },
    { to: 'page',    label: 'My Page',   icon: '🌙' },
    { to: 'ledger',  label: 'Ledger',    icon: '📋' },
    { to: 'sub',     label: 'Subscribe', icon: '⭐' },
    ...(isAdmin ? [{ to: 'admin', label: 'Admin', icon: '🔑' }] : []),
  ]

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <aside className="dashboard__sidebar">
        <div className="dashboard__sidebar-user">
          {user?.imageUrl
            ? <img src={user.imageUrl} alt="" className="dashboard__sidebar-avatar" />
            : <div className="dashboard__sidebar-avatar dashboard__sidebar-avatar--placeholder" />
          }
          <div className="dashboard__sidebar-info">
            <span className="dashboard__sidebar-name">{user?.firstName ?? 'User'}</span>
            <span className="dashboard__sidebar-role">Salami page</span>
          </div>
        </div>

        <nav className="dashboard__nav" aria-label="Dashboard navigation">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ''}
              className={({ isActive }) =>
                `dashboard__nav-item ${isActive ? 'dashboard__nav-item--active' : ''}`
              }
            >
              <span className="dashboard__nav-icon" aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="dashboard__main">
        <Routes>
          <Route index         element={<DashboardHome />} />
          <Route path="page"   element={<PageBuilder />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="sub"    element={<Subscribe />} />
          <Route path="admin"  element={<Admin />} />
          <Route path="*"      element={<Navigate to="" replace />} />
        </Routes>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="dashboard__bottomnav" aria-label="Dashboard mobile navigation">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ''}
            className={({ isActive }) =>
              `dashboard__bottomnav-item ${isActive ? 'dashboard__bottomnav-item--active' : ''}`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

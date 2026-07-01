import { useState, useEffect } from 'react'
import { adminApi } from '../../../../utils/api'
import { useApi }   from '../../../../hooks/useApi'
import type { User } from '../../../../types'
import './AdminUsers.css'

const TIER_BADGE: Record<string, string> = {
  free:     'badge-neutral',
  monthly:  'badge-gold',
  lifetime: 'badge-gold',
}

const TIER_LABEL: Record<string, string> = {
  free:     'Free',
  monthly:  'Eid Pass',
  lifetime: 'Lifetime',
}

export default function AdminUsers() {
  const [page, setPage] = useState(1)

  const usersState = useApi(
    () => adminApi.users({ page, per_page: 20 }) as Promise<{ success: boolean; data?: { items: User[]; total: number; pages: number }; message?: string }>
  )

  useEffect(() => { usersState.execute() }, [page]) // eslint-disable-line

  const users = (usersState.data?.items as User[]) ?? []
  const total = usersState.data?.total ?? 0
  const pages = usersState.data?.pages ?? 1

  return (
    <div className="ausers">
      <p className="ausers__count">{total} registered users</p>

      {usersState.loading ? (
        <div className="ausers__skeletons">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="ausers__skeleton skeleton" />)}
        </div>
      ) : (
        <div className="ausers__table-wrap">
          <table className="ausers__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Plan</th>
                <th>Joined</th>
                {/* Admin indicator */}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="ausers__row">
                  <td className="ausers__user-cell">
                    <div className="ausers__avatar">
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" />
                        : <span>{(u.display_name || u.email).charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="ausers__user-info">
                      <span className="ausers__name">{u.display_name || '—'}</span>
                      <span className="ausers__email">{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <code className="ausers__username">{u.username ?? '—'}</code>
                  </td>
                  <td>
                    <span className={`badge ${TIER_BADGE[u.subscription] ?? 'badge-neutral'}`}>
                      {TIER_LABEL[u.subscription] ?? u.subscription}
                    </span>
                  </td>
                  <td className="ausers__date">
                    {new Date(u.created_at).toLocaleDateString('en-BD', { dateStyle: 'short' })}
                  </td>
                  <td>
                    {u.is_admin && <span className="badge badge-gold">Admin</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="ausers__pagination">
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>← Prev</button>
          <span className="ausers__page-label">Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page === pages}>Next →</button>
        </div>
      )}
    </div>
  )
}

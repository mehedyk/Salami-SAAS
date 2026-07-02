import { useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useApi, useMutation } from '../../../hooks/useApi'
import { pagesApi, ledgerApi, subscriptionsApi } from '../../../utils/api'
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner'
import { useToast }    from '../../../components/Toast/Toast'
import ShareButton   from '../../../components/ShareButton/ShareButton'
import type { SalamiPage } from '../../../types'
import './DashboardHome.css'

export default function DashboardHome() {
  const { toast } = useToast()

  const pageState    = useApi(pagesApi.mine as () => Promise<{ success: boolean; data?: SalamiPage; message?: string }>)
  const tierState    = useApi(subscriptionsApi.active as () => Promise<{ success: boolean; data?: { tier: string; is_premium: boolean }; message?: string }>)

  const publishMut   = useMutation(pagesApi.publish)
  const unpublishMut = useMutation(pagesApi.unpublish)

  useEffect(() => {
    pageState.execute()
    tierState.execute()
  }, []) // eslint-disable-line

  const summaryState = useApi(
    useCallback(
      () => pageState.data ? ledgerApi.summary(pageState.data._id) : Promise.resolve({ success: false }),
      [pageState.data]
    )
  )

  useEffect(() => {
    if (pageState.data?._id) summaryState.execute()
  }, [pageState.data?._id]) // eslint-disable-line

  const togglePublish = async () => {
    const page = pageState.data
    if (!page) return
    if (page.is_published) {
      const ok = await unpublishMut.mutate(page._id)
      if (ok) { toast('Page unpublished.', 'info'); pageState.execute() }
      else toast(unpublishMut.error ?? 'Failed.', 'error')
    } else {
      const ok = await publishMut.mutate(page._id)
      if (ok) { toast('Page published! 🎉', 'success'); pageState.execute() }
      else toast(publishMut.error ?? 'Failed.', 'error')
    }
  }

  if (pageState.loading) return <LoadingSpinner fullPage />

  const page    = pageState.data
  const summary = summaryState.data
  const tier    = tierState.data?.tier ?? 'free'

  return (
    <div className="db-home">
      <div className="db-home__header">
        <div>
          <h1 className="db-home__title">Overview</h1>
          <p className="db-home__sub">Your salami page at a glance.</p>
        </div>
        <span className={`badge ${tier === 'free' ? 'badge-neutral' : 'badge-gold'}`}>
          {tier === 'free' ? 'Free' : tier === 'monthly' ? 'Eid Pass' : 'Lifetime'}
        </span>
      </div>

      {/* ── No page yet ── */}
      {!page ? (
        <div className="db-home__empty card">
          <span className="db-home__empty-icon">🌙</span>
          <h2>Create your salami page</h2>
          <p>One beautiful link where family can send you Eid salami.</p>
          <Link to="/dashboard/page" className="btn btn-primary btn-lg">
            Create page
          </Link>
        </div>
      ) : (
        <>
          {/* ── Stats ── */}
          <div className="db-home__stats">
            {[
              { label: 'Total received',  value: summary ? `৳${summary.total_amount.toLocaleString()}` : '—',  icon: '💰' },
              { label: 'Entries',         value: summary?.total_entries  ?? '—', icon: '📋' },
              { label: 'Verified',        value: summary?.verified_count ?? '—', icon: '✓'  },
              { label: 'Page views',      value: page.view_count ?? 0,            icon: '👁'  },
            ].map((stat) => (
              <div key={stat.label} className="db-home__stat card">
                <span className="db-home__stat-icon" aria-hidden="true">{stat.icon}</span>
                <span className="db-home__stat-value">{stat.value}</span>
                <span className="db-home__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* ── Page card ── */}
          <div className="db-home__page-card card">
            <div className="db-home__page-info">
              <div className="db-home__page-meta">
                <h3 className="db-home__page-title">{page.title}</h3>
                <code className="db-home__page-url">salami.app/s/{page.username}</code>
              </div>
              <span className={`badge ${page.is_published ? 'badge-green' : 'badge-neutral'}`}>
                {page.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="db-home__page-actions">
              <button
                className={`btn btn-sm ${page.is_published ? 'btn-secondary' : 'btn-primary'}`}
                onClick={togglePublish}
                disabled={publishMut.loading || unpublishMut.loading}
              >
                {publishMut.loading || unpublishMut.loading
                  ? 'Saving…'
                  : page.is_published ? 'Unpublish' : 'Publish page'
                }
              </button>

              {page.is_published && (
                <a
                  href={`/s/${page.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  View page ↗
                </a>
              )}

              <Link to="/dashboard/page" className="btn btn-ghost btn-sm">Edit</Link>
              {page.is_published && (
                <ShareButton url={`/s/${page.username}`} label="Share page" size="sm" />
              )}
              <Link to="/dashboard/ledger" className="btn btn-ghost btn-sm">Ledger →</Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

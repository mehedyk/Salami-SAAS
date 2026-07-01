import { useState, useEffect, useCallback } from 'react'
import { pagesApi, ledgerApi } from '../../../utils/api'
import { useApi } from '../../../hooks/useApi'
import LedgerStats    from './LedgerStats/LedgerStats'
import LedgerEntryCard from './LedgerEntry/LedgerEntry'
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner'
import { useToast }   from '../../../components/Toast/Toast'
import type { SalamiPage, LedgerEntry } from '../../../types'
import './Ledger.css'

type Filter = 'all' | 'verified' | 'pending'

const PER_PAGE = 15

export default function Ledger() {
  const { toast } = useToast()

  const pageState = useApi(
    pagesApi.mine as () => Promise<{ success: boolean; data?: SalamiPage; message?: string }>
  )

  const [filter,  setFilter]  = useState<Filter>('all')
  const [page,    setPage]    = useState(1)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [total,   setTotal]   = useState(0)
  const [pages,   setPages]   = useState(1)
  const [loading, setLoading] = useState(false)

  const summaryState = useApi(
    useCallback(
      () => pageState.data
        ? ledgerApi.summary(pageState.data._id) as Promise<{ success: boolean; data?: { total_amount: number; total_entries: number; verified_count: number; pending_count: number }; message?: string }>
        : Promise.resolve({ success: false }),
      [pageState.data]
    )
  )

  useEffect(() => { pageState.execute() }, []) // eslint-disable-line

  useEffect(() => {
    if (pageState.data?._id) summaryState.execute()
  }, [pageState.data?._id]) // eslint-disable-line

  const fetchEntries = useCallback(async (pg: number, f: Filter) => {
    if (!pageState.data?._id) return
    setLoading(true)
    try {
      const res = await ledgerApi.list(pageState.data._id, {
        page:     pg,
        per_page: PER_PAGE,
        ...(f === 'verified' ? { verified: true } : f === 'pending' ? { verified: false } : {}),
      })
      if (res.success && res.data) {
        setEntries(res.data.items)
        setTotal(res.data.total)
        setPages(res.data.pages)
      }
    } catch {
      toast('Could not load entries.', 'error')
    } finally {
      setLoading(false)
    }
  }, [pageState.data?._id, toast])

  useEffect(() => {
    if (pageState.data?._id) fetchEntries(page, filter)
  }, [pageState.data?._id, page, filter]) // eslint-disable-line

  const handleFilterChange = (f: Filter) => {
    setFilter(f)
    setPage(1)
  }

  const handleRefresh = () => {
    fetchEntries(page, filter)
    summaryState.execute()
  }

  if (pageState.loading) return <LoadingSpinner fullPage />

  if (!pageState.data) {
    return (
      <div className="ledger__no-page">
        <span>🌙</span>
        <h2>No page yet</h2>
        <p>Create your salami page first, then entries will appear here.</p>
        <a href="/dashboard/page" className="btn btn-primary">Create page</a>
      </div>
    )
  }

  const summary   = summaryState.data
  const totalPgs  = pages
  const hasPrev   = page > 1
  const hasNext   = page < totalPgs

  return (
    <div className="ledger">

      {/* ── Header ── */}
      <div className="ledger__header">
        <div>
          <h1 className="ledger__title">Ledger</h1>
          <p className="ledger__sub">Every salami you've received — verified and tracked.</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleRefresh}
          disabled={loading}
          aria-label="Refresh entries"
        >
          {loading ? '…' : '↻ Refresh'}
        </button>
      </div>

      {/* ── Stats ── */}
      <LedgerStats
        totalAmount={summary?.total_amount   ?? 0}
        totalEntries={summary?.total_entries  ?? 0}
        verifiedCount={summary?.verified_count ?? 0}
        pendingCount={summary?.pending_count   ?? 0}
        loading={summaryState.loading}
      />

      {/* ── Filter tabs ── */}
      <div className="ledger__filters" role="tablist" aria-label="Filter entries">
        {(['all', 'verified', 'pending'] as Filter[]).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            className={`ledger__filter-btn ${filter === f ? 'ledger__filter-btn--active' : ''}`}
            onClick={() => handleFilterChange(f)}
          >
            {f === 'all'      && `All${total ? ` (${total})` : ''}`}
            {f === 'verified' && `Verified${summary?.verified_count ? ` (${summary.verified_count})` : ''}`}
            {f === 'pending'  && `Pending${summary?.pending_count ? ` (${summary.pending_count})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── Entry list ── */}
      {loading ? (
        <div className="ledger__loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ledger__skeleton" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="ledger__empty">
          <span className="ledger__empty-icon" aria-hidden="true">
            {filter === 'verified' ? '✓' : filter === 'pending' ? '⏳' : '🎁'}
          </span>
          <h3>
            {filter === 'all'      && 'No entries yet'}
            {filter === 'verified' && 'No verified entries'}
            {filter === 'pending'  && 'No pending entries'}
          </h3>
          <p>
            {filter === 'all'
              ? 'Share your salami page and entries will appear here.'
              : 'Switch to "All" to see every entry.'
            }
          </p>
        </div>
      ) : (
        <div className="ledger__list" role="list">
          {entries.map((entry) => (
            <div key={entry._id} role="listitem">
              <LedgerEntryCard
                entry={entry}
                page={pageState.data!}
                onUpdate={handleRefresh}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPgs > 1 && (
        <nav className="ledger__pagination" aria-label="Entries pagination">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={!hasPrev || loading}
            aria-label="Previous page"
          >
            ← Prev
          </button>

          <div className="ledger__page-info">
            <span>Page <strong>{page}</strong> of <strong>{totalPgs}</strong></span>
            <span className="ledger__page-total">{total} entries</span>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
            aria-label="Next page"
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  )
}

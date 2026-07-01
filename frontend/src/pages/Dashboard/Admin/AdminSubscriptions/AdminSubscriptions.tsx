import { useState, useEffect } from 'react'
import { adminApi } from '../../../../utils/api'
import { useApi, useMutation } from '../../../../hooks/useApi'
import { useToast } from '../../../../components/Toast/Toast'
import Modal        from '../../../../components/Modal/Modal'
import type { Subscription } from '../../../../types'
import './AdminSubscriptions.css'

const TIER_LABELS: Record<string, string> = { monthly: 'Eid Pass · ৳17', lifetime: 'Lifetime · ৳29' }

export default function AdminSubscriptions() {
  const { toast }  = useToast()
  const [viewSub,  setViewSub]  = useState<Subscription | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [page, setPage] = useState(1)

  const subsState = useApi(
    () => (tab === 'pending' ? adminApi.pendingSubs : adminApi.allSubs)({ page, per_page: 20 }) as Promise<{ success: boolean; data?: { items: Subscription[]; total: number; pages: number }; message?: string }>
  )

  const approveMut = useMutation((id: string) => adminApi.approve(id))
  const rejectMut  = useMutation((id: string, note: string) => adminApi.reject(id, note))

  useEffect(() => { subsState.execute() }, [tab, page]) // eslint-disable-line

  const handleApprove = async (id: string, tier: string) => {
    const ok = await approveMut.mutate(id)
    if (ok) { toast(`Approved! User upgraded to ${tier}.`, 'success'); subsState.execute() }
    else toast(approveMut.error ?? 'Approve failed.', 'error')
  }

  const openReject = (id: string) => { setRejectTarget(id); setRejectNote('') }

  const handleReject = async () => {
    if (!rejectTarget) return
    const ok = await rejectMut.mutate(rejectTarget, rejectNote)
    if (ok) { toast('Subscription rejected.', 'info'); setRejectTarget(null); subsState.execute() }
    else toast(rejectMut.error ?? 'Reject failed.', 'error')
  }

  const subs  = (subsState.data?.items as Subscription[]) ?? []
  const total = subsState.data?.total ?? 0
  const pages = subsState.data?.pages ?? 1

  return (
    <div className="asubs">
      {/* ── Tabs ── */}
      <div className="asubs__tabs">
        {(['pending', 'all'] as const).map((t) => (
          <button
            key={t}
            className={`asubs__tab ${tab === t ? 'asubs__tab--active' : ''}`}
            onClick={() => { setTab(t); setPage(1) }}
          >
            {t === 'pending' ? 'Pending review' : 'All subscriptions'}
          </button>
        ))}
      </div>

      <p className="asubs__count">{total} {tab === 'pending' ? 'pending' : 'total'}</p>

      {/* ── List ── */}
      {subsState.loading ? (
        <div className="asubs__skeletons">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="asubs__skeleton skeleton" />)}
        </div>
      ) : subs.length === 0 ? (
        <div className="asubs__empty">
          <span>✓</span>
          <p>No {tab === 'pending' ? 'pending' : ''} subscriptions.</p>
        </div>
      ) : (
        <div className="asubs__list">
          {subs.map((sub) => (
            <div key={sub._id} className={`asubs__card card asubs__card--${sub.status}`}>
              <div className="asubs__card-left">
                <div className="asubs__card-tier">
                  <span className={`badge ${sub.status === 'approved' ? 'badge-green' : sub.status === 'rejected' ? 'badge-red' : 'badge-neutral'}`}>
                    {sub.status}
                  </span>
                  <strong className="asubs__tier-label">{TIER_LABELS[sub.tier] ?? sub.tier}</strong>
                </div>

                <div className="asubs__card-meta">
                  <span className="asubs__method">{sub.payment_method}</span>
                  <code className="asubs__number">{sub.payment_number}</code>
                  <code className="asubs__txn">{sub.transaction_id}</code>
                </div>

                <span className="asubs__date">
                  {new Date(sub.created_at).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
                </span>

                {sub.admin_note && (
                  <span className="asubs__note">Note: {sub.admin_note}</span>
                )}
              </div>

              <div className="asubs__card-right">
                {/* Screenshot preview */}
                {sub.screenshot_url ? (
                  <button className="asubs__screenshot-btn" onClick={() => setViewSub(sub)} title="View screenshot">
                    <img src={sub.screenshot_url} alt="Payment screenshot" className="asubs__screenshot-thumb" />
                    <span>View</span>
                  </button>
                ) : (
                  <span className="asubs__no-screenshot">No screenshot</span>
                )}

                {/* Actions — only for pending */}
                {sub.status === 'pending' && (
                  <div className="asubs__actions">
                    <button
                      className="btn btn-sm asubs__approve-btn"
                      onClick={() => handleApprove(sub._id, sub.tier)}
                      disabled={approveMut.loading || rejectMut.loading}
                    >
                      {approveMut.loading ? '…' : '✓ Approve'}
                    </button>
                    <button
                      className="btn btn-sm btn-secondary asubs__reject-btn"
                      onClick={() => openReject(sub._id)}
                      disabled={approveMut.loading || rejectMut.loading}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className="asubs__pagination">
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>← Prev</button>
          <span className="asubs__page-label">Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page === pages}>Next →</button>
        </div>
      )}

      {/* ── Screenshot modal ── */}
      <Modal open={!!viewSub} onClose={() => setViewSub(null)} title="Payment screenshot" size="md">
        {viewSub?.screenshot_url && (
          <div className="asubs__screenshot-modal">
            <img src={viewSub.screenshot_url} alt="Payment screenshot" />
            <div className="asubs__screenshot-details">
              <span>{TIER_LABELS[viewSub.tier]}</span>
              <span>{viewSub.payment_method} · {viewSub.payment_number}</span>
              <code>{viewSub.transaction_id}</code>
            </div>
            {viewSub.status === 'pending' && (
              <div className="asubs__screenshot-actions">
                <button className="btn btn-primary" onClick={() => { handleApprove(viewSub._id, viewSub.tier); setViewSub(null) }}>
                  ✓ Approve
                </button>
                <button className="btn btn-secondary" onClick={() => { openReject(viewSub._id); setViewSub(null) }}>
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Reject modal ── */}
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject subscription" size="sm">
        <div className="asubs__reject-modal">
          <p>Add an optional note for the user (why rejected, what to fix).</p>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="e.g. Transaction ID not found, please resubmit."
            rows={3}
            maxLength={300}
          />
          <div className="asubs__reject-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setRejectTarget(null)}>Cancel</button>
            <button className="btn btn-danger btn-sm" onClick={handleReject} disabled={rejectMut.loading}>
              {rejectMut.loading ? 'Rejecting…' : 'Confirm reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

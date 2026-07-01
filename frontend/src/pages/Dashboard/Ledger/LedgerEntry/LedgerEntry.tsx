import { useState } from 'react'
import { ledgerApi } from '../../../../utils/api'
import { useMutation } from '../../../../hooks/useApi'
import Modal         from '../../../../components/Modal/Modal'
import ReceiptViewer from '../ReceiptViewer/ReceiptViewer'
import { useToast }  from '../../../../components/Toast/Toast'
import type { LedgerEntry, SalamiPage } from '../../../../types'
import './LedgerEntry.css'

const PROVIDER_META: Record<string, { label: string; color: string }> = {
  bkash:  { label: 'bKash',  color: '#e2136e' },
  nagad:  { label: 'Nagad',  color: '#f26522' },
  rocket: { label: 'Rocket', color: '#8b2fc9' },
  bank:   { label: 'Bank',   color: '#2563eb' },
}

interface Props {
  entry:    LedgerEntry
  page:     SalamiPage
  onUpdate: () => void
}

export default function LedgerEntryCard({ entry, page, onUpdate }: Props) {
  const { toast }           = useToast()
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const verifyMut   = useMutation(() => ledgerApi.verify(entry._id))
  const unverifyMut = useMutation(() => ledgerApi.unverify(entry._id))
  const deleteMut   = useMutation(() => ledgerApi.delete(entry._id))

  const provider = PROVIDER_META[entry.provider] ?? { label: entry.provider, color: '#94a3b8' }

  const handleVerifyToggle = async () => {
    if (entry.is_verified) {
      const ok = await unverifyMut.mutate()
      if (ok) { toast('Marked as unverified.', 'info'); onUpdate() }
      else toast(unverifyMut.error ?? 'Failed.', 'error')
    } else {
      const ok = await verifyMut.mutate()
      if (ok) { toast('Entry verified. ✓', 'success'); onUpdate() }
      else toast(verifyMut.error ?? 'Failed.', 'error')
    }
  }

  const handleDelete = async () => {
    const ok = await deleteMut.mutate()
    if (ok) { toast('Entry deleted.', 'info'); onUpdate() }
    else toast(deleteMut.error ?? 'Failed.', 'error')
    setConfirmDelete(false)
  }

  const isActing = verifyMut.loading || unverifyMut.loading || deleteMut.loading

  const timeAgo = (() => {
    const diff = Date.now() - new Date(entry.created_at).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ago`
    if (h > 0) return `${h}h ago`
    if (m > 0) return `${m}m ago`
    return 'just now'
  })()

  return (
    <>
      <article
        className={`le ${entry.is_verified ? 'le--verified' : ''}`}
        aria-label={`Salami from ${entry.sender_name}`}
      >
        {/* ── Left: sender info ── */}
        <div className="le__left">
          <div className="le__avatar" aria-hidden="true">
            {entry.sender_name.charAt(0).toUpperCase()}
          </div>
          <div className="le__info">
            <span className="le__sender">{entry.sender_name}</span>
            {entry.sender_note && (
              <p className="le__note">"{entry.sender_note}"</p>
            )}
            <div className="le__meta">
              <span
                className="le__provider"
                style={{ '--provider-color': provider.color } as React.CSSProperties}
              >
                {provider.label}
              </span>
              {entry.transaction_id && (
                <code className="le__txn" title="Transaction ID">{entry.transaction_id}</code>
              )}
              <span className="le__time">{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* ── Right: amount + actions ── */}
        <div className="le__right">
          <span className="le__amount">৳{entry.amount.toLocaleString()}</span>

          <div className="le__badges">
            {entry.is_verified
              ? <span className="badge badge-green">Verified</span>
              : <span className="badge badge-neutral">Pending</span>
            }
            {entry.receipt_url && (
              <span className="badge badge-gold" title="Has receipt">🧾</span>
            )}
          </div>

          <div className="le__actions">
            {/* Verify toggle */}
            <button
              className={`le__action-btn ${entry.is_verified ? 'le__action-btn--unverify' : 'le__action-btn--verify'}`}
              onClick={handleVerifyToggle}
              disabled={isActing}
              title={entry.is_verified ? 'Mark as unverified' : 'Mark as verified'}
              aria-label={entry.is_verified ? 'Unverify entry' : 'Verify entry'}
            >
              {verifyMut.loading || unverifyMut.loading
                ? '…'
                : entry.is_verified ? '✓ Verified' : '○ Verify'
              }
            </button>

            {/* Receipt */}
            <button
              className="le__action-btn le__action-btn--receipt"
              onClick={() => setReceiptOpen(true)}
              disabled={isActing}
              title="View or upload receipt"
              aria-label="Manage receipt"
            >
              🧾
            </button>

            {/* Delete */}
            <button
              className="le__action-btn le__action-btn--delete"
              onClick={() => setConfirmDelete(true)}
              disabled={isActing}
              title="Delete entry"
              aria-label="Delete entry"
            >
              {deleteMut.loading ? '…' : '✕'}
            </button>
          </div>
        </div>
      </article>

      {/* ── Receipt modal ── */}
      <Modal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        title="Receipt"
        size="md"
      >
        <ReceiptViewer
          entry={entry}
          page={page}
          onClose={() => setReceiptOpen(false)}
          onSaved={() => { setReceiptOpen(false); onUpdate() }}
        />
      </Modal>

      {/* ── Delete confirm modal ── */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete entry?"
        size="sm"
      >
        <div className="le__delete-confirm">
          <p>
            Remove the salami entry from <strong>{entry.sender_name}</strong> for{' '}
            <strong>৳{entry.amount.toLocaleString()}</strong>? This can't be undone.
          </p>
          <div className="le__delete-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleteMut.loading}>
              {deleteMut.loading ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

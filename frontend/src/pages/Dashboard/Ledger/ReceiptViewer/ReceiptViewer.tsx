import { useState } from 'react'
import { ledgerApi } from '../../../../utils/api'
import { generateReceiptPng, downloadReceiptPng } from '../../../../utils/receiptGenerator'
import ImageUploader from '../../../../components/ImageUploader/ImageUploader'
import { useToast }  from '../../../../components/Toast/Toast'
import type { LedgerEntry, SalamiPage } from '../../../../types'
import './ReceiptViewer.css'

interface Props {
  entry:   LedgerEntry
  page:    SalamiPage
  onClose: () => void
  onSaved: () => void
}

export default function ReceiptViewer({ entry, page, onClose, onSaved }: Props) {
  const { toast }     = useToast()
  const [tab, setTab] = useState<'view' | 'upload'>(entry.receipt_url ? 'view' : 'upload')
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const dataUrl  = await generateReceiptPng(entry, page)
      const filename = `salami-receipt-${entry.sender_name.replace(/\s+/g, '-').toLowerCase()}-${entry._id.slice(-6)}.png`
      downloadReceiptPng(dataUrl, filename)
      toast('Receipt downloaded.', 'success')
    } catch {
      toast('Could not generate receipt.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleUpload = async (file: File) => {
    const res = await ledgerApi.uploadReceipt(entry._id, file)
    if (res.success) {
      toast('Receipt uploaded and entry verified. ✓', 'success')
      onSaved()
    } else {
      throw new Error(res.message)
    }
  }

  return (
    <div className="rv">
      {/* ── Tabs ── */}
      <div className="rv__tabs">
        <button
          className={`rv__tab ${tab === 'view' ? 'rv__tab--active' : ''}`}
          onClick={() => setTab('view')}
        >
          View / Download
        </button>
        <button
          className={`rv__tab ${tab === 'upload' ? 'rv__tab--active' : ''}`}
          onClick={() => setTab('upload')}
        >
          Upload screenshot
        </button>
      </div>

      {/* ── View tab ── */}
      {tab === 'view' && (
        <div className="rv__view">
          {/* Receipt preview */}
          <div className="rv__preview-wrap">
            {entry.receipt_url ? (
              <img
                src={entry.receipt_url}
                alt="Payment receipt"
                className="rv__receipt-img"
              />
            ) : (
              <div className="rv__no-receipt">
                <span>🧾</span>
                <p>No payment screenshot uploaded yet.</p>
                <button className="btn btn-ghost btn-sm" onClick={() => setTab('upload')}>
                  Upload one
                </button>
              </div>
            )}
          </div>

          {/* Generated receipt download */}
          <div className="rv__generated">
            <div className="rv__generated-info">
              <strong>Generated receipt</strong>
              <p>Download a branded PNG receipt for this entry.</p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleDownload}
              disabled={generating}
            >
              {generating ? 'Generating…' : '↓ Download PNG'}
            </button>
          </div>

          {/* Entry summary */}
          <div className="rv__summary">
            {[
              ['From',           entry.sender_name],
              ['Amount',         `৳${entry.amount.toLocaleString()}`],
              ['Method',         entry.provider.charAt(0).toUpperCase() + entry.provider.slice(1)],
              ...(entry.transaction_id ? [['Transaction ID', entry.transaction_id]] as [string,string][] : []),
              ['Date',           new Date(entry.created_at).toLocaleDateString('en-BD', { dateStyle: 'medium' })],
              ['Status',         entry.is_verified ? 'Verified ✓' : 'Pending'],
              ...(entry.sender_note ? [['Note', entry.sender_note]] as [string,string][] : []),
            ].map(([label, value]) => (
              <div key={label} className="rv__row">
                <span className="rv__row-label">{label}</span>
                <span className={`rv__row-value ${label === 'Status' && entry.is_verified ? 'rv__row-value--verified' : label === 'Status' ? 'rv__row-value--pending' : ''}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Upload tab ── */}
      {tab === 'upload' && (
        <div className="rv__upload">
          <p className="rv__upload-hint">
            Upload a screenshot of the payment. This will automatically mark the entry as verified.
          </p>
          <ImageUploader
            type="receipt"
            currentUrl={entry.receipt_url ?? undefined}
            onUpload={handleUpload}
            label="Payment screenshot"
          />
        </div>
      )}

      <div className="rv__footer">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { ledgerApi } from '../../../utils/api'
import { validate, ledgerEntrySchema } from '../../../utils/validation'
import type { PaymentMethod, SalamiPage } from '../../../types'
import './SendSalamiForm.css'

interface Props {
  page:    SalamiPage
  onClose: () => void
}

type Step = 'form' | 'success'

const AMOUNT_PRESETS = [50, 100, 200, 500, 1000]

export default function SendSalamiForm({ page, onClose }: Props) {
  const [step,     setStep]     = useState<Step>('form')
  const [name,     setName]     = useState('')
  const [note,     setNote]     = useState('')
  const [amount,   setAmount]   = useState<number | ''>('')
  const [provider, setProvider] = useState<PaymentMethod['provider']>(
    page.payment_methods[0]?.provider ?? 'bkash'
  )
  const [txnId,    setTxnId]    = useState('')
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(false)
  const confettiRef = useRef<HTMLDivElement>(null)

  const triggerConfetti = () => {
    const el = confettiRef.current
    if (!el) return
    el.innerHTML = ''
    const colors = ['#f5c850', '#28c878', '#d4878a', '#a0b4dc', '#e6821e', '#b8a8e8']
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div')
      piece.className = 'confetti-piece'
      piece.style.setProperty('--x', `${(Math.random() - 0.5) * 300}px`)
      piece.style.setProperty('--y', `${-Math.random() * 300 - 100}px`)
      piece.style.setProperty('--r', `${Math.random() * 720 - 360}deg`)
      piece.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)])
      piece.style.setProperty('--delay', `${Math.random() * 0.4}s`)
      piece.style.setProperty('--size', `${Math.random() * 8 + 5}px`)
      el.appendChild(piece)
    }
    setTimeout(() => { if (el) el.innerHTML = '' }, 2000)
  }

  const handleSubmit = async () => {
    const result = validate(ledgerEntrySchema, {
      senderName:    name,
      senderNote:    note,
      amount:        Number(amount),
      provider,
      transactionId: txnId || undefined,
    })
    if (!result.success) { setErrors(result.errors); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await ledgerApi.submit(page._id, {
        sender_name:    name,
        sender_note:    note,
        amount:         Number(amount),
        provider,
        transaction_id: txnId || undefined,
      })
      if (res.success) {
        triggerConfetti()
        setStep('success')
      } else {
        setErrors({ root: res.message ?? 'Something went wrong.' })
      }
    } catch (e) {
      setErrors({ root: e instanceof Error ? e.message : 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  const selectedMethod = page.payment_methods.find((m) => m.provider === provider)

  if (step === 'success') {
    return (
      <div className="ssf ssf--success">
        <div className="confetti-container" ref={confettiRef} aria-hidden="true" />
        <div className="ssf__success-content">
          <div className="ssf__success-emoji" role="img" aria-label="Celebration">🎉</div>
          <h2 className="ssf__success-title">Salami sent!</h2>
          <p className="ssf__success-sub">
            Your gift of <strong>৳{amount}</strong> has been recorded.
            {page.title.split(' ')[0]} will see it in their ledger.
          </p>
          <p className="ssf__success-eid">Eid Mubarak! 🌙</p>
          <button className="ssf__close-btn themed-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ssf">
      <div className="confetti-container" ref={confettiRef} aria-hidden="true" />

      <div className="ssf__header">
        <h2 className="ssf__title">Send Salami 💌</h2>
        <p className="ssf__sub">Fill in your details after sending payment.</p>
      </div>

      {/* ── Amount ── */}
      <div className="ssf__field">
        <label className="ssf__label">Amount (৳)</label>
        <div className="ssf__presets">
          {AMOUNT_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`ssf__preset ${amount === p ? 'ssf__preset--active' : ''}`}
              onClick={() => { setAmount(p); setErrors((e) => ({ ...e, amount: '' })) }}
            >
              ৳{p}
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={100000}
          value={amount}
          onChange={(e) => { setAmount(e.target.value === '' ? '' : Number(e.target.value)); setErrors((er) => ({ ...er, amount: '' })) }}
          placeholder="or enter custom amount"
          className={errors.amount ? 'input-error' : ''}
        />
        {errors.amount && <span className="ssf__error">{errors.amount}</span>}
      </div>

      {/* ── Provider ── */}
      {page.payment_methods.length > 1 && (
        <div className="ssf__field">
          <label className="ssf__label">Which method did you use?</label>
          <div className="ssf__providers">
            {page.payment_methods.map((m) => (
              <button
                key={m.provider}
                type="button"
                className={`ssf__provider-btn ${provider === m.provider ? 'ssf__provider-btn--active' : ''}`}
                onClick={() => setProvider(m.provider)}
              >
                {m.provider.charAt(0).toUpperCase() + m.provider.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Number reminder ── */}
      {selectedMethod && (
        <div className="ssf__reminder">
          Send to <strong>{selectedMethod.account_name}</strong> ·{' '}
          <code className="ssf__reminder-number">{selectedMethod.number}</code>
        </div>
      )}

      {/* ── Your name ── */}
      <div className="ssf__field">
        <label className="ssf__label" htmlFor="ssf-name">Your name <span className="ssf__req">*</span></label>
        <input
          id="ssf-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, senderName: '' })) }}
          placeholder="e.g. Chachu, Khala, Apni..."
          maxLength={60}
          className={errors.senderName ? 'input-error' : ''}
        />
        {errors.senderName && <span className="ssf__error">{errors.senderName}</span>}
      </div>

      {/* ── Transaction ID ── */}
      <div className="ssf__field">
        <label className="ssf__label" htmlFor="ssf-txn">Transaction ID <span className="ssf__optional">(optional)</span></label>
        <input
          id="ssf-txn"
          type="text"
          value={txnId}
          onChange={(e) => { setTxnId(e.target.value.toUpperCase()); setErrors((er) => ({ ...er, transactionId: '' })) }}
          placeholder="From your payment history"
          className={errors.transactionId ? 'input-error' : ''}
        />
        {errors.transactionId && <span className="ssf__error">{errors.transactionId}</span>}
      </div>

      {/* ── Note ── */}
      <div className="ssf__field">
        <label className="ssf__label" htmlFor="ssf-note">Leave a note <span className="ssf__optional">(optional)</span></label>
        <textarea
          id="ssf-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Eid Mubarak! 🌙 May Allah bless you..."
          rows={3}
          maxLength={200}
        />
        <span className="ssf__counter">{note.length}/200</span>
      </div>

      {/* ── Root error ── */}
      {errors.root && (
        <div className="ssf__root-error" role="alert">{errors.root}</div>
      )}

      {/* ── Actions ── */}
      <div className="ssf__actions">
        <button type="button" className="ssf__cancel-btn" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          type="button"
          className="ssf__submit-btn themed-btn"
          onClick={handleSubmit}
          disabled={loading || !amount || !name}
        >
          {loading ? 'Sending…' : `Send ৳${amount || '—'} Salami 🎁`}
        </button>
      </div>
    </div>
  )
}

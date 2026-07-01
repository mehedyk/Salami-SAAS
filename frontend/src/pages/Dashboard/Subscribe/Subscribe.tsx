import { useState, useEffect } from 'react'
import { subscriptionsApi } from '../../../utils/api'
import { useApi, useMutation } from '../../../hooks/useApi'
import { validate, subscriptionSchema } from '../../../utils/validation'
import ImageUploader  from '../../../components/ImageUploader/ImageUploader'
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner'
import { useToast }   from '../../../components/Toast/Toast'
import type { Subscription } from '../../../types'
import './Subscribe.css'

type Tier     = 'monthly' | 'lifetime'
type Provider = 'bkash' | 'nagad' | 'rocket'

const PLANS = [
  {
    id:       'monthly' as Tier,
    name:     'Eid Pass',
    price:    17,
    duration: '11 months',
    perks:    ['All 6 themes', 'PDF receipts', 'Page analytics', 'Priority badge'],
  },
  {
    id:       'lifetime' as Tier,
    name:     'Lifetime',
    price:    29,
    duration: '5 years',
    perks:    ['Everything in Eid Pass', '5 years access', 'Future features', 'Priority support'],
  },
]

const PROVIDERS: Array<{ id: Provider; label: string; color: string; number: string }> = [
  { id: 'bkash',  label: 'bKash',  color: '#e2136e', number: '01XXXXXXXXX' },
  { id: 'nagad',  label: 'Nagad',  color: '#f26522', number: '01XXXXXXXXX' },
  { id: 'rocket', label: 'Rocket', color: '#8b2fc9', number: '01XXXXXXXXX' },
]

export default function Subscribe() {
  const { toast }  = useToast()

  const activeState = useApi(
    subscriptionsApi.active as () => Promise<{ success: boolean; data?: { tier: string; is_premium: boolean; subscription: Subscription | null }; message?: string }>
  )
  const subsState   = useApi(
    subscriptionsApi.mine as () => Promise<{ success: boolean; data?: Subscription[]; message?: string }>
  )

  useEffect(() => { activeState.execute(); subsState.execute() }, []) // eslint-disable-line

  const [tier,     setTier]     = useState<Tier>('monthly')
  const [provider, setProvider] = useState<Provider>('bkash')
  const [number,   setNumber]   = useState('')
  const [txnId,    setTxnId]    = useState('')
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [pending,  setPending]  = useState<Subscription | null>(null)

  const submitMut = useMutation(subscriptionsApi.create)

  const handleUploadScreenshot = async (file: File) => {
    if (!pending) return
    const res = await subscriptionsApi.uploadScreenshot(pending._id, file)
    if (res.success) {
      toast('Screenshot uploaded! We\'ll confirm within 24h.', 'success')
      activeState.execute()
      subsState.execute()
    } else {
      throw new Error(res.message)
    }
  }

  const handleSubmit = async () => {
    const result = validate(subscriptionSchema, {
      tier,
      paymentMethod: provider,
      paymentNumber: number,
      transactionId: txnId,
    })
    if (!result.success) { setErrors(result.errors); return }
    setErrors({})

    const ok = await submitMut.mutate({
      tier,
      payment_method: provider,
      payment_number: number,
      transaction_id: txnId,
    })

    if (ok) {
      toast('Request submitted! Upload your screenshot next.', 'success')
      await activeState.execute()
      await subsState.execute()
      // Find the new pending sub
      const mine = await subscriptionsApi.mine()
      if (mine.success && mine.data) {
        const newPending = (mine.data as Subscription[]).find((s) => s.status === 'pending') ?? null
        setPending(newPending)
      }
    } else {
      toast(submitMut.error ?? 'Submission failed.', 'error')
    }
  }

  if (activeState.loading) return <LoadingSpinner fullPage />

  const active    = activeState.data
  const isPremium = active?.is_premium ?? false
  const existingPending = (subsState.data as Subscription[] | null)?.find((s) => s.status === 'pending') ?? null
  const showPending = pending ?? existingPending

  return (
    <div className="subscribe">
      <div className="subscribe__header">
        <h1 className="subscribe__title">Plans</h1>
        <p className="subscribe__sub">Pay with bKash, Nagad, or Rocket — confirmed within 24h.</p>
      </div>

      {/* ── Active badge ── */}
      {isPremium && (
        <div className="subscribe__active-banner">
          <span>⭐</span>
          <div>
            <strong>You're on {active?.tier === 'monthly' ? 'Eid Pass' : 'Lifetime'}.</strong>
            <span> All premium features are unlocked.</span>
          </div>
        </div>
      )}

      {/* ── Plan cards ── */}
      <div className="subscribe__plans">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`subscribe__plan-card ${tier === plan.id ? 'subscribe__plan-card--selected' : ''}`}
            onClick={() => setTier(plan.id)}
            aria-pressed={tier === plan.id}
          >
            <div className="subscribe__plan-head">
              <div>
                <h3 className="subscribe__plan-name">{plan.name}</h3>
                <span className="subscribe__plan-duration">{plan.duration}</span>
              </div>
              <div className="subscribe__plan-price">
                <span className="subscribe__plan-currency">৳</span>
                <span className="subscribe__plan-amount">{plan.price}</span>
              </div>
            </div>

            <ul className="subscribe__plan-perks">
              {plan.perks.map((p) => (
                <li key={p}>
                  <span className="subscribe__perk-check" aria-hidden="true">✓</span>
                  {p}
                </li>
              ))}
            </ul>

            {tier === plan.id && (
              <div className="subscribe__plan-selected-indicator" aria-hidden="true">Selected ✓</div>
            )}
          </button>
        ))}
      </div>

      {/* ── Pending screenshot upload ── */}
      {showPending && !showPending.screenshot_url && (
        <div className="subscribe__pending card">
          <h3>📸 Upload your payment screenshot</h3>
          <p>
            Your <strong>{showPending.tier === 'monthly' ? 'Eid Pass' : 'Lifetime'}</strong> request
            is pending. Upload a screenshot of your payment to speed up approval.
          </p>
          <ImageUploader
            type="receipt"
            label="Payment screenshot"
            onUpload={handleUploadScreenshot}
          />
        </div>
      )}

      {showPending?.screenshot_url && (
        <div className="subscribe__waiting card">
          <span>⏳</span>
          <div>
            <strong>Awaiting admin approval</strong>
            <p>We'll activate your plan within 24h. Check back soon.</p>
          </div>
        </div>
      )}

      {/* ── Payment form ── */}
      {!showPending && (
        <div className="subscribe__form card">
          <h3 className="subscribe__form-title">Payment details</h3>

          {/* Provider */}
          <div className="subscribe__field">
            <label className="subscribe__label">Send ৳{PLANS.find((p) => p.id === tier)?.price} to</label>
            <div className="subscribe__providers">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`subscribe__provider-btn ${provider === p.id ? 'subscribe__provider-btn--active' : ''}`}
                  style={{ '--p-color': p.color } as React.CSSProperties}
                  onClick={() => setProvider(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="subscribe__payment-notice">
            Send <strong>৳{PLANS.find((p) => p.id === tier)?.price}</strong> to our{' '}
            <strong>{provider.charAt(0).toUpperCase() + provider.slice(1)}</strong> number{' '}
            <code className="subscribe__acct-number">01XXXXXXXXX</code> (Personal), then fill in below.
          </div>

          {/* Number */}
          <div className="subscribe__field">
            <label className="subscribe__label" htmlFor="sub-number">Your {provider} number</label>
            <input
              id="sub-number"
              type="text"
              inputMode="numeric"
              value={number}
              onChange={(e) => { setNumber(e.target.value); setErrors((er) => ({ ...er, paymentNumber: '' })) }}
              placeholder="01XXXXXXXXX"
              className={errors.paymentNumber ? 'input-error' : ''}
            />
            {errors.paymentNumber && <span className="subscribe__error">{errors.paymentNumber}</span>}
          </div>

          {/* Transaction ID */}
          <div className="subscribe__field">
            <label className="subscribe__label" htmlFor="sub-txn">Transaction ID</label>
            <input
              id="sub-txn"
              type="text"
              value={txnId}
              onChange={(e) => { setTxnId(e.target.value.toUpperCase()); setErrors((er) => ({ ...er, transactionId: '' })) }}
              placeholder="e.g. 8AB12CD34E"
              className={errors.transactionId ? 'input-error' : ''}
            />
            {errors.transactionId && <span className="subscribe__error">{errors.transactionId}</span>}
            <span className="subscribe__hint">Found in your {provider} transaction history.</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitMut.loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {submitMut.loading
              ? 'Submitting…'
              : `Submit ৳${PLANS.find((p) => p.id === tier)?.price} payment`
            }
          </button>

          <p className="subscribe__disclaimer">
            After submitting, upload a screenshot of your payment. Approval is manual and usually within 24h.
          </p>
        </div>
      )}

      {/* ── History ── */}
      {subsState.data && (subsState.data as Subscription[]).length > 0 && (
        <div className="subscribe__history">
          <h3 className="subscribe__history-title">Payment history</h3>
          <div className="subscribe__history-list">
            {(subsState.data as Subscription[]).map((s) => (
              <div key={s._id} className="subscribe__history-item card">
                <div className="subscribe__history-info">
                  <span className="subscribe__history-plan">
                    {s.tier === 'monthly' ? 'Eid Pass' : 'Lifetime'}
                  </span>
                  <span className="subscribe__history-price">৳{s.price}</span>
                  <span className="subscribe__history-method">{s.payment_method}</span>
                </div>
                <span className={`badge ${
                  s.status === 'approved' ? 'badge-green' :
                  s.status === 'rejected' ? 'badge-red' : 'badge-neutral'
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

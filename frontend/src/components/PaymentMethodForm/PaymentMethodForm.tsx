import { useState } from 'react'
import type { PaymentMethod } from '../../types'
import { validate, paymentMethodSchema } from '../../utils/validation'
import './PaymentMethodForm.css'

const PROVIDERS: Array<{ id: PaymentMethod['provider']; label: string; color: string; logo: string }> = [
  { id: 'bkash',  label: 'bKash',  color: '#e2136e', logo: '৳' },
  { id: 'nagad',  label: 'Nagad',  color: '#f26522', logo: '৳' },
  { id: 'rocket', label: 'Rocket', color: '#8b2fc9', logo: '৳' },
  { id: 'bank',   label: 'Bank',   color: '#2563eb', logo: '🏦' },
]

interface Props {
  methods:   PaymentMethod[]
  onChange:  (methods: PaymentMethod[]) => void
  disabled?: boolean
}

const empty = (): PaymentMethod => ({
  provider: 'bkash', number: '', account_name: '',
})

export default function PaymentMethodForm({ methods, onChange, disabled }: Props) {
  const [editing, setEditing]   = useState<number | null>(null)   // index being edited, null = adding new
  const [form,    setForm]       = useState<PaymentMethod>(empty())
  const [errors,  setErrors]     = useState<Record<string, string>>({})
  const [adding,  setAdding]     = useState(false)

  const openAdd = () => {
    setForm(empty())
    setErrors({})
    setEditing(null)
    setAdding(true)
  }

  const openEdit = (idx: number) => {
    setForm({ ...methods[idx] })
    setErrors({})
    setEditing(idx)
    setAdding(true)
  }

  const cancel = () => { setAdding(false); setEditing(null) }

  const save = () => {
    const result = validate(paymentMethodSchema, {
      provider:    form.provider,
      number:      form.number,
      account_name: form.account_name,
    })
    if (!result.success) { setErrors(result.errors); return }

    const next = [...methods]
    if (editing !== null) {
      next[editing] = form
    } else {
      // No duplicate providers
      if (next.some((m) => m.provider === form.provider)) {
        setErrors({ provider: 'You already have this payment method.' })
        return
      }
      next.push(form)
    }
    onChange(next)
    setAdding(false)
    setEditing(null)
  }

  const remove = (idx: number) => {
    onChange(methods.filter((_, i) => i !== idx))
  }

  const providerMeta = (id: PaymentMethod['provider']) =>
    PROVIDERS.find((p) => p.id === id)!

  return (
    <div className="pm-form">
      {/* ── Existing methods ── */}
      {methods.length > 0 && (
        <div className="pm-form__list">
          {methods.map((m, i) => {
            const meta = providerMeta(m.provider)
            return (
              <div key={i} className="pm-card">
                <div
                  className="pm-card__badge"
                  style={{ background: meta.color }}
                >
                  {meta.logo}
                </div>
                <div className="pm-card__info">
                  <span className="pm-card__provider">{meta.label}</span>
                  <span className="pm-card__number">{m.number}</span>
                  <span className="pm-card__name">{m.account_name}</span>
                </div>
                <div className="pm-card__actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEdit(i)}
                    disabled={disabled}
                  >Edit</button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm pm-card__remove"
                    onClick={() => remove(i)}
                    disabled={disabled}
                    aria-label={`Remove ${meta.label}`}
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add form ── */}
      {adding ? (
        <div className="pm-form__editor card">
          <h4 className="pm-form__editor-title">
            {editing !== null ? 'Edit payment method' : 'Add payment method'}
          </h4>

          {/* Provider select */}
          <div className="pm-form__field">
            <label className="pm-form__label">Provider</label>
            <div className="pm-form__providers">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`pm-provider-btn ${form.provider === p.id ? 'pm-provider-btn--active' : ''}`}
                  style={{ '--p-color': p.color } as React.CSSProperties}
                  onClick={() => setForm((f) => ({ ...f, provider: p.id }))}
                  disabled={editing === null && methods.some((m) => m.provider === p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {errors.provider && <span className="pm-form__error">{errors.provider}</span>}
          </div>

          {/* Number */}
          <div className="pm-form__field">
            <label className="pm-form__label" htmlFor="pm-number">
              {form.provider === 'bank' ? 'Account number' : 'Mobile number'}
            </label>
            <input
              id="pm-number"
              type="text"
              inputMode="numeric"
              value={form.number}
              onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
              placeholder={form.provider === 'bank' ? 'Account number' : '01XXXXXXXXX'}
              className={errors.number ? 'input-error' : ''}
            />
            {errors.number && <span className="pm-form__error">{errors.number}</span>}
          </div>

          {/* Account name */}
          <div className="pm-form__field">
            <label className="pm-form__label" htmlFor="pm-name">Account name</label>
            <input
              id="pm-name"
              type="text"
              value={form.account_name}
              onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))}
              placeholder="Name on the account"
              className={errors.account_name ? 'input-error' : ''}
            />
            {errors.account_name && <span className="pm-form__error">{errors.account_name}</span>}
          </div>

          <div className="pm-form__actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={cancel}>Cancel</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={save}>
              {editing !== null ? 'Save changes' : 'Add method'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="pm-form__add-btn"
          onClick={openAdd}
          disabled={disabled || methods.length >= 4}
        >
          <span>+</span>
          {methods.length === 0 ? 'Add a payment method' : 'Add another method'}
        </button>
      )}

      {methods.length === 0 && !adding && (
        <p className="pm-form__hint">Add at least one method to publish your page.</p>
      )}
    </div>
  )
}

import { useState } from 'react'
import type { PaymentMethod } from '../../../types'
import './PaymentCard.css'

const META: Record<PaymentMethod['provider'], { label: string; color: string; bg: string; icon: string }> = {
  bkash:  { label: 'bKash',  color: '#e2136e', bg: 'rgba(226,19,110,0.12)',  icon: 'B' },
  nagad:  { label: 'Nagad',  color: '#f26522', bg: 'rgba(242,101,34,0.12)',  icon: 'N' },
  rocket: { label: 'Rocket', color: '#8b2fc9', bg: 'rgba(139,47,201,0.12)', icon: 'R' },
  bank:   { label: 'Bank',   color: '#2563eb', bg: 'rgba(37,99,235,0.12)',   icon: '🏦' },
}

interface Props {
  method: PaymentMethod
}

export default function PaymentCard({ method }: Props) {
  const [copied, setCopied] = useState(false)
  const meta = META[method.provider]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(method.number)
    } catch {
      // Fallback for older mobile browsers
      const el = document.createElement('textarea')
      el.value = method.number
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pay-card" style={{ '--provider-color': meta.color, '--provider-bg': meta.bg } as React.CSSProperties}>
      <div className="pay-card__icon">{meta.icon}</div>

      <div className="pay-card__body">
        <span className="pay-card__provider">{meta.label}</span>
        <span className="pay-card__number">{method.number}</span>
        <span className="pay-card__name">{method.account_name}</span>
      </div>

      <button
        className={`pay-card__copy ${copied ? 'pay-card__copy--done' : ''}`}
        onClick={handleCopy}
        aria-label={copied ? 'Copied!' : `Copy ${meta.label} number`}
        title={copied ? 'Copied!' : 'Copy number'}
      >
        <span className="pay-card__copy-icon" aria-hidden="true">
          {copied ? '✓' : '⎘'}
        </span>
        <span>{copied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>
  )
}

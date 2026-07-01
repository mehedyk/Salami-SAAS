import { useState } from 'react'
import { useToast } from '../Toast/Toast'
import './ShareButton.css'

interface Props {
  url:      string
  label?:   string
  size?:    'sm' | 'md'
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function ShareButton({ url, label = 'Copy link', size = 'md', variant = 'secondary' }: Props) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`

    // Try native share sheet first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ url: fullUrl, title: 'My Eid Salami page 🌙' })
        return
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl)
    } catch {
      const el = document.createElement('textarea')
      el.value = fullUrl
      el.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }

    setCopied(true)
    toast('Link copied! Share it with family. 🎁', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button
      className={`share-btn share-btn--${variant} share-btn--${size} ${copied ? 'share-btn--copied' : ''}`}
      onClick={handleShare}
      aria-label={copied ? 'Link copied!' : label}
    >
      <span className="share-btn__icon" aria-hidden="true">
        {copied ? '✓' : '⎘'}
      </span>
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  )
}

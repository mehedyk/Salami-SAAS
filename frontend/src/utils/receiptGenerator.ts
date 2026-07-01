/**
 * receiptGenerator.ts
 * Draws a styled salami receipt onto an HTML Canvas and returns a data URL.
 * Works fully client-side — no library needed.
 */
import type { LedgerEntry, SalamiPage } from '../types'

const PROVIDER_COLORS: Record<string, string> = {
  bkash:  '#e2136e',
  nagad:  '#f26522',
  rocket: '#8b2fc9',
  bank:   '#2563eb',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-BD', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words  = text.split(' ')
  let line     = ''
  let currentY = y

  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line     = word
      currentY += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, currentY)
  return currentY + lineHeight
}

export async function generateReceiptPng(
  entry: LedgerEntry,
  page:  SalamiPage,
): Promise<string> {
  const W = 520
  const H = 680
  const PAD = 40

  const canvas = document.createElement('canvas')
  canvas.width  = W * 2    // 2× for retina
  canvas.height = H * 2
  canvas.style.width  = `${W}px`
  canvas.style.height = `${H}px`

  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  // ── Background ──────────────────────────────────────────────
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, W, H)

  // Ambient glow
  const grad = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 320)
  grad.addColorStop(0, 'rgba(245,200,80,0.12)')
  grad.addColorStop(1, 'rgba(245,200,80,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // ── Top gold bar ─────────────────────────────────────────────
  const barGrad = ctx.createLinearGradient(0, 0, W, 0)
  barGrad.addColorStop(0, '#f5c850')
  barGrad.addColorStop(1, '#d97706')
  ctx.fillStyle = barGrad
  ctx.fillRect(0, 0, W, 5)

  // ── Logo ─────────────────────────────────────────────────────
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = '#f5c850'
  ctx.fillText('🌙 Salami', PAD, 50)

  ctx.font = '13px "Inter", sans-serif'
  ctx.fillStyle = '#64748b'
  ctx.fillText('Gift Receipt', PAD, 70)

  // ── Divider ──────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth   = 1
  ctx.beginPath()
  ctx.moveTo(PAD, 88)
  ctx.lineTo(W - PAD, 88)
  ctx.stroke()

  // ── Amount (hero) ─────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.font      = '14px "Inter", sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('Amount Sent', W / 2, 120)

  ctx.font      = 'bold 64px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = '#f5c850'
  ctx.fillText(`৳${entry.amount.toLocaleString()}`, W / 2, 190)

  // Provider pill
  const provColor = PROVIDER_COLORS[entry.provider] ?? '#94a3b8'
  const provLabel = entry.provider.charAt(0).toUpperCase() + entry.provider.slice(1)
  const pillW     = 100
  const pillX     = (W - pillW) / 2

  ctx.beginPath()
  ctx.roundRect(pillX, 202, pillW, 28, 14)
  ctx.fillStyle = `${provColor}22`
  ctx.fill()

  ctx.strokeStyle = `${provColor}66`
  ctx.lineWidth   = 1
  ctx.stroke()

  ctx.font      = 'bold 13px "Inter", sans-serif'
  ctx.fillStyle = provColor
  ctx.fillText(provLabel, W / 2, 221)

  // ── Divider ──────────────────────────────────────────────────
  ctx.textAlign   = 'left'
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth   = 1
  ctx.setLineDash([4, 6])
  ctx.beginPath()
  ctx.moveTo(PAD, 248)
  ctx.lineTo(W - PAD, 248)
  ctx.stroke()
  ctx.setLineDash([])

  // ── Detail rows ───────────────────────────────────────────────
  const rows: Array<[string, string]> = [
    ['From',      entry.sender_name],
    ['To',        page.title],
    ['Date',      formatDate(entry.created_at)],
    ['Status',    entry.is_verified ? '✓ Verified' : '⏳ Pending verification'],
  ]
  if (entry.transaction_id) rows.splice(3, 0, ['Transaction ID', entry.transaction_id])
  if (entry.sender_note)    rows.push(['Note', entry.sender_note])

  let rowY = 278
  for (const [label, value] of rows) {
    ctx.font      = '12px "Inter", sans-serif'
    ctx.fillStyle = '#64748b'
    ctx.fillText(label.toUpperCase(), PAD, rowY)

    ctx.font      = label === 'Status' && entry.is_verified
      ? 'bold 14px "Inter", sans-serif'
      : '14px "Inter", sans-serif'
    ctx.fillStyle = label === 'Status' && entry.is_verified ? '#34d399'
                  : label === 'Status' ? '#fbbf24'
                  : '#f0f4f8'

    // Right-align value
    ctx.textAlign = 'right'
    if (label === 'Note' || value.length > 40) {
      ctx.textAlign = 'left'
      rowY = wrapText(ctx, value, PAD + 120, rowY, W - PAD - 120, 20)
    } else {
      ctx.fillText(value, W - PAD, rowY)
      rowY += 20
    }
    ctx.textAlign = 'left'
    rowY += 18
  }

  // ── Bottom divider ────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.beginPath()
  ctx.moveTo(PAD, H - 90)
  ctx.lineTo(W - PAD, H - 90)
  ctx.stroke()

  // ── Footer ────────────────────────────────────────────────────
  ctx.textAlign   = 'center'
  ctx.font        = '12px "Inter", sans-serif'
  ctx.fillStyle   = '#475569'
  ctx.fillText('Generated by Salami · salami.app', W / 2, H - 65)
  ctx.fillText(`Receipt ID · ${entry._id.slice(-8).toUpperCase()}`, W / 2, H - 48)

  // Eid greeting
  ctx.font      = '14px "Amiri", serif'
  ctx.fillStyle = 'rgba(245,200,80,0.5)'
  ctx.fillText('عيد مبارك', W / 2, H - 24)

  return canvas.toDataURL('image/png', 0.95)
}

export function downloadReceiptPng(dataUrl: string, filename: string): void {
  const a    = document.createElement('a')
  a.href     = dataUrl
  a.download = filename
  a.click()
}

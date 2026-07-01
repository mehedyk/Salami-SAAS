import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pagesApi } from '../../utils/api'
import { useApi } from '../../hooks/useApi'
import PaymentCard    from './PaymentCard/PaymentCard'
import SendSalamiForm from './SendSalamiForm/SendSalamiForm'
import Modal          from '../../components/Modal/Modal'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'
import type { SalamiPage } from '../../types'
import './PublicPage.css'

export default function PublicPage() {
  const { username } = useParams<{ username: string }>()
  const [formOpen, setFormOpen] = useState(false)

  const pageState = useApi(
    () => pagesApi.getPublic(username ?? '') as Promise<{ success: boolean; data?: SalamiPage; message?: string }>
  )

  useEffect(() => {
    if (username) pageState.execute()
  }, [username]) // eslint-disable-line

  if (pageState.loading) {
    return (
      <div className="pub-loading">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!pageState.data || pageState.error) {
    return (
      <div className="pub-notfound">
        <span className="pub-notfound__moon">🌙</span>
        <h1>Page not found</h1>
        <p>This salami page doesn't exist or isn't published yet.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    )
  }

  const page  = pageState.data
  const theme = page.theme ?? 'noor'

  return (
    <div className="pub" data-theme={theme}>
      {/* ── Ambient background ── */}
      <div className="pub__bg" aria-hidden="true">
        <div className="pub__bg-orb pub__bg-orb--1" />
        <div className="pub__bg-orb pub__bg-orb--2" />
      </div>

      {/* ── Cover photo ── */}
      <div className="pub__cover">
        {page.cover_url
          ? <img src={page.cover_url} alt="" className="pub__cover-img" />
          : <div className="pub__cover-default" />
        }
        <div className="pub__cover-gradient" aria-hidden="true" />
      </div>

      {/* ── Profile card ── */}
      <main className="pub__main">
        <div className="pub__card themed-card">

          {/* Avatar */}
          <div className="pub__avatar-wrap">
            {page.avatar_url
              ? <img src={page.avatar_url} alt={page.title} className="pub__avatar" />
              : (
                <div className="pub__avatar pub__avatar--default" aria-hidden="true">
                  {page.title.charAt(0).toUpperCase()}
                </div>
              )
            }
          </div>

          {/* Identity */}
          <div className="pub__identity">
            <h1 className="pub__name themed-accent">{page.title}</h1>
            <code className="pub__username">@{page.username}</code>
            {page.bio && (
              <p className="pub__bio">{page.bio}</p>
            )}
          </div>

          {/* ── Payment methods ── */}
          {page.payment_methods.length > 0 && (
            <section className="pub__payments" aria-label="Payment methods">
              <p className="pub__section-label">Send salami to</p>
              <div className="pub__payment-list">
                {page.payment_methods.map((m) => (
                  <PaymentCard key={m.provider} method={m} />
                ))}
              </div>
            </section>
          )}

          {/* ── Eid greeting ── */}
          <div className="pub__greeting" aria-hidden="true">
            <span className="pub__greeting-arabic">عيد مبارك</span>
            <span className="pub__greeting-divider">·</span>
            <span className="pub__greeting-bn">ঈদ মোবারক</span>
          </div>

          {/* ── CTA ── */}
          <button
            className="pub__cta themed-btn"
            onClick={() => setFormOpen(true)}
            disabled={page.payment_methods.length === 0}
            aria-label="Send Salami gift"
          >
            <span className="pub__cta-icon" aria-hidden="true">💌</span>
            Send Salami
          </button>

          {page.payment_methods.length === 0 && (
            <p className="pub__no-methods">No payment methods added yet.</p>
          )}
        </div>

        {/* ── Powered by ── */}
        <a
          href="/"
          className="pub__powered"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Powered by Salami"
        >
          <span>🌙</span>
          <span>Made with <strong>Salami</strong></span>
        </a>
      </main>

      {/* ── Send Salami modal ── */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="md"
      >
        <SendSalamiForm
          page={page}
          onClose={() => setFormOpen(false)}
        />
      </Modal>
    </div>
  )
}

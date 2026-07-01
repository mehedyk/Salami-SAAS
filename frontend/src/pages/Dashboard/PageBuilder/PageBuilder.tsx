import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { pagesApi, subscriptionsApi } from '../../../utils/api'
import { useApi, useMutation } from '../../../hooks/useApi'
import { validate, pageSchema } from '../../../utils/validation'
import ThemePicker       from '../../../components/ThemePicker/ThemePicker'
import PaymentMethodForm from '../../../components/PaymentMethodForm/PaymentMethodForm'
import ImageUploader     from '../../../components/ImageUploader/ImageUploader'
import LoadingSpinner    from '../../../components/LoadingSpinner/LoadingSpinner'
import Modal             from '../../../components/Modal/Modal'
import { useToast }      from '../../../components/Toast/Toast'
import type { SalamiPage, ThemeId, PaymentMethod } from '../../../types'
import './PageBuilder.css'

type Section = 'info' | 'theme' | 'payment' | 'media'

export default function PageBuilder() {
  const { toast }    = useToast()
  const navigate     = useNavigate()

  // ── Remote data ──────────────────────────────────────────────
  const pageState  = useApi(pagesApi.mine as () => Promise<{ success: boolean; data?: SalamiPage; message?: string }>)
  const tierState  = useApi(subscriptionsApi.active as () => Promise<{ success: boolean; data?: { is_premium: boolean }; message?: string }>)
  const saveMut    = useMutation(
    (isNew: boolean, data: Record<string, unknown>) =>
      isNew
        ? pagesApi.create(data as Parameters<typeof pagesApi.create>[0])
        : pagesApi.update((pageState.data as SalamiPage)._id, data)
  )

  useEffect(() => {
    pageState.execute()
    tierState.execute()
  }, []) // eslint-disable-line

  // ── Form state ───────────────────────────────────────────────
  const [title,   setTitle]   = useState('')
  const [bio,     setBio]     = useState('')
  const [theme,   setTheme]   = useState<ThemeId>('noor')
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [errors,  setErrors]  = useState<Record<string, string>>({})
  const [section, setSection] = useState<Section>('info')
  const [upgradeModal, setUpgradeModal] = useState(false)
  const [dirty,   setDirty]   = useState(false)

  // Populate form from existing page
  useEffect(() => {
    const page = pageState.data
    if (!page) return
    setTitle(page.title)
    setBio(page.bio ?? '')
    setTheme(page.theme as ThemeId)
    setMethods(page.payment_methods ?? [])
  }, [pageState.data])

  const isNew      = !pageState.data
  const isPremium  = tierState.data?.is_premium ?? false

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    const result = validate(pageSchema, { title, bio, theme })
    if (!result.success) { setErrors(result.errors); return }
    setErrors({})

    const payload = {
      title,
      bio,
      theme,
      payment_methods: methods.map((m) => ({
        provider:     m.provider,
        number:       m.number,
        account_name: m.accountName,
      })),
    }

    const ok = await saveMut.mutate(isNew, payload as unknown as Record<string, unknown>)
    if (ok) {
      toast(isNew ? 'Page created! 🎉' : 'Changes saved.', 'success')
      setDirty(false)
      await pageState.execute()
      if (isNew) navigate('/dashboard')
    } else {
      toast(saveMut.error ?? 'Save failed.', 'error')
    }
  }

  // ── Avatar / cover uploads ────────────────────────────────────
  const handleAvatar = useCallback(async (file: File) => {
    if (!pageState.data) return
    const res = await pagesApi.uploadAvatar(pageState.data._id, file)
    if (res.success) { toast('Avatar updated.', 'success'); pageState.execute() }
    else throw new Error(res.message)
  }, [pageState]) // eslint-disable-line

  const handleCover = useCallback(async (file: File) => {
    if (!pageState.data) return
    const res = await pagesApi.uploadCover(pageState.data._id, file)
    if (res.success) { toast('Cover updated.', 'success'); pageState.execute() }
    else throw new Error(res.message)
  }, [pageState]) // eslint-disable-line

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setDirty(true)
  }

  if (pageState.loading) return <LoadingSpinner fullPage />

  const SECTIONS: Array<{ id: Section; label: string; icon: string }> = [
    { id: 'info',    label: 'Info',    icon: '📝' },
    { id: 'theme',   label: 'Theme',   icon: '🎨' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'media',   label: 'Media',   icon: '📷' },
  ]

  return (
    <div className="pb">
      <div className="pb__header">
        <div>
          <h1 className="pb__title">{isNew ? 'Create your page' : 'Edit your page'}</h1>
          <p className="pb__sub">
            {isNew
              ? 'Set up your salami page in a few steps.'
              : `salami.app/s/${pageState.data?.username}`
            }
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saveMut.loading || (!dirty && !isNew)}
        >
          {saveMut.loading ? 'Saving…' : isNew ? 'Create page' : 'Save changes'}
        </button>
      </div>

      {/* ── Section tabs ── */}
      <div className="pb__tabs" role="tablist">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={section === s.id}
            className={`pb__tab ${section === s.id ? 'pb__tab--active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            <span aria-hidden="true">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Info section ── */}
      {section === 'info' && (
        <div className="pb__section card" role="tabpanel">
          <div className="pb__field">
            <label className="pb__label" htmlFor="pb-title">Page title <span className="pb__req">*</span></label>
            <input
              id="pb-title"
              type="text"
              value={title}
              onChange={(e) => markDirty(setTitle)(e.target.value)}
              placeholder="e.g. Mehedy's Eid Salami"
              maxLength={60}
              className={errors.title ? 'input-error' : ''}
            />
            <div className="pb__field-meta">
              {errors.title
                ? <span className="pb__error">{errors.title}</span>
                : <span className="pb__hint">Shown at the top of your public page.</span>
              }
              <span className="pb__counter">{title.length}/60</span>
            </div>
          </div>

          <div className="pb__field">
            <label className="pb__label" htmlFor="pb-bio">Bio</label>
            <textarea
              id="pb-bio"
              value={bio}
              onChange={(e) => markDirty(setBio)(e.target.value)}
              placeholder="A short message for your visitors… Eid Mubarak! 🌙"
              rows={4}
              maxLength={300}
              className={errors.bio ? 'input-error' : ''}
            />
            <div className="pb__field-meta">
              {errors.bio && <span className="pb__error">{errors.bio}</span>}
              <span className="pb__counter">{bio.length}/300</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Theme section ── */}
      {section === 'theme' && (
        <div className="pb__section card" role="tabpanel">
          <ThemePicker
            value={theme}
            onChange={markDirty(setTheme)}
            isPremium={isPremium}
            onUpgrade={() => setUpgradeModal(true)}
          />
        </div>
      )}

      {/* ── Payment section ── */}
      {section === 'payment' && (
        <div className="pb__section card" role="tabpanel">
          <div className="pb__section-header">
            <h3>Payment methods</h3>
            <p>Senders will see these numbers on your public page to send salami.</p>
          </div>
          <PaymentMethodForm
            methods={methods}
            onChange={markDirty(setMethods)}
            disabled={saveMut.loading}
          />
        </div>
      )}

      {/* ── Media section ── */}
      {section === 'media' && (
        <div className="pb__section card" role="tabpanel">
          {isNew ? (
            <div className="pb__media-notice">
              <span>💡</span>
              <p>Save your page first, then come back to upload your avatar and cover photo.</p>
            </div>
          ) : (
            <div className="pb__media-grid">
              <ImageUploader
                type="avatar"
                label="Profile photo"
                currentUrl={pageState.data?.avatar_url}
                onUpload={handleAvatar}
                disabled={saveMut.loading}
              />
              <ImageUploader
                type="cover"
                label="Cover photo"
                currentUrl={pageState.data?.cover_url}
                onUpload={handleCover}
                disabled={saveMut.loading}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Sticky save bar ── */}
      {dirty && (
        <div className="pb__save-bar">
          <span className="pb__save-bar-text">You have unsaved changes</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saveMut.loading}
          >
            {saveMut.loading ? 'Saving…' : 'Save now'}
          </button>
        </div>
      )}

      {/* ── Upgrade modal ── */}
      <Modal
        open={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        title="Unlock premium themes"
        size="sm"
      >
        <div className="pb__upgrade">
          <p>Premium themes are available on the <strong>Eid Pass (৳17)</strong> or <strong>Lifetime (৳29)</strong> plans.</p>
          <div className="pb__upgrade-actions">
            <button className="btn btn-secondary" onClick={() => setUpgradeModal(false)}>Not now</button>
            <a href="/dashboard/sub" className="btn btn-primary" onClick={() => setUpgradeModal(false)}>
              View plans
            </a>
          </div>
        </div>
      </Modal>
    </div>
  )
}

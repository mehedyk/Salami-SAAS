import { useState, useRef, useCallback } from 'react'
import { validateImageFile } from '../../utils/mime'
import './ImageUploader.css'

type UploadType = 'avatar' | 'cover' | 'receipt'

interface Props {
  type:        UploadType
  currentUrl?: string | null
  onUpload:    (file: File) => Promise<void>
  disabled?:   boolean
  label?:      string
}

const ASPECT: Record<UploadType, string> = {
  avatar:  '1/1',
  cover:   '3/1',
  receipt: '4/3',
}

const LABELS: Record<UploadType, { hint: string; size: string }> = {
  avatar:  { hint: 'Drop your photo here, or click to browse',  size: 'JPG, PNG or WebP · max 2 MB' },
  cover:   { hint: 'Drop a cover image here, or click to browse', size: 'JPG, PNG or WebP · max 4 MB' },
  receipt: { hint: 'Drop your payment screenshot here',        size: 'JPG, PNG or WebP · max 5 MB' },
}

export default function ImageUploader({ type, currentUrl, onUpload, disabled, label }: Props) {
  const [dragging,  setDragging]  = useState(false)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [error,     setError]     = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    setError(null)
    const result = await validateImageFile(file, type)
    if (!result.valid) { setError(result.error ?? 'Invalid file.'); return }

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      await onUpload(file)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }, [type, onUpload])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (disabled || uploading) return
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [disabled, uploading, processFile])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const displayUrl = preview ?? currentUrl

  return (
    <div className={`img-uploader img-uploader--${type}`}>
      {label && <span className="img-uploader__label">{label}</span>}

      <div
        className={`img-uploader__zone ${dragging ? 'img-uploader__zone--drag' : ''} ${uploading ? 'img-uploader__zone--uploading' : ''} ${disabled ? 'img-uploader__zone--disabled' : ''}`}
        style={{ aspectRatio: ASPECT[type] }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        aria-label={`Upload ${type} image`}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt={`${type} preview`}
              className="img-uploader__preview"
            />
            <div className="img-uploader__overlay">
              <span className="img-uploader__overlay-text">
                {uploading ? 'Uploading…' : 'Change image'}
              </span>
            </div>
          </>
        ) : (
          <div className="img-uploader__empty">
            <span className="img-uploader__icon" aria-hidden="true">
              {uploading ? '⏳' : '📷'}
            </span>
            <p className="img-uploader__hint">{LABELS[type].hint}</p>
            <p className="img-uploader__size">{LABELS[type].size}</p>
          </div>
        )}

        {uploading && <div className="img-uploader__progress" />}
      </div>

      {error && <p className="img-uploader__error" role="alert">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        disabled={disabled || uploading}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  )
}

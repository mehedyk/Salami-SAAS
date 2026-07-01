import './LoadingSpinner.css'

interface Props {
  fullPage?: boolean
  size?:     'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ fullPage = false, size = 'md' }: Props) {
  const spinner = (
    <div className={`spinner spinner--${size}`} role="status" aria-label="Loading">
      <div className="spinner__ring" />
    </div>
  )

  if (fullPage) {
    return <div className="spinner-page">{spinner}</div>
  }

  return spinner
}

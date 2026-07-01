import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound__inner">
        <div className="notfound__moon" aria-hidden="true">🌙</div>
        <h1 className="notfound__title">404</h1>
        <p className="notfound__message">This page went on Eid holiday and didn't come back.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    </div>
  )
}

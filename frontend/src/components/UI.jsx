import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div>
}
export function Loading({ label = 'Loading…' }) {
  return <div className="state-box"><LoaderCircle className="spinner-icon" size={22} /><span>{label}</span></div>
}
export function ErrorNotice({ error, onRetry }) {
  return <div className="error-notice"><AlertCircle size={18} /><span>{error}</span>{onRetry && <button onClick={onRetry}>Try again</button>}</div>
}
export function Empty({ title = 'Nothing here yet', body = 'When you have something to review, it will show up here.' }) {
  return <div className="empty-state"><span className="empty-icon"><Inbox size={22} /></span><strong>{title}</strong><p>{body}</p></div>
}
export function MetricCard({ label, value, hint, icon: Icon, tone = 'violet' }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={17} /></span></div><div className="metric-value">{value ?? '—'}</div><div className="metric-hint">{hint}</div></article>
}
export function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '—'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return `${Math.round(numeric <= 1 ? numeric * 100 : numeric)}%`
}
export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—'
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric.toLocaleString() : '—'
}

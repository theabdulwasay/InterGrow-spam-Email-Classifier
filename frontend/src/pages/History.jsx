import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MailPlus, Trash2 } from 'lucide-react'
import { listFrom, request } from '../api'
import { Empty, ErrorNotice, Loading, PageHeading, formatPercent } from '../components/UI'

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  async function load() {
    setLoading(true); setError('')
    try { setItems(listFrom(await request('/history/'))) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  async function remove(item) {
    const id = item.id ?? item.pk
    if (id == null) return
    setDeleting(id); setError('')
    try {
      await request(`/history/${encodeURIComponent(id)}/`, { method: 'DELETE' })
      setItems((current) => current.filter((entry) => (entry.id ?? entry.pk) !== id))
    } catch (err) { setError(err.message) } finally { setDeleting(null) }
  }
  return <>
    <PageHeading eyebrow="YOUR ACTIVITY" title="Email history" description="A record of the emails you’ve classified." action={<Link className="button button-primary" to="/classify"><MailPlus size={16} /> New classification</Link>} />
    {error && <ErrorNotice error={error} onRetry={load} />}
    <section className="card history-card">
      <div className="section-heading"><div><span className="eyebrow">CLASSIFIED MESSAGES</span><h2>Your email activity</h2></div><span className="subtle-tag">{items.length} {items.length === 1 ? 'email' : 'emails'}</span></div>
      {loading ? <Loading label="Loading your history…" /> : items.length ? <div className="table-scroll"><table className="history-table"><thead><tr><th>Email</th><th>Category</th><th>Confidence</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{items.map((item) => {
        const id = item.id ?? item.pk
        const category = item.category || item.label || item.prediction || item.predicted_class || 'Uncategorized'
        return <tr key={id ?? `${item.subject}-${item.created_at}`}><td><div className="table-email"><span className="mail-icon"><Mail size={16} /></span><div><strong>{item.subject || item.email_subject || item.title || 'Classified email'}</strong><span>{item.sender || item.from || item.email || item.text || ''}</span></div></div></td><td><span className={`category-pill ${String(category).toLowerCase().includes('spam') ? 'category-spam' : ''}`}><span />{category}</span></td><td className="confidence-cell">{formatPercent(item.confidence ?? item.confidence_score ?? item.probability)}</td><td className="date-cell">{item.created_at || item.timestamp || item.date ? new Date(item.created_at || item.timestamp || item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td><td><button className="icon-button delete-button" title="Delete email" aria-label={`Delete ${item.subject || 'email'}`} disabled={deleting === id || id == null} onClick={() => remove(item)}>{deleting === id ? <span className="spinner spinner-small" /> : <Trash2 size={16} />}</button></td></tr>
      })}</tbody></table></div> : <Empty title="No emails classified yet" body="Your classified emails will appear here. Start with one message and build your history." />}
    </section>
    {!loading && !items.length && !error && <div className="history-empty-action"><Link to="/classify" className="text-link">Classify your first email <ArrowRight size={14} /></Link></div>}
  </>
}

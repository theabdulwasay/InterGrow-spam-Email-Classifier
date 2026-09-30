import { useState } from 'react'
import { ArrowRight, Check, Clipboard, Mail, RotateCcw, Sparkles } from 'lucide-react'
import { request } from '../api'
import { ErrorNotice, PageHeading, formatPercent } from '../components/UI'

export default function Classify() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  async function classify(event) {
    event.preventDefault()
    if (!email.trim()) return
    setError(''); setResult(null); setLoading(true)
    try {
      const data = await request('/classify/predict/', { method: 'POST', body: JSON.stringify({ text: email.trim() }) })
      setResult(data?.result && typeof data.result === 'object' ? data.result : data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  const label = result?.category || result?.label || result?.prediction || result?.class || result?.predicted_class
  const confidence = result?.confidence ?? result?.confidence_score ?? result?.probability
  async function copyResult() {
    const output = [label && `Category: ${label}`, confidence !== undefined && `Confidence: ${formatPercent(confidence)}`].filter(Boolean).join('\n')
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) }
  }
  return (
    <>
      <PageHeading eyebrow="EMAIL INTELLIGENCE" title="What’s in this email?" description="Paste a message below and let Mailmind surface the signal." />
      <div className="classify-layout">
        <section className="card classify-card">
          <div className="section-heading"><div><span className="eyebrow">NEW CLASSIFICATION</span><h2>Drop in an email</h2></div><span className="secure-label"><span className="live-dot" /> Ready when you are</span></div>
          <form onSubmit={classify}>
            <label className="textarea-label" htmlFor="email-content">Email content</label>
            <textarea id="email-content" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={'Paste the subject and body of an email here…\n\nThe more context you include, the more useful your result will be.'} rows={11} required />
            <div className="compose-footer"><span>{email.length.toLocaleString()} characters</span><button type="button" className="text-button" onClick={() => { setEmail(''); setResult(null); setError('') }} disabled={!email}><RotateCcw size={14} /> Clear</button></div>
            {error && <ErrorNotice error={error} />}
            <button className="button button-primary classify-submit" disabled={loading || !email.trim()}>{loading ? <><span className="spinner spinner-small" /> Analyzing email…</> : <><Sparkles size={16} /> Classify email <ArrowRight size={15} /></>}</button>
          </form>
        </section>
        <aside className={`card result-card ${result ? 'result-card-ready' : ''}`}>
          <span className="result-orbit"><Mail size={21} /></span>
          {result ? <>
            <span className="eyebrow">YOUR RESULT</span>
            <h2>{label || 'Classification complete'}</h2>
            <p className="result-description">Mailmind has finished analyzing this email.</p>
            <div className="confidence-box"><div className="confidence-line"><span>Confidence</span><strong>{formatPercent(confidence)}</strong></div>{confidence !== undefined && <div className="confidence-track"><span style={{ width: `${Math.min(100, Math.max(0, Number(confidence) <= 1 ? Number(confidence) * 100 : Number(confidence)))}%` }} /></div>}<small>Confidence is the model’s estimate for this result.</small></div>
            <button className="button button-secondary copy-button" onClick={copyResult}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? 'Copied' : 'Copy result'}</button>
          </> : <>
            <span className="eyebrow">YOUR RESULT</span><h2>Your answer will appear here.</h2><p className="result-description">Once you classify an email, you’ll see its category and confidence score here.</p>
            <div className="result-placeholder"><span><Sparkles size={17} /></span><div><strong>Insight, not just a label</strong><small>Get a useful signal on every message.</small></div></div>
          </>}
        </aside>
      </div>
      <div className="privacy-note"><span><Check size={14} /></span> Emails are analyzed securely. Your classification is added to your history.</div>
    </>
  )
}

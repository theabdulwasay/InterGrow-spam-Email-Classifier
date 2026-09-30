import { useEffect, useState } from 'react'
import { Activity, Award, Crosshair, Gauge, Target } from 'lucide-react'
import { request } from '../api'
import { Empty, ErrorNotice, Loading, MetricCard, PageHeading, formatPercent } from '../components/UI'

export default function Performance() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  async function load() {
    setLoading(true); setError('')
    try { setMetrics(await request('/metrics/')) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const values = metrics?.metrics || metrics?.data || metrics || {}
  const accuracy = values.accuracy ?? values.model_accuracy
  const precision = values.precision
  const recall = values.recall
  const available = [accuracy, precision, recall].filter((value) => value !== undefined && value !== null).length
  return <>
    <PageHeading eyebrow="MODEL INSIGHTS" title="Performance, made clear." description="A transparent view of the classifier’s reported quality metrics." />
    {error && <ErrorNotice error={error} onRetry={load} />}
    {loading ? <Loading label="Loading model performance…" /> : available ? <>
      <div className="performance-intro"><span className="performance-icon"><Activity size={20} /></span><div><strong>Model metrics</strong><p>Based on the performance data provided by your classifier.</p></div><span className="subtle-tag">Reported by API</span></div>
      <div className="metric-grid performance-grid">
        <MetricCard label="Accuracy" value={formatPercent(accuracy)} hint="Correct predictions across all results" icon={Award} />
        <MetricCard label="Precision" value={formatPercent(precision)} hint="How often positive predictions are correct" icon={Crosshair} tone="green" />
        <MetricCard label="Recall" value={formatPercent(recall)} hint="How many relevant items were identified" icon={Target} tone="blue" />
      </div>
      {Array.isArray(values.confusion_matrix) && <section className="card history-card">
        <div className="section-heading"><div><span className="eyebrow">EVALUATION DETAIL</span><h2>Confusion matrix</h2></div><span className="subtle-tag">Actual rows · predicted columns</span></div>
        <div className="table-scroll"><table className="history-table"><thead><tr><th>Actual / Predicted</th>{(values.confusion_matrix_labels || ['ham', 'spam']).map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{values.confusion_matrix.map((row, index) => <tr key={index}><th>{(values.confusion_matrix_labels || ['ham', 'spam'])[index]}</th>{row.map((count, column) => <td key={column}>{count}</td>)}</tr>)}</tbody></table></div>
      </section>}
      <section className="card metric-explainer"><div className="section-heading"><div><span className="eyebrow">UNDERSTANDING THE NUMBERS</span><h2>What these metrics tell you</h2></div><Gauge size={20} className="explainer-icon" /></div><div className="explainer-grid"><article><span className="explainer-number">01</span><strong>Accuracy</strong><p>The share of all classifications the model got right.</p></article><article><span className="explainer-number">02</span><strong>Precision</strong><p>When the model flags a category, how often that result is right.</p></article><article><span className="explainer-number">03</span><strong>Recall</strong><p>How many of the messages in a category the model successfully catches.</p></article></div></section>
      <p className="metrics-footnote">Metrics are shown as provided by the API; values aren’t estimated when unavailable.</p>
    </> : <section className="card metrics-empty"><Empty title="Performance data isn’t available yet" body="When your classifier reports accuracy, precision, or recall, you’ll find those metrics here. No values are estimated." /></section>}
  </>
}

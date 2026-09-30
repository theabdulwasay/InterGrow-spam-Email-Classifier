import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, BarChart3, CheckCircle2, Clock3, Mail, MailPlus, ShieldCheck } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { listFrom, request } from '../api'
import { Empty, ErrorNotice, Loading, MetricCard, PageHeading, formatNumber, formatPercent } from '../components/UI'

const colors = ['#7565ed', '#f2a65a', '#54b89a', '#e67889', '#5f9de8', '#ad80d5']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  async function load() {
    setLoading(true); setError('')
    try {
      const [summary, emails] = await Promise.all([request('/stats/'), request('/history/')])
      setStats(summary || {})
      setHistory(listFrom(emails).slice(0, 4))
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const total = stats?.total_emails ?? stats?.total_classified ?? stats?.total ?? stats?.count
  const categories = stats?.categories || stats?.category_counts || stats?.distribution || {
    ...(stats?.spam !== undefined ? { spam: stats.spam } : {}),
    ...(stats?.ham !== undefined ? { ham: stats.ham } : {}),
  }
  const categoryData = (Array.isArray(categories)
    ? categories.map((item) => ({ name: item.name || item.category || item.label, value: Number(item.count ?? item.value ?? 0) }))
    : Object.entries(categories).map(([name, value]) => ({ name, value: Number(typeof value === 'object' ? value.count ?? value.value ?? 0 : value) }))
  ).filter((item) => item.value > 0)
  return (
    <>
      <PageHeading eyebrow="YOUR WORKSPACE" title="A clearer inbox starts here." description="Your email intelligence, all in one place." action={<Link className="button button-primary" to="/classify"><MailPlus size={16} /> Classify an email</Link>} />
      {error && <ErrorNotice error={error} onRetry={load} />}
      {loading ? <Loading label="Gathering your inbox insights…" /> : <>
        <div className="metric-grid">
          <MetricCard label="Emails classified" value={formatNumber(total)} hint="Across your email history" icon={Mail} />
          <MetricCard label="Categories found" value={categoryData.length || (Object.keys(categories).length || '—')} hint="Distinct email categories" icon={BarChart3} tone="amber" />
          <MetricCard label="Model accuracy" value={formatPercent(stats?.accuracy ?? stats?.model_accuracy)} hint="Reported model performance" icon={ShieldCheck} tone="green" />
          <MetricCard label="Recent activity" value={history.length ? formatNumber(history.length) : '—'} hint="Latest emails in your history" icon={Clock3} tone="blue" />
        </div>
        <div className="dashboard-grid">
          <section className="card chart-card">
            <div className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Category breakdown</h2></div><span className="subtle-tag">By volume</span></div>
            {categoryData.length ? <div className="chart-content"><div className="donut-wrap"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={91} paddingAngle={4} stroke="none">{categoryData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value, name) => [formatNumber(value), name]} /></PieChart></ResponsiveContainer></div><div className="chart-legend">{categoryData.map((category, index) => <div key={category.name} className="legend-item"><span className="legend-dot" style={{ background: colors[index % colors.length] }} /><span>{category.name}</span><strong>{formatNumber(category.value)}</strong></div>)}</div></div> : <Empty title="No category data yet" body="Classify an email and your category breakdown will appear here." />}
          </section>
          <section className="card recent-card">
            <div className="section-heading"><div><span className="eyebrow">YOUR LATEST</span><h2>Recent emails</h2></div><Link className="text-link" to="/history">View all <ArrowRight size={14} /></Link></div>
            {history.length ? <div className="recent-list">{history.map((item) => <div className="recent-item" key={item.id || item.pk}><span className={`mail-icon ${String(item.category || item.label || '').toLowerCase().includes('spam') ? 'mail-icon-warn' : ''}`}><Mail size={16} /></span><div className="recent-main"><strong>{item.subject || item.email_subject || 'Classified email'}</strong><span>{item.category || item.label || 'Uncategorized'}</span></div><CheckCircle2 size={16} className="recent-check" /></div>)}</div> : <Empty title="Your history is waiting" body="Once you classify an email, your latest activity will show up here." />}
          </section>
        </div>
        <div className="tip-banner"><span className="tip-spark"><Activity size={18} /></span><div><strong>Make room for the important stuff.</strong><span>Paste an email to see what it is and get a confidence score.</span></div><Link to="/classify" className="text-link">Try it out <ArrowRight size={14} /></Link></div>
      </>}
    </>
  )
}

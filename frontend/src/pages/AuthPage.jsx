import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { request } from '../api'
import { useAuth } from '../App'

export default function AuthPage({ register = false }) {
  const [values, setValues] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const set = (key) => (event) => setValues({ ...values, [key]: event.target.value })

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = register ? '/auth/register/' : '/auth/login/'
      const payload = register
        ? { username: values.username, email: values.email, password: values.password }
        : { username: values.username, password: values.password }
      const data = await request(endpoint, { method: 'POST', body: JSON.stringify(payload) })
      const access = data?.access || data?.access_token || data?.token || data?.key
      if (register && !access) {
        setError('Your account was created. Please sign in to continue.')
        return
      }
      if (!access) throw new Error('The server did not return a sign-in token. Please try again.')
      signIn(data)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-brand"><span className="brand-mark"><Sparkles size={18} /></span><span>mailmind</span></div>
        <div className="showcase-copy"><span className="pill"><span className="live-dot" /> A clearer kind of inbox</span><h1>Less inbox noise.<br /><span>More signal.</span></h1><p>Know what matters at a glance. Let thoughtful email intelligence bring order to your inbox.</p>
          <div className="showcase-note"><span className="note-icon"><ShieldCheck size={19} /></span><div><strong>Your data stays yours</strong><span>Private by design. Insights you can trust.</span></div></div>
        </div>
        <div className="auth-decoration decoration-one" /><div className="auth-decoration decoration-two" /><div className="showcase-footer">A little more clarity, every day.</div>
      </section>
      <section className="auth-panel">
        <div className="auth-mobile-brand"><span className="brand-mark"><Sparkles size={18} /></span> mailmind</div>
        <div className="auth-form-wrap"><div className="auth-overline">{register ? 'GET STARTED' : 'WELCOME BACK'}</div><h2>{register ? 'Create your account' : 'Sign in to Mailmind'}</h2><p className="auth-subtitle">{register ? 'A calmer inbox is just a few details away.' : 'Pick up where you left off.'}</p>
          {error && <div className={`auth-message ${error.startsWith('Your account') ? 'success' : ''}`} role="alert">{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            {register && <label>Your name<input value={values.username} onChange={set('username')} placeholder="e.g. alex" autoComplete="username" required /></label>}
            {!register && <label>Username<input value={values.username} onChange={set('username')} placeholder="Your username" autoComplete="username" required /></label>}
            {register && <label>Email address<div className="input-with-icon"><Mail size={16} /><input type="email" value={values.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" required /></div></label>}
            <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={values.password} onChange={set('password')} placeholder={register ? 'At least 8 characters' : 'Enter your password'} autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 8 : undefined} required /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            <button className="button button-primary auth-submit" disabled={loading}>{loading ? 'Please wait…' : register ? 'Create account' : 'Sign in'}{!loading && <ArrowRight size={16} />}</button>
          </form>
          <p className="auth-switch">{register ? 'Already have an account?' : 'New to Mailmind?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
          <div className="auth-privacy"><ShieldCheck size={15} /> Your account is private and secure</div>
        </div>
        <div className="auth-panel-footer">Thoughtful tools for a more focused day.</div>
      </section>
    </main>
  )
}

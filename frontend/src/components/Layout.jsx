import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, ArrowUpRight, ChevronDown, CircleHelp, LayoutDashboard, LogOut, MailPlus, Menu, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../App'

const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/classify', label: 'Classify email', icon: MailPlus },
  { to: '/history', label: 'Email history', icon: Activity },
  { to: '/performance', label: 'Performance', icon: ArrowUpRight },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const title = navigation.find((item) => item.to === location.pathname)?.label || 'Overview'
  const name = user?.first_name || user?.username || user?.email?.split('@')[0] || 'there'
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div className="app-shell">
      {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><Sparkles size={18} /></span><span>mailmind</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{to === '/classify' && <span className="nav-new">NEW</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><strong>Need a hand?</strong><span>Make sense of your email insights.</span><a href="mailto:support@mailmind.app">Get in touch <ArrowUpRight size={13} /></a></div>
          <div className="profile-row"><div className="avatar">{initials}</div><div className="profile-meta"><strong>{name}</strong><span>{user?.email || 'Personal workspace'}</span></div><button className="icon-button logout" title="Sign out" aria-label="Sign out" onClick={signOut}><LogOut size={17} /></button></div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{title}</strong></div>
          <div className="topbar-right"><span className="live-dot" /> Your inbox, in focus <ChevronDown size={15} className="muted-icon" /></div>
        </header>
        <div className="content"><Outlet /></div>
      </main>
    </div>
  )
}

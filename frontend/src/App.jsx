import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { request, setToken } from './api'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Classify from './pages/Classify'
import History from './pages/History'
import Performance from './pages/Performance'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function Protected({ children }) {
  const { token, checking } = useAuth()
  if (checking) return <div className="page-loader"><span className="spinner" />Loading your workspace…</div>
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [token, updateToken] = useState(() => localStorage.getItem('mailmind_token'))
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('mailmind_token')))

  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }
    request('/auth/profile/')
      .then((profile) => setUser(profile?.user || profile))
      .catch(() => {
        setToken(null)
        updateToken(null)
      })
      .finally(() => setChecking(false))
  }, [token])

  const auth = useMemo(() => ({
    token, user, checking,
    signIn(data) {
      const access = data?.access || data?.access_token || data?.token || data?.key
      if (access) {
        setToken(access)
        updateToken(access)
      }
      setUser(data?.user || data?.profile || null)
    },
    signOut() {
      setToken(null)
      updateToken(null)
      setUser(null)
    },
  }), [token, user, checking])

  return (
    <AuthContext.Provider value={auth}>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <AuthPage register />} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="classify" element={<Classify />} />
          <Route path="history" element={<History />} />
          <Route path="performance" element={<Performance />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  )
}

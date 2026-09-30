const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

export function getToken() {
  return localStorage.getItem('mailmind_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('mailmind_token', token)
  else localStorage.removeItem('mailmind_token')
}

function firstMessage(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(firstMessage).find(Boolean)
  if (value && typeof value === 'object') return Object.values(value).map(firstMessage).find(Boolean)
  return null
}

export async function request(path, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Unable to connect to the server. Check that the API is running and try again.')
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const message = firstMessage(data?.error?.message)
      || firstMessage(data?.detail)
      || firstMessage(data?.message)
      || 'Something went wrong. Please try again.'
    throw new Error(message)
  }
  return data
}

export function listFrom(data) {
  if (Array.isArray(data)) return data
  return data?.results || data?.history || data?.items || data?.data || []
}

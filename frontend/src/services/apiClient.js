const API_BASE = '/api'

function readCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null
}

async function ensureCsrfToken() {
  const existingToken = readCookie('csrftoken')
  if (existingToken) return existingToken

  await fetch(`${API_BASE}/auth/csrf/`, { credentials: 'include' })
  return readCookie('csrftoken')
}

export async function apiRequest(path, options = {}) {
  const method = (options.method ?? 'GET').toUpperCase()
  const headers = new Headers(options.headers)
  const unsafeMethod = !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (unsafeMethod) {
    const csrfToken = await ensureCsrfToken()
    if (csrfToken) headers.set('X-CSRFToken', csrfToken)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  })
  const responseBody = response.status === 204
    ? null
    : await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(
      responseBody?.detail ??
      responseBody?.password?.[0] ??
      responseBody?.email?.[0] ??
      responseBody?.message?.[0] ??
      'The request could not be completed.',
    )
    error.status = response.status
    error.response = responseBody
    throw error
  }

  return responseBody
}

export async function getCurrentUser() {
  try {
    return await apiRequest('/auth/me/')
  } catch (error) {
    if (error.status === 401 || error.status === 403) return null
    throw error
  }
}

export function registerAccount({ email, name, password }) {
  return apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  })
}

export function loginAccount({ email, password }) {
  return apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logoutAccount() {
  return apiRequest('/auth/logout/', { method: 'POST' })
}

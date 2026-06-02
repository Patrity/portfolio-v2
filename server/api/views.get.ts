/**
 * Per-post view counts from the (self-hosted) Umami analytics instance.
 *
 * Required env (set in Vercel, never committed):
 *   UMAMI_API_URL     base URL, e.g. https://analytics.patrity.com (defaults to that)
 *   UMAMI_WEBSITE_ID  defaults to the public id in nuxt.config
 *   Self-hosted auth:  UMAMI_USERNAME + UMAMI_PASSWORD
 *   OR Umami Cloud:    UMAMI_API_KEY
 *
 * Returns { views: number | null }. Null whenever it's unconfigured or the
 * upstream call fails, so the UI can simply hide the counter.
 */
const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID || '27f65d7d-3ef5-4e46-bfdf-182b3d6d2bf4'
const API_URL = (process.env.UMAMI_API_URL || 'https://analytics.patrity.com').replace(/\/$/, '')
const VIEW_TTL = 10 * 60 * 1000 // 10 min
const TOKEN_TTL = 6 * 60 * 60 * 1000 // 6 h

let tokenCache: { token: string, exp: number } | null = null
const viewCache = new Map<string, { views: number, exp: number }>()

async function getToken(): Promise<string | null> {
  if (tokenCache && tokenCache.exp > Date.now()) return tokenCache.token
  const username = process.env.UMAMI_USERNAME
  const password = process.env.UMAMI_PASSWORD
  if (!username || !password) return null
  try {
    const res = await $fetch<{ token: string }>(`${API_URL}/api/auth/login`, {
      method: 'POST',
      body: { username, password },
    })
    tokenCache = { token: res.token, exp: Date.now() + TOKEN_TTL }
    return res.token
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const path = getQuery(event).path as string | undefined
  if (!path || !path.startsWith('/')) return { views: null }

  const cached = viewCache.get(path)
  if (cached && cached.exp > Date.now()) return { views: cached.views }

  const apiKey = process.env.UMAMI_API_KEY
  const token = apiKey ? null : await getToken()
  if (!apiKey && !token) return { views: null }

  const base = apiKey ? 'https://api.umami.is/v1' : API_URL
  const headers = apiKey
    ? { 'x-umami-api-key': apiKey }
    : { Authorization: `Bearer ${token}` }

  try {
    const stats = await $fetch<{ pageviews?: { value?: number } }>(
      `${base}/api/websites/${WEBSITE_ID}/stats`,
      {
        headers,
        query: {
          startAt: new Date('2020-01-01').getTime(),
          endAt: Date.now(),
          url: path,
        },
      },
    )
    const views = stats?.pageviews?.value ?? 0
    viewCache.set(path, { views, exp: Date.now() + VIEW_TTL })
    return { views }
  } catch {
    return { views: null }
  }
})

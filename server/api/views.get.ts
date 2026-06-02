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
 *
 * Append ?debug=1 to get a `_debug` object describing where it stopped
 * (no secrets, safe to share) — handy for diagnosing a deploy.
 */
const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID || '27f65d7d-3ef5-4e46-bfdf-182b3d6d2bf4'
const API_URL = (process.env.UMAMI_API_URL || 'https://analytics.patrity.com').replace(/\/$/, '')
const VIEW_TTL = 10 * 60 * 1000 // 10 min
const TOKEN_TTL = 6 * 60 * 60 * 1000 // 6 h

let tokenCache: { token: string, exp: number } | null = null
const viewCache = new Map<string, { views: number, exp: number }>()

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const path = q.path as string | undefined
  const debug = q.debug !== undefined
  const out = (views: number | null, dbg: Record<string, unknown>) =>
    debug ? { views, _debug: dbg } : { views }

  if (!path || !path.startsWith('/')) return out(null, { stage: 'bad-path', path })

  const cached = viewCache.get(path)
  if (cached && cached.exp > Date.now()) return out(cached.views, { stage: 'cache-hit' })

  const apiKey = process.env.UMAMI_API_KEY
  const hasLogin = !!(process.env.UMAMI_USERNAME && process.env.UMAMI_PASSWORD)
  if (!apiKey && !hasLogin) {
    return out(null, { stage: 'no-env', apiUrl: API_URL, websiteId: WEBSITE_ID, hasApiKey: false, hasLogin: false })
  }

  // Authenticate (self-hosted login flow) unless using a cloud API key.
  let token: string | null = null
  if (!apiKey) {
    if (tokenCache && tokenCache.exp > Date.now()) {
      token = tokenCache.token
    } else {
      try {
        const res = await $fetch<{ token: string }>(`${API_URL}/api/auth/login`, {
          method: 'POST',
          body: { username: process.env.UMAMI_USERNAME, password: process.env.UMAMI_PASSWORD },
        })
        token = res?.token ?? null
        if (token) tokenCache = { token, exp: Date.now() + TOKEN_TTL }
      } catch (e: any) {
        return out(null, { stage: 'login-failed', status: e?.response?.status ?? e?.statusCode, msg: String(e?.message || e).slice(0, 160) })
      }
    }
    if (!token) return out(null, { stage: 'login-no-token' })
  }

  const base = apiKey ? 'https://api.umami.is/v1' : API_URL
  const headers = apiKey ? { 'x-umami-api-key': apiKey } : { Authorization: `Bearer ${token}` }

  try {
    const stats = await $fetch<Record<string, any>>(
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
    const views = stats?.pageviews?.value ?? null
    if (views !== null) viewCache.set(path, { views, exp: Date.now() + VIEW_TTL })
    return out(views, { stage: 'ok', statsKeys: Object.keys(stats || {}), pageviews: stats?.pageviews })
  } catch (e: any) {
    return out(null, { stage: 'stats-failed', status: e?.response?.status ?? e?.statusCode, msg: String(e?.message || e).slice(0, 160) })
  }
})

/**
 * Per-post view count from Umami: GET /api/views?path=/blog/slug
 * Returns { views: number | null }. Null when unconfigured/unauthorized/failed
 * so the UI can hide the counter. Append ?debug=1 for a secret-free _debug stage.
 */
const VIEW_TTL = 10 * 60 * 1000 // 10 min
const viewCache = new Map<string, { views: number, exp: number }>()

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const path = q.path as string | undefined
  const debug = q.debug !== undefined
  const out = (views: number | null, dbg: Record<string, unknown>) => (debug ? { views, _debug: dbg } : { views })

  if (!path || !path.startsWith('/')) return out(null, { stage: 'bad-path', path })

  const cached = viewCache.get(path)
  if (cached && cached.exp > Date.now()) return out(cached.views, { stage: 'cache-hit' })

  const auth = await getUmamiAuth()
  if ('error' in auth) return out(null, { stage: auth.error })

  try {
    const stats = await $fetch<Record<string, any>>(
      `${auth.base}/api/websites/${umamiConfig.WEBSITE_ID}/stats`,
      { headers: auth.headers, query: { startAt: ALL_TIME_START, endAt: Date.now(), url: path } },
    )
    const views = stats?.pageviews?.value ?? null
    if (views !== null) viewCache.set(path, { views, exp: Date.now() + VIEW_TTL })
    return out(views, { stage: 'ok', pageviews: stats?.pageviews })
  } catch (e: any) {
    return out(null, { stage: 'stats-failed', status: e?.response?.status ?? e?.statusCode })
  }
})

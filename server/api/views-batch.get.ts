/**
 * View counts for every blog post in ONE request: GET /api/views-batch
 * Uses Umami's metrics?type=url endpoint (all paths at once) so the listing
 * page costs a single round-trip regardless of post count.
 * Returns { counts: { '/blog/slug': number } }. Append ?debug=1 for stages.
 */
const BATCH_TTL = 10 * 60 * 1000 // 10 min
let batchCache: { data: Record<string, number>, exp: number } | null = null

export default defineEventHandler(async (event) => {
  const debug = getQuery(event).debug !== undefined
  const out = (counts: Record<string, number>, dbg: Record<string, unknown>) => (debug ? { counts, _debug: dbg } : { counts })

  if (batchCache && batchCache.exp > Date.now()) return out(batchCache.data, { stage: 'cache-hit' })

  const auth = await getUmamiAuth()
  if ('error' in auth) return out({}, { stage: auth.error })

  try {
    const rows = await $fetch<Array<{ x: string, y: number }>>(
      `${auth.base}/api/websites/${umamiConfig.WEBSITE_ID}/metrics`,
      { headers: auth.headers, query: { startAt: ALL_TIME_START, endAt: Date.now(), type: 'url', limit: 500 } },
    )
    // Umami stores URL variants separately (trailing slash, #fragment, ?query).
    // Normalize to the canonical path and sum so totals match the per-post stats.
    const counts: Record<string, number> = {}
    for (const r of rows || []) {
      if (!r?.x) continue
      let p = r.x.split('?')[0].split('#')[0]
      if (p.length > 1) p = p.replace(/\/$/, '')
      if (p.startsWith('/blog/')) counts[p] = (counts[p] || 0) + (r.y || 0)
    }
    batchCache = { data: counts, exp: Date.now() + BATCH_TTL }
    return out(counts, { stage: 'ok', rows: rows?.length, blogPaths: Object.keys(counts).length })
  } catch (e: any) {
    return out({}, { stage: 'metrics-failed', status: e?.response?.status ?? e?.statusCode })
  }
})

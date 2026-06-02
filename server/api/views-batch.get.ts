/**
 * View counts for a set of posts in one request:
 *   GET /api/views-batch?paths=/blog/a,/blog/b
 * Fans out to the same per-path stats lookup the article pages use (shared
 * cache), so listing counts always match the article counts. The client makes
 * a single call; server-side work is cached for 10 min.
 * Returns { counts: { '/blog/slug': number } }.
 */
export default defineEventHandler(async (event) => {
  const raw = (getQuery(event).paths as string | undefined) || ''
  const paths = raw
    .split(',')
    .map(p => p.trim())
    .filter(p => p.startsWith('/blog/'))
    .slice(0, 50) // guard against abuse

  const entries = await Promise.all(paths.map(async p => [p, await getPageViews(p)] as const))
  const counts: Record<string, number> = {}
  for (const [p, v] of entries) if (v !== null) counts[p] = v
  return { counts }
})

/**
 * Per-post view count: GET /api/views?path=/blog/slug
 * Returns { views: number | null } (null hides the counter in the UI).
 */
export default defineEventHandler(async (event) => {
  const path = getQuery(event).path as string | undefined
  return { views: path ? await getPageViews(path) : null }
})

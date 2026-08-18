/**
 * RSS 2.0 feed for the blog collection: GET /rss.xml
 *
 * Non-draft posts, newest first. Prerendered at build time (route listed in
 * nitro.prerender.routes) and also works as a live Nitro route, so nothing
 * here may assume a filesystem or a browser.
 */
import { queryCollection } from '@nuxt/content/nitro'

const SITE_URL = 'https://www.techhivelabs.net'
const FEED_URL = `${SITE_URL}/rss.xml`
const CHANNEL_TITLE = 'TechHive Labs'
const CHANNEL_DESCRIPTION = 'Field reports on full-stack development, local AI, RAG pipelines, and the homelab experiments behind them.'

const MIME_BY_EXT: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  avif: 'image/avif',
  svg: 'image/svg+xml',
}

function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// RFC 822 as RSS 2.0 wants it, e.g. "Wed, 17 Jun 2026 00:00:00 GMT".
function toRfc822(date: string | Date): string {
  return new Date(date).toUTCString()
}

function mimeFor(path: string): string {
  const ext = (path.split('?')[0] || '').split('.').pop()?.toLowerCase() || ''
  return MIME_BY_EXT[ext] || 'image/webp'
}

export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'blog')
    .select('title', 'description', 'path', 'date', 'image', 'draft')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all()

  const items = posts.map((post) => {
    const url = `${SITE_URL}${post.path}`
    const lines = [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <pubDate>${toRfc822(post.date)}</pubDate>`,
      `      <description>${escapeXml(post.description || '')}</description>`,
    ]
    if (post.image) {
      // RSS Best Practices Profile: when the byte size is unknown, publishers
      // should use length="0" (the attribute itself is required by the spec).
      lines.push(`      <enclosure url="${escapeXml(`${SITE_URL}${post.image}`)}" type="${mimeFor(post.image)}" length="0"/>`)
    }
    lines.push('    </item>')
    return lines.join('\n')
  })

  const lastBuildDate = toRfc822(posts[0]?.date || new Date())

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(CHANNEL_TITLE)}</title>`,
    `    <link>${SITE_URL}</link>`,
    `    <description>${escapeXml(CHANNEL_DESCRIPTION)}</description>`,
    '    <language>en-us</language>',
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')

  setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
  return xml
})

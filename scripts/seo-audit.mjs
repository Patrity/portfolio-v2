/**
 * SEO / accessibility / performance audit crawler.
 *
 * Usage:
 *   pnpm audit                         # audit the live site
 *   pnpm audit http://localhost:3000   # audit a local preview build
 *   AUDIT_URL=... pnpm audit
 *   pnpm audit --shots                 # also save desktop+mobile screenshots
 *
 * Discovers URLs from /sitemap.xml (falls back to a small static list), then
 * checks each page for: HTTP status, single <h1>, title/description length,
 * canonical, og tags, image alt/dimensions/lazy coverage, JSON-LD presence,
 * console/hydration errors, failed requests, and navigation timing.
 *
 * Exits non-zero if any blocking issue is found, so it can gate CI.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = (process.argv.find(a => a.startsWith('http')) || process.env.AUDIT_URL || 'https://www.techhivelabs.net').replace(/\/$/, '')
const SHOTS = process.argv.includes('--shots')
const OUT = 'audit-output'
const FALLBACK_PATHS = ['/', '/about', '/contact', '/projects', '/blog']

const slug = (p) => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '_'))

async function discoverPaths() {
  try {
    const res = await fetch(`${BASE}/sitemap.xml`)
    if (!res.ok) throw new Error(`sitemap ${res.status}`)
    const xml = await res.text()
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(BASE, '') || '/')
    if (locs.length) return [...new Set(locs)].sort()
  } catch (e) {
    console.warn(`! sitemap unavailable (${e.message}), using fallback path list`)
  }
  return FALLBACK_PATHS
}

const collectMeta = () => {
  const m = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || null
  const imgs = [...document.querySelectorAll('img')]
  const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].length
  const perf = performance.getEntriesByType('navigation')[0] || {}
  const paints = Object.fromEntries(performance.getEntriesByType('paint').map(p => [p.name, Math.round(p.startTime)]))
  return {
    title: document.title,
    titleLen: document.title.length,
    metaDescLen: (m('meta[name="description"]') || '').length,
    canonical: m('link[rel="canonical"]', 'href'),
    ogTitle: m('meta[property="og:title"]'),
    ogImage: m('meta[property="og:image"]'),
    h1Count: document.querySelectorAll('h1').length,
    imgCount: imgs.length,
    imgNoAlt: imgs.filter(i => !i.getAttribute('alt')).length,
    imgNoDims: imgs.filter(i => !i.getAttribute('width') && !i.getAttribute('height')).length,
    jsonldBlocks: jsonld,
    fcpMs: paints['first-contentful-paint'] ?? null,
    ttfbMs: Math.round(perf.responseStart || 0),
    loadMs: Math.round(perf.loadEventEnd || 0),
  }
}

const browser = await chromium.launch()
const paths = await discoverPaths()
console.log(`Auditing ${paths.length} pages on ${BASE}${SHOTS ? ' (+screenshots)' : ''}\n`)
if (SHOTS) mkdirSync(`${OUT}/shots`, { recursive: true })
mkdirSync(OUT, { recursive: true })

const results = []
for (const path of paths) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const consoleErrors = [], failedReq = []
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)) })
  page.on('pageerror', e => consoleErrors.push('PAGEERROR ' + String(e).slice(0, 160)))
  page.on('requestfailed', r => {
    // ERR_ABORTED is normal for <video> byte-range requests and cancelled
    // prefetches — not a real failure. Genuine 4xx/5xx caught via 'response'.
    const err = r.failure()?.errorText || ''
    if (err.includes('ERR_ABORTED')) return
    failedReq.push(`${err} ${r.url().slice(0, 100)}`)
  })
  page.on('response', r => { if (r.status() >= 400) failedReq.push(`HTTP ${r.status()} ${r.url().slice(0, 100)}`) })

  let status = null
  try {
    // 'load' rather than 'networkidle': pages with autoplay carousels or
    // <video> keep the network active and never reach idle.
    const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 45000 })
    status = resp?.status()
  } catch (e) {
    results.push({ path, error: String(e).slice(0, 120) })
    await ctx.close()
    continue
  }
  await page.waitForTimeout(1500)
  const meta = await page.evaluate(collectMeta)
  if (SHOTS) {
    await page.screenshot({ path: `${OUT}/shots/${slug(path)}_desktop.png`, fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({ path: `${OUT}/shots/${slug(path)}_mobile.png`, fullPage: true })
  }

  // flag blocking issues
  const issues = []
  if (status !== 200) issues.push(`status ${status}`)
  if (meta.h1Count !== 1) issues.push(`${meta.h1Count} h1`)
  if (consoleErrors.some(e => /hydrat|mismatch/i.test(e))) issues.push('hydration error')
  if (consoleErrors.length) issues.push(`${consoleErrors.length} console error(s)`)
  if (meta.imgNoAlt) issues.push(`${meta.imgNoAlt} img w/o alt`)
  if (failedReq.length) issues.push(`${failedReq.length} failed req`)
  // warnings (non-blocking)
  const warnings = []
  if (meta.titleLen > 60) warnings.push(`title ${meta.titleLen}c`)
  if (meta.metaDescLen > 160) warnings.push(`desc ${meta.metaDescLen}c`)
  if (meta.imgNoDims) warnings.push(`${meta.imgNoDims} img w/o dims`)

  results.push({ path, status, ...meta, consoleErrors, failedReq, issues, warnings })
  const tag = issues.length ? 'FAIL' : warnings.length ? 'warn' : ' ok '
  console.log(`[${tag}] ${path}  h1=${meta.h1Count} title=${meta.titleLen}c fcp=${meta.fcpMs}ms` +
    (issues.length ? `\n        issues: ${issues.join(', ')}` : '') +
    (warnings.length ? `\n        warn:   ${warnings.join(', ')}` : ''))
  await ctx.close()
}

await browser.close()
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, results }, null, 2))

const failed = results.filter(r => r.error || r.issues?.length)
console.log(`\n${results.length} pages | ${failed.length} with blocking issues | report: ${OUT}/report.json`)
if (failed.length) {
  console.log('Blocking issues found on:', failed.map(r => r.path).join(', '))
  process.exit(1)
}
console.log('No blocking issues. ✔')

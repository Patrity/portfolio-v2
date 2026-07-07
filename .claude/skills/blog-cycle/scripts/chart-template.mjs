// TEMPLATE from the local-ai-true-cost cycle — copy to the scratchpad, swap the
// data/labels/output paths for the current post, keep the chrome + helpers.

// Chart generator for the local-ai-true-cost blog post.
// Dark self-contained card surface so the figures read correctly on both site themes.
// Palette: dataviz dark steps, validated (blue #3987e5, aqua #199e70 — ΔE 69.8 PASS).
import { writeFileSync, mkdirSync } from 'node:fs'

const OUT = '/Users/tony/Documents/GitHub/portfolio-v2/public/images/blog/local-ai-true-cost'
mkdirSync(OUT, { recursive: true })

const C = {
  surface: '#1a1a19',
  border: 'rgba(255,255,255,0.10)',
  ink: '#ffffff',
  ink2: '#c3c2b7',
  muted: '#898781',
  grid: '#2c2c2a',
  baseline: '#383835',
  blue: '#3987e5',
  aqua: '#199e70',
  gray: '#898781',
}
const FONT = `system-ui, -apple-system, 'Segoe UI', sans-serif`

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

// Horizontal bar: square at the left baseline, 4px rounded data-end on the right.
function bar(x, y, w, h, fill) {
  if (w < 6) return `<rect x="${x}" y="${y}" width="${Math.max(w, 3)}" height="${h}" fill="${fill}"/>`
  const r = Math.min(4, h / 2)
  return `<path d="M ${x} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x} Z" fill="${fill}"/>`
}

function text(x, y, str, { size = 12.5, fill = C.ink2, weight = 400, anchor = 'start', style = '' } = {}) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${style ? ` style="${style}"` : ''}>${esc(str)}</text>`
}

function svgDoc(w, h, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" font-family="${FONT}">
<title>${esc(title)}</title>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="14" fill="${C.surface}" stroke="${C.border}"/>
${body}
</svg>\n`
}

const L = 28          // left padding / baseline x
const R = 772         // right edge of plot
const PW = R - L      // plot width

// ---------------------------------------------------------------- chart 1
{
  const scale = PW / 1000 // $ -> px
  const wLocal = 35.85 * scale
  const wCloud = 961 * scale
  const body = [
    text(L, 40, 'The same 6.7 billion tokens, billed two ways', { size: 17, fill: C.ink, weight: 600 }),
    text(L, 63, 'All-time local coder workload since April 2026 · electricity at $0.1395/kWh vs OpenRouter list rates', { size: 12.5 }),

    // row 1 — local (emphasis, blue)
    text(L, 108, 'My rig (electricity)'),
    bar(L, 116, wLocal, 22, C.blue),
    text(L + wLocal + 10, 131, '$35.85', { size: 13, fill: C.ink, weight: 600 }),
    `<text x="${R}" y="131" font-family="${FONT}" font-size="14" text-anchor="end"><tspan fill="${C.ink}" font-weight="600">≈27× cheaper</tspan><tspan dx="6" fill="${C.muted}" font-size="12">on marginal cost</tspan></text>`,

    // row 2 — cloud (de-emphasis gray)
    text(L, 188, 'OpenRouter (same tokens, Qwen3.6-35B-A3B rates)'),
    bar(L, 196, wCloud, 22, C.gray),
    text(L + wCloud - 10, 211, '$961 est.', { size: 13, fill: C.surface, weight: 600, anchor: 'end' }),

    `<line x1="${L + 0.5}" y1="110" x2="${L + 0.5}" y2="224" stroke="${C.baseline}" stroke-width="1"/>`,
    text(L, 266, 'Marginal electricity only: excludes idle draw, cooling, and hardware. OpenRouter rate: $0.14/M input, $1.00/M output.', { size: 11, fill: C.muted }),
  ].join('\n')
  writeFileSync(`${OUT}/bill-vs-cloud.svg`, svgDoc(800, 296, 'All-time cost of 6.7 billion tokens: $35.85 of local electricity vs an estimated $961 at OpenRouter rates', body))
}

// ---------------------------------------------------------------- chart 2
{
  const rows = [
    { label: 'Always-on assistant (Hermes)', tokens: 4.753e9, val: '4.75B tokens · 71.4%', elec: '$25.77', inside: true },
    { label: 'Agentic coding (opencode)', tokens: 1.876e9, val: '1.88B · 28.2%', elec: '$9.66' },
    { label: 'Vision / security cameras (Frigate)', tokens: 15.57e6, val: '15.6M · 0.23%', elec: '$0.12' },
    { label: 'Second brain (MyMind + agents)', tokens: 13.61e6, val: '13.6M · 0.20%', elec: '$0.22' },
  ]
  const scale = PW / 5e9
  const parts = [
    text(L, 40, 'Where 6.66 billion input tokens actually went', { size: 17, fill: C.ink, weight: 600 }),
    text(L, 63, 'All-time input tokens by workload, from LiteLLM spend logs (April to July 2026)', { size: 12.5 }),
    text(R, 96, 'electricity', { size: 11, fill: C.muted, anchor: 'end' }),
  ]
  let y = 104
  for (const r of rows) {
    const w = r.tokens * scale
    parts.push(text(L, y + 12, r.label))
    parts.push(text(R, y + 12, r.elec, { size: 12, fill: C.muted, anchor: 'end', style: 'font-variant-numeric: tabular-nums' }))
    parts.push(bar(L, y + 20, w, 22, C.blue))
    if (r.inside) parts.push(text(L + w - 10, y + 35, r.val, { size: 12.5, fill: C.ink, weight: 600, anchor: 'end' }))
    else parts.push(text(L + Math.max(w, 3) + 10, y + 35, r.val, { size: 12.5, fill: C.ink2 }))
    y += 64
  }
  parts.push(`<line x1="${L + 0.5}" y1="118" x2="${L + 0.5}" y2="${104 + 3 * 64 + 44}" stroke="${C.baseline}" stroke-width="1"/>`)
  parts.push(text(L, y + 22, 'Bar length = input tokens, linear scale. Excludes 71.6M system health-check tokens with no API key.', { size: 11, fill: C.muted }))
  writeFileSync(`${OUT}/token-attribution.svg`, svgDoc(800, 404, 'All-time input tokens by workload: assistant 4.75 billion (71.4%), coding 1.88 billion (28.2%), vision 15.6 million (0.23%), second brain 13.6 million (0.20%)', parts.join('\n')))
}

// ---------------------------------------------------------------- chart 3
{
  const groups = [
    { label: 'Always-on assistant (Hermes)', req: 82, tok: 71.4, reqL: '82%', tokL: '71.4%' },
    { label: 'Agentic coding (opencode)', req: 12, tok: 28.2, reqL: '12%', tokL: '28.2%', note: 'avg ~97K tokens per request' },
    { label: 'Vision / security (Frigate)', req: 5, tok: 0.23, reqL: '5%', tokL: '0.23%' },
    { label: 'Second brain (MyMind + agents)', req: 1.5, tok: 0.2, reqL: '1.5%', tokL: '0.20%' },
  ]
  const scale = PW / 100
  const parts = [
    text(L, 40, 'Coding is the heavyweight per request, not per volume', { size: 17, fill: C.ink, weight: 600 }),
    text(L, 63, `Each workload's share of all requests vs its share of all input tokens`, { size: 12.5 }),
    // legend
    `<rect x="${L}" y="81" width="12" height="12" rx="3" fill="${C.aqua}"/>`,
    text(L + 18, 91, 'Share of requests', { size: 12 }),
    `<rect x="${L + 148}" y="81" width="12" height="12" rx="3" fill="${C.blue}"/>`,
    text(L + 166, 91, 'Share of input tokens', { size: 12 }),
  ]
  // gridlines at 25/50/75/100
  for (const pct of [25, 50, 75, 100]) {
    const x = L + pct * scale
    parts.push(`<line x1="${x + 0.5}" y1="112" x2="${x + 0.5}" y2="382" stroke="${C.grid}" stroke-width="1"/>`)
    parts.push(text(x, 400, `${pct}%`, { size: 11, fill: C.muted, anchor: 'middle', style: 'font-variant-numeric: tabular-nums' }))
  }
  parts.push(text(L, 400, '0%', { size: 11, fill: C.muted, anchor: 'middle', style: 'font-variant-numeric: tabular-nums' }))
  let y = 122
  for (const g of groups) {
    const wReq = g.req * scale
    const wTok = g.tok * scale
    parts.push(text(L, y + 10, g.label))
    parts.push(bar(L, y + 18, wReq, 16, C.aqua))
    parts.push(text(L + Math.max(wReq, 3) + 8, y + 30, g.reqL, { size: 12, fill: C.ink2 }))
    parts.push(bar(L, y + 36, wTok, 16, C.blue))
    parts.push(text(L + Math.max(wTok, 3) + 8, y + 48, g.tokL, { size: 12, fill: C.ink2 }))
    if (g.note) parts.push(text(L + Math.max(wTok, 3) + 60, y + 48, g.note, { size: 11, fill: C.muted }))
    y += 66
  }
  parts.push(`<line x1="${L + 0.5}" y1="112" x2="${L + 0.5}" y2="382" stroke="${C.baseline}" stroke-width="1"/>`)
  parts.push(text(L, 428, '161,905 requests · 6.66B input tokens all-time. System health checks excluded.', { size: 11, fill: C.muted }))
  writeFileSync(`${OUT}/requests-vs-tokens.svg`, svgDoc(800, 446, 'Share of requests vs share of input tokens by workload: assistant 82% of requests and 71.4% of tokens, coding 12% of requests but 28.2% of tokens, vision 5% and 0.23%, second brain 1.5% and 0.20%', parts.join('\n')))
}

console.log('charts written to', OUT)

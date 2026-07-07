// TEMPLATE from the local-ai-true-cost cycle — copy to the scratchpad, swap the
// data/labels/output paths for the current post, keep the chrome + helpers.

// LinkedIn stats card for the local-ai-true-cost post. 1200x1200 dark card,
// TechHive green accent (#39a10e, 5.56:1 on card), rendered to PNG at 2x.
import { writeFileSync } from 'node:fs'

const W = 1200, H = 1200, PAD = 96
const C = {
  bg: '#0d0d0d',
  card: '#131312',
  border: 'rgba(255,255,255,0.08)',
  ink: '#ffffff',
  ink2: '#c3c2b7',
  muted: '#8a897f',
  green: '#39a10e',
  greenSoft: 'rgba(57,161,14,0.14)',
  gray: '#4a4a46',
  baseline: '#333330',
}
const FONT = `'Helvetica Neue', Helvetica, Arial, sans-serif`
const t = (x, y, str, { size = 24, fill = C.ink2, weight = 400, anchor = 'start', ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${str}</text>`

const bar = (x, y, w, h, fill) => {
  const r = Math.min(6, w / 2)
  return `<path d="M ${x} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x} Z" fill="${fill}"/>`
}

const PW = W - PAD * 2   // 1008
const scale = PW / 1000  // $ -> px
const wLocal = Math.max(35.85 * scale, 14)
const wCloud = 961 * scale

const parts = [
  `<rect width="${W}" height="${H}" fill="${C.bg}"/>`,
  `<rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="28" fill="${C.card}" stroke="${C.border}" stroke-width="2"/>`,

  // eyebrow + title
  t(PAD, 150, 'TECHHIVE LABS · SELF-HOSTED AI, FULLY METERED', { size: 25, fill: C.green, weight: 700, ls: 3 }),
  t(PAD, 216, 'One quarter of AI coding on my own GPUs', { size: 52, fill: C.ink, weight: 700 }),

  // hero
  t(PAD - 6, 420, '27<tspan font-size="120">×</tspan>', { size: 190, fill: C.ink, weight: 800 }),
  t(PAD + 330, 372, 'cheaper than the same tokens', { size: 40, fill: C.ink2, weight: 500 }),
  t(PAD + 330, 424, 'at cloud API list rates', { size: 40, fill: C.ink2, weight: 500 }),

  // bars
  t(PAD, 524, 'On-prem rig, electricity', { size: 28, fill: C.ink2, weight: 500 }),
  bar(PAD, 544, wLocal, 44, C.green),
  t(PAD + wLocal + 22, 576, '$35.85', { size: 38, fill: C.ink, weight: 800 }),

  t(PAD, 672, 'Same 6.7B tokens at cloud rates', { size: 28, fill: C.ink2, weight: 500 }),
  bar(PAD, 692, wCloud, 44, C.gray),
  t(PAD + wCloud - 22, 724, '≈ $961', { size: 38, fill: C.ink, weight: 800, anchor: 'end' }),

  `<line x1="${PAD + 1}" y1="538" x2="${PAD + 1}" y2="742" stroke="${C.baseline}" stroke-width="2"/>`,

  // KPI row
  `<line x1="${PAD}" y1="812" x2="${W - PAD}" y2="812" stroke="${C.border}" stroke-width="2"/>`,
]

const kpis = [
  { v: '6.7B', l: 'tokens processed' },
  { v: '120+ tok/s', l: 'on 2x RTX 3090' },
  { v: '75.6', l: 'SWE-Bench Verified' },
  { v: '~$30/mo', l: 'electricity run rate' },
]
const kw = PW / kpis.length
kpis.forEach((k, i) => {
  const x = PAD + i * kw
  parts.push(`<rect x="${x}" y="866" width="10" height="10" rx="3" fill="${C.green}"/>`)
  parts.push(t(x + 24, 878, k.v, { size: 38, fill: C.ink, weight: 800 }))
  parts.push(t(x + 24, 916, k.l, { size: 22, fill: C.muted }))
})

parts.push(
  `<line x1="${PAD}" y1="986" x2="${W - PAD}" y2="986" stroke="${C.border}" stroke-width="2"/>`,
  t(PAD, 1044, 'Marginal electricity at $0.1395/kWh vs cloud list rates, identical token volume.', { size: 24, fill: C.muted }),
  t(PAD, 1080, 'Measured from live GPU power draw + throughput.', { size: 24, fill: C.muted }),
  t(W - PAD, 1080, 'techhivelabs.net', { size: 28, fill: C.green, weight: 700, anchor: 'end' }),
)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${parts.join('\n')}</svg>`
writeFileSync('/private/tmp/claude-501/-Users-tony-Documents-GitHub-portfolio-v2/a289ad7f-bc76-4a1a-b1c0-94e0f5708afa/scratchpad/linkedin-stats.svg', svg)
console.log('written')

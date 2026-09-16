// Aligning narration timings onto the rendered post.
//
// The narration text is deliberately NOT the post: `clean.ts` drops the Links section,
// tables, charts and images, prepends the title, and rewrites units and money into spoken
// form ("96 GB" -> "96 gigabytes"). So a timed paragraph cannot be matched to a rendered
// paragraph by index. It has to be matched by content, in order, and it has to be willing
// to give up rather than highlight the wrong paragraph while someone is reading.

export interface TimedParagraph { start: number, end: number, text: string }

/** Words worth matching on. Short tokens carry no signal and numerals get rewritten. */
export function keyWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
}

/** Jaccard-ish overlap weighted toward the timed paragraph, which is the shorter side. */
export function similarity(a: string, b: string): number {
  const wa = keyWords(a)
  const wb = new Set(keyWords(b))
  if (!wa.length || !wb.size) return 0
  let hit = 0
  for (const w of wa) if (wb.has(w)) hit++
  return hit / wa.length
}

export interface AlignOptions {
  /** A pairing below this is treated as no match at all. */
  minScore?: number
  /** How far ahead of the last match to look. Guards against a late false pairing. */
  lookahead?: number
}

/**
 * Greedy in-order alignment: timed paragraph i can only match a node at or after the node
 * matched by paragraph i-1. Narration and post share an order, so a monotonic walk avoids
 * the pathological case where a repeated phrase ("So what happened?") pairs with the wrong
 * section halfway down the page.
 *
 * Returns one entry per timed paragraph; -1 means deliberately unmatched.
 */
export function alignToNodes(
  timed: TimedParagraph[],
  nodeTexts: string[],
  { minScore = 0.5, lookahead = 8 }: AlignOptions = {},
): number[] {
  const out: number[] = []
  let cursor = 0
  for (const t of timed) {
    let bestIdx = -1
    let bestScore = minScore
    for (let i = cursor; i < Math.min(nodeTexts.length, cursor + lookahead); i++) {
      const s = similarity(t.text, nodeTexts[i])
      if (s > bestScore) { bestScore = s; bestIdx = i }
    }
    out.push(bestIdx)
    if (bestIdx >= 0) cursor = bestIdx + 1
  }
  return out
}

/**
 * Share of timed paragraphs that found a home. The player uses this to decide whether to
 * highlight at all: a partially-aligned post is worse than a plain player, because the
 * highlight silently drifts onto the wrong text and the reader trusts it.
 */
export function alignmentConfidence(mapping: number[]): number {
  if (!mapping.length) return 0
  return mapping.filter(i => i >= 0).length / mapping.length
}

/** Index of the paragraph being spoken at `t`, or -1. Binary search: this runs on timeupdate. */
export function activeIndex(timed: TimedParagraph[], t: number): number {
  let lo = 0
  let hi = timed.length - 1
  let found = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (t >= timed[mid].start) { found = mid; lo = mid + 1 }
    else hi = mid - 1
  }
  // Past the end of the last paragraph's audio, nothing is active.
  if (found >= 0 && t > timed[found].end + 1.5) return -1
  return found
}

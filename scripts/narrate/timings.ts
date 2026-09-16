// Build the per-post timing sidecar the player uses to follow along.
//
// The first version distributed whisper's SEGMENTS across paragraphs by word count. That
// drifts: segments do not respect paragraph boundaries, so every mismatch accumulates and
// by the middle of a post the timeline was a whole section out.
//
// This version asks whisper for WORD-level timestamps and anchors each paragraph to the
// real time of its own opening words. Error cannot accumulate, because every paragraph is
// located independently against the transcript rather than inheriting the previous one's
// position.
import { readFile, writeFile } from 'node:fs/promises'

export interface StampedWord { word: string, start: number, end: number }
export interface TimedParagraph { start: number, end: number, text: string }

/** Tokens worth matching on. Whisper rewrites numerals ("nine" -> "9"), so they are noise. */
export function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 3)
}

interface Indexed { t: string, time: number }

/**
 * Locate each paragraph by scoring a window of its opening tokens against the transcript.
 *
 * Measured against the real audio this beat both a bounded forward scan and a proportional
 * banded match (10/16 vs 6/16 and 2/16 on the same post). Keeping the numbers here because
 * the alternatives look more principled on paper and are worse in practice.
 */
export function wordsToParagraphs(paragraphs: string[], words: StampedWord[]): TimedParagraph[] {
  const stream: Indexed[] = []
  for (const w of words) {
    const t = w.word.toLowerCase().replace(/[^a-z]/g, '')
    if (t.length > 3) stream.push({ t, time: w.start })
  }

  const starts: number[] = []
  let cursor = 0
  const audioEnd = words.length ? words[words.length - 1].end : 0

  for (const p of paragraphs) {
    const probe = tokens(p).slice(0, 6)
    if (!probe.length || cursor >= stream.length) {
      starts.push(starts.length ? starts[starts.length - 1] : 0)
      continue
    }
    let bestIdx = -1
    let bestScore = 0
    // Start slightly behind the cursor so one overshooting match cannot strand the rest.
    const from = Math.max(0, cursor - 60)
    const limit = Math.min(stream.length, cursor + 600)
    for (let i = from; i < limit; i++) {
      let score = 0
      const window = stream.slice(i, i + probe.length + 8).map(x => x.t)
      for (const tok of probe) if (window.includes(tok)) score++
      if (stream[i].t === probe[0]) score += 1.5   // matching in place IS the boundary
      if (score > bestScore) { bestScore = score; bestIdx = i }
      if (score >= probe.length + 1.5) break
    }
    if (bestIdx < 0 || bestScore < 2) {
      starts.push(starts.length ? starts[starts.length - 1] : 0)
      continue
    }
    // The best window can open several words before the paragraph really starts, because
    // the probe tokens still fall inside its lookahead. Snap to a word that is ours.
    const probeSet = new Set(probe)
    let snapped = bestIdx
    for (let i = bestIdx; i < Math.min(stream.length, bestIdx + probe.length + 8); i++) {
      if (probeSet.has(stream[i].t)) { snapped = i; break }
    }
    const prev = starts.length ? starts[starts.length - 1] : 0
    starts.push(Math.max(stream[snapped].time, prev))
    cursor = snapped + 1
  }

  return paragraphs.map((text, i) => ({
    start: starts[i],
    end: i + 1 < starts.length ? Math.max(starts[i + 1], starts[i]) : audioEnd,
    text,
  }))
}

export function narrationParagraphs(text: string): string[] {
  return text.split(/\n{2,}/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

export async function transcribeWords(mp3: string, sttUrl: string, model: string): Promise<StampedWord[]> {
  const form = new FormData()
  form.set('file', new Blob([await readFile(mp3)], { type: 'audio/mpeg' }), 'a.mp3')
  form.set('model', model)
  form.set('response_format', 'verbose_json')
  form.set('timestamp_granularities[]', 'word')
  const res = await fetch(sttUrl, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`STT ${res.status} for ${mp3}`)
  const json = await res.json() as { words?: StampedWord[], segments?: { words?: StampedWord[] }[] }
  const words = json.words?.length ? json.words : (json.segments ?? []).flatMap(s => s.words ?? [])
  if (!words.length) throw new Error('no word timestamps returned')
  return words
}

export async function writeTimings(slug: string, opts: { sttUrl: string, model: string }): Promise<number> {
  const text = await readFile(`content/blog/${slug}.narration.txt`, 'utf8')
  const paragraphs = narrationParagraphs(text)
  const words = await transcribeWords(`public/audio/blog/${slug}.mp3`, opts.sttUrl, opts.model)
  const timed = wordsToParagraphs(paragraphs, words)
  await writeFile(`public/audio/blog/${slug}.timing.json`, JSON.stringify(timed))
  return timed.length
}

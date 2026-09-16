// Breeze TTS 2 adapter. Replaced the Chatterbox adapter on 2026-09-15 when
// Chatterbox and Kokoro were decommissioned in favour of a single model.
//
// Six things changed:
//  1. endpoint + port
//  2. JSON body -> multipart/form-data
//  3. server-side voice library -> the reference clip + its transcript are uploaded EVERY call
//  4. exaggeration/cfg_weight -> cfg_scale + a natural-language `instruction`
//  5. `split_text: true` is gone: Breeze has a hard prompt cap, so WE chunk
//  6. mp3 response -> raw headerless PCM that we concat, wrap, and optionally encode
//
// Requires in-repo (Breeze has no stored voices):
//   assets/voice/tony.wav   — the reference clip
//   assets/voice/tony.txt   — its EXACT transcript
//
// Breeze is LAN-only (192.168.2.25) and serves ONE request at a time.

import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'

const SR = 24000

export interface TtsOptions {
  /** STT endpoint used to read each chunk back. Unset disables verification. */
  sttUrl?: string
  sttModel: string
  /** Re-renders allowed per chunk when the read-back looks wrong. */
  maxRetries: number
  server: string          // http://192.168.2.25:8880
  refAudio: string        // assets/voice/tony.wav
  refText: string         // assets/voice/tony.txt contents
  instruction: string     // narration direction, e.g. "Warm, measured documentary narration."
  cfgScale: number        // 4 — also what lifts the prompt cap 256 -> 512
  temperature: number
  seed: number
  maxWords: number        // ~100. cap is 512 tokens INCLUDING the reference (~290)
  format: 'wav' | 'mp3'
}

/** Split into request-sized pieces on paragraph, then sentence, boundaries. */
/**
 * Split into synthesis chunks, packing ADJACENT paragraphs together up to the budget.
 *
 * Each chunk is generated independently, so every boundary resets prosody. Emitting one
 * chunk per paragraph left five- and seven-word chunks sitting next to seventy-word ones,
 * and the short ones came back flat and slow — audible as uneven pacing and energy across
 * the finished file. Packing keeps chunk sizes in the same band so the delivery matches.
 */
export function chunkText(text: string, maxWords: number): string[] {
  const out: string[] = []
  const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  const words = (t: string) => t.split(/\s+/).length

  // Pack consecutive short paragraphs into one chunk before falling back to sentences.
  const packed: string[] = []
  for (const para of paras) {
    const prev = packed[packed.length - 1]
    if (prev && words(prev) + words(para) <= maxWords) packed[packed.length - 1] = `${prev}\n${para}`
    else packed.push(para)
  }

  for (const para of packed) {
    if (words(para) <= maxWords) { out.push(para); continue }
    // too long: fall back to sentences, accumulating up to the budget
    let buf: string[] = []
    let n = 0
    for (const sent of para.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [para]) {
      const w = sent.trim().split(/\s+/).length
      if (n + w > maxWords && buf.length) { out.push(buf.join(' ').trim()); buf = []; n = 0 }
      buf.push(sent.trim()); n += w
    }
    if (buf.length) out.push(buf.join(' ').trim())
  }
  return out
}

async function synthesizeChunk(text: string, o: TtsOptions, refBytes: Buffer): Promise<Buffer> {
  const form = new FormData()
  form.set('text', text)
  form.set('instruction', o.instruction)
  form.set('cfg_scale', String(o.cfgScale))
  form.set('temperature', String(o.temperature))
  form.set('seed', String(o.seed))
  form.set('ref_text', o.refText)
  form.set('ref_audio', new Blob([refBytes], { type: 'audio/wav' }), 'reference.wav')

  // Breeze serves ONE request at a time; 409 while busy.
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`${o.server}/v1/audio/speech`, { method: 'POST', body: form })
    if (res.status === 409) { await new Promise(r => setTimeout(r, 1500 * (attempt + 1))); continue }
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`Breeze failed: HTTP ${res.status}${detail ? ` ${detail.slice(0, 300)}` : ''}`)
    }
    return Buffer.from(await res.arrayBuffer())   // raw PCM, no header
  }
  throw new Error('Breeze stayed busy after retries')
}

function pcmToWav(pcm: Buffer, sampleRate = SR): Buffer {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)          // PCM chunk size
  header.writeUInt16LE(1, 20)           // format = PCM
  header.writeUInt16LE(1, 22)           // mono
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28)  // byte rate
  header.writeUInt16LE(2, 32)           // block align
  header.writeUInt16LE(16, 34)          // bits per sample
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}

function wavToMp3(wav: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error',
      '-i', 'pipe:0', '-codec:a', 'libmp3lame', '-b:a', '128k', '-f', 'mp3', 'pipe:1'])
    const out: Buffer[] = []; const err: Buffer[] = []
    ff.stdout.on('data', c => out.push(c))
    ff.stderr.on('data', c => err.push(c))
    ff.on('error', reject)
    ff.on('close', code => code === 0
      ? resolve(Buffer.concat(out))
      : reject(new Error(`ffmpeg exited ${code}: ${Buffer.concat(err).toString().slice(0, 300)}`)))
    ff.stdin.end(wav)
  })
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Read a rendered chunk back with STT and decide whether Breeze actually said it.
 *
 * Breeze has two silent failure modes and neither changes the HTTP status:
 *   babble     - fluent-sounding invented words ("Woot Pound saves like far all 600 watts")
 *   repetition - one clause looped dozens of times
 * Babble is caught by novel word adjacencies; repetition is caught by length, since the
 * looped text is entirely in-vocabulary and scores perfectly on every content metric.
 */
async function chunkLooksWrong(pcm: Buffer, expected: string, o: TtsOptions): Promise<string | null> {
  if (!o.sttUrl) return null
  let heard: string
  try {
    const form = new FormData()
    form.set('file', new Blob([pcmToWav(pcm)], { type: 'audio/wav' }), 'c.wav')
    form.set('model', o.sttModel)
    const res = await fetch(o.sttUrl, { method: 'POST', body: form })
    if (!res.ok) return null                       // STT down: do not block the render
    heard = norm((await res.json() as { text?: string }).text ?? '')
  } catch { return null }
  if (!heard) return 'silent'

  const want = norm(expected).split(' ')
  const got = heard.split(' ')

  // Repetition/truncation: a loop inflates the transcript, a dropped tail shrinks it.
  const ratio = got.length / Math.max(want.length, 1)
  if (ratio > 1.35) return `repetition (heard ${got.length} words for ${want.length})`
  if (ratio < 0.65) return `truncated (heard ${got.length} words for ${want.length})`

  const bigrams = (w: string[]) => {
    const s = new Set<string>()
    for (let i = 0; i < w.length - 1; i++) s.add(w[i] + ' ' + w[i + 1])
    return s
  }
  const wantPairs = bigrams(want)
  const gotPairs = bigrams(got)

  // Babble: fluent, but its word PAIRS are novel. (precision)
  let hit = 0
  for (const g of gotPairs) if (wantPairs.has(g)) hit++
  const precision = gotPairs.size ? hit / gotPairs.size : 1
  if (precision < 0.55) return `babble (${(precision * 100).toFixed(0)}% phrase match)`

  // Dropped clause: the audio is perfectly clean but a phrase never got said. Precision
  // stays high because everything heard IS in the source, so only recall catches it.
  // Skipped on very short chunks: a six-word heading has five bigrams, so one STT
  // normalisation ("Wall Four" -> "Wall 4") reads as 20% loss and retries forever.
  if (want.length < 12) return null
  let found = 0
  for (const w of wantPairs) if (gotPairs.has(w)) found++
  const recall = wantPairs.size ? found / wantPairs.size : 1
  if (recall < 0.7) return `dropped content (${(recall * 100).toFixed(0)}% of phrases heard)`
  return null
}

export async function synthesize(text: string, o: TtsOptions): Promise<Buffer> {
  const refBytes = await readFile(o.refAudio)
  const chunks = chunkText(text, o.maxWords)
  const gap = Buffer.alloc(Math.round(SR * 0.35) * 2)   // 350ms between chunks, mono s16
  const parts: Buffer[] = []
  let retries = 0

  for (let i = 0; i < chunks.length; i++) {
    process.stderr.write(`  chunk ${i + 1}/${chunks.length} (${chunks[i].split(/\s+/).length}w)`)
    let pcm: Buffer | undefined
    // The failure is deterministic for a given seed, so a retry must move the seed.
    for (let attempt = 0; attempt <= o.maxRetries; attempt++) {
      const seed = o.seed + attempt * 7919
      pcm = await synthesizeChunk(chunks[i], { ...o, seed }, refBytes)
      const problem = await chunkLooksWrong(pcm, chunks[i], o)
      if (!problem) { if (attempt) process.stderr.write(` ok after ${attempt} retry`); break }
      retries++
      process.stderr.write(`\n    ${problem} -> reseed`)
      if (attempt === o.maxRetries) process.stderr.write(`\n    WARNING: still bad, keeping last take`)
    }
    process.stderr.write('\n')
    parts.push(pcm!)
    if (i < chunks.length - 1) parts.push(gap)
  }
  if (retries) process.stderr.write(`  re-rendered ${retries} bad chunk(s)\n`)

  const wav = pcmToWav(Buffer.concat(parts))
  return o.format === 'mp3' ? wavToMp3(wav) : wav
}

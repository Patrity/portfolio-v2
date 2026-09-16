// pnpm narrate:timings [slug ...]  ->  public/audio/blog/<slug>.timing.json
// With no slugs, does every post that has an mp3.
import { readdir, access, stat } from 'node:fs/promises'
import { writeTimings } from './narrate/timings'

const STT = process.env.NARRATE_STT ?? 'http://192.168.2.25:8881/v1/audio/transcriptions'
const MODEL = process.env.NARRATE_STT_MODEL ?? 'deepdml/faster-whisper-large-v3-turbo-ct2'

const exists = (p: string) => access(p).then(() => true, () => false)

const args = process.argv.slice(2).filter(a => !a.startsWith('--'))
const slugs = args.length
  ? args
  : (await readdir('public/audio/blog')).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)).sort()

let failed = 0
for (const slug of slugs) {
  if (!await exists(`content/blog/${slug}.narration.txt`)) {
    console.error(`  ${slug}: no .narration.txt, skipped`)
    continue
  }
  try {
    const n = await writeTimings(slug, { sttUrl: STT, model: MODEL })
    // A sidecar older than its audio describes a render that no longer exists, and the
    // player would confidently highlight the wrong paragraphs. Caught this once by luck
    // when a timings run raced a re-render, so it is an assertion now.
    const [mp3, side] = await Promise.all([
      stat(`public/audio/blog/${slug}.mp3`),
      stat(`public/audio/blog/${slug}.timing.json`),
    ])
    if (side.mtimeMs < mp3.mtimeMs) throw new Error('sidecar older than its mp3')
    console.log(`  ${slug}: ${n} paragraphs timed`)
  } catch (err) {
    failed++
    console.error(`  ${slug}: FAILED ${(err as Error).message}`)
  }
}
process.exit(failed ? 1 : 0)

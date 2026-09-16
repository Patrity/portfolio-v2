import { readFile, writeFile, mkdir, rename, access } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { postToNarrationText } from './narrate/clean'
import { synthesize, chunkText, type TtsOptions } from './narrate/tts'

interface Args {
  post: string
  textOnly: boolean
  rebuildText: boolean
  out?: string
  refTextPath: string
  opts: Omit<TtsOptions, 'refText'>
}

const DEFAULT_INSTRUCTION =
  'Warm, measured documentary narration. Unhurried, with clear emphasis on technical terms.'

const USAGE = `Usage: pnpm narrate <content/blog/post.md> [options]
  --text-only           stop after writing <slug>.narration.txt
  --rebuild-text        regenerate the .txt even if it exists
  --instruction <text>  narration direction (this is the main quality lever)
  --cfg-scale <n>       instruction adherence, default 4 (also lifts the prompt cap to 512)
  --temperature <n>     default 0.7 (0.9 produces babble on some chunks)
  --seed <int>          default 12345
  --max-words <int>     words per request, default 60. The cap counts the reference too, and
                        Breeze degrades into babble near the tail of long chunks.
  --ref-audio <path>    default assets/voice/tony.wav
  --ref-text <path>     default assets/voice/tony.txt
  --format <wav|mp3>    default mp3
  --server <url>        default http://192.168.2.25:8880
  --max-retries <int>   re-renders per chunk when read-back looks wrong, default 3
  --no-verify           skip the STT read-back (faster, but babble ships silently)
  --out <path>          default public/audio/blog/<slug>.<format>`

export function parseArgs(argv: string[]): Args {
  const VALUE_FLAGS = new Set(['--instruction', '--cfg-scale', '--temperature', '--seed',
    '--max-words', '--ref-audio', '--ref-text', '--format', '--server', '--out',
    '--stt', '--stt-model', '--max-retries'])
  let post: string | undefined
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      if (VALUE_FLAGS.has(argv[i])) i++ // skip the flag's value token
    } else {
      post = argv[i]
      break
    }
  }
  if (!post) { console.error(USAGE); process.exit(1) }
  const flag = (n: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined }
  const has = (n: string) => argv.includes(n)
  const format = (flag('--format') ?? 'mp3') as 'wav' | 'mp3'
  if (format !== 'wav' && format !== 'mp3') { console.error(`--format must be wav or mp3`); process.exit(1) }
  return {
    post,
    textOnly: has('--text-only'),
    rebuildText: has('--rebuild-text'),
    out: flag('--out'),
    refTextPath: flag('--ref-text') ?? 'assets/voice/tony.txt',
    opts: {
      server: flag('--server') ?? 'http://192.168.2.25:8880',
      refAudio: flag('--ref-audio') ?? 'assets/voice/tony.wav',
      instruction: flag('--instruction') ?? DEFAULT_INSTRUCTION,
      cfgScale: Number(flag('--cfg-scale') ?? 4),
      temperature: Number(flag('--temperature') ?? 0.7),
      seed: Number(flag('--seed') ?? 12345),
      maxWords: Number(flag('--max-words') ?? 60),
      sttUrl: has('--no-verify') ? undefined : (flag('--stt') ?? 'http://192.168.2.25:8881/v1/audio/transcriptions'),
      sttModel: flag('--stt-model') ?? 'deepdml/faster-whisper-large-v3-turbo-ct2',
      maxRetries: Number(flag('--max-retries') ?? 3),
      format,
    },
  }
}

async function exists(p: string): Promise<boolean> {
  try { await access(p); return true } catch { return false }
}

export async function buildText(post: string, txtPath: string, rebuild: boolean): Promise<string> {
  if (await exists(txtPath) && !rebuild) return readFile(txtPath, 'utf8')
  const text = postToNarrationText(await readFile(post, 'utf8'))
  await writeFile(txtPath, text)
  console.log(`wrote ${txtPath}`)
  return text
}

/** Breeze takes ~44s to warm up and is LAN-only — fail fast rather than mid-post. */
async function assertReachable(server: string): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${server}/health`, { signal: AbortSignal.timeout(5000) })
  } catch {
    throw new Error(`Breeze unreachable at ${server} — it is LAN-only (192.168.2.25). On the network?`)
  }
  if (res.status === 503) throw new Error(`Breeze is still warming up (~44s). Retry shortly.`)
  if (!res.ok) throw new Error(`Breeze health check failed: HTTP ${res.status}`)
}

async function main(): Promise<void> {
  const a = parseArgs(process.argv.slice(2))
  if (!(await exists(a.post))) throw new Error(`post not found: ${a.post}`)
  const slug = basename(a.post).replace(/\.md$/, '')
  const txtPath = join(dirname(a.post), `${slug}.narration.txt`)
  const text = await buildText(a.post, txtPath, a.rebuildText)
  if (a.textOnly) return

  for (const p of [a.opts.refAudio, a.refTextPath]) {
    if (!(await exists(p))) throw new Error(`reference missing: ${p} — Breeze uploads the clip + transcript on every call`)
  }
  const refText = (await readFile(a.refTextPath, 'utf8')).trim()
  await assertReachable(a.opts.server)

  const chunks = chunkText(text, a.opts.maxWords)
  console.log(`${text.split(/\s+/).length} words -> ${chunks.length} chunks (~2x realtime, so be patient)`)

  const buf = await synthesize(text, { ...a.opts, refText })
  const out = a.out ?? join('public/audio/blog', `${slug}.${a.opts.format}`)
  await mkdir(dirname(out), { recursive: true })
  const tmp = `${out}.tmp`
  await writeFile(tmp, buf)
  await rename(tmp, out)
  console.log(`wrote ${out} (${buf.length} bytes)`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e: unknown) => { console.error(e instanceof Error ? e.message : String(e)); process.exit(1) })
}

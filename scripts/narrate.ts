import { readFile, writeFile, mkdir, rename, access } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { postToNarrationText } from './narrate/clean'
import { synthesize, type TtsOptions } from './narrate/tts'

interface Args { post: string; textOnly: boolean; rebuildText: boolean; out?: string; opts: TtsOptions }

const USAGE = `Usage: pnpm narrate <content/blog/post.md> [options]
  --text-only           stop after writing <slug>.narration.txt
  --rebuild-text        regenerate the .txt even if it exists
  --voice <name>        clone voice (default happy-us.wav)
  --exaggeration <n>    default 0.5
  --cfg-weight <n>      default 0.5
  --temperature <n>     default 0.7
  --seed <int>          default 12345
  --chunk-size <int>    default 240
  --server <url>        default http://192.168.2.25:8884
  --out <path>          default public/audio/blog/<slug>.mp3`

export function parseArgs(argv: string[]): Args {
  const VALUE_FLAGS = new Set(['--voice', '--exaggeration', '--cfg-weight', '--temperature', '--seed', '--chunk-size', '--server', '--out'])
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
  let voice = flag('--voice') ?? 'happy-us.wav'
  if (!voice.endsWith('.wav')) voice += '.wav'
  return {
    post,
    textOnly: has('--text-only'),
    rebuildText: has('--rebuild-text'),
    out: flag('--out'),
    opts: {
      server: flag('--server') ?? 'http://192.168.2.25:8884',
      voice,
      exaggeration: Number(flag('--exaggeration') ?? 0.5),
      cfgWeight: Number(flag('--cfg-weight') ?? 0.5),
      temperature: Number(flag('--temperature') ?? 0.7),
      seed: Number(flag('--seed') ?? 12345),
      chunkSize: Number(flag('--chunk-size') ?? 240),
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

async function main(): Promise<void> {
  const a = parseArgs(process.argv.slice(2))
  if (!(await exists(a.post))) throw new Error(`post not found: ${a.post}`)
  const slug = basename(a.post).replace(/\.md$/, '')
  const txtPath = join(dirname(a.post), `${slug}.narration.txt`)
  const text = await buildText(a.post, txtPath, a.rebuildText)
  if (a.textOnly) return
  const buf = await synthesize(text, a.opts)
  const out = a.out ?? join('public/audio/blog', `${slug}.mp3`)
  await mkdir(dirname(out), { recursive: true })
  const tmp = `${out}.tmp`
  await writeFile(tmp, buf)
  await rename(tmp, out)
  console.log(`wrote ${out} (${buf.length} bytes)`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e: unknown) => { console.error(e instanceof Error ? e.message : String(e)); process.exit(1) })
}

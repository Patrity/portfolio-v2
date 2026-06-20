# Blog Post Narration (`narrate` CLI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A manual `narrate` CLI that converts one blog post's markdown into a quality-tuned spoken MP3 via the homelab Chatterbox server, with a reviewable intermediate narration script.

**Architecture:** One TS CLI (`scripts/narrate.ts`) orchestrating three pure-ish units — a deterministic markdown→speech cleaner (`scripts/narrate/clean.ts`), a Chatterbox `/tts` client (`scripts/narrate/tts.ts`), and a one-time MDC audio component (`app/components/AudioPlayer.vue`). The cleaner writes an editable `<slug>.narration.txt` sidecar that the author reviews before synthesis.

**Tech Stack:** Nuxt 4 + @nuxt/content v3, pnpm, tsx, vitest, unified/remark-parse, gray-matter. Chatterbox native `POST /tts` at `http://192.168.2.25:8884`.

## Global Constraints

- Package manager is **pnpm** (repo has `pnpm-lock.yaml`). Never use npm/yarn.
- No changes to the Chatterbox server config or the agent's Kokoro path — all TTS tuning is per-request.
- Posts live in `content/blog/<slug>.md`; audio output mirrors images at `public/audio/blog/<slug>.mp3`.
- Default TTS params (quality mode): `voice_mode=clone`, `reference_audio_filename=happy-us.wav`, `exaggeration=0.5`, `cfg_weight=0.5`, `temperature=0.7`, `seed=12345`, `split_text=true`, `chunk_size=240`, `output_format=mp3`.
- Valid clone voices on the server: `happy-us.wav`, `fast1-us.wav`, `fast2-us.wav`, `Gianna.wav`, `Robert.wav`.
- TDD: write the failing test first; commit after each green task.

---

### Task 1: Project setup — branch, deps, scripts, dirs

**Files:**
- Modify: `package.json` (add devDeps + `scripts` entries)
- Create: `scripts/narrate/` and `public/audio/blog/` directories

**Interfaces:**
- Produces: `pnpm narrate` (→ `tsx scripts/narrate.ts`) and `pnpm test:narrate` (→ `vitest run scripts/narrate`) commands.

- [ ] **Step 1: Create a feature branch** (repo is on `main`)

```bash
cd /Users/tony/Documents/GitHub/portfolio-v2
git checkout -b feat/blog-narration
```

- [ ] **Step 2: Install dev dependencies**

```bash
pnpm add -D tsx vitest unified remark-parse gray-matter @types/mdast @types/node
```

- [ ] **Step 3: Add scripts to `package.json`**

In the `"scripts"` block add:

```json
"narrate": "tsx scripts/narrate.ts",
"test:narrate": "vitest run scripts/narrate"
```

- [ ] **Step 4: Create directories with keepers**

```bash
mkdir -p scripts/narrate public/audio/blog
touch public/audio/blog/.gitkeep
```

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml public/audio/blog/.gitkeep
git commit -m "chore: scaffold narrate CLI tooling (deps, scripts, dirs)"
```

---

### Task 2: Markdown → speakable text cleaner

**Files:**
- Create: `scripts/narrate/clean.ts`
- Test: `scripts/narrate/clean.test.ts`

**Interfaces:**
- Produces:
  - `stripMdc(md: string): string`
  - `postToNarrationText(rawFile: string): string` — strips frontmatter, removes MDC blocks, walks the remark AST, returns speakable plain text ending in a single `\n`.

- [ ] **Step 1: Write the failing tests**

```ts
// scripts/narrate/clean.test.ts
import { describe, it, expect } from 'vitest'
import { stripMdc, postToNarrationText } from './clean'

describe('stripMdc', () => {
  it('removes block and leaf MDC components', () => {
    const md = 'before\n\n::audio-player{src="/a.mp3"}\n::\n\nafter\n\n::badge{x}\n'
    const out = stripMdc(md)
    expect(out).not.toContain('::')
    expect(out).toContain('before')
    expect(out).toContain('after')
  })
})

describe('postToNarrationText', () => {
  const raw = [
    '---', 'title: Hi', 'draft: false', '---',
    '# Heading One',
    '',
    'A paragraph with `inlineCode` and a [link text](https://example.com).',
    '',
    '```ts', 'const secret = 1', '```',
    '',
    '- first item', '- second item',
    '',
    '> a quoted line',
    '',
    '![alt](/img.png)',
    '',
    'Use e.g. this and i.e. that.',
  ].join('\n')

  const out = postToNarrationText(raw)

  it('drops frontmatter, code blocks, images, and URLs', () => {
    expect(out).not.toContain('title: Hi')
    expect(out).not.toContain('const secret')
    expect(out).not.toContain('https://example.com')
    expect(out).not.toContain('/img.png')
    expect(out).not.toContain('`')
  })
  it('keeps prose, link text, inline-code text, list items, and quote', () => {
    expect(out).toContain('Heading One')
    expect(out).toContain('inlineCode')
    expect(out).toContain('link text')
    expect(out).toContain('first item')
    expect(out).toContain('second item')
    expect(out).toContain('Quote: a quoted line')
  })
  it('applies eye→ear fixups', () => {
    expect(out).toContain('for example')
    expect(out).toContain('that is')
    expect(out).not.toMatch(/\be\.g\./)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:narrate`
Expected: FAIL — `clean.ts` has no such exports / module not found.

- [ ] **Step 3: Implement `scripts/narrate/clean.ts`**

```ts
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import type { Root, RootContent } from 'mdast'

const ABBREV: [RegExp, string][] = [
  [/\be\.g\.,?/gi, 'for example'],
  [/\bi\.e\.,?/gi, 'that is'],
  [/\betc\./gi, 'etcetera'],
]

// Remove MDC component blocks (remark-parse doesn't know them).
// Block form: ::name{...}\n ... \n::   Leaf form: ::name{...}
export function stripMdc(md: string): string {
  let out = md.replace(/^::[A-Za-z][\w-]*(?:\{[^}]*\})?\s*$[\s\S]*?^::\s*$/gm, '')
  out = out.replace(/^::[A-Za-z][\w-]*(?:\{[^}]*\})?\s*$/gm, '')
  return out
}

function childrenText(children: RootContent[]): string {
  return children.map(nodeToText).join('')
}

function nodeToText(node: RootContent): string {
  switch (node.type) {
    case 'code':
    case 'image':
    case 'imageReference':
    case 'html':
    case 'thematicBreak':
    case 'table':
      return ''
    case 'inlineCode':
    case 'text':
      return node.value
    case 'break':
      return ' '
    case 'heading': {
      const t = childrenText(node.children).trim()
      return t ? `${t}.\n\n` : ''
    }
    case 'paragraph': {
      const t = childrenText(node.children).trim()
      return t ? `${t}\n\n` : ''
    }
    case 'blockquote': {
      const t = childrenText(node.children).trim()
      return t ? `Quote: ${t}\n\n` : ''
    }
    case 'list':
      return node.children.map(nodeToText).join('')
    case 'listItem': {
      const t = childrenText(node.children).trim()
      return t ? `${t}.\n` : ''
    }
    case 'link':
    case 'emphasis':
    case 'strong':
    case 'delete':
      return childrenText(node.children)
    default:
      return 'children' in node ? childrenText((node as { children: RootContent[] }).children) : ''
  }
}

export function postToNarrationText(rawFile: string): string {
  const body = matter(rawFile).content
  const noMdc = stripMdc(body)
  const tree = unified().use(remarkParse).parse(noMdc) as Root
  let text = childrenText(tree.children)
  for (const [re, rep] of ABBREV) text = text.replace(re, rep)
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  return text + '\n'
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:narrate`
Expected: PASS (all clean.test.ts cases green).

- [ ] **Step 5: Commit**

```bash
git add scripts/narrate/clean.ts scripts/narrate/clean.test.ts
git commit -m "feat(narrate): deterministic markdown→speakable-text cleaner"
```

---

### Task 3: Chatterbox `/tts` client

**Files:**
- Create: `scripts/narrate/tts.ts`
- Test: `scripts/narrate/tts.test.ts`

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces:
  - `interface TtsOptions { server: string; voice: string; exaggeration: number; cfgWeight: number; temperature: number; seed: number; chunkSize: number }`
  - `buildTtsRequest(text: string, o: TtsOptions): Record<string, unknown>`
  - `synthesize(text: string, o: TtsOptions): Promise<Buffer>`

- [ ] **Step 1: Write the failing test** (pure request-body builder; no network)

```ts
// scripts/narrate/tts.test.ts
import { describe, it, expect } from 'vitest'
import { buildTtsRequest, type TtsOptions } from './tts'

const opts: TtsOptions = {
  server: 'http://192.168.2.25:8884', voice: 'happy-us.wav',
  exaggeration: 0.5, cfgWeight: 0.5, temperature: 0.7, seed: 12345, chunkSize: 240,
}

describe('buildTtsRequest', () => {
  it('maps options to the native /tts clone request', () => {
    const b = buildTtsRequest('hello world', opts)
    expect(b).toMatchObject({
      text: 'hello world',
      voice_mode: 'clone',
      reference_audio_filename: 'happy-us.wav',
      exaggeration: 0.5,
      cfg_weight: 0.5,
      temperature: 0.7,
      seed: 12345,
      split_text: true,
      chunk_size: 240,
      output_format: 'mp3',
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:narrate`
Expected: FAIL — `tts.ts` not found.

- [ ] **Step 3: Implement `scripts/narrate/tts.ts`**

```ts
export interface TtsOptions {
  server: string
  voice: string            // clone reference filename, e.g. "happy-us.wav"
  exaggeration: number
  cfgWeight: number
  temperature: number
  seed: number
  chunkSize: number
}

export function buildTtsRequest(text: string, o: TtsOptions): Record<string, unknown> {
  return {
    text,
    voice_mode: 'clone',
    reference_audio_filename: o.voice,
    exaggeration: o.exaggeration,
    cfg_weight: o.cfgWeight,
    temperature: o.temperature,
    seed: o.seed,
    split_text: true,
    chunk_size: o.chunkSize,
    output_format: 'mp3',
  }
}

export async function synthesize(text: string, o: TtsOptions): Promise<Buffer> {
  const res = await fetch(`${o.server}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildTtsRequest(text, o)),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Chatterbox /tts failed: HTTP ${res.status} ${detail.slice(0, 200)}`)
  }
  return Buffer.from(await res.arrayBuffer())
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:narrate`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/narrate/tts.ts scripts/narrate/tts.test.ts
git commit -m "feat(narrate): Chatterbox /tts client + request builder"
```

---

### Task 4: CLI orchestrator

**Files:**
- Create: `scripts/narrate.ts`
- Test: `scripts/narrate/cli.test.ts`

**Interfaces:**
- Consumes: `postToNarrationText` (Task 2); `synthesize`, `TtsOptions` (Task 3).
- Produces: the `narrate` CLI. Behavior: writes `<dir>/<slug>.narration.txt`; if it exists and `--rebuild-text` not given, reuses it; `--text-only` stops after the txt; otherwise synthesizes and writes `public/audio/blog/<slug>.mp3` (or `--out`).
  - Exports `parseArgs(argv: string[])` and `buildText(post: string, rebuild: boolean)` for testing.

- [ ] **Step 1: Write the failing integration test** (`--text-only`, no network)

```ts
// scripts/narrate/cli.test.ts
import { describe, it, expect, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { writeFileSync, readFileSync, rmSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'narrate-'))
const post = join(dir, 'sample.md')
writeFileSync(post, [
  '---', 'title: T', '---',
  '# Hello', '', 'Body with [a link](https://x.com) and `code`.', '',
  '```js', 'danger()', '```', '',
].join('\n'))

afterAll(() => rmSync(dir, { recursive: true, force: true }))

describe('narrate --text-only', () => {
  it('writes a clean narration.txt and no audio', () => {
    execFileSync('pnpm', ['narrate', post, '--text-only'], { encoding: 'utf8' })
    const txt = readFileSync(join(dir, 'sample.narration.txt'), 'utf8')
    expect(txt).toContain('Hello')
    expect(txt).toContain('a link')
    expect(txt).not.toContain('https://x.com')
    expect(txt).not.toContain('danger()')
    expect(txt).not.toContain('`')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:narrate`
Expected: FAIL — `scripts/narrate.ts` does not exist (execFileSync throws).

- [ ] **Step 3: Implement `scripts/narrate.ts`**

```ts
import { readFile, writeFile, mkdir, rename, access } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
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
  const post = argv.find(a => !a.startsWith('--'))
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

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:narrate`
Expected: PASS — `sample.narration.txt` written and clean.

- [ ] **Step 5: Live smoke test (manual, requires the Rig)**

Run: `pnpm narrate content/blog/local-ai-rig.md --text-only` then review the `.txt`; then `pnpm narrate content/blog/local-ai-rig.md` and confirm `public/audio/blog/local-ai-rig.mp3` plays.
Expected: clean script, then a valid MP3.

- [ ] **Step 6: Commit**

```bash
git add scripts/narrate.ts scripts/narrate/cli.test.ts
git commit -m "feat(narrate): CLI orchestrator with reviewable .txt + mp3 output"
```

---

### Task 5: `AudioPlayer.vue` MDC embed component

**Files:**
- Create: `app/components/AudioPlayer.vue`

**Interfaces:**
- Consumes: nothing. Used in posts as `::audio-player{src="/audio/blog/<slug>.mp3"}`.

- [ ] **Step 1: Create the component** (mirrors existing `app/components/Contentvid.vue`)

```vue
<script lang="ts" setup>
defineProps<{ src: string }>()
</script>

<template>
  <div class="my-4">
    <slot />
    <audio :src="src" controls preload="metadata" class="w-full" />
  </div>
</template>
```

- [ ] **Step 2: Verify it resolves as an MDC component**

Add `::audio-player{src="/audio/blog/local-ai-rig.mp3"}` + a closing `::` to a draft post, run `pnpm dev`, and confirm the player renders (component auto-imported like `Contentvid`).
Expected: an audio player appears where the block was placed.

- [ ] **Step 3: Commit**

```bash
git add app/components/AudioPlayer.vue
git commit -m "feat(narrate): AudioPlayer MDC component for post embeds"
```

---

## Self-Review

**Spec coverage:**
- CLI in portfolio-v2 (pnpm/tsx) → Task 1. ✓
- Deterministic remark cleaner (strip code/MDC/images, links→text, headings/lists/quotes, e.g./i.e.) → Task 2. ✓
- Reviewable `<slug>.narration.txt` + `--text-only` + honor existing edits / `--rebuild-text` → Task 4. ✓
- Chatterbox native `/tts` clone with tuned params, mp3 → Task 3, wired in Task 4. ✓
- `--voice` (default happy-us) + all tunable flags → Task 4 `parseArgs`. ✓
- Output to `public/audio/blog/<slug>.mp3`, no partial file on error (temp+rename) → Task 4. ✓
- Manual `::audio-player` embed → Task 5. ✓
- Error handling (missing post, non-200) → Task 3 `synthesize`, Task 4 `main`. ✓
- Tests (cleaner unit, request-builder unit, CLI integration) → Tasks 2/3/4. ✓
- No server/config or Kokoro changes → honored (per-request only). ✓

**Placeholder scan:** none — every step has concrete code/commands.

**Type consistency:** `TtsOptions` fields (`server, voice, exaggeration, cfgWeight, temperature, seed, chunkSize`) match between `tts.ts` (Task 3) and `parseArgs` (Task 4); `postToNarrationText`/`synthesize` signatures consistent across tasks.

## Notes / verify-at-build
- Confirm `unified`/`remark-parse` import shape (`unified().use(remarkParse).parse(...)`) against installed versions; adjust if the major version differs.
- `@nuxt/content` auto-imports `app/components/*` for MDC; confirm `audio-player` (kebab of `AudioPlayer`) resolves like the existing `Contentvid` (`content-vid`).

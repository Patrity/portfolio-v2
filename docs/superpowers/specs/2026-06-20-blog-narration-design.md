# Blog Post Narration (`narrate` CLI) — Design

**Date:** 2026-06-20
**Status:** Approved design, pending spec review
**Repo:** portfolio-v2 (Nuxt 4 + @nuxt/content v3)

## Goal

Generate a high-quality spoken-audio (MP3) narration of a written blog post and attach
it to the post as an audio player. Quality over speed — this is a batch/offline task, not
the real-time agent voice path.

Use the homelab **Chatterbox** TTS server in a quality-tuned, non-streaming mode. The
agent's real-time voice continues to use Kokoro and is unaffected.

## Why Chatterbox, tuned per-request (not a server change)

Chatterbox is the higher-ceiling, more expressive model but is currently driven by the
agent through the OpenAI `/v1/audio/speech` shim, which hides its quality knobs, and the
shared server runs the speed-distilled `chatterbox-turbo` with `exaggeration: 1.3` (too
high — its sweet spot is ~0.5). For long-form narration we instead call the server's
**native `POST /tts`** endpoint, which accepts per-request quality parameters. This means:

- **No change** to the Chatterbox server config (`~/chatterbox-tts-server/config.yaml`).
- **No change** to the agent's Kokoro path.
- All tuning is per-request, set by this CLI.

Verified against the live server (192.168.2.25:8884, 2026-06-20): native `/tts` with
`voice_mode=clone`, `reference_audio_filename=happy-us.wav`, `exaggeration=0.5`,
`cfg_weight=0.5`, `temperature=0.7`, `seed=1234`, `output_format=mp3`, `split_text=true`
returned HTTP 200 + valid MP3 bytes.

## Scope

In scope: a manual CLI tool (`narrate`) that turns one post's markdown into one MP3, with
a reviewable intermediate text script. Out of scope (YAGNI): LLM "polish" rewrite pass,
auto-frontmatter player injection, server/config changes, streaming, batch-all-posts.

## Architecture

Single CLI script + one Vue component. Two logical stages with a reviewable artifact
between them.

```
content/blog/<slug>.md
   │  (1) parse + strip frontmatter
   ▼
   │  (2) clean: remark AST → speakable text   ──►  content/blog/<slug>.narration.txt   (reviewable, hand-editable)
   ▼
   │  (3) synthesize: Chatterbox native POST /tts  (reads the .txt, possibly edited)
   ▼
public/audio/blog/<slug>.mp3
   │  (4) author pastes the embed into the post
   ▼
::audio-player{src="/audio/blog/<slug>.mp3"}
```

### Location & tooling

- Script: `portfolio-v2/scripts/narrate.ts`, run via **pnpm** (repo uses `pnpm-lock.yaml`)
  with `tsx`. A `narrate` entry is added to `package.json` `scripts`.
- Dependencies: **remark** + **remark-parse** (+ `unist-util-visit`) for the markdown AST
  (matches how `@nuxt/content` parses posts), and **gray-matter** for frontmatter.
  (Confirm which are already transitively present; add explicitly as devDependencies.)
- Existing `scripts/` directory already exists in the repo.

### Stage 1 — Parse

- Read `content/blog/<slug>.md`. Strip YAML frontmatter via gray-matter.
- Error if the file does not exist or has no body.

### Stage 2 — Clean (deterministic, remark AST → speakable text)

Walk the markdown AST and emit plain narration text. Rules:

- **Drop entirely:** fenced/indented code blocks, `::mdc::` component blocks (e.g.
  existing `::content-vid`), images, raw HTML, badges.
- **Flatten structure:** headings → their text on its own line followed by a pause
  (blank line / sentence break); list items → sentences; blockquotes → prefixed
  "Quote: …"; tables → skipped (not readable as audio).
- **Convert inline:** links → visible link text only (never the URL); inline code →
  text with backticks removed; bold/italic → plain text.
- **Light eye→ear fixups:** `e.g.` → "for example", `i.e.` → "that is"; strip stray
  markdown punctuation; collapse repeated whitespace/blank lines.

Output is written to **`content/blog/<slug>.narration.txt`** — the reviewable artifact.
The author may hand-edit this file before synthesis. `--text-only` stops the run here.

Rationale: markdown is written for the eye; the script is the single biggest quality
lever, and a reviewable/editable intermediate gives the author full control over exactly
what is spoken.

### Stage 3 — Synthesize (Chatterbox native `/tts`)

- Read the (possibly edited) `.narration.txt`.
- `POST http://192.168.2.25:8884/tts` with JSON body:
  - `text`: the narration script
  - `voice_mode`: `"clone"`
  - `reference_audio_filename`: `"happy-us.wav"` (default; overridable via `--voice`)
  - `exaggeration`: `0.5`
  - `cfg_weight`: `0.5`
  - `temperature`: `0.7`
  - `seed`: fixed integer default (e.g. `12345`) so multi-chunk long posts stay vocally
    consistent; overridable via `--seed`
  - `split_text`: `true`, `chunk_size`: `240` (server chunks long text and stitches the
    result into one file)
  - `output_format`: `"mp3"`
- The server returns the stitched MP3 in the response body.

Available clone voices on the server (verified 2026-06-20): `happy-us.wav`,
`fast1-us.wav`, `fast2-us.wav`, `Gianna.wav`, `Robert.wav`. ~120 predefined voices also
exist (selectable via `voice_mode=predefined` + `predefined_voice_id`) if `--voice` is
given a predefined name — optional nicety, default path is the clone.

### Stage 4 — Output

- Write the MP3 to `public/audio/blog/<slug>.mp3` (mirrors the existing
  `public/images/blog/` convention). Create the directory if missing.

### Embed component (one-time)

`app/components/AudioPlayer.vue`, mirroring the existing `app/components/Contentvid.vue`
pattern so it works as an MDC block in posts:

```vue
<script lang="ts" setup>
defineProps<{ src: string }>()
</script>
<template>
  <audio :src="src" controls preload="metadata" class="w-full my-4" />
</template>
```

Used in any post wherever the author wants the player (manual placement = max control):

```
::audio-player{src="/audio/blog/<slug>.mp3"}
::
```

## CLI interface

```
pnpm narrate content/blog/<slug>.md                 # clean → write .txt → synthesize → mp3
pnpm narrate content/blog/<slug>.md --text-only     # stop after writing the reviewable .txt
pnpm narrate content/blog/<slug>.md --voice fast1-us --exaggeration 0.4 --seed 1234
```

Flags (all optional, sensible defaults): `--text-only`, `--voice <name>`,
`--exaggeration <n>`, `--cfg-weight <n>`, `--temperature <n>`, `--seed <int>`,
`--chunk-size <int>`, `--server <url>` (default `http://192.168.2.25:8884`),
`--out <path>` (default `public/audio/blog/<slug>.mp3`).

Default behavior: if `<slug>.narration.txt` already exists, the run uses it as-is (so a
hand-edit is honored) unless `--rebuild-text` is passed to regenerate it from the markdown.

## Error handling

- Post file missing / empty body → clear error, non-zero exit.
- Chatterbox unreachable or non-200 → clear message including status, non-zero exit, **no
  partial MP3 written** (write to a temp path, move on success).
- Re-runs are deterministic (fixed seed) and overwrite outputs in place.

## Testing

- **Unit (stage 2 cleaner):** the markdown→text transform is pure and is the riskiest
  logic — test it directly. Cases: code block dropped, `::mdc::` block dropped, link →
  text, image dropped, heading flattened with pause, list → sentences, `e.g.`/`i.e.`
  fixups, whitespace collapse.
- **Integration (smoke):** run the CLI `--text-only` on a real post (e.g.
  `content/blog/local-ai-rig.md`) and assert a non-empty `.narration.txt` with no
  backticks / no `::` / no URLs. Full synthesis is a manual check (depends on the Rig).

## Verified facts (2026-06-20, live system)

- Blog: Nuxt 4 + `@nuxt/content` ^3.6.0; posts in `content/blog/*.md`; frontmatter
  `title/description/date/tags/author/draft/image`; assets in `public/`; package manager
  pnpm; `scripts/` dir present; custom embeds via MDC components (`Contentvid.vue`).
- Chatterbox `192.168.2.25:8884` native `POST /tts` schema: `text, voice_mode,
  predefined_voice_id, reference_audio_filename, output_format(wav|opus|mp3),
  split_text, chunk_size(50–500), temperature, exaggeration, cfg_weight, seed,
  speed_factor, language, stream`.
- Smoke test (clone happy-us, mp3, tuned params) → HTTP 200 + valid MP3.

## Open implementation notes

- Confirm exact remark/unified packages already in the dependency tree vs. needing
  explicit install.
- The `--voice` example above is illustrative; valid clone names are listed in Stage 3.

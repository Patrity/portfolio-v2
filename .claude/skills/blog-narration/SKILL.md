---
name: blog-narration
description: >-
  Narrate a TechHive Labs blog post in Tony's cloned voice using the self-hosted
  Breeze TTS 2 model on the homelab AI rig, producing public/audio/blog/<slug>.mp3.
  Use whenever Tony wants audio for a post — "narrate the X post", "add audio",
  "voice this", "record the blog post" — or as the narration phase of blog-cycle.
  Also consult it when narration fails, sounds wrong, or when choosing the delivery
  style for a post, since the instruction is the main quality lever.
---

# Blog Narration

Turns a post into narrated audio in Tony's voice. The mechanical transform lives in
`pnpm narrate` (tested); this skill carries the judgment and the gotchas.

## Run it

```bash
pnpm narrate content/blog/<slug>.md                    # -> public/audio/blog/<slug>.mp3
pnpm narrate content/blog/<slug>.md --text-only        # just the cleaned .narration.txt
pnpm narrate content/blog/<slug>.md --instruction "..." # override the delivery
```

**Always `--text-only` first on a new post.** It writes `<slug>.narration.txt` next to
the markdown. Read it — that file is what gets spoken. `clean.ts` strips code blocks,
images, tables and HTML, but it cannot fix an awkward sentence or an acronym that
should be spelled out. Hand-edit the `.txt`; a later run reuses it unless
`--rebuild-text` is passed.

## Choosing the instruction — this is the quality lever

Sliders barely matter. Measured on identical text and seed: changing the instruction
moved pace **5×** (2.16s → 10.88s), while cfg 1→8 moved it 2% and temperature 0.3→1.4
moved it 17%. Speed, pitch, tone and emotion **all** live in the instruction string.

| Post type | Instruction |
|---|---|
| Technical deep-dive (default) | `Warm, measured documentary narration. Unhurried, with clear emphasis on technical terms.` |
| Personal essay / reflective | `A thoughtful, reflective delivery. Conversational and unhurried, with natural pauses.` |
| Opinion / punchy | `Direct and confident, with dry understatement. Conversational pace, light emphasis.` |
| Tutorial / walkthrough | `Clear and instructional. Steady pace, deliberate emphasis on steps and commands.` |

Keep `--cfg-scale 4`. It is both the documented sweet spot *and* what lifts the prompt
cap from 256 to 512 tokens — dropping it to 1 will break long chunks.

## Verify before committing audio

1. **Duration sanity** — roughly 150 wpm. A 1,300-word post should land near 8–9 minutes.
   Wildly short means chunks failed; wildly long means the instruction asked for slow delivery.
2. **Spot-check a chunk** by ear, especially the first and last.
3. **Optional STT check** — transcribe a segment against `whisper-large-v3-turbo` on
   `http://192.168.2.25:8881/v1/audio/transcriptions` and diff against the `.narration.txt`.
   Treat it as a garbage filter only; STT mangles model names and acronyms on its own.

## Gotchas

- **Breeze is LAN-only** (`192.168.2.25:8880`). It will not work from CI or off-network.
  The CLI health-checks first and fails fast rather than dying mid-post.
- **~44s warmup** after a service restart; `/health` returns 503 until ready.
- **One request at a time.** The server returns HTTP 409 when busy; the adapter retries
  with backoff. Do not run two narrations concurrently.
- **The prompt cap counts the reference.** The clip + transcript are ~290 of the 512
  tokens, leaving ~220 for content — hence `--max-words 100`. Raising it risks a hard
  `RuntimeError` from Breeze, not a graceful truncation.
- **The reference must match exactly.** `assets/voice/tony.wav` and `assets/voice/tony.txt`
  are uploaded on every call — Breeze has no server-side voice library, unlike Chatterbox.
  If the transcript drifts from the audio, cloning quality degrades silently.
- **Expect ~2× realtime.** A 1,300-word post is roughly 4–5 minutes of wall time. It is a
  build step, not interactive.
- **Inline vocal events work** — `(laugh)`, `(sigh)`, `(gasp)`, `(yawn)`, `(chuckle)`,
  `(clears throat)` and others render as real sounds. Unrecognised ones are silently
  dropped rather than read aloud, so they are safe to try. `(whisper)` and `(pause)` are
  inert — those are delivery styles, so put them in the instruction instead.

## If it sounds wrong

| Symptom | Fix |
|---|---|
| Flat / lifeless | Strengthen the instruction. Don't reach for temperature. |
| Over-articulated, unnatural stress | Lower `--cfg-scale` to 3 |
| Unstable, odd artifacts | Lower `--temperature` to 0.7 |
| Wrong pace | Say so explicitly in the instruction ("unhurried", "brisk") |
| One bad chunk | Re-run with a different `--seed`; the reference keeps timbre stable |
| Mispronounced term | Fix it phonetically in the `.narration.txt`, then re-run without `--rebuild-text` |

## Background

Breeze TTS 2 replaced Chatterbox and Kokoro on 2026-09-15 — it does cloning, voice
design and voice direction from one model at 5–27 ms time-to-first-audio. Full setup,
API contract and design guide: `~/Documents/GitHub/homelab/breeze-tts-package/`.

⚠️ Breeze's weights are **research / non-commercial** (inference code is Apache-2.0).
Revisit if the blog is ever monetized.

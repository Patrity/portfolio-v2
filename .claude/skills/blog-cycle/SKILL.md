---
name: blog-cycle
description: >-
  Run the full TechHive Labs blog post cycle: source brief → voice-matched draft →
  data charts → hero image → SEO-audited publish to production → distribution
  variants (LinkedIn, dev.to, X) with a branded stats card. Use whenever Tony wants
  to write and publish a new blog post, turn a brief/brain-dump into a post, "do the
  full cycle", "post like last time", cross-post an existing article, or produce any
  distribution deliverable (LinkedIn post, dev.to variant, tweet, stats image). Also
  consult it when doing just ONE phase — it maps each phase to the specialist skill
  and records the conventions and gotchas learned from real cycles.
---

# Blog Post Cycle

The end-to-end pipeline for a TechHive Labs blog post, from brief to published
post to social distribution. Proven on `local-ai-true-cost` (2026-07); the
per-post working files from past cycles live in `distribution/<slug>/` — read
them as worked examples.

This is an orchestration skill: each phase delegates to a specialist skill and a
reference file. Create a todo per phase so nothing gets dropped. Phases are
sequential, but a cycle can enter anywhere (e.g. "just give me a tweet for post X"
→ Phase 8 only).

## The cycle at a glance

| # | Phase | Delegate to | Details |
|---|-------|-------------|---------|
| 0 | Setup | — | below |
| 1 | Write the draft | `blog-writer` skill | `references/writing.md` |
| 2 | Charts & data viz | `dataviz` skill (REQUIRED before chart code) | `references/charts.md` |
| 3 | Inline images | `::content-image` component | `references/images.md` |
| 4 | Hero image | `blog-image-generator` skill → Tony generates → process | `references/images.md` |
| 5 | Narration (audio) | `blog-narration` skill | skill carries its own gotchas |
| 6 | Verify in the app | `browser-testing` skill | `references/publish.md` |
| 7 | Publish | `blog-post-publication` skill | `references/publish.md` |
| 8 | Distribution | `marketing-skills:social-content` | `references/distribution.md` |
| 9 | Wrap-up | MyMind tasks + memory | below |

## Phase 0 — Setup

- Create `distribution/<slug>/` (slug matches `content/blog/<slug>.md`). Put the
  source brief/brain-dump there as `brief.md`. This directory is **gitignored on
  purpose** — the repo is public and briefs are personal. Never commit it.
- Search MyMind for related tasks/memories (`search_tasks`, `search_memories`),
  then create a cycle task tracking the phases. Update it as phases complete —
  it's how a future session picks up a half-finished cycle.
- Read 1–2 recent posts in `content/blog/` and the previous cycle's
  `distribution/` folder before producing anything. Calibration beats rules.

## Phases 1–8

Each has a reference file — read it when you reach that phase, not before.
The reference files carry the conventions that were learned by getting them
wrong once; treat deviations as needing a reason.

**Phase 5 (Narration) is optional and gated on the network** — Breeze TTS is
LAN-only, so it cannot run off-network or from CI. Skip it if unreachable and
note it as a follow-up rather than blocking publish; the audio can be added to a
published post later. It runs *before* Verify so the audio player gets checked in
the app, and before Publish because the mp3 is a committed repo asset.

## Phase 9 — Wrap-up

- Mark the MyMind cycle task completed with a summary of what shipped (URLs,
  commits) and remaining follow-ups as separate tasks with due dates.
- If a convention changed this cycle (a format flopped, a new platform, a new
  trap), update the relevant reference file HERE and note it in `distribution/README.md`.
  The skill only stays useful if each cycle feeds back into it.

## Gotchas (read before you repeat them)

- **LinkedIn carousels underperform badly for Tony.** Text post + stats card
  image, blog link in the FIRST COMMENT. Confirmed by real reach data.
- **dev.to's image proxy mangles SVG.** Cross-posts reference PNG chart copies
  (`rsvg-convert -w 1600`) committed to `public/images/blog/<slug>/`.
- **X throttles links in the tweet body.** Link goes in an immediate self-reply.
  URLs count as 23 chars — verify ≤280 with a script, not by eye.
- **Gemini hero images carry a sparkle watermark.** Crop it out (left-anchored
  16:9 crop usually works — composition rarely reaches the right edge). Do NOT
  attempt pixel-patching first; it cost an hour and failed. Always ask Tony for
  the full-size original, not the chat preview.
- **`pnpm generate` warnings that are pre-existing noise:** `_payload.json` 500s
  and uppercase tag-link warnings. The bar is 0 errors, not 0 warnings.
- **Push can fail with "could not read Username" (keychain locked).** Use
  `git -c credential.helper='!gh auth git-credential' push origin main`.
- **Stage only the post's files.** The working tree usually has unrelated WIP.
- **Charts in posts are static `<img>`s** — no tooltips exist, so every value
  must be direct-labeled, and each SVG carries its own dark card background so
  it renders on both site themes.
- **Draft posts are viewable at their direct URL in dev** — only the `/blog`
  listing filters drafts. Review before flipping `draft: false`.

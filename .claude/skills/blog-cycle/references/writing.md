# Phase 1 — Writing the draft

Invoke the `blog-writer` skill — it owns Tony's voice (self-deprecating,
conversational, double-dots, no em dashes, no semicolons) and its checklist is
the source of truth for prose. This file only adds cycle-level conventions.

## Inputs

- `distribution/<slug>/brief.md` — the source material. Briefs are usually
  data-rich brain dumps with more than one post needs. Curate; don't transcribe.
- If the brief suggests multiple angles, pick a lead angle and confirm it with
  Tony before writing 2,000 words. (For `local-ai-true-cost` the cost analysis
  led and the debugging war story became the on-ramp.)

## Frontmatter (schema in `content.config.ts`)

```yaml
title: ""            # long, narrative, Tony-style ("I Billed Myself for…")
seoTitle: ""         # ≤60 chars, keyword-bearing — SERP truncates past ~60
description: ""      # hook, one line; doubles as og:image:alt
date: YYYY-MM-DD
sitemap:
  lastmod: YYYY-MM-DD
tags: []             # match existing tag vocabulary (AI, Self Hosting, …)
author: Tony Costanzo
draft: true          # always true until Tony reviews
image: ""            # filled in Phase 4
```

## Cycle conventions

- `## Links` section at the top, after frontmatter. Internal links must be
  RELATIVE (`/blog/foo`) — the build's link checker flags absolute site URLs.
- Numbers come from the brief, verbatim. If a stat needs deriving, show the
  derivation in the post (Tony's audience checks math) and keep the brief's
  honesty caveats — they are voice, not hedging.
- Anonymize other people ("one of my users", "my buddy"), never key names or
  anything infrastructure-identifying from homelab sources.
- Lint before presenting: no `;`, no `—`/`–`, no `...` (use `..`), no emojis.
  A grep pass is faster than rereading.

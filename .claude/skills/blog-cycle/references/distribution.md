# Phase 7 — Distribution (LinkedIn, dev.to, X)

All variants live in `distribution/<slug>/` (gitignored — public repo). Consult
`marketing-skills:social-content` for platform strategy; below are the formats
that actually worked, with worked examples in `distribution/*/`.

Each variant may need its own ANGLE — confirm with Tony. (Example: the blog told
a debugging war story; the LinkedIn version dropped it entirely and pitched
self-hosting economics to companies.) Voice on LinkedIn: still Tony, lighter on
self-deprecation and profanity-free; on dev.to: full blog voice.

## Stats card image (attach to LinkedIn AND X)

Generate from `scripts/stats-card-template.mjs`: 1200×1200 dark card
(`#131312`), brand green `#39a10e` accent (validated 5.56:1), eyebrow + title,
one hero number, an honest two-bar comparison, a 4-stat KPI row, caveat footer +
`techhivelabs.net`. Render `rsvg-convert -w 2400`, then **look at it** —
label collisions happen. Save as `distribution/<slug>/linkedin-stats.png`.

## LinkedIn — `linkedin.md`

- File: posting notes (link in FIRST COMMENT — links in the body get buried;
  attach the stats card), then post body, then first-comment text.
- Shape that works: numbers-first hook above the fold → how it was measured →
  honest-caveats block (credibility with the skeptical crowd) → "why it
  matters" bullets → a fair concession ("cloud is still right when…") →
  engagement question. No hashtags. **Never a carousel** (real data: flopped).

## dev.to — `devto.md`

- Frontmatter: `title`, `published: false`, `description`, 4 tags
  (e.g. `ai, selfhosted, llm, devops`), `canonical_url` → the blog post
  (protects blog SEO), `cover_image` → the LIVE hero URL.
- Body: intro blockquote crediting the blog, then the blog post essentially
  verbatim with conversions: drop the `## Links` section (weave links inline),
  `::content-image` → markdown image + italic caption line, all image URLs
  absolute, **charts use the PNG copies** (their proxy is unreliable with SVG —
  confirm the PNGs are live in production first).
- Best window: Tue–Thu 7–9 AM ET (EU afternoon + US East morning). Tell Tony to
  eyeball the dev.to PREVIEW for image rendering before hitting publish.

## X — `tweet.md`

- File: posting notes, tweet, link-reply. Attach the same stats card.
- Tweet: numbers-first, no link in the body (throttled). Link goes in an
  immediate self-reply. Verify length with a script — URLs count as 23 chars:

  ```python
  import re; t = re.sub(r'https?://\S+', 'x'*23, text); print(len(t))
  ```

- Peak tech-X window: weekday 8–11 AM ET.

## After creating variants

Create/refresh MyMind tasks: one per platform with the file path, image path,
posting mechanics, and a due date when timing matters. Future sessions find the
work through these tasks.

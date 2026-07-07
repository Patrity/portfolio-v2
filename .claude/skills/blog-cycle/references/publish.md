# Phases 5–6 — Verify & publish

Invoke the `blog-post-publication` skill for the canonical checklist; this file
adds what real cycles taught. Do not publish without explicit go-ahead from
Tony — "draft it" and "publish it" are different requests.

## Phase 5 — Verify in the running app

- Use the `browser-testing` skill (playwright-cli): dev server port comes from
  the output (3000 may be taken), draft posts ARE reachable at
  `/blog/<slug>` in dev, `_payload.json` 500s in the console are dev-mode noise.
- Check: post renders, MDC components work (lightbox opens/closes), charts load,
  no real console errors.

## Phase 6 — Publish

1. Frontmatter: `draft: false`, `seoTitle` ≤60 chars, `image` set.
2. `pnpm generate` — the bar is **0 errors**; known warning noise: uppercase
   tag links, `_payload.json`, absolute-URL warnings (fix any that are yours by
   making internal links relative).
3. Audit the PRERENDERED HTML (`.output/public/blog/<slug>/index.html`):
   `<title>` correct, canonical `https://www.techhivelabs.net/...`, og:image +
   twitter:image absolute with alt, JSON-LD includes Article + BreadcrumbList +
   ImageObject, post present in `/blog` listing and `sitemap.xml`.
4. Commit: **stage only this post's files** (`content/blog/<slug>.md`,
   `public/images/blog/<slug>/`, any new components/skills). Message format
   `blog: <short title>` + the standard Claude co-author footer (repo history
   convention). Never sweep in unrelated WIP.
5. Push to `main` (Vercel auto-deploys, ~2–3 min). If push fails with
   "could not read Username" the keychain can't prompt — use
   `git -c credential.helper='!gh auth git-credential' push origin main`.
6. Verify production with a background poll (20s interval): page 200, then
   title/canonical/og on the live HTML, every image asset 200, sitemap and
   listing include the post. Deploys have landed in ~140s.
7. Update the MyMind cycle task with the live URL and commit hash.

---
name: browser-testing
description: >-
  Browser-test this site (techhivelabs.net portfolio) with playwright-cli — verify pages render,
  MDC components behave (modals, players), and interactions work in the real app. Use whenever a
  change needs visual or interactive verification in the browser: new/changed components, blog post
  layout checks, screenshot requests, or E2E flows like the contact form.
---

# Browser Testing (playwright-cli)

Drive the site with the `playwright-cli` command (globally installed). No auth anywhere on this
site, so no test accounts are needed. The contact form is the only stateful surface — it posts to
a Discord webhook, so do NOT submit it against production values in `.env`.

## Start the app

```bash
pnpm dev   # run in background; port 3000, falls back to 3001+ if busy
```

Read the actual port from the dev server output ("Local: http://localhost:XXXX/") — don't assume
3000. Give Nuxt ~8s after "Local:" appears before the first navigation (Vite warm-up).

## Core loop

```bash
playwright-cli open http://localhost:3001/blog/some-post   # opens headless session
playwright-cli screenshot --filename=shot.png              # saved to cwd
playwright-cli eval "() => { ... }"                        # run JS, returns JSON result
playwright-cli press Escape
playwright-cli snapshot                                    # a11y tree with element refs for click
playwright-cli click <ref>                                 # ref comes from snapshot output
playwright-cli close                                       # ALWAYS close when done
```

- `eval` with `scrollIntoView({block:'center'})` then `screenshot` is the fastest way to
  verify a specific element visually.
- Screenshots/snapshots/console logs land in `.playwright-cli/` under the cwd — run from the
  scratchpad dir, not the repo, to avoid littering the worktree.
- Console log files are listed in each command's output; grep them for errors after page loads.

## Site-specific gotchas

- **Draft posts ARE viewable** at their direct URL in dev — only the `/blog` listing filters
  `draft: false`. Test drafts by navigating straight to `/blog/<slug>`.
- **Ignore `_payload.json` 500s** in the console during dev (`Cannot load payload ... Invalid
  input`). It's a dev-mode artifact of the prerender route rules, not a real error.
- **MDC components** (`::content-image`, `::audio-player`, `::contentvid`) live in
  `app/components/`. HMR picks up edits, but the page fully reloads — re-run any state-building
  steps (e.g. reopen a modal) after an edit.
- Color mode: the site supports light/dark via the header toggle (sun icon, top right). Playwright
  sessions start in light mode.

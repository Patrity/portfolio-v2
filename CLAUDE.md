# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nuxt 4 full-stack portfolio site for TechHive Labs (techhivelabs.net), deployed on Cloudflare Pages with R2 blob storage and D1 database. Uses Nuxt Content for markdown-based blog posts and project pages.

## Commands

- **Dev server:** `pnpm dev` (http://localhost:3000)
- **Build:** `pnpm build`
- **Preview production build:** `pnpm preview`
- **Generate static:** `pnpm generate`

No test suite or linter is configured.

## Architecture

**Framework:** Nuxt 4.4.2 with Vue 3, Tailwind CSS v4, and Nuxt UI Pro component library.

**Key directories:**
- `app/pages/` — File-based routing (index, about, contact, blog/[...slug], projects/[...slug])
- `app/layouts/default.vue` — Single layout with UHeader/UFooter from Nuxt UI Pro
- `app/components/` — Custom components (Contentvid video player, GlobalIcon logo)
- `content/blog/` and `content/projects/` — Markdown content with Zod-validated frontmatter (schemas in `content.config.ts`)
- `server/api/` — Nitro API routes (contact form → Discord webhook, blob image serving)

**Content system:** Blog and project collections defined in `content.config.ts`. Fetched via `queryCollection()` composable. Blog posts support draft mode. Projects have a `featured` flag for homepage carousel and a `type` enum (video/code).

**Styling:** Tailwind v4 + Nuxt UI Pro. Theme config (green primary, Teko font) in `app/assets/css/main.css`. App-level color config in `app/app.config.ts`.

**Infrastructure:** Cloudflare Pages + D1 database (content storage) + R2 blob storage (images/videos via `/api/images/[...pathname]`). Bindings configured in `wrangler.toml`, accessed via `event.context.cloudflare.env` in server routes.

**Contact form:** Zod validation → Cloudflare Turnstile verification → Discord webhook. Server handler at `server/api/contact.post.ts`.

**Deployment:** Push to `production` branch triggers Cloudflare Pages build. Main branch is `main`.

## Environment Variables

Required in `.env` (not committed):
- `NUXT_UI_PRO_LICENSE` — Nuxt UI Pro license key
- `NUXT_TURNSTILE_SITE_KEY` / `NUXT_TURNSTILE_SECRET_KEY` — Cloudflare Turnstile
- `NUXT_DISCORD_WEBHOOK_URL` — Contact form webhook

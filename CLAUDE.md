# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nuxt 4 portfolio site for TechHive Labs (techhivelabs.net), deployed on Vercel with static site generation. Uses Nuxt Content for markdown-based blog posts and project pages.

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
- `public/images/` — Static images and videos served directly from Vercel's edge CDN
- `server/api/` — Nitro API routes (contact form → Discord webhook)

**Content system:** Blog and project collections defined in `content.config.ts`. Fetched via `queryCollection()` composable. Blog posts support draft mode. Projects have a `featured` flag for homepage carousel and a `type` enum (video/code). Content is indexed via SQLite at build time (no runtime database needed).

**Styling:** Tailwind v4 + Nuxt UI Pro. Theme config (green primary, Teko font) in `app/assets/css/main.css`. App-level color config in `app/app.config.ts`.

**Infrastructure:** Vercel with SSG. All pages are prerendered at build time. Images and videos are static assets in `public/images/`. Cloudflare DNS proxy sits in front for caching and DDoS protection.

**Contact form:** Zod validation → Cloudflare Turnstile verification → Discord webhook. Server handler at `server/api/contact.post.ts`.

**Deployment:** Push to `main` triggers Vercel build. All routes are prerendered via `routeRules` and `nitro.prerender`.

## Environment Variables

Required in `.env` (not committed):
- `NUXT_TURNSTILE_SITE_KEY` / `NUXT_TURNSTILE_SECRET_KEY` — Cloudflare Turnstile
- `NUXT_DISCORD_WEBHOOK_URL` — Contact form webhook

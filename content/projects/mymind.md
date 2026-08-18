---
title: MyMind
description: A self-hosted, AI-native second brain. Documents, memories distilled from my coding sessions, tasks, images, a device-sync clipboard, and a voice agent, all running on my own hardware and exposed to my agents over MCP. Open source, MIT.
tags:
  - AI
  - TypeScript
  - Nuxt
  - PostgreSQL
  - pgvector
  - MCP
  - Open Source
images:
  - /images/projects/mymind/documents.webp
  - /images/projects/mymind/command-palette.webp
  - /images/projects/mymind/memories.webp
  - /images/projects/mymind/tasks.webp
featured: true
priority: 1
type: code
sitemap:
  lastmod: 2026-08-18
---

## Project Overview

MyMind is the single front door to everything I would otherwise scatter across a dozen apps: a Markdown knowledge base with a real editor, a ShareX-compatible image host with OCR, a kanban, a clipboard that syncs between my machines, and a memory system that turns my AI coding sessions into durable, searchable notes. It runs on my homelab, uses my own GPUs for the AI work, and is exposed to the internet only where I choose.

The part I use most is the memory loop. Claude Code and Hermes hooks stream session transcripts in, a background job extracts atomic, deduplicated memories with confidence scores ("prefers pnpm", "this project uses Drizzle + pgvector"), high-confidence ones auto-file and the rest land in a review queue. Then an MCP server hands all of it back to the agents: search memories and docs, save a memory, create and edit tasks and projects. My coding agents read my knowledge and write back to it, which is the whole point.

It is also a portfolio piece in the literal sense: the "Live from the rig" strip on this site's homepage is served by MyMind's analytics slice, which already reads Prometheus, vLLM, and LiteLLM for my own dashboard. The source is public at [github.com/Patrity/mymind](https://github.com/Patrity/mymind) under MIT.

## Design

One Nuxt 4 service does all of it, the web app, the HTTP API, and the MCP server, from a single deployable:

- **Frontend:** Nuxt UI, live across devices over SSE (every mutation publishes a change, every list refetches), a `⌘K` palette that searches documents, memories, image OCR and tags, tasks, and projects in one query
- **Search:** hybrid semantic + keyword, pgvector embeddings fused with trigram matching, so you find the thing by what it means, not the words you happen to remember
- **Data:** Postgres + pgvector via Drizzle, canonical projects keyed on the git remote so the same repo cloned to five machines resolves to one identity
- **AI:** everything runs against models on my rig through LiteLLM (embeddings, vision OCR, transcription, memory extraction, TTS), reviewable and never silently "magic"
- **Voice:** a hands-free agent with Silero VAD in the browser, faster-whisper STT and Kokoro TTS on the rig, barge-in that actually works, and a Three.js particle reactor with 50k particles in a custom vertex shader that breathes when idle and erupts with the reply
- **Analytics:** a read-only dashboard over the homelab's Prometheus and LiteLLM (per-GPU telemetry, engine activity, token and spend history), plus one curated public endpoint for this site
- **Deploy:** native systemd app in a Proxmox LXC, Postgres and SearXNG in Docker beside it, GitHub Actions test + deploy on every push to master

## Lessons learned

- **The AI proposes, I approve.** Nothing auto-mutates the corpus. The review queue looked like friction at first and turned out to be the reason I trust the memories at all.
- **Persist the minimum.** MyMind stores no live telemetry, it reads Prometheus on demand. The one exception is a daily LiteLLM rollup, because Prometheus retention capped the history I wanted to chart. Every exception like that is written down next to the code so a future me does not "fix" it back.
- **Build it in cycles.** Each system was its own brainstorm, spec, plan, build, handover, and wiki page. The wiki describes what runs today, the handovers describe how it got there, and the specs stay frozen at intent. Stale docs misled sessions more than once before that discipline existed.
- **Live by default is a contract, not a feature.** Once one page updated across devices without a refresh, every page had to, or the ones that didn't felt broken.

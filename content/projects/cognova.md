---
title: Cognova
description: An AI agent workspace built for Claude -- started as a self-hosted platform, pivoted to a full SaaS at cognova.dev with custom tools, knowledge bases, and team collaboration.
tags:
  - AI
  - TypeScript
  - Nuxt
  - PostgreSQL
  - Drizzle ORM
  - Stripe
  - MCP
images:
  - /images/projects/cognova/banner.webp
featured: true
type: code
sitemap:
  lastmod: 2026-03-25
---

## Project Overview

Cognova started as a self-hosted AI agent workspace -- a platform you could deploy on your own infrastructure to create purpose-built agents powered by Anthropic's Claude. Each agent gets its own system prompt, tool bindings, and knowledge base, making them specialists rather than generalists.

After validating the concept and getting early feedback, the project pivoted to a full SaaS model at [cognova.dev](https://cognova.dev). The self-hosted complexity was a barrier for most users, and a managed platform meant faster iteration and a lower barrier to entry. The core architecture stayed the same, but the deployment, billing, and onboarding experience were rebuilt for multi-tenant SaaS.

The platform sits in the space between raw API access and bloated enterprise platforms. Agents can check APIs, query databases, execute sandboxed code, and take actions via custom tools. Teams share a workspace with role-based permissions, and agents can be deployed to Discord channels or triggered on cron schedules.

## Design

Built on Nuxt 4 with a Node.js backend via Nitro, deployed to Railway as a managed SaaS:

- **Frontend:** Nuxt 4 with Nuxt UI v4, Tailwind CSS v4, CodeMirror 6 for code editing, and Yjs/Hocuspocus for real-time collaborative editing over WebSockets
- **Backend:** Nitro server with Anthropic SDK, Model Context Protocol (MCP) for tool interop, and E2B for sandboxed code execution
- **Database:** PostgreSQL 16 with Drizzle ORM, schema split across 20 domain-specific files (agents, billing, channels, conversations, knowledge, tools, workspaces, etc.)
- **Auth:** better-auth with email/password plus OAuth via GitHub, Google, and Discord
- **Billing:** Stripe with Free, Pro, and Team tiers

The dashboard and auth pages are client-side only for app-like performance, while marketing and public pages are server-rendered for SEO. Secrets are encrypted at rest with AES-256.

Key features include a custom tool hub (install from GitHub or build your own), document-backed knowledge bases, cron-scheduled agents, Discord bot integration, REST API access, and MCP server support for standardized tool interoperability.

## Lessons Learned

- **Self-Hosted to SaaS Pivot:** The self-hosted version validated the product but limited the audience. Moving to SaaS meant rethinking onboarding, billing, and deployment -- but the multi-tenant architecture we'd built from day one made the transition surprisingly smooth.
- **Multi-Tenant from Day One:** Designing workspace-scoped data with role-based access from the start saved a painful retrofit when pivoting to SaaS. Every query, every permission check, every billing event is workspace-aware.
- **Drizzle Over Prisma:** Drizzle's SQL-like API and lightweight footprint made it a better fit than Prisma for a schema spanning 20+ domain files. Migrations are fast and the generated SQL is predictable.
- **MCP for Tool Interop:** Adopting Model Context Protocol early meant agents can use standardized tools without custom integration code per tool. It's the closest thing to a plugin system for AI agents.
- **Selective SSR:** Turning off SSR for authenticated app routes while keeping it for public pages gave the best of both worlds -- fast dashboard interactions and proper SEO for marketing pages.
- **WebSocket Collaboration:** Integrating Yjs with Hocuspocus over Nitro's experimental WebSocket support enables real-time collaborative editing of agent prompts and tool configurations across team members.

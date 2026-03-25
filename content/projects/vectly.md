---
title: Vectly
description: An AI-powered developer chat platform with RAG capabilities, multi-model support, and GitHub integration for code-aware conversations.
tags:
  - AI
  - TypeScript
  - Nuxt
  - Fastify
  - Supabase
  - Stripe
images:
  - /images/projects/vectly/banner.webp
featured: true
type: code
sitemap:
  lastmod: 2026-03-25
---

## Project Overview

Vectly is an AI chat platform built for developers who want context-aware conversations about their codebase. It supports six AI providers -- OpenAI, Anthropic, Google Gemini, DeepSeek, Mistral, and xAI -- and uses a RAG pipeline to ground responses in your actual code, documents, and uploaded files.

Users can connect GitHub repositories, upload documents, and organize everything by project. The platform chunks and embeds content using Cohere, stores vectors in pgvector, and retrieves relevant context at query time so the AI actually knows what it's talking about.

## Design

The architecture is a hybrid edge/backend split deployed as a pnpm monorepo:

- **Frontend:** Nuxt 3 on Cloudflare Workers handling SSR, auth, and lightweight CRUD operations
- **Backend:** Fastify on Railway handling AI inference, RAG processing, file uploads, and PDF parsing
- **Data:** Supabase (PostgreSQL + pgvector + Auth + Storage) as a unified data layer
- **Shared:** A `@vectly/shared` workspace package for TypeScript types across both services

This split keeps the edge layer fast and cheap while the heavy AI operations run on dedicated compute. An auto-generated API client stays in sync with the backend's OpenAPI spec.

Key features include streaming multi-model chat, GitHub App integration for code-aware conversations, automatic chat summarization, credit-based billing via Stripe, and token estimation with tiktoken.

## Lessons Learned

- **Edge vs. Node Split:** AI SDKs and PDF parsing don't play nice with edge runtimes. Splitting the architecture into edge (fast, cheap) and Node (heavy compute) was the right call and became the subject of a [blog post](/blog/vectly-scaling).
- **Provider Abstraction:** Supporting six AI providers meant building a base provider pattern with per-provider implementations. Adding a new model is now just a new directory and adapter.
- **pgvector Over Dedicated Vector DB:** Keeping vectors in the same PostgreSQL instance as relational data simplified the stack significantly. One database, one auth layer, one backup strategy.
- **Monorepo Discipline:** Shared types between frontend and backend caught contract drift early. The auto-generated API client from Swagger made this nearly seamless.

---
title: Build First - Learn Later
description: Building an AI app with zero knowledge of AI, hitting deployment walls, and evolving architecture to meet real-world needs.
date: 2025-06-25
sitemap: 
  lastmod: 2025-06-25
tags:
  - AI
  - Web Development
  - Side Projects
  - Nuxt
author: Tony Costanzo
draft: false
image: https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive//vectly.png
---
# Building an AI App When You Don't Know AI: My Journey from Zero to Deployment Hell to Hybrid Architecture

Been quiet about my AI app project lately, but for good reason - I learned the hard way about what it really takes to build with AI. Let me share the journey of building [Vectly](https://vectly.ai) with zero AI knowledge, hitting walls, and learning a ton along the way.

## The Beauty of Not Knowing What You Don't Know

When I started Vectly, I didn't know what embeddings were, how LLMs actually worked, or what a vector database did. Hell, I thought "RAG" was just a cleaning cloth. But that's the beauty of side projects - you jump in and figure it out as you go.

Built features first, understood them second. No regrets.

This approach might make some developers cringe, but here's the thing: if I had spent months learning all the theory first, I probably would have gotten overwhelmed and never started. Instead, I learned by implementing:
- Embeddings? Figured them out when I needed semantic search
- Vector databases? Learned about them when MySQL wasn't cutting it
- Token limits? Discovered those when my first API call failed spectacularly

## Everything Works Locally™

For months, everything worked beautifully on my machine. I had:
- Multiple AI models (OpenAI, Anthropic, Cohere) all playing nicely together
- PDF and document processing that could handle anything I threw at it
- RAG pipelines that made my chat responses actually useful
- File uploads and processing working like a charm
- GitHub integration pulling in entire codebases

I was learning and shipping at the same time. Felt amazing. My local dev environment was humming along, and I was adding features left and right.

Then came deployment day.

## When Cloudflare Workers Says No

Turns out, Cloudflare Workers had some opinions about my Node.js dependencies. Strong opinions. 

Here's what I discovered the hard way:
- **AI SDKs don't like edge runtimes** - OpenAI, Anthropic, and Cohere SDKs all use Node.js-specific features
- **PDF parsing needs real compute** - `pdf-parse` requires native binaries that edge functions can't handle
- **File operations need a file system** - Who knew? (Everyone but me, apparently)
- **10MB+ bundles make Cloudflare sad** - My bundle was thicc with dependencies

The error messages were... educational.

## The Real Infrastructure Needs of AI Apps

Here's the headline: AI apps need different infrastructure than typical web apps. This isn't your standard CRUD application. 

Edge functions are incredible for:
- Static site generation
- API routes that just hit a database
- Simple transformations
- Authentication flows

But AI apps need:
- **Full Node.js runtime** for the SDKs
- **Persistent connections** for streaming responses
- **Real compute** for processing documents
- **File system access** for temporary storage
- **Memory** for handling large contexts

You can't know these constraints until you hit them. And boy, did I hit them hard.

## Evolution, Not Failure

Am I starting over? Nope. Just evolving the architecture. 

Here's the new plan:
```
Frontend (Nuxt + Edge Functions)     Backend (Node.js + Fastify)
├── Public pages                     ├── AI chat streaming
├── Authentication                   ├── File upload & processing  
├── Simple CRUD ops                  ├── PDF parsing & RAG
├── Project management               ├── GitHub imports
└── Cloudflare Pages ($0-5/mo)       └── Railway/Render ($5-15/mo)
```

It's not a failure - it's learning what actually works by building something real. This is exactly why we build side projects.

## The Technical Evolution

For my fellow developers, here's what the migration looks like:

1. **Monorepo structure** with pnpm workspaces
2. **Shared types** between frontend and backend
3. **Smart API client** that routes requests to the right service
4. **Keep 80% of routes on the edge** (they don't need heavy lifting)
5. **Move 20% to dedicated backend** (the AI-heavy stuff)

The beauty? Most operations stay fast and free on the edge. Only the heavy AI operations need the full backend.

## Just Start Building

If you're thinking about building with AI but feel overwhelmed by what you don't know - just start. 

You'll learn:
- **Embeddings** by implementing search
- **Streaming** by building chat interfaces  
- **Token economics** by seeing your API bills
- **Infrastructure needs** by trying to deploy
- **Vector databases** when Postgres isn't enough

The building IS the learning. No amount of tutorials prepared me for the actual challenges of production AI apps.

## Back to Shipping

I'm back to shipping with a hybrid architecture that actually works. More complex? Definitely. But now I understand WHY it needs to be this way.

Sometimes the best way to learn a technology is to build something ambitious with it. Even if you have to refactor along the way. The knowledge you gain from hitting these walls is invaluable.

## Key Takeaways

1. **Start before you're ready** - You'll learn faster by doing
2. **Local success ≠ Deployment success** - Always consider deployment early
3. **AI apps are different** - They need different infrastructure than typical web apps
4. **Evolution is normal** - Your architecture will change as you learn
5. **Side projects are for learning** - Breaking things is part of the process

## What's Next?

I'm implementing the hybrid architecture now. Frontend stays blazing fast on the edge, backend handles the AI heavy lifting. It's not the architecture I started with, but it's the one that works.

If you're building with AI or thinking about it, I'd love to hear about your journey. What walls have you hit? What surprised you? 

Follow the journey on Twitter [@ThePatrity](https://twitter.com/ThePatrity) or check out [Vectly](https://vectly.ai) to see what I'm building.

Remember: every expert was once a beginner who refused to give up. Keep building, keep learning, keep shipping.

---

*Building in public means sharing the struggles along with the successes. This is one of those struggles that turned into a valuable lesson.*
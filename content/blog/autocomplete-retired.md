---
title: "My First Local AI Model Was an Autocomplete Server. Its Last Customer Was an AI Agent."
seoTitle: "Retiring My Self-Hosted Copilot for AI Agents and Clef"
description: "I evicted my self-hosted autocomplete model to make room for Cloudflare's Clef, a local Jev alternative, and found its only remaining user was an AI agent."
date: 2026-10-15
sitemap:
  lastmod: 2026-10-15
tags:
  - AI
  - Self Hosting
  - Developer Workflow
  - AI Agents
author: Tony Costanzo
draft: false
image: /images/blog/autocomplete-retired/hero.webp
imageWidth: 1920
imageHeight: 1075
---

::audio-player
::

## Links
- [The original rig writeup](https://www.techhivelabs.net/blog/local-ai-rig)
- [The nine-model Blackwell bake-off](https://www.techhivelabs.net/blog/blackwell-bakeoff)
- [Continue.dev](https://continue.dev)
- [Clef-Flash GGUF on Hugging Face](https://huggingface.co/ggml-org/Clef-Flash-GGUF)

## Eviction Notice

I was halfway through wiring Jev into my workflows when Cloudflare went and ruined my week.

If you haven't run into it yet, Jev is TypeSafe's decision model. It never writes a word of text. You hand it some state and a set of questions with the answers defined up front (yes or no, pick one of these, score this from 1 to 5), and it hands back a typed answer with a probability and a confidence score, all in a single pass.

For AI agents that's a big deal. Half of what my agents do all day is make tiny calls like "which project does this note belong to" or "is this request hard enough for the big model." Asking a chatty LLM to make those calls is slow, and occasionally creative in ways nobody asked for.

I had Jev deciding which model my LLM gateway routes each request to, and a whole list of jobs lined up for it in MyMind, my second-brain app. Then on October 1st Cloudflare open-sourced Clef. Two decision models, Apache 2.0, built on Qwen, sitting on Hugging Face.. and speaking almost exactly the same API as Jev.

A Jev alternative I could run at home. Private, free, no rate limits. Obviously I had to try it (have you met me?).

The catch was that the 9B Clef-Flash needs about 6.5GB of VRAM, and every card in my rig was already spoken for. So I started playing Tetris, scrolling the service list for a victim, and landed on `llama-autocomplete`. A little 7B coding model sitting on a 3090, waiting patiently for me to type something in VS Code.

Before I killed it I had Claude Code pull the usage numbers from Prometheus, because I wanted to make sure I wasn't about to break something I'd forgotten about. Thirty days of traffic came back:

- **Prompt tokens:** 22
- **Generated tokens:** 33
- **Peak concurrent requests:** zero, at every single scrape

Twenty two tokens. That's roughly one sentence. In a month.

And it gets better (worse?). The lifetime counters on the container lined up exactly with the shape of a smoke test. The only traffic that server had served since its last rebuild was Claude, checking that the server worked.

So the model that got me into self-hosting AI spent its final days with exactly one customer, an AI agent making sure it was still alive. Then the agent shut it off.

## The Gateway Drug

Like most developers, my first taste of "AI development" was GitHub Copilot. Grey ghost text shows up, you hit Tab, and suddenly the boilerplate writes itself. It felt like cheating in the best possible way.

It also meant shipping every keystroke of client code to someone else's server, and paying a monthly bill for the privilege. Neither of those sat well with me. So at the start of this year I decided to host my own (how hard could it be?).

The first attempt was Tabby, which promptly refused to run because my CPU didn't support AVX-512. Strong opinions for an autocomplete engine. I ended up on Continue.dev in VS Code talking to my own model, and after a few weeks of shuffling it around, it found a home that I'm still weirdly proud of:

- **The box:** a ZimaBoard, which is a single-board server about the size of a paperback
- **The GPU:** a Quadro P2000 hanging off it, 5GB of VRAM
- **The power budget:** a 60W power supply, so I had to underclock the card just to keep the board from browning out
- **The model:** a tiny Qwen2.5-Coder, served by llama.cpp
- **The speed:** around 45 tokens per second

A computer smaller than a hardcover book, running an underclocked workstation GPU, finishing my lines of code without a single packet leaving my house.

It felt like magic. Genuinely. I remember typing a function signature and watching the body fill in from a box on my shelf and just grinning at my monitor like an idiot.

## Then Everything Escalated

That little Zima setup was the first domino. Here's what the rig is serving today, about nine months later:

- **Main coder:** Qwen3.8-Flash-Next on an RTX PRO 6000 Blackwell, 262K context, the brain behind most of my agents
- **Vision:** Qwen3-VL watching my security cameras and describing what it sees
- **Decision model:** Cloudflare's Clef-Flash, the local Jev replacement that kicked the autocomplete off its card
- **Embeddings and reranking:** the search layer behind MyMind, my second-brain app
- **Speech to text:** Whisper and Parakeet for anything I say out loud
- **Text to speech:** Breeze TTS 2 with a clone of my voice, which narrates these posts
- **Image generation:** Qwen-Image in ComfyUI, which makes most of my hero images
- **Music generation:** yes, really. MiniMax Music 3. That one gets its own post

It all runs on a rack of four 3090s plus the Blackwell, north of $20k in hardware, heating my office whether I like it or not.

I went from "can I get grey text in VS Code without paying GitHub" to running a small, deeply unprofitable AI lab in my house. In under a year. My wife has questions. So do I.

## I Don't Really Write Code Anymore (Sort Of)

Here's the part that actually got me thinking.

The autocomplete server died because I stopped being in the editor.

These days I live in a terminal. Herdr splits my screen into panes, and almost every pane has a Claude Code session in it, each one chewing on a different task. One is fixing a bug in MyMind, one is poking at the homelab, one is writing.. well, this. I open VS Code for a quick tweak or to eyeball a diff, and then I close it again.

Autocomplete is built for a person typing code one line at a time. It guesses the next twenty characters and waits for you to hit Tab. I don't sit in that loop anymore. I describe the change, the agent makes it, I review it, and we argue about it (it has opinions, I have worse ones).

## The Quiet Death Nobody Noticed

The best evidence I have for how hard this shift happened is that the autocomplete server already died once, and I didn't notice.

Back in September I pulled the P2000 out of the rig during a hardware shuffle and deleted its model the next day. For two days, Continue.dev was firing requests at a port with nothing listening on it. Every completion failed.

Not one complaint from me. I wasn't even in VS Code long enough to see the ghost text was missing.

Claude eventually tripped over it during a documentation audit. It rebuilt the whole service from scratch on an idle 3090, upgraded it to the 7B model, wired the monitoring back up, and tested that it actually completed code. Thorough work. Lovely work.

Then nobody used it for a month. Except Claude. Checking that it worked.

## What Actually Changed

I've been programming for 22 years, and the last two moved more than the twenty before them. A few things stand out when I look back at that Zima board:

- **The unit of work got bigger.** Autocomplete helped me finish a line. Now I hand off a whole task and come back to a diff.
- **My job shifted to reviewing.** I read far more code than I type, and catching a wrong assumption early matters more than typing fast ever did.
- **Self-hosting followed the workflow.** The rig grew because each new way of working wanted a new model behind it. Voice, vision, search, all of it showed up because an agent needed it.
- **The tool that started it all didn't scale with me.** It did exactly what it was built for, and I moved somewhere it couldn't follow.

I don't feel sad about it, honestly. The Zima autocomplete is the reason I learned what a GGUF is, what quantization does, and why you never trust a model server that only returns a 200. Every one of those lessons got used on the bigger rig.

## Rest Easy, Little Guy

The service is stopped and disabled. I kept the unit file and the model weights on disk, because I'm a hoarder and it's one command to bring it back.

I won't run that command, but it's nice to know I could.

For the record, the eviction paid off. I ran Clef-Flash head to head against Jev on the full banking77 intent benchmark, same requests byte for byte, and Clef-Flash scored 95.9% accuracy to Jev's 79.7%. Its confidence scores were more trustworthy too, which matters when an agent decides whether to act on its own or kick the call up to me. It's now running MyMind's decisions from the same 3090 the autocomplete used to live on (that bake-off deserves its own post).

Somewhere in a Prometheus database there's a flat line where my first local AI model used to be, broken up by 22 tokens of an AI agent asking it if it was okay.

It was. It just didn't have anyone left to talk to. (Next up: the music model, which has a lot more to say.)

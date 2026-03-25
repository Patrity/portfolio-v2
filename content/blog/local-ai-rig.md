---
title: "I Spent $5K on GPUs Just to Learn That One GPU Was Enough"
description: "Four RTX 3090s, an EPYC server, and a 122B parameter model -- the journey from underwhelming to overkill and back to surprisingly elegant."
date: 2026-03-25
sitemap:
  lastmod: 2026-03-25
tags:
  - AI
  - Self Hosting
author: Tony Costanzo
draft: false
image: /api/images/blog/ai-server/hero.webp
---

## Links
- [Qwen3.5-122B-A10B on HuggingFace](https://huggingface.co/Qwen/Qwen3.5-122B-A10B-GGUF)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)

# The $5,000 Question

Four RTX 3090s. An AMD EPYC 7532 with 32 cores. 128GB of DDR4. A server rack in my closet that sounds like a jet engine and heats my office better than my actual central heating.

And the best I could do was run a 27B model at 22 tokens per second.

I wish I was joking. Nearly $5K in hardware -- 96GB of total VRAM across four cards -- and I was getting outperformed by people running quantized models on a MacBook Pro. Something had to change, because my electricity bill (and my wife) was already judging me.

## The Starting Point (a.k.a. The Disappointment)

Here's what I was working with:

- **CPU:** AMD EPYC 7532 (32 cores, 64 threads)
- **RAM:** 128GB DDR4-2933 ECC (8 channels)
- **GPUs:** 4x RTX 3090 24GB (96GB total VRAM)
- **Bonus GPU:** Quadro P2000 5GB (for autocomplete, because why not)
- **Total cost:** ~$5,000

My setup was running Qwen3.5-27B through vLLM with tensor parallelism across 2 GPUs. It worked. It was stable. It was also.. underwhelming. The 27B dense model was fine for basic tasks but I had two hard requirements it couldn't meet -- I needed a large context window (128K minimum, ideally 256K) for feeding entire codebases into conversations, and I needed multimodal support so I could screenshot a UI and ask "why does this look like garbage." The 27B model technically had 128K context, but I knew these cards could run something much more capable.

The problem? Larger dense models need more tensor parallelism, and PCIe 4.0 bandwidth between GPUs (~14-20 GB/s actual) creates a nasty bottleneck. I'd already tried pipeline parallelism with an 80B MoE model and got nothing but NCCL timeouts for my trouble.

## The "Should I Just Buy a Mac?" Phase

At this point I did what any rational person would do -- I started pricing Mac Studios and questioning every life decision that led me here.

| Platform | Memory | Bandwidth | ~120B tok/s | Price |
|----------|--------|-----------|-------------|-------|
| My 4x 3090 rig | 96GB VRAM | 936 GB/s/card | ~30 (MoE) | ~$5K (owned) |
| Mac Studio M3 Ultra | 256GB unified | 819 GB/s | ~70 | $8,499 |
| DGX Spark | 128GB unified | 273 GB/s | ~39 | $4,699 |

The Mac looked tempting. But after a long night of spreadsheets and self-reflection, I realized something: my hardware wasn't the problem. The software was. Specifically, I wasn't using the right models or the right approach to multi-GPU inference.

The answer was MoE -- Mixture of Experts. Models where only a fraction of parameters are active per token, which means way less inter-GPU communication. Time to stop shopping and start experimenting.

## The Multi-GPU Gauntlet

First up: Qwen3-Coder-Next, an 80B MoE model with only 3B active parameters per token. Loaded it in llama.cpp on 3 GPUs and..

| Test | 3x 3090 tok/s | 2x 3090 tok/s |
|------|---------------|---------------|
| pp512 (prompt) | 1,725 | -- |
| pp2048 (prompt) | 2,150 | -- |
| **tg32 (generation)** | **84.4** | **86.4** |

Wait. 86 tokens per second on an 80B model? Using FEWER GPUs? That's 4x faster than my dense 27B setup. MoE is a different beast entirely -- with only 3B active params, the inter-GPU communication overhead basically disappears.

But there was a catch. No multimodal support. I needed to send screenshots to the model for frontend work, and a text-only model wasn't going to cut it. Back to the drawing board.

## Enter the 122B Monster

After comparing every multimodal MoE model that could fit in 96GB of VRAM, the winner was obvious: Qwen3.5-122B-A10B. 122 billion total parameters, 10 billion active per token, 256 experts, full multimodal support, and a 72.4% score on SWE-bench. On paper, this thing was a beast.

On 3 GPUs with an IQ4_XS quant, the benchmarks looked great:

| Test | tok/s |
|------|-------|
| pp512 (prompt) | 1,208 |
| pp8192 (prompt) | 1,610 |
| **tg32 (generation)** | **53.8** |

53 tok/s on a 122B model across 3 consumer GPUs. Context scaled up to ~72K tokens with Q4 KV cache. I was genuinely excited.

Then I tried to actually use it.

## When Benchmarks Lie to You

Here's the thing about `llama-bench` -- it runs in isolation. No server, no HTTP, no concurrent requests. Just raw inference. And in that beautiful vacuum, everything was perfect.

`llama-server` had other plans.

Short responses worked fine. But anything over ~100 tokens? The model would intermittently stall. GPU utilization would drop to 0%, CPU would spike to 100%, and my server would just.. sit there. Thinking about thinking.

I tried everything:

- **Single slot mode** -- helped sometimes, not reliably
- **`--no-mmap`** -- fixed short request stalls
- **Patching graph reuse** -- faster (66 tok/s!) but caused token corruption (question marks everywhere)
- **2 GPUs** -- OOM immediately (43GB model, 48GB VRAM, no room for compute buffers)

And 4 GPUs? Didn't work at all. Both Qwen3 architectures hit a [known regression in llama.cpp](https://github.com/ggml-org/llama.cpp/issues/20835) where graph reuse gets disabled whenever pipeline parallelism is detected. MoE models trigger this detection even when pipeline parallelism isn't needed.

I even tried ik_llama.cpp's graph split mode -- which handles multi-GPU MoE much better -- but it crashed on Qwen3.5's hybrid attention architecture (delta-net + full attention layers). Filed bug reports. Got confirmations that yeah, nobody's really running this model reliably on multi-GPU consumer hardware.

## The Accidental Breakthrough

After weeks of fighting multi-GPU bugs, I stumbled onto a flag I'd dismissed earlier: `--cpu-moe`.

The idea is simple. Instead of splitting the model across multiple GPUs (which triggers every pipeline parallelism bug in the book), run the attention layers on a single GPU and offload the MoE expert layers to CPU. My EPYC 7532 has 32 cores and 8 channels of DDR4-2933 -- roughly 150 GB/s of memory bandwidth. And since MoE models only activate 8 of 256 experts per token, the CPU doesn't need to be fast. It just needs bandwidth.

First run: 11.1 tok/s. Stable, but slow.

Then I started tuning threads.

| Threads | tok/s | vs baseline |
|---------|-------|-------------|
| 4 | 6.2 | -44% |
| 8 | 11.1 | baseline |
| 16 | 18.4 | +66% |
| 24 | 22.5 | +103% |
| **32** | **25.2** | **+127%** |

Thread count maps directly to CPU memory channels. 32 threads (4 per channel) saturated the EPYC's 8-channel bandwidth. This single change more than doubled performance. The EPYC processor I'd barely thought about turned out to be the MVP of the entire build.

## The Part Where Context Doesn't Matter

Qwen3.5-122B has this hybrid attention architecture -- 12 full attention layers and 36 delta-net/linear attention layers. The KV cache is absurdly efficient at ~24 KB per token.

| Context | GPU VRAM | tok/s |
|---------|----------|-------|
| 88K | 11.7 GB | 25.3 |
| 200K | 13.8 GB | 25.3 |
| **256K (model max)** | **15.6 GB** | **26.9** |

Full 256K context window on a single RTX 3090 with 9GB of VRAM to spare. Speed doesn't degrade at all. I ran the stability tests five times in a row -- zero stalls, zero corruption, zero failures.

The multi-GPU approach couldn't even serve a stable 100-token response. The single-GPU approach handles 256K context without breaking a sweat.

## Before and After

| Metric | Before | After |
|--------|--------|-------|
| **Model** | Qwen3.5-27B (dense) | Qwen3.5-122B-A10B (MoE) |
| **Parameters** | 27B | 122B total, 10B active |
| **Generation speed** | 22 tok/s | 25-27 tok/s |
| **Context window** | 128K | 256K |
| **SWE-bench** | N/A | 72.4% |
| **GPUs used** | 3 of 4 | 1 of 4 |
| **Stability** | Stable | Stable |

A model 4.5x larger, running faster, on fewer GPUs. Three GPUs freed up for other services. Can confirm: I did not see this coming.

## Three GPUs Walk Into a Homelab

Remember those three "wasted" GPUs? Turns out freeing them up was almost as valuable as the model upgrade itself. The full rig now looks like this:

- **GPU 0 (15.6 GB):** Qwen3.5-122B -- the main brain, 256K context, multimodal
- **GPU 1:** A lightweight 9B model for classification workloads and quick tasks that don't need the big model
- **GPU 2:** TTS, speech-to-text, and other real-time media services
- **GPU 3 (10.9 GB):** Embedding model and reranker for RAG pipelines
- **P2000 (2.3 GB):** Qwen2.5-Coder-3B for IDE autocomplete

Before this, I was burning 3 GPUs just to run the main model and still had no room for anything else. Now I'm running an entire AI stack -- inference, embeddings, reranking, speech, classification -- across hardware that was previously choking on a single use case.

## The Counter-Intuitive Lesson

More GPUs isn't always better. This is physically painful to type as someone who bought four of them, but it's true. The multi-GPU pipeline parallelism bugs made 3 GPUs less stable than 1 GPU + CPU. The EPYC's memory bandwidth -- a spec I barely glanced at when building this system -- turned out to be the thing that made everything work.

If you're running consumer GPUs and looking at MoE models, stop fighting multi-GPU inference. Grab a CPU with lots of memory channels, use `--cpu-moe`, tune your thread count, and move on with your life.

The whole thing runs as systemd services behind LiteLLM and OpenWebUI, with Frigate NVR tapping the main model for camera analysis. It's not just benchmarks -- it's a real homelab workhorse that I use every single day.

Now if you'll excuse me, I need to go figure out what to do with all this leftover VRAM. I'm thinking about training a model to predict how much time I'll waste on my next optimization rabbit hole. Current estimate: too much.

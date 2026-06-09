---
title: "I Chased Four Benchmark Points and Almost Missed the Model That's Twice as Fast"
seoTitle: "Qwen3.6 27B Dense vs 35B-A3B MoE on Dual RTX 3090 (vLLM Benchmarks)"
description: "I finally got Qwen3.6 running locally, ran the dense flagship against the sparse MoE, and learned that four benchmark points are worth a lot less than 5x prefill."
date: 2026-06-08
sitemap:
  lastmod: 2026-06-08
tags:
  - AI
  - Self Hosting
author: Tony Costanzo
draft: false
image: /images/blog/local-ai-moe-vs-dense/hero.webp
---

## Links
- [The original rig writeup](https://www.techhivelabs.net/blog/local-ai-rig)
- [The Saturday I failed to upgrade](https://www.techhivelabs.net/blog/local-ai-upgrade)
- [vLLM](https://github.com/vllm-project/vllm)

## I Said I'd Check Back

Last time I touched Qwen3.6 I burned a whole Saturday, IPMI-rebooted my own server, and crawled back to the 122B model that's been quietly carrying my agent backend for months. I ended that post with a promise to check back in a few weeks once the inference engines caught up.

Reader, I checked back.

vLLM 0.20.0 finally serves Qwen3.6 without speaking exclusively in slashes, which means I could do the thing I actually wanted to do all along: put the two new models head to head and figure out which one earns a slot on the rig. A 27B dense flagship against a 35B sparse-MoE with only 3B active per token. Same family, same tool-call format, same 256K context. I went in fully expecting to crown the dense model and move on with my life.

That.. is not what happened.

## The Rig (and Why You Don't Need All of It)

If you read [the original build post](https://www.techhivelabs.net/blog/local-ai-rig) you know the cast. Quick recap for everyone else:

- **4x NVIDIA RTX 3090 24GB** (Ampere, no native FP8, no NVLink, open mining-style frame)
- **AMD EPYC 7532**, 128GB DDR4, PCIe 4.0, driver 580 / CUDA 13
- **vLLM 0.20.0**, the stable sweet spot on Ampere right now (more on why below)

Now the important part, because I don't want anyone thinking this is a four-GPU flex. It isn't. Each model in this comparison runs tensor parallel across **just two 3090s**. The other two cards in my frame are off doing unrelated jobs. So read this as a **dual 3090 story**. If you've got two 24GB Ampere cards and an afternoon, everything below is yours. Identical client both times, warmup runs discarded, nothing exotic.

## Before I Show You Numbers, Here's Where I'm Cheating

I hate benchmark posts that pretend the comparison is spotless. This one isn't, and you deserve to know exactly how before you trust a single row.

- **Different INT4 recipes.** The 27B is AutoRound, the 35B is AWQ (`cyankiwi/Qwen3.6-35B-A3B-AWQ-4bit`). Both 4-bit, slightly different math, so a sliver of any quality delta is the quant talking, not the architecture.
- **Speculative decoding favors the dense model.** The 27B ran with MTP (n=3) ON. The AWQ MoE checkpoint ships no MTP module, so it ran without. Every speed win the MoE posts below, it posts while spotting the dense model a head start.

So when I tell you the MoE is faster, read it as *faster despite me stacking the deck against it.* Keep that in your back pocket.

## The Part Where Sparse Embarrasses Dense

| Metric | 27B dense | 35B-A3B MoE | MoE advantage |
|---|---|---|---|
| TTFT (short prompt) | 162 ms | **48 ms** | 3.4x lower |
| Decode (single stream) | 74 tok/s | **154 tok/s** | 2.1x |
| **Prefill TTFT** (3,525-tok prompt) | 1,531 ms | **279 ms** | **5.5x lower** |
| Decode (long context) | 106 tok/s | **165 tok/s** | 1.6x |
| Throughput @ 4 concurrent | 182 tok/s | **220 tok/s** | 1.2x |

The headline isn't the decode rate. It's the prefill. **5.5x faster to chew through a long prompt.**

Here's why that one matters more than the rest. The MoE only fires 3B parameters per token, so reading a giant prompt (a whole file, a wall of tool output, a stuffed system prompt) is dramatically cheaper than the dense 27B dragging all 27B params across every single input token. For interactive chat the decode speed is what you feel. For agentic work, where every turn re-reads a mountain of context before it writes a single word, prefill is the tax you pay on every loop. The MoE basically stops charging it.

## And Then It Did This With Memory

| | 27B dense | 35B-A3B MoE |
|---|---|---|
| vLLM-reported KV cache | 169,600 tokens | **421,296 tokens** (~2.5x) |
| Concurrency @ 256K/request | 2.39x | **6.10x** |
| VRAM footprint | ~24GB/card (48GB) | ~21.5GB/card (43GB) |

Same two cards. Same fp8 KV cache. The MoE holds **~2.5x more context** and serves ~2.5x more concurrent long-context requests, while using *less* VRAM.

I want to be careful here, because I got publicly humbled on exactly this point last time. MoE saves compute, not KV cache memory in the general case (I had that backwards for months and the math eventually broke me on a Hermes checkpoint). The reason the MoE wins on context here is its specific shape, 40 layers with a smaller per-token KV footprint, not some free lunch that ships with every sparse model. Different architecture, different KV bill. Read the model card, not the vibes.

> **Ops note:** the multimodal AWQ checkpoint is 24GB on disk because it bundles a vision tower, so it needs two cards. The "fits a single 3090" claim you'll see online is the text-only GGUF Q4 (~18 to 20GB). This is the exact same trap that OOM'd me in [the last post](https://www.techhivelabs.net/blog/local-ai-upgrade). I just understand the bill now.

## Okay But Is It Actually As Smart

Speed is worthless if the model is an idiot, so I ran my own hard-task gauntlet. Identical prompts, both models, no benchmark cherry-picking.

| Task | 27B dense | 35B-A3B MoE |
|---|---|---|
| LRU cache, 6 strict constraints | all 6 + self-verified (11.5s) | all 6 + self-verified (9.4s) |
| Find ALL bugs incl. subtle list-aliasing | all 3, explained each (9.8s) | all 3 fixed incl. aliasing, terse (1.4s) |
| Multi-step train/bird reasoning | 1900/7 ~= 271.4 mi (8.9s) | 1900/7 ~= 271.4 mi (6.1s) |

Correctness was a tie. A flat-out tie.

Both models caught the nasty one. The bug where `merged[-1][1] = ...` quietly aliases and mutates the caller's original sub-lists, which is the kind of thing lesser models stroll right past. The only real difference was personality. The dense 27B talks you through its reasoning like a patient senior dev. The MoE fixes it, drops the code, and walks away in 1.4 seconds like it's got somewhere to be. (I relate to the MoE.)

### So Where's the Catch

Here's where the dense model earns its keep, and I'm not going to bury it:

| Benchmark (Qwen official, not re-run here) | 27B | 35B-A3B |
|---|---|---|
| SWE-bench Verified | **77.2** | 73.4 |
| Terminal-Bench 2.0 | **59.3** | 51.5 |

The dense model is genuinely better at the hard agentic tail. The long, gnarly, multi-step coding tasks that my three quick prompts never even poke at. Those benchmarks aren't lying. That gap is real on real work.

But look at the size of it. **Four points on SWE-bench.** Roughly eight on Terminal-Bench. That's the entire price of admission for the dense model.

## Four Benchmark Points Walk Into a Homelab

This is the part I keep chewing on, and it's the reason this is a blog post instead of a quiet config commit.

We worship leaderboard deltas. I'm as guilty as anyone alive. The entire reason I started [this expensive saga](https://www.techhivelabs.net/blog/local-ai-rig) was a benchmark number that looked filthy. But here's the uncomfortable thing I had to sit with: when I put both models in front of actual work, that four-point SWE-bench gap was invisible. I could not feel it. Not once.

You know what I felt on every single turn? The MoE answering before the dense model finished clearing its throat. Two and a half times more of my codebase sitting in context. My whole house hammering the same endpoint without it buckling.

Speed isn't a luxury metric. It's the line between an agent loop that feels alive and one where you tab away to doomscroll while it thinks. Context isn't a spec-sheet flex. It's whether the model sees the whole problem or squints at it through a keyhole. For the daily 80% (chat, tool calls, voice, long context, throughput) those two things outrank the hardest 4% of an agentic benchmark by a country mile.

Here's the thing nobody puts on a slide. Benchmarks measure the model at its absolute limit. You don't live at the limit. You live in the boring middle, all day, every day, and in the middle the sparse model is flatly the better tool. I spent years optimizing for a score I hit maybe twice a month.

The dense model wins the test. The sparse model wins the Tuesday.

## Run It Yourself

Enough philosophy. Here are the exact incantations, both on vLLM 0.20.0, TP=2 (two cards each). Swap your own paths and keys.

**27B dense (AutoRound INT4, with MTP):**
```bash
CUDA_VISIBLE_DEVICES=2,3 CUDA_DEVICE_ORDER=PCI_BUS_ID \
NCCL_P2P_DISABLE=1 NCCL_CUMEM_ENABLE=0 VLLM_WORKER_MULTIPROC_METHOD=spawn \
vllm serve /path/to/qwen3.6-27b-autoround-int4 \
  --port 8004 --served-model-name qwen3.6-27b-coder --api-key YOURKEY \
  --tensor-parallel-size 2 --disable-custom-all-reduce \
  --quantization auto_round --dtype float16 \
  --max-model-len 262144 --gpu-memory-utilization 0.92 \
  --kv-cache-dtype fp8_e5m2 --max-num-seqs 4 --max-num-batched-tokens 8192 \
  --enable-prefix-caching --enable-chunked-prefill --mamba-cache-mode align \
  --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder \
  --default-chat-template-kwargs '{"enable_thinking": false}' \
  --speculative-config '{"method":"mtp","num_speculative_tokens":3}' \
  --trust-remote-code
```

**35B-A3B MoE (AWQ INT4, no MTP):**
```bash
CUDA_VISIBLE_DEVICES=2,3 CUDA_DEVICE_ORDER=PCI_BUS_ID \
NCCL_P2P_DISABLE=1 NCCL_CUMEM_ENABLE=0 VLLM_WORKER_MULTIPROC_METHOD=spawn \
vllm serve /path/to/qwen3.6-35b-a3b-awq \
  --port 8007 --served-model-name qwen3.6-35b-a3b --api-key YOURKEY \
  --tensor-parallel-size 2 --disable-custom-all-reduce \
  --quantization awq_marlin \
  --max-model-len 262144 --gpu-memory-utilization 0.92 \
  --kv-cache-dtype fp8_e5m2 --max-num-seqs 16 --max-num-batched-tokens 8192 \
  --enable-prefix-caching --enable-chunked-prefill --mamba-cache-mode align \
  --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder \
  --default-chat-template-kwargs '{"enable_thinking": false}' \
  --trust-remote-code
```

### The Landmines I Stepped On So You Don't Have To

- **`--mamba-cache-mode align` demands `--max-num-batched-tokens >= 2096`.** These are gated-delta hybrid models with a 2096 block size, and the default 2048 hard-crashes the engine on init. Set 8192 and move on.
- **The multimodal AWQ is 24GB, so it wants two cards.** If you want to run on a single 3090, grab a text-only GGUF instead. No amount of `--gpu-memory-utilization` tuning fixes physics.
- **vLLM 0.22.x would not build on Ampere for me.** Its flashinfer wheels JIT-compile CUDA-13 kernels and my system nvcc was too old to keep up. 0.20.0 is the stable pick for 3090s today, full stop.
- **No native FP8 or NVFP4 on Ampere.** INT4 via AutoRound or AWQ is the play. Stop trying to make FP8 happen on these cards.
- **The AWQ MoE has no MTP module**, so you lose the speculative-decode lever. It's so fast you won't miss it.

## The Verdict (On Two 3090s)

- **35B-A3B MoE is the daily driver now.** Interactive chat, voice agents, tool use, long context, throughput. Roughly 2x faster everywhere, 2.5x more context, same two cards, and it was *as correct* as the dense model on everything I threw at it by hand. It just doesn't monologue about it.
- **27B dense stays on call for the hard 20%.** When I need maximum correctness on a long, brutal, multi-step coding task, or I genuinely want the model to explain its reasoning, the benchmark edge is real and I'll route to it.
- **Same family means routing is trivial.** Identical tool-call format, identical 256K context. Run both, send the easy stuff to the fast one, escalate the nasty stuff to the smart one. And if two cards is your whole budget, run the MoE solo and keep the dense GGUF on a shelf for the rare day you need it.

So I came back to crown the dense flagship and instead I'm leading with the model I literally watched OOM itself last time. The benchmark snob in me is a little offended. The guy who actually uses this rig every day has never been happier.

Funny how that keeps happening. The 122B was supposed to be a 27B. The dense model was supposed to win. At this point I should just bet against my own predictions and serve whatever loses.

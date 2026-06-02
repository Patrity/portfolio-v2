---
title: "I Spent a Saturday Trying to Replace My Local AI to Save on Tokens. The Server Voted No."
seoTitle: "Why My Local LLM Upgrade Failed (vLLM + Qwen3.6)"
description: "Six hours, five models, one IPMI reboot, zero upgrades -- a field report on why the bleeding edge of local LLM hosting is mostly bleeding."
date: 2026-04-28
sitemap:
  lastmod: 2026-04-28
tags:
  - AI
  - Self Hosting
author: Tony Costanzo
draft: false
image: /images/blog/local-ai-upgrade/hero.webp
---

## Links
- [The original rig writeup](https://www.techhivelabs.net/blog/local-ai-rig)
- [vLLM hybrid attention bug (#38643)](https://github.com/vllm-project/vllm/issues/38643)
- [noonghunna/qwen36-dual-3090](https://github.com/noonghunna/qwen36-dual-3090)

## The Cope That Started It All

I run my entire AI stack locally to save on token costs.

That sentence is technically true and economically deranged. I dropped five grand on a 4x RTX 3090 EPYC server (a story for [another post](https://www.techhivelabs.net/blog/local-ai-rig)), I burn enough power to heat my office better than the actual heating system, and I tell my wife with a straight face that the math works out. The math does not work out. The math will never work out. I would have to refuse Claude tokens for the rest of my natural life to break even on this thing.

But the model that's been quietly carrying my agent backend for weeks -- Qwen3.5-122B-A10B, 122 billion total parameters with 10 billion active per token, 256K context, multimodal, ~26 tok/s decode -- runs flawlessly on my closet jet engine. And that genuinely rules.

Then Qwen3.6 dropped.

And I made the classic mistake of assuming the year-old model in production needed to be replaced.

## The Plan (Past Tense)

Qwen3.6-27B's benchmarks looked filthy. 77.2% on SWE-Bench Verified, within shouting distance of Claude Opus 4.6. Smaller, faster, more efficient. Designed for exactly the kind of homelab shenanigans I keep getting myself into.

The migration plan was clean:

- **Main brain:** Qwen3.6-27B in FP8 via vLLM, tensor parallel across two 3090s
- **Vision sidecar:** Qwen3.6-35B-A3B for the Frigate camera analysis
- **Frees a GPU** vs the 122B's CPU-offload pattern
- **Same multimodal coverage** as the current stack
- **Faster decode** in theory

I had a Saturday. I had a freshly downloaded model. I had coffee.

What's the worst that could happen.

## Wall One: The Hybrid Attention Tax

Every modern Qwen3 model uses hybrid attention, a 3:1 ratio of Gated DeltaNet layers (linear attention, fast, light) to standard Gated Attention layers. On paper it's elegant. In practice, inference engines are still catching up.

vLLM 0.19.0 + Qwen3.6-27B FP8 hits a [tensor format mismatch in the FLA path](https://github.com/vllm-project/vllm/issues/38643). The bug doesn't crash gracefully, it just produces gibberish. You ask the model what 2+2 is and it confidently answers in slashes. 0.19.1 ships.. still broken. Adding `--enforce-eager` makes it stable, then drops decode to 3-4 tok/s because cudagraphs get disabled. At that speed I might as well type the response myself.

Yikes.

## Wall Two: 24GB Is a Lie

Tried loading `Qwen3.6-35B-A3B-AWQ` on a single 3090 for the Frigate sidecar. AWQ weights are ~17.5GB. Should fit comfortably in 24GB. It doesn't.

```
torch.OutOfMemoryError: CUDA out of memory.
GPU 0 has a total capacity of 23.80 GiB of which 182.19 MiB is free.
```

vLLM's profile_run pre-allocates worst-case multimodal buffers during warmup, and the vision encoder balloons to ~23GB before the model even starts running. I tweaked every flag I knew.. `--gpu-memory-utilization 0.85`, `--max-model-len 16384`, `--max-num-seqs 8`, `--enforce-eager`. Same answer every time: 24GB consumer card, AWQ, vision encoder.. pick two.

Fell back to llama.cpp + GGUF for that one (which fit fine at ~22GB). Then realized Frigate genai analysis was a "nice to have" rather than a must-have, and disabled it entirely. Who needs to know when the UPS guy is spending too much time at my frontdoor anyway.

## Wall Three: Quantized KV Cache Speaks Only in Slashes

Tried llama.cpp on Qwen3.6-27B Q5_K_M with my usual flags: `-ctk q4_0 -ctv q4_0`. Same flags I run on the 122B every day with zero issues.

Asked the model "What is 2+2?"

The decode rate was perfect, the tokenization was clean, the entire pipeline was confidently producing garbage.

It replied: `//////////////////` at a brisk 37 tok/s.

Q8 KV did the same thing. Turns out Qwen3.6 only rotates 64 of its 256 head dimensions, and the scoring math the KV-quant code uses leans on exactly the rotated portion. Quantize what holds 75% of the cell content and the model goes blind.

Switched to BF16 KV. Output came back as English. Decode held up at small context, but at 65K+ I started catching CUDA errors during prefill activations. Practical ceiling on dual 3090s with BF16 KV: about 128K context... half of what the 122B handles without breaking a sweat.

Strike three.

## Wall Four: A Hermes Naming Gotcha

Nous Research recommends their Hermes 4 fine-tunes for the kind of agent loop I'm running. There are two of them:

- **Hermes 4 35B-A3B** -- actual MoE, 3B active, fine-tuned from Qwen3.5-35B-A3B
- **Hermes 4.3 36B** -- dense, 36 billion parameters, fine-tuned from **ByteDance Seed** (not Qwen, surprise)

The "A3B" doesn't appear in the file or repo names, and I assumed wrong. Pulled the dense one. 22GB Q4_K_M. Loaded fine. Worked great at <2K context, hung the moment I tried 8K.

But the real lesson here was the KV cache math. 65 layers all running full attention means ~33GB of KV at 128K context regardless of FFN sparsity. **MoE saves compute, not KV memory.** I'd been quietly wrong about that for months. Embarrassing.

## Wall Five: The IPMI Lockup

This is the one I'd like to forget.

I'd seen MiniMax M2.5 doing the rounds.. 230B-A10B agentic model, 80.2% on SWE-Bench Verified, designed end-to-end for tool use. Different model family entirely, no Qwen3 hybrid attention bugs to inherit. The 10B active footprint meant the CPU-offload pattern would still work on my 128GB of DDR4. 95GB download. I got more coffee.

I forgot to stop the 122B service before launching M2.5.

Two simultaneous CPU-offload models meant 62GB (122B experts) + 99GB (M2.5 experts) trying to share 128GB of physical RAM. The kernel started swap-thrashing. SSH stopped responding. The fans got loud. Then the fans got quiet, which is somehow worse.

I had to IPMI-reboot the box.

(For the non-homelab readers: IPMI is the "remote-press the physical reset button" interface. Using it is not a flex. Using it because you stacked two MoE models on top of each other and ate all the RAM is, frankly, embarrassing.)

After a clean reboot with the 122B properly stopped, M2.5 ran. Decode at 1K context: 26 tok/s. Decode at 128K context: 5.9 tok/s. That's about one word per second. Useful for crossword puzzles, less useful for a multi-turn agent loop. Plus, I confirmed this the hard way, the open weights are text-only. So much for replacing the multimodal pipeline.

## Wall Six: The Community Recipe Speedrun

There's a [GitHub repo](https://github.com/noonghunna/qwen36-dual-3090) by `noonghunna`, a community-engineered stack with custom vLLM patches that allegedly gets Qwen3.6-27B running on dual 3090s at ~50 tok/s with 100K context. DigitalSpaceport showed it running in a YouTube video. I had to try.

Required prerequisite: NVIDIA driver 580.x (I was on 570). Did the upgrade in-place via apt. Clean swap, all five GPUs detected on first boot, every existing service came back. The driver upgrade was the one universally good thing to come out of the entire day. Hold that thought.

Then I tried each compose variant the repo ships:

- **Default fp8 build:** booted, threw the same vLLM hybrid attention bug at 65K+ context. Turns out the default variant doesn't apply the patches that fix it.
- **Turbo build with Genesis patches:** mounted a file the repo doesn't actually contain (Docker silently created an empty placeholder, lol). Once I no-op stubbed it, the engine crashed importing a vLLM symbol that no longer exists in current nightly.
- **DFlash speculative decoding build:** the drafter model is gated on HuggingFace, the setup script doesn't tell you, the first download silently produces 36KB of metadata, you accept the gate, redownload, then watch the engine wedge for forty straight minutes during cudagraph capture before you give up and kill it.

The repo's README is honest about all of this: *"this stack tracks vllm:nightly rather than pinning to a tested digest."* Translation: this worked end-to-end for about 48 hours after each commit. By the time you find it, half the patches reference symbols that have moved.

Community recipes rot. Fast.

## What I Actually Tested

The day's burn-down chart, in the form of a table I'd rather not look at again:

| Stack | Engine | Result |
|-------|--------|--------|
| **Qwen3.5-122B-A10B (production)** | llama.cpp + cpu-moe | **Stable. 26 tok/s @ 256K. Untouched.** |
| Qwen3.6-27B FP8 | vLLM 0.19.x | Gibberish, or 3-4 tok/s with eager mode |
| Qwen3.6-27B Q5_K_M | llama.cpp BF16 KV | OOM at 65K |
| Qwen3.6-27B Q5_K_M | llama.cpp q4_0 KV | Confident gibberish |
| Qwen3.6-35B-A3B AWQ | vLLM single 3090 | Vision encoder OOM |
| Hermes 4.3-36B (dense, not Qwen) | llama.cpp BF16 KV | Hangs at 8K |
| MiniMax M2.5 230B-A10B | llama.cpp + cpu-moe | Slow at long ctx, text-only |
| Qwen3.6-27B AutoRound (default) | vLLM nightly | Same FLA bug |
| Qwen3.6-27B AutoRound (Turbo) | vLLM nightly + Genesis | Genesis ImportError |
| Qwen3.6-27B AutoRound (DFlash) | vLLM nightly + DFlash | Wedged in compile |

Six hours. ~155GB of disk burned. One driver upgrade kept. One server briefly bricked. Production: unchanged.

## What I Actually Learned

Three things came out of this day clean:

- **Hybrid attention is the new bug magnet.** Every Qwen3-family model and Gemma 4 use hybrid layouts, and every mainline inference engine is still chasing the bugs. Qwen3.6-27B is widely beloved. You can find a dozen people on X right now telling you it's their daily driver, but the runtime story at long context is still not there if you need stability. The bleeding edge actually bleeds.
- **MoE saves compute, not KV cache memory.** All attention layers compute KV for every token regardless of expert routing. A 36B dense model and a 36B-A3B MoE model have the same KV footprint at the same context length. I'd been wrong about this for months and didn't notice until the math broke me.
- **Don't run two CPU-offload models at the same time.** Or do, and reserve some quality time to chat with your IPMI interface like an old friend.

The CPU-offload pattern (`--cpu-moe` in llama.cpp, attention on the GPU, MoE experts in DDR4) remains the only stable path I've found to 256K+ context on consumer 3090s for this model family. The 122B works because experts go to RAM (~46GB at IQ4_XS) and only the attention slice touches the 24GB GPU. That dodges most of the GPU-side bugs the new stuff trips on.

Marketing context numbers are usually YaRN max, by the way. MiniMax sells "1M context", native is 204,800. Qwen3.6 sells "262K native, 1M with YaRN" (at least that one is honest). Always check the model card, not the launch blog.

## The Cope, Revisited

So I'm back on Qwen3.5-122B-A10B. Same model, same 26 tok/s, same 256K context, same multimodal, same boring stability. The only thing that changed today is my driver version and my newfound respect for swap thrashing.

The token-cost cope still doesn't pencil out. I knew that going in. But six hours of failure left me with the one thing the API never gives you: **definitive evidence** that the obvious upgrade isn't ready for my use case. Not "I keep meaning to try it." Not "maybe Qwen3.6 fixes everything." Burned in. Documented. Done.

I'll check back in a few weeks. The best part is.. this is exactly how I ended up on a 122B model in the first place.

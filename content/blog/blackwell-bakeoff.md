---
title: "I Benchmarked Nine Models to Spec a Four-GPU Node. Every Single Number Crowned the Wrong Winner."
seoTitle: "RTX PRO 6000 Local LLM Bakeoff: Nine Models Tested"
description: "I have to spec a two-to-four card inference node, so one Blackwell went on the bench first. Every throughput test picked one winner. Then a benchmark that actually compiles the code scored it 28.9% against 64.4%."
date: 2026-09-14
sitemap:
  lastmod: 2026-09-14
tags:
  - AI
  - Self Hosting
author: Tony Costanzo
draft: false
image: /images/blog/blackwell-bakeoff/hero.webp
imageWidth: 1536
imageHeight: 864
---

## Links
- [The original rig writeup](/blog/local-ai-rig)
- [The upgrade that the server voted down](/blog/local-ai-upgrade)
- [What this thing actually costs to run](/blog/local-ai-true-cost)
- [The Aider polyglot benchmark](https://github.com/Aider-AI/aider/tree/main/benchmark)

## The Node I Have to Spec

There's a production deployment coming that I have to spec, and it's two to four of these cards.

I did not want to pick that hardware off a benchmark table.

Here's the problem with the tables. Every number you read on one is for BF16 weights, and I serve int4, sometimes int2, because that's what actually fits. A model sitting at 42 on some open-weight index is not that same model at a two-bit quant, and nobody publishes what the quantization did to it on the way down. You measure that yourself or you buy on vibes.

The second problem is worse. Those benchmarks measure the model. They don't measure the model doing my job.

So one card went on my bench first. Its entire job is to tell me what the real ones should be.

## The Card Went In and Two 3090s Fell Out

An RTX PRO 6000 Blackwell showed up and was in the server twenty minutes later, which is the fastest I have ever moved on anything involving a screwdriver.

96 GB on one card. Compute capability way up. Six hundred watts of "please do not ask about the power bill." It replaced a Quadro P2000 that had been quietly doing autocomplete duty.

The rest of the box, because the new card does not live alone: four RTX 3090s, an EPYC 7532 with 128 GB of DDR4, and one GPU nobody was allowed to touch (the Zotac runs my embeddings and reranker around the clock, and I like being able to search my own notes).

First thing I did was move a model I already run onto it. Same model, same quant, off two 3090s in tensor-parallel and onto the one big card.

- **Decode up 40 to 56 percent** at every context depth
- **KV cache from 861,477 tokens to 3,174,512,** which is 3.7 times the room
- **Both Strix cards handed straight back to me**

Under actual batching the gap got embarrassing:

![Grouped bar chart comparing aggregate throughput on two RTX 3090s in tensor-parallel against one RTX PRO 6000 running the same Ornith-1.5-35B-A3B model: at 1 concurrent request 153.9 versus 200.0 tokens per second, at 8 concurrent 667.6 versus 1049.2, and at 32 concurrent 758.4 versus 2072.3, a 2.7 times gain](/images/blog/blackwell-bakeoff/one-card-vs-two.svg)

At 32 concurrent requests one card did 2,072 tokens per second against 758 for the pair, and time-to-first-token dropped from 11.76 seconds to 1.57.

That gap isn't mysterious. Tensor-parallel across two 3090s pays a PCIe all-reduce every single layer and there's no NVLink here to make that cheap. One large card never pays it. What matters for the node is that the gap *widens* with exactly the load a real deployment produces, so line one of my notes was: scale with replicas, not tensor-parallel.

## Every Number I Had Said Ornith

Then the boring question. What's fastest?

Single-stream decode in tokens per second, at roughly 2.4K, 38K and 151K prompt tokens. Median of three with a warmup call, thinking off, streamed.

| Config | 2.4K | 38K | 151K |
|---|---|---|---|
| **Ornith-1.5-35B-A3B int4, vLLM, PRO 6000** | **143.8** | **172.7** | **159.1** |
| Ornith-1.5 int4, vLLM, 2x Strix TP=2 *(previous setup)* | 103 | 136 | 102 |
| Laguna-S-2.1 Q4_K_XL, llama.cpp | 77.5 | 99.6 | 72.1 |
| Qwen3.8-Flash-Next Q3_K_XL, llama.cpp | 70 | 54 | 28 |
| Qwen3.8-27B dense FP8, vLLM | 46.1 | 48.2 | 40.2 |
| GLM-5.3-Flash IQ2_XXS, llama.cpp fork | 32.7 | 19.7 *(at 21K)* | .. |

Ornith won. Ornith won at every depth, by a lot, and it kept winning the harder I pushed.

I also ran an 11-point quiz of my own against the whole field. Code-semantics puzzles, a planted bug, strict JSON, a reasoning trap, needle-in-a-haystack at three depths. Ornith scored 10 out of 11 and pulled an eight-character secret out of the middle of a 127,000-token document, which told me int4 hadn't broken long-context recall at all. That genuinely surprised me. I assumed that's where the bodies were buried.

So: fastest model, passes my quiz, frees two GPUs. I wrote it up as settled and felt great about myself for several hours.

## Three "Optimizations" That Measured Backwards

Before the settled conclusion got unsettled, three things every forum will tell you are free wins. All three came out negative on this hardware.

**More GPUs made it slower.** I spread flash-next across the PRO 6000 plus three 3090s, 166 GiB of VRAM, against the one card. It came out 14 to 21 percent *worse* at every depth. Layer-split PCIe hops plus slower Ampere layers cost more than the extra memory bought.

**Speculative decoding never won, by any route.** The claim going around for this card was "MTP gets you 2.7x, DFlash 3.7x, an n-gram stack maybe 6x on real coding work." Measured on actual code-edit tasks, median of three:

| Ornith-1.5 on the PRO 6000 | refactor | extend | review | mean |
|---|---|---|---|---|
| baseline | 199.5 | 199.8 | 199.8 | **199.7** |
| with vLLM n-gram lookup | 91.8 | 96.1 | 82.1 | **90.0** |

2.2 times *slower*. Draft-and-verify overhead beats the savings, because code rewrites don't copy long verbatim spans out of the prompt. N-gram speculation only pays when the output echoes the input closely, and editing code is the opposite of that.

**Bigger and newer both lost.** GLM-5.3-Flash is 320 billion parameters with 18 billion active and sat at number three on the open-weight index. It did 32.7 tokens per second. Flash-next, 131B with 6B active, did 70. Ornith, 35B with *3B* active, did 143.8.

Active parameter count dominates decode speed. Not total size, not release date, not benchmark reputation.

## The Benchmark That Actually Compiles the Code

Here's the thing about that 11-point quiz Ornith aced. I wrote it. It's small, it's mine, and all it really asks is whether a model knows some things about Python.

What I needed to know was whether it can do the job.

The Aider polyglot benchmark does that. 225 exercises across six languages pulled from real Exercism suites, graded by actually compiling the result and running its tests. More to the point, it measures whether a model can emit a valid edit into a real repository, which is the entire thing a coding agent does all day.

First run handed me 26.2 percent for Ornith and I almost wrote it down.

Then I found `max_tokens: 4096` sitting in my harness config. It had been truncating edits mid-block, the API returned a length stop, and the benchmark logged that as "exhausted context window." **Thirty-one percent of that run had silently failed** and handed me a number that looked completely reasonable. Nothing was broken on screen. The only evidence was one line reading `Output tokens: ~3,897 of 8,192` right before the harness gave up.

That's the bug I'd pay money to never hit again. A crash you can see. A plausible wrong number you cannot.

I raised the cap and ran it properly.

![Two panels showing a reversal between the same two models. Top panel, decode speed: Ornith-1.5-35B-A3B reaches 143.8 tokens per second against 70 for Qwen3.8-Flash-Next. Bottom panel, Aider polyglot pass at 2 across 225 compiled and tested exercises: Ornith scores 28.9 percent against 64.4 percent for Qwen3.8-Flash-Next, a paired McNemar p value of 1.1e-17](/images/blog/blackwell-bakeoff/speed-vs-score.svg)

Ornith scored **28.9 percent**. Flash-next scored **64.4 percent**. Same 225 exercises, same harness, same afternoon.

Because both models saw identical problems, exercise difficulty cancels out and a paired test applies. Both passed 56, neither passed 71, flash-next-only 89, Ornith-only 9. That lands at p = 1.1e-17, which is statistics for "this is not a coincidence, go sit down."

Per language it wasn't a fight either:

![Grouped bar chart of Aider polyglot pass at 2 by language. Ornith-1.5-35B-A3B scores 35.3 percent on Python, 40.8 on JavaScript, 28.2 on Go, 34.6 on C++ and 27.7 on Java. Qwen3.8-Flash-Next scores 82.4, 81.6, 71.8, 69.2 and 66.0 on the same languages. Rust is omitted because the benchmark container has a broken cargo toolchain and both models score zero](/images/blog/blackwell-bakeoff/per-language.svg)

Two notes on this bench, both on me. Both models scored 0.0 on Rust, purely due to an error in my setup of the container. I had enough data at this point and did not feel the need to rerun with Rust enabled. And I had thinking flagged off on Ornith, which is just due to the way I use the model, while I left it on with Qwen3.8.

## The Part Where the Edits Wouldn't Apply

So what actually happened? The mechanism is the best part.

**134 malformed responses against 14.**

Ornith can write code. What Ornith cannot do is reliably emit a valid search-and-replace edit block. Its output was well-formed 62.7 percent of the time. Flash-next managed 96.4 percent and never got truncated once.

![Two panels on edit-format compliance. Top, across the full 225-exercise run: Ornith-1.5 returns a well-formed edit 62.7 percent of the time with 134 malformed and 37 truncated responses, while Qwen3.8-Flash-Next returns 96.4 percent well formed with 14 malformed and none truncated. Bottom, a 20-exercise probe on Ornith-1.5 alone: 40 percent well formed when asked for search-and-replace diffs, against 100 percent when asked to rewrite whole files](/images/blog/blackwell-bakeoff/edit-format.svg)

Forty percent well-formed when asked for diffs. One hundred percent when asked to rewrite whole files. The intelligence was there the entire time and it kept falling out of the envelope on the way to disk.

For an agent that edits files in place, that isn't a quality gap. That's disqualifying. The output has to *apply*.

And it reframes the speed win completely. Ornith was twice as fast at producing work I'd have to throw away.

## What I'm Actually Buying Now

The bench card runs flash-next now. Four slots at 262,144 context each, 97.6 tokens per second on one stream and 305.3 across eight. Parallel tool calls in a single turn, character-exact OCR, and it found a needle at 101,570 tokens. More slots cost zero extra VRAM at a fixed total budget, which is the best trick I learned all week.

The node notes, which is what this whole exercise was for:

- **Target low *active* parameters, not low total.** A 6-14B-active mixture-of-experts at int4 is the sweet spot, and it beat everything with more active parameters regardless of total size or ship date.
- **Design around four-bit Marlin.** The exotic formats on this architecture either fall back or corrupt, int8 is compiled out entirely, and FP8 mixture-of-experts crashes. Marlin is the fastest *correct* path, and it beat native FP8 even on dense weights.
- **Scale with replicas, not tensor-parallel.** One card sustains 2,072 tokens per second at 32 concurrent with 12 times the KV headroom it needs.
- **Never mix architectures in one engine.** Tensor-parallel across Blackwell and Ampere is documented-broken and closed as not-planned, and an Ampere card in the group forfeits the low-precision formats, which is the entire reason to own Blackwell.
- **Weight "merged upstream" heavily.** Two of my most promising candidates died purely on engine support. One wouldn't load anywhere. The other needed a specific fork, required flash attention disabled to produce correct output, and overflows a grid dimension at exactly the context length its headline is about.

That last one deserves a footnote. Another agent's research estimated 90 to 110 tokens per second for that model. Measured reality was 32.7. Research is not measurement.. and I say that as the guy whose measurements were also wrong for six hours.

## Tokens Per Second Is Not the (whole) Product

Nine configurations, four benchmark suites, an entire night, and a conclusion I was confident enough to write down.

Every synthetic test favored the fast model. Decode, prefill, concurrency, KV capacity, my own quiz. Then one execution-graded benchmark that mirrors the actual work inverted the answer completely.

If I'd specced that node off night one, I'd have sized it around a model that can't reliably hand back an edit that applies. Run the workload-representative test *first*, not last. That's the whole post.

Oh, and one thing got switched off along the way. My camera system's AI description feature had quietly burned about 27,000 requests and 100 million tokens describing my driveway to nobody. Not once has a human read one. I turned it off on every camera and the only thing that changed is the GPU got quieter.

The math still does not work out. It was never going to work out.

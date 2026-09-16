---
title: "I Billed Myself for 6.7 Billion Tokens and the Total Came Out to $35.85"
seoTitle: "Local LLM Cost Analysis: Electricity per Token vs the Cloud"
description: "My friends said the new model on my rig was drunk. Root-causing that from LiteLLM request logs turned into pricing every token my GPUs have ever produced.. and a $961 cloud comparison."
date: 2026-07-07
sitemap:
  lastmod: 2026-07-07
tags:
  - AI
  - Self Hosting
author: Tony Costanzo
draft: false
image: /images/blog/local-ai-true-cost/hero.webp
imageWidth: 1920
imageHeight: 1080
---

::audio-player
::

## Links
- [The original rig writeup](/blog/local-ai-rig)
- [The MoE vs dense showdown](/blog/local-ai-moe-vs-dense)
- [vLLM](https://github.com/vllm-project/vllm)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [OpenRouter's Qwen3.6-35B-A3B pricing](https://openrouter.ai/qwen/qwen3.6-35b-a3b)

## My Model Got Called Illiterate

My friends spent the weekend trash-talking the new coding model on my rig. By the time I finished defending its honor, I had priced every token my GPUs have ever produced and drafted a passive-aggressive invoice to the cloud.

Quick context for the new folks: I run a four-GPU homelab rig that serves coding models to a handful of people over [LiteLLM](https://github.com/BerriAI/litellm). Last week I swapped the coder from Qwen3.6-35B-A3B to Ornith-1.0-35B, a DeepReinforce fine-tune built for agentic coding that benches a couple points higher on SWE-Bench (75.6 vs ~73.4). Getting it to boot took a vLLM upgrade and five sequential startup failures, which is a war story for another post.

::content-image{src="/images/blog/local-ai-true-cost/rig.webp" alt="Open-frame GPU rig on a wire shelf: four RTX 3090s mounted on an aaawave mining frame with an EPYC server board and dual power supplies below" caption="The defendant's residence. Four 3090s on a mining frame, and yes, the RGB is load-bearing."}
::

The point is, the community was raving about this model. Then my users started filing complaints:

- *"this model misspells shit a lot"*
- *"spent about 10 minutes deleting a file and recreating it, forgot what its original task was"*
- *"big habit of deleting the whole file it's working on and trying to rewrite it all even though it's just missing imports"*

So either every reviewer on the internet was wrong, or something about *my* serving setup was making a good model act like it had a concussion. I had a suspect. It was me.

## Subpoenaing My Own Request Logs

Here's a thing I didn't fully appreciate until this week: LiteLLM stores the raw request body of every call in its spend logs. Every parameter every client ever sent. It's a full forensic record, sitting in Postgres, waiting for someone to have a bad enough week to read it.

I pulled every Ornith-era request for the heaviest user's key. 2,706 requests. 2,703 of them sent no `temperature` at all.

When the client doesn't send a temperature, vLLM falls back to whatever the model's generation config says. This quant's default: **1.0**. Combined with the `top_p` of 1.0 the client *did* send, my users were generating production code at near-maximum randomness. The misspellings weren't a model problem.. they were a dice-rolling problem.

Yikes.

And that was just the first charge. The logs kept talking:

- **The contexts were enormous.** Average prompt: 105,394 tokens. The biggest: 230,071, damn near the model's 262K ceiling. Roughly a third of all requests came in over 140K.
- **My fp8 KV cache was quietly taxing those deep contexts.** Squeezing the cache to 8-bit is how I bought headroom, but at 100K+ tokens the precision loss is real. That's your "forgot what its original task was."
- **Thinking was disabled globally.** I'd turned it off for my other workloads. For a model whose entire party trick is reasoning through a plan before acting, that explains the "rewrite the whole file to fix one import" behavior.

The control group sealed it: completions in the 44K to 56K range were clean, articulate, multi-step debugging. The model was fine. The config was drunk.

## The Fix Cost Nothing (My Favorite Price)

Two things I learned fixing this, and both were free:

- **Sampling params ride along per request.** One loaded model can behave completely differently per consumer. I made a second LiteLLM model entry, `ornith-thinking`, pointing at the same backend with `temperature: 0.2` and thinking enabled baked in. The coding folks switch one config line. My other consumers (a security camera captioner, my knowledge base, a chat UI) keep their fast no-thinking behavior and never notice.
- **This model's KV cache is comically small.** Ornith uses aggressive GQA with only 2 KV heads, so I checked whether I even needed fp8 anymore. Turns out fp16 still fits the entire 262K context with room for ~3 fully-maxed concurrent requests, and about 8 at my users' average context size. Peak concurrency ever observed on this box: 4. I was paying a precision tax to buy concurrency nobody was using.

So the deep-context degradation fix was literally *removing* a flag. I love it when the answer is deleting something.

## The Rabbit Hole Under the Spend Tables

Now, while I was elbow-deep in LiteLLM's spend tables gathering evidence, something kept bugging me. Every local request had a spend of $0.00. Which is adorable, but wrong. These tokens aren't free.. I pay for them in electricity, and I had all the data to compute exactly how much.

My Prometheus setup already scrapes per-GPU power draw and vLLM throughput. The math is one line:

- **Energy per token** = watts / (tokens per second)
- The two coder GPUs pull ~700W under load (power-capped 3090s)
- Decode runs ~130 tok/s, so each output token costs **5.4 joules**
- Prefill chews ~6,000 tok/s, so each input token costs **0.12 joules**

At my rate of $0.1395/kWh, that lands here:

| | $ per 1M tokens |
|---|---|
| Input (prefill) | **$0.0045** |
| Output (decode) | **$0.21** |

Prefill is ~46x cheaper per token than decode because it batches, which matters enormously when your workload is agents stuffing entire repos into every prompt.

Honesty corner, because I hate cost posts that hide the asterisks: this is *marginal* cost. It excludes idle power, cooling, and hardware amortization. And the prefill throughput is estimated, not measured, so the input rate is the softest number in this post. Sanity check though: it prices my last 7 days of usage at about $6.90, call it $30/month of coder electricity, which matches what the rig actually pulls. The math holds.

## The Part Where the Cloud Should Blush

I set those per-token prices on the local models and backfilled every request LiteLLM has ever logged. All-time damage across every local coding model since April: **6.67 billion input tokens, 27.8 million output tokens, $35.85 in electricity.**

Then I priced the identical token volume at OpenRouter's rate for Qwen3.6-35B-A3B, the exact architecture Ornith is fine-tuned from, at $0.14/M in and $1.00/M out. Same tokens, their bill: **~$961**.

![Bar chart comparing the all-time cost of 6.7 billion tokens: $35.85 of local electricity vs an estimated $961 at OpenRouter rates, roughly 27 times more](/images/blog/local-ai-true-cost/bill-vs-cloud.svg)

That's ~27x cheaper on marginal cost, and OpenRouter's open-model pricing is *already* the cheap option. Input tokens are the absurd part: 31x cheaper locally, on the exact token type my agentic workload mainlines.

Before anyone yells at me (again), yes, the comparison is electricity vs fully-loaded cloud. So let's load it: the rig cost about $6k, which amortizes to ~$167/month over three years. The coder workload alone has been producing $320 to $480/month of cloud-equivalent value. It pays the rig's mortgage two or three times over before counting anything else the box does (image gen, voice, embeddings.. you name it).

## Where 6.7 Billion Tokens Actually Went

Backfilling spend meant I could finally answer a question I'd never thought to ask: what is actually *eating* my rig? I mapped every API key to its workload and grouped all-time usage.

![Bar chart of all-time input tokens by workload: the always-on assistant used 4.75 billion (71.4%), agentic coding 1.88 billion (28.2%), vision and security 15.6 million (0.23%), and the second brain 13.6 million (0.20%)](/images/blog/local-ai-true-cost/token-attribution.svg)

The results broke my mental model of my own homelab:

- **The always-on assistant dominates everything.** Hermes, my 24/7 messaging agent, has quietly pushed 4.75 billion tokens.. 71% of all local inference ever. Total electricity: about $26. A billion tokens a month of ambient assistant costs less than a pizza.
- **Coding is the heavyweight per request, not per volume.** 28% of the tokens from just 12% of the requests, averaging ~97K tokens per request. Agentic coding tools shove the whole repo into every single turn.
- **The "second brain" is a rounding error.** My knowledge base and memory agents, the thing people assume is the token hog, used 13.6 million tokens all-time. Twenty-two cents. The chat agent out-consumed it 350x, purely by never shutting up.
- **Vision is cheap and bursty.** The security cameras fire thousands of tiny ~1.9K-token requests. 5% of requests, 0.23% of tokens.

![Grouped bar chart comparing each workload's share of requests vs share of input tokens: the assistant is 82% of requests and 71% of tokens, coding is 12% of requests but 28% of tokens, vision is 5% of requests and 0.2% of tokens, second brain is 1.5% of requests and 0.2% of tokens](/images/blog/local-ai-true-cost/requests-vs-tokens.svg)

## Three Traps I Sprung So You Don't Have To

If you want to do this backfill on your own LiteLLM box, learn from my bruises:

- **`/model/update` silently drops custom cost fields.** `input_cost_per_token` and `output_cost_per_token` only stick if you delete the model and recreate it via `/model/new`. No error, no warning. The API just quietly disagrees with you.
- **Spend lives in three places, and the UI reads the one you'd guess last.** Per-request spend logs, per-key running totals, and daily aggregate tables. The usage dashboard reads the *daily* tables, so backfilling only the request logs changes nothing on screen. Ask me how long that took me to figure out.
- **Reconcile key totals additively, never from scratch.** Old spend logs get pruned while key counters persist. Two of my keys held $42 of real recorded spend with zero surviving log rows. A naive `spend = sum(logs)` would have erased history, and bumping totals can also trip keys with budgets, so guard for that too.

LiteLLM has strong opinions about its spend tables. Now I have strong opinions about its opinions.

## Case Closed

So the model was never drunk. My config was rolling dice at temperature 1.0, compressing memories at 200K context, and lobotomizing a reasoning model's ability to reason. Ornith is owed a formal apology from at least three people, and I've sent mine.

The real souvenir is that number though. Every token my coding stack has ever produced, 6.7 billion of them, cost me less than a family dinner. The cloud wanted a grand for the same work.

My friends are back to happily burning 97K tokens per request like it's nothing. Because at $0.0045 per million, it basically is.

Go bill yourself. It's weirdly satisfying.

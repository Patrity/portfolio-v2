---
title: "I Built a Bot Army to Attack My Own Game Server, and 45 of Them Took It Down"
seoTitle: "Load Testing a Colyseus MMO Server: The 50ms Tick Budget"
description: "My movement bots said the server could hold hundreds. Then I taught them to swing a sword and the whole thing fell over at 45.. which is how I ended up shopping for CPUs instead of RAM."
date: 2026-07-25
sitemap:
  lastmod: 2026-07-25
tags:
  - Game Development
  - Self Hosting
author: Tony Costanzo
draft: false
image: /images/blog/game-server-scaling/hero.webp
imageWidth: 1920
imageHeight: 1080
---

## Links
- [Thundoria](https://thundoria.com)
- [The live server fleet](https://thundoria.com/worlds)
- [The last time I wrote about this game](/blog/thundoria-architecture)
- [Colyseus](https://github.com/colyseus/colyseus)

## Fifty Players Cost Me Half a Millisecond

I ramped fifty bots into my game server, watched the tick time land at 0.4 milliseconds, and felt fantastic about myself. Fifty players, basically free. I had capped rooms at fifty on a hunch months earlier and this looked like proof I'd been insultingly conservative.

Then I taught the bots to swing a sword.

Forty-five of them saturated the same server so completely it stopped accepting new connections. Same room, same map, roughly the same headcount. The only difference was whether they were fighting.

That gap is the entire reason this post exists, and it ended with me shopping for a *cheaper* CPU.

## Everything I Told You About This Stack Is Now Wrong

Quick correction for anyone who read [the last Thundoria post](/blog/thundoria-architecture). That one described a Godot client, a Nakama server in Go, and a Kotlin service layer holding hands in the middle. All of it is gone.

Not because it didn't work. Because four runtimes meant four places to define the same thing, and I got tired of a room-naming scheme living in a Kotlin file *and* a Go file and praying they agreed. Now it's TypeScript end to end.. Phaser in the browser, [Colyseus](https://github.com/colyseus/colyseus) on the server, and a pnpm workspace in the middle where the shared logic actually lives.

Take `ROOM_TYPES`, which defines how a room gets named. The world-server composes a room ID when it mints your join ticket. The game-server composes the same ID to register the handler. Then the room composes it a *third* time to check your ticket is real. Three services independently deriving one string that has to match exactly, from one file that all of them import.

Which is how I inherited the constraint this entire post is about.

Colyseus is Node. Node is single-threaded.

## What I Was Actually Pointing the Bots At

Two services, and the split matters for the rest of this.

- **The world-server** is the thin orchestrator. It mints join tickets, keeps the world clock, and is completely private.. the browser never touches it. Only my other servers can.
- **The game-servers** are where the game actually happens. Each one is a Node process running rooms. A room is one map instance. Every node writes itself into Redis on boot with a 15 second TTL and heartbeats every 5 seconds, so a crashed node just quietly expires out of the fleet instead of needing a funeral.

![Diagram of the Thundoria server topology: the browser reaches the Nuxt web app over HTTPS and the game-server over WSS, while the world-server sits private behind them reachable only server-to-server, and a Cloudflare Tunnel dials outward from the box so no inbound ports are open](/images/blog/game-server-scaling/topology.svg)

Production runs two of them, us-east-1 and us-east-2, which sounds impressive until I admit they're two processes on the same box in the same rack. Individually addressable, genuinely clustered, absolutely not the globe-spanning fleet the names imply.

You can go look at it right now. `thundoria.com/api/fleet` will happily tell a total stranger exactly how many players are online. Hold that thought.

## Teaching a Bot to Punch Without Hands

The first harness ramped bots that only walked around. Random-walk velocity, twenty updates a second, ramping up in steps. That's the run that produced the beautiful, useless 0.4ms number.

Movement isn't the cost. Combat is. And I couldn't test combat, because my bots had a problem: no inventory.

A synthetic bot has no items. It can't swing a sword through the normal path because there's no sword, no hands, nothing. The client-side route was closed.

So I went around it. There's now a `devSwing()` that shoves an inventory-less player through the *real* melee hit-resolution path using an inert no-op client and an empty item stack. Then the room itself runs the fight: every 700 milliseconds (roughly the fist cooldown) it spawns about one mob per two bots, tops up everyone's health so nobody dies and ruins the sample, and makes every single bot throw a punch.

My load test is a room full of naked bots fist-fighting slimes forever. It is not dignified. It works.

The bots are also persistence-guarded so none of them touch the database, and the whole thing is behind a flag plus a secret key, because "server-side endpoint that skips ticket verification and session locks" is the kind of sentence that ends up in an incident report.

## My Ruler Was Broken

Before the good numbers, the embarrassing part.

Node has `monitorEventLoopDelay()`, which tells you how backed up your event loop is. I set it up with `resolution: 20` because twenty milliseconds felt like a reasonable sampling interval for a 20Hz loop.

The histogram's floor *is* the sampling interval. So a completely idle, perfectly healthy server reported a p99 of about 20ms and tripped my DEGRADED threshold every single time. For a while there I thought my server was permanently on fire. It was measuring its own ruler.

One character fixed it. `resolution: 1`.

I also added a mob counter to the metrics endpoint purely out of paranoia, because if the combat stimulus ever silently broke, the results would read as "combat is free" and I'd have believed it. Always make your instruments prove they're awake.

## The Number

Here it is. One box, one room, an audience of bots.

| Scenario | Players | Mobs | tick.p99 | loop.p99 | Verdict |
|---|---|---|---|---|---|
| Movement only | 50 | 0 | 0.3 to 0.4 ms | flat | trivial |
| Combat | ~45 | 66 | **50 to 65 ms** | ~7 ms | saturated |

![Chart comparing tick time against the 50ms budget: 50 players moving costs 0.4ms, a barely visible sliver, while 45 players fighting costs 50 to 65ms and crosses the budget line entirely](/images/blog/game-server-scaling/tick-budget.svg)

Combat is roughly **150 times heavier per tick than movement.** Same server, same room, same map. The only variable is whether anyone is swinging.

Three things in that table matter more than the headline:

- **The 50ms is a wall, not a coincidence.** The simulation runs at 20Hz, which gives every tick a 50 millisecond budget. Blow through it and you aren't lagging, you're falling behind reality permanently.
- **The event loop stayed healthy at ~7ms.** This is the reading that made the whole test worth running. If the loop had *also* been backed up, the story would be boring I/O queueing and I could have optimized my way out. It wasn't. The 50ms was the simulation itself.. mob AI and hit resolution, executing inside one tick. That's a real ceiling, not a backlog.
- **The ramp never finished.** I'd configured steps at 10, 25, 50, 100 and 200. It stalled around 45 and never saw 100. New joins timed out because the tick was already maxed, which means the server was too busy to accept the connections that would have made it busier. It briefly touched about 130 bots before the whole thing shed them.

Honesty corner, because I hate benchmark posts that quietly skip this: that's a worst case. Forty-five bots stacked on the spawn point, all swinging into sixty-six mobs at once. Real players spread out and fight less, so the *playable* number is higher. Fifty is a safe heavy-combat figure, not a hard wall.

## One Process, One Core, Fifty Milliseconds

Here's the rule that fell out of it, and it's the thing I'd tattoo on a junior dev if that were legal:

**One game-server process is one event loop, which is effectively one CPU core.**

Every room living in that process shares the same 50ms budget. You can host many rooms in one process, but they're all elbowing each other for the same thread. So you don't scale by making rooms bigger or processes fatter. You scale by adding *processes*, one per core, like a very boring assembly line.

Which reframes "how many rooms fit on a server" into simple arithmetic: however many you can stack before their combined tick cost hits 50ms. A busy combat room eats the entire budget by itself, so that's one per process. A quiet social room costs under a millisecond, so you could pack dozens.

## My 62GB of RAM Is Doing Absolutely Nothing

I run this on an OVH dedicated box. Xeon D-1540, eight cores, 2.0GHz base, and 62GB of RAM. When I bought it I felt very responsible about that RAM.

Then I did the division.

![Chart comparing what limits the same server: 62GB of RAM allows roughly 200 to 300 rooms, while the usable CPU cores allow only 8 to 12 busy rooms, a gap of about 25 times](/images/blog/game-server-scaling/ram-vs-cpu.svg)

An idle process costs about 160MB, and a fully maxed combat room adds roughly another 150MB on top. With 62GB I can hold two or three hundred rooms without breathing hard. But that same maxed room eats a whole core, and after leaving headroom for Redis and the world-server and the proxy stack I have eight to ten usable cores.

RAM says 250 rooms. CPU says 10. I over-provisioned the resource that wasn't the problem by roughly **25 times.**

The box idles at 3 to 4% CPU and about 3GB of RAM. It's a machine built for a workload I do not have, running two of the ten-ish processes it could theoretically hold, wearing 62GB like a hat.

## Buy Clock, Not Cores

The fix isn't a bigger server. It's a *faster* one, and specifically faster in the one dimension nobody advertises.

Minecraft players figured this out years ago. MC's main tick is also single-threaded at 20 TPS, which is why every "best Minecraft server hardware" thread eventually screams the same thing: buy single-thread clock speed and dedicated cores. Not core count. Not RAM. Never shared vCPU.

Same rules apply to me. A modern ~5GHz Zen 5 core does roughly 2.5 to 3 times the tick work of my 2015-era Xeon core, which would take that ~50 player combat ceiling up to something like 120 to 150.

![Dot plot of monthly cost versus estimated concurrent combat players for four server configs: a shared-vCPU DigitalOcean box at 48 dollars marked unreliable, an EPYC 4245P at 134 dollars, a Ryzen 7 9700X at 77 dollars offering the best value, and a Ryzen 7 9800X3D at 179 dollars](/images/blog/game-server-scaling/hardware-value.svg)

The **$77 Ryzen 7 9700X** wins outright. It lands at roughly 90% of the 9800X3D's per-core throughput for under half the money. The X3D is genuinely better for dense combat (its 3D V-Cache keeps the entity-iteration loop cache-resident, same reason it wins Factorio benchmarks), but not $102-a-month better for a game currently serving nobody.

The EPYC only makes sense if you need ECC and a real SLA. And the shared-vCPU VPS is the actual trap: CPU steal time causes tick spikes, and a tick spike on a 20Hz loop is your players rubber-banding into walls. The one thing a realtime simulation cannot tolerate is a stranger borrowing your core.

Fair warning on that chart: only the Xeon number is measured. Everything else is that one data point scaled by single-thread performance and core count. It's sizing math, not benchmarks, and I'd rather say so than let you find out later.

## The Guess That Became a Constant

The satisfying part is what the measurement turned into. My shot-in-the-dark cap of 50 stopped being a vibe and became a documented default:

- **`MAX_HUB_CLIENTS = 50`** is now the combat-safe default for any public map, with the load test date sitting right there in the code comment.
- **`PUBLIC_ROOM_CAPS`** overrides it per map. The social hub runs at 200 because it's movement-bound and I have the data to prove that's fine.
- **Mine floors cap at 10**, because they run combat with floor-scaled mobs and I'd rather shard early than melt.

Public rooms shard when they hit their cap. So the town holds 200 and splits, and any combat-heavy map splits at 50 *before* it can saturate a core.

The bit I like most: a combat map I haven't written yet automatically inherits the safe 50. The measurement became a guardrail around work that doesn't exist. It also lives in `packages/shared`, right next to the room types and the tick rate, which is exactly the "one place for domain knowledge" thing I burned a whole rewrite to get.

## The Part I Haven't Built Yet

Here's the shape all of this leaves open, and I want to be clear that it is currently vapor.

Because a node writes itself into the registry on boot and expires out when it dies, there is no static server list anywhere in my infrastructure. Nothing has to be *told* a server exists. It shows up, announces itself, and starts taking players.

Which means the missing piece for autoscaling is just a control loop. Watch the fleet for a region running out of headroom, call a cloud provider's API to boot another box with the same image and a different address, and it joins itself. Demand drops, kill it, let the TTL clean up the paperwork.

The region field is already in every node record. The spec for region-aware placement is written. And the honest catch is that it's less magical than it sounds, because each region has to be its own independent cluster with its own Redis.. the tick is latency-bound, so "just spin up a node in Frankfurt" really means "stand up a whole second stack in Frankfurt."

None of this exists. It is a seam, a spec, and an environment variable.

## Two Servers, Zero Players

So that's the campaign. I built a bot army, taught it to fistfight, fixed my broken ruler, found the ceiling, and priced out the hardware that raises it. I now know my server's exact breaking point to within about five players, and I know which $77 CPU moves it.

Then I ran the fleet endpoint one more time while writing this:

```json
"count": 2, "totalPlayers": 0
```

Two servers. Room for hundreds. Currently hosting nobody, forever ready, like a very well-instrumented ghost town.

Turns out the hardest scaling problem isn't the tick budget. It's players.

If you'd like to personally ruin my beautiful zero, [the game is right here](https://thundoria.com). I'll be watching the graph.

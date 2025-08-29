---
title: I Spent 22 Years Programming Just to Fail at Making a Skeleton Swing a Sword
description: "REST APIs to roguelikes: How I'm using a smaller game to learn the fundamentals before building my dream MMORPG. A honest indie gamedev journey."
date: 2025-08-27
sitemap: 
  lastmod: 2025-08-29
tags:
  - Game Development
  - Nuxt
author: Tony Costanzo
draft: false
image: https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/thundoria-1.png
---
## Links
- [Thundoria Site](https://thundoria.com)
- [X / Twitter](https://x.com/ThePatrity)
- [Blue Sky](https://bsky.app/profile/patrity.com)

# Why I'm Building an MMORPG (By Learning How NOT to Build One First)

## Every Game Developer Tells Us The Same Thing...

"Don't build an MMO."

It's literally the first rule of indie game devs. Right up there with "start small" and "your first 10 games will suck." And you know what? After 22 years of programming and two months of trying to build one, can confirm: they're absolutely right.

The thing is.. I'm still going to build my MMORPG. I'm just taking a massive detour through a completely different game first. Let me explain why building my dream game meant stepping the hell away from it.

## From RuneScape Private Servers to Full-Stack Development

My programming journey started when I was 11, doing what any reasonable (totally not degenerate) pre-teen would do in 2004: hacking together RuneScape private servers so I could spawn max cash stacks and party hats. Those early days of tearing apart poorly-written Java codebases by other degenerates taught me one thing exceptionally well: how to duct-tape other people's code together until it (mostly) worked.

Over the years, I graduated from game server shenanigans to real backend development. I built RESTful APIs, managed millions of rows of data for EPC contractors, and became what I'd call a "real programmer." Java, Kotlin, Python, TypeScript, PostgreSQL, microservices.. you name it, I could architect it.

But deep down? I never stopped scoping out game ideas in markdown files. Mountains of them.

## Enter Thundoria: My Beautiful, Overscoped Monster

Earlier this year, I finally said "screw it" and started building **[Thundoria](https://thundoria.com)**—a browser-based multiplayer roguelike bullet-hell with:

- Procedurally generated dungeons
- Real-time multiplayer combat
- RPG progression systems (because why not?)
- Crafting, fishing, mining (the holy trinity of scope creep)
- Social features like guilds and parties
- And yes... it's an MMO

*[Want to watch this trainwreck unfold? Join the mailing list at [thundoria.com](https://thundoria.com)!]*

### The Technical Flex That Nobody Asked For

In two months of near-daily work, I built some fairly impressive infra:

**NuxtJS Frontend:**
- Supabase auth with JWT passthrough to the game client
- Embedded game frame with seamless auth

**Kotlin Service Layer:**
- RESTful API for game server orchestration
- Dynamic instance balancing
- Procedural map generation
- HTTP map data serving to both client and server

**Nakama Game Server (Go):**
- Multi-character system per account
- Server-authoritative collision detection using map data from Kotlin
- Real-time multiplayer synchronization
- Full inventory and stats persistence

**Godot Client:**
- Fully integrated with the entire stack
- Complete UI with MMO-style panels
- Character creation with class selection
- Multiple polished scenes

I was crushing it. Architecture? Check. Data flow? Nailed it. Scalability? Ready for millions of players that would definitely (never) come.

## The Brutal Realization

Then I tried to implement combat.
And NPCs.
And enemy AI.
And suddenly, it hit me like a wave attack from a boss I needed to design: **I had no idea how to actually design game systems.**

Twenty-two years of programming experience, and I was paralyzed by questions like:
- Should enemies attack on a timer or use complex behavior trees?
- What percentage of loot should be rare vs common?
- How do you make death punishing but not ragequit inducing?
- Why does every design decision have 47 interdependent systems?

I knew HOW to make an enemy attack. I knew HOW to implement a loot table. Shit, I could build you a distributed loot service with Redis caching. But WHAT should that enemy's attack pattern teach the player? WHAT loot distribution keeps players engaged without breaking the economy? 

I was an architect and never built a house.

## The YouTube Immersion Therapy

When I started this journey a few months ago, my entire YouTube feed became game development content. I immersed myself in design philosophy while coding, listening to creators like:
- [Thomas Brush](https://www.youtube.com/@thomasbrush) (indie success stories and reality checks)
- [Jonas Tyroller](https://www.youtube.com/@JonasTyroller) (the science of game feel)
- [Aarimous](https://www.youtube.com/@Aarimous) (roguelike design deep dives)
- [Jackie Codes](https://www.youtube.com/@JackieCodes) (Godot-specific wisdom)
- [DevWorm](https://www.youtube.com/@DevWorm) (practical indie dev insights)

Not tutorials, mind you. Working with the Fireship YouTube channel has taught me that tutorial hell is real, and most developers just need concepts, not code-alongs, something he does a great job at. I needed to understand how game designers THINK, not how they type.

Everyone kept saying the same damn thing: "Start small. Build Pong. Make a platformer."

But telling a seasoned developer to make Pong is like telling Gordon Ramsay to make a ham sandwhich. Sure, I could do it, but what would I actually learn?

## Dungeon Supply Co: My "Small" Game That's Actually Perfect

Instead of abandoning everything like so many times in the past, I started designing a new game specifically to teach me what I didn't know: **Dungeon Supply Co.**

The premise? 
We've all crawled our fair share of dungeons, right? We grind and grind for gear, pots, and food for hours before finally attempting the dungeon. How the hell do the dungeon NPCs always have everything that they need??
You're enslaved by an asshole orc who forces you to run a factory that supplies dungeons with everything—swords for skeletons, potions for bosses, and yes, all those ceramic pots that heroes compulsively smash.

It's automation meets subtle dark humor and a bit of irony.

More importantly, it's designed to force me to learn:

- **State Management**: Hundreds of items on conveyor belts without melting CPUs
- **Game Feel**: Making automation satisfying (that sweet, sweet production line dopamine)
- **Art Pipeline**: Expanding on [Mwaayk's excellent 16x16 automation pack](https://mwaayk.itch.io/16x16-automation-asset-pack) with my own sprites
- **Scope Control**: 4-8 week timeline, not 4-8 years of development hell
- **Player Psychology**: What makes "just one more production line" addictive

### Why This Actually Works

Building an automation game teaches fundamental game development skills without the complexity of combat, multiplayer networking, or making sure your netcode doesn't let players phase through walls like interdimensional ghosts.

The technical challenges are real (managing thousands of moving items at 60 FPS), but bounded. The design space is constrained but meaningful. Most importantly, it's a game I'd actually want to play while procrastinating on building my actual dream game.

## The Developer's Paradox: Failing Up

Here's what nobody tells you: As programmers, we're trained to build incrementally. We start with "Hello World," not "Let's rebuild Google from scratch." But the moment passion enters the equation, we immediately try to build our own GSuite replacement for enterprise customers.

My MMORPG isn't dead. In fact, working on Dungeon Supply Co. has made me MORE excited about Thundoria, not less. Every system I implement teaches me something I'll need. Every optimization technique, every player feedback loop, every scene implementation, it's all training for the main event.

## The Real Lesson: Your Dream Game Needs Practice Games

If you're a developer sitting on your own "dream game" idea, here's my advice: **Don't abandon it. Orbit it.**

Build smaller games that teach you specific skills you'll need. Want to make an RPG? Build an inventory system game first. Dream of a shooter? Start with a wave defense game.
Think of it as building your own curriculum where every assignment directly contributes to your final project, except nobody's grading you and you can drink while doing it.

## Join Me on This Beautiful Disaster

I'm documenting everything—the successes, failures, and the times I spent 6 hours debugging only to realize I spelled "strength" wrong. **[Thundoria](https://thundoria.com)** is still happening, and I'm trying to build it in public because apparently I'm a masochist.

The game design is stupidly ambitious:
- Roguelike extraction mechanics where you gamble progression like a degenerate
- Bullet-hell combat that scales from "tutorial grandmother" to "what the fuck is happening"  
- "Just one more floor" addiction that ruins friendships
- No pay-to-win BS, just honest "give me money for cosmetics" capitalism

Meanwhile, Dungeon Supply Co. is teaching me how to actually deliver on that vision without having a complete mental breakdown.

**Want to watch this slow-motion catastrophe?** 
- Sign up for development updates at **[thundoria.com](https://thundoria.com)**
- Watch me learn game dev fundamentals the hardest way possible
- Get early access to both games (whenever the hell they're ready)

## The Bottom Line

Every game developer is right: don't build an MMO as your first game. But also, don't let your dreams die in a folder called "maybe_someday_projects_final_v2_actual_final."
Instead, be strategic. Build towards your dream, not away from it. Learn in public. Fail spectacularly. And remember—even the creators of World of Warcraft probably started by spawning themselves max cash stacks in someone else's terrible code.

Although... how can I expect you to listen to me? I didn't listen, and honestly, I don't really expect anyone else to either. I'm just a guy with a dream and a tendency to overcomplicate things.

Now if you'll excuse me, I have some conveyor belts to optimize. These skeletons won't arm themselves, and my orc overlord is getting bitchy.

---

### Links
*Are you also building a game way above your skill level? Learning game development after years of "real" programming? Let's suffer together!*
Follow the journey at [thundoria.com](https://thundoria.com) and let's fail upward as a community.

I post about my progressions sometimes on [Bluesky](https://bsky.app/profile/patrity.com) and [X / Twitter](https://x.com/ThePatrity) as well.

---

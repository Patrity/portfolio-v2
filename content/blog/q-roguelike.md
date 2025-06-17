---
title: Building a Roguelike Game with Amazon Q
description: A deep dive into using Amazon's AI coding assistant, Q, to build a browser-based roguelike game with Nuxt.js. From initial concept to implementation challenges, this post explores the potential and limitations of AI-assisted development.
date: 2025-06-17
tags:
  - AI
  - Game Development
  - Nuxt
author: Tony Costanzo
draft: false
image: https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q//SS2025-06-17-09.29.27.png
---
## Links
- [GitHub Repository](https://github.com/patrity/q-rogue)
- [Game Demo](https://q-rogue.nuxt.dev)
## The Setup

When Amazon threw down the gauntlet with their AI coding challenge, I couldn't resist. The mission? Build a browser-based game using their new AI assistant, Q. As someone who's been curious about the current state of AI-powered development, this seemed like the perfect opportunity to push the boundaries and see just how far we could go with "vibe coding" - that magical state where you describe what you want and the AI makes it happen.

My weapon of choice? A fresh Nuxt.js project, my go-to framework for web development. I fired up Tabby and was pleasantly surprised to see Q integrate seamlessly with it - I'd half expected it to only work with the built-in terminal. While I noticed Q only offered Claude models (no complaints there, it's my LLM of choice anyway), I was ready to embark on this adventure.

## First Contact: Setting Expectations

I started by spitballing a rough idea for a roguelike game:

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-14.24.20.png)

The initial response was... well, exactly what you'd expect from an eager AI assistant - way too affirmative. I don't need a yes-man; I need honest feedback and alternative suggestions!

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-14.24.20.png)

After some gentle encouragement (okay, I may have talked some shit to the LLM), I finally got the honest feedback I was looking for. Be careful what you wish for, though - the reality check was humbling!

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-14.32.07.png)

## Finding the Perfect Assets

Before diving deeper, I needed some visual assets. I stumbled upon an absolutely gorgeous asset pack on [itch.io by Trevor Pupkin](https://trevor-pupkin.itch.io/tech-dungeon-roguelite) - affordable, high-quality, and perfect for the cyberpunk roguelike vibe I was going for. I dropped it in the root directory and asked Q for its honest opinion about our game design and timeline.

```
Okay check out the asset pack in q-roguelike/TechDungeonAssets I really like this and think we could build a simple roguelike.. We can just do projectile combat, no building.. we can have upgrades like speed, multi projectile (adds +1 at a slight angle each time), health, fire speed, exploding bullets, etc.. We can keep it simple enough I suppose. What do you think about game engine with this design? is it doable in our timeframe? again dont just reaffirm, give honest feedback
```

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-14.54.18.png)

Q suggested we should just yeet a 2d canvas and start building on that. I was certainly hesitant about that considering all of the helpers libraries like Phaser or PixiJS gives us..
![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-14.53.12.png)

## The First Attempt: A Comedy of Errors

The "actual" first attempt was... let's call it educational. The code was non-functioning, mixing Vue 2 Options API inside a Vue 3 Composition API script block. But hey, I was being intentionally vague with my requirements, so I can't blame Claude or Q entirely. One prompt later pointing out the issue, and we had our first error-free pass.

Well... it was _something_:

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-18.18.04.gif)

I'm still not entirely sure what I was looking at, but asking an LLM to parse multiple spritesheets and properly set up sprites with animations is admittedly a tall order.

Before diving into fixing the sprite issues, I noticed Q had done something quite thoughtful - it had taken all the assets I'd dumped in the root directory and organized them nicely in the public folder. Small wins!

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-18.25.14.png)

## The TexturePacker Breakthrough

Then I thought of a way to give more image context.. the TexturePacker app outputs JSON data alongside its spritesheets. If I gave each image and animation a descriptive name, Q should be able to parse and use them correctly... right?

RIGHT!

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-20.04.53.gif)

Suddenly, we had a working run animation and projectiles firing in the direction of my mouse! Sure, my character wasn't facing the right direction and the projectiles were angled incorrectly, but this was genuine progress. This was the point where I thought I'd need to take over completely, but I was curious to see how far Q could go.

## Building the Core Game Loop

Instead of getting bogged down in perfectionism, I asked Q to outline the next steps:

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-20.12.06.png)

Q provided a solid roadmap:

```md
## Priority Order:

1. Collision & Combat System
• Projectile-enemy collision detection
• Enemy health and death
• Basic enemy AI (move toward player)

2. Wave System
• Spawn enemies in waves
• Wave progression with increasing difficulty
• Wave completion detection

3. Roguelike Upgrades
• Upgrade selection screen between waves
• Core upgrades: damage, fire rate, health, speed, multi-shot
• Persistent upgrade effects

4. Game State Management
• Health system for player
• Game over/restart
• Score tracking
```

### Implementing Combat

Starting with collision and combat systems, I prompted: `Okay let's go in order! We can go ahead and implement the projectile hits, enemies chasing, health system, and death animations!`

The first attempt introduced some bugs - I couldn't shoot and spawned with 0 HP. By the time I died, my health was between -5 and -10. Classic game development!

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-20.20.42.gif)

One clarifying prompt later: `I'm ready to move on but we do have some issues. I'm not able to shoot but I think it may be because I spawn with 0hp and by the time I die, my hp is -5 - -10.. I think we need some delay between death and restarting so that the death animation can play as well. Finally I see a lot of warnings in the console from the animation manager stating that our animation keys already exist.. Are we reinitializing these unnecessarily?`

And just like that, we had a functioning combat system! Complete with health management, incremental damage, immunity periods, and even a score system:

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-20.30.29.gif)

### Code Quality Check

At this point, I hadn't really examined the code beyond fixing that initial Vue 2/3 issue. I was expecting a thousand lines of spaghetti. To my surprise, we had only ~450 lines of surprisingly clean code. All in a single component (not ideal, but workable), including ~20 lines of CSS and 10 lines of templating. The JavaScript was well-structured, without duplicated logic, and documented concisely - not in that typical verbose AI fashion. Color me impressed!

### The Wave System

Next up: the wave system. One prompt. Just one prompt, and boom:

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-13-20.46.48.gif)

I was genuinely impressed at this point. We had a working wave system with progressive difficulty in a single iteration.

## Hitting the Wall: Context Limits and Collision Detection

The next challenge - implementing the upgrade system and tilemap collision - is where things got rocky. Q struggled. Hard. My codebase ballooned from ~500 lines to about 1,000 lines. Despite having all the tilemap data in JSON format, Q couldn't get the collision layers working properly.

It loaded the map and registered all the layers correctly, but when it came to setting up collision detection, we went in circles. Q eventually decided that Phaser's built-in collision system was broken (spoiler: it wasn't) and attempted to write its own per-tile collision system. Yikes.

I tried to guide it back to using Phaser's built-in features, but we'd hit the classic AI coding limitation: context window exhaustion. Under 1,000 lines of code and we were already having fundamental issues. Q started creating basic TypeScript errors that prevented the page from running entirely.

Recognizing the signs, I asked Q to strip out all the collision work so I could handle it myself. I created a git commit (should have done this earlier!) and prompted Q to create documentation to maintain high-level context.

## Taking Back Control

I performed a major refactor, splitting the monolithic component into separate TypeScript files and Phaser scenes. With the help of [Ourcade TV's](https://www.youtube.com/@ourcadetv) excellent YouTube tutorials, I implemented proper collision detection myself.

This created a new problem: the basic straight-line enemy AI couldn't navigate around walls. Time to see how Q handled pathfinding:

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-14-18.07.34.gif)

Well... the enemies were certainly moving, just not in any useful direction. When I clarified that I needed proper pathfinding, Q implemented A* pathfinding with heuristic functions for 8-directional movement. The first attempt was too precise, causing enemies to overshoot waypoints and backtrack:

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-14-18.11.16.gif)

But third time's the charm! In just three prompts, Q had implemented fairly sophisticated pathfinding:

![](https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/render/image/public/tech-hive/blog/amazon-q/SS2025-06-14-18.18.50.gif)

## Pushing Forward and Finding the Limits

At this point, we'd essentially completed the original goal, but I was feeling inspired. I've had this concept for a browser-based MMO/roguelike hybrid brewing for a while, and this seemed like the perfect opportunity to explore it further.

I took more control from here, using Q as a coding assistant rather than the primary developer. We added more enemy types, complex wave patterns, tiered upgrades, and other roguelike elements. But the final straw? Enemy projectiles.

Getting enemy projectiles to move correctly, deal damage, and not freeze the entire game took over 10 prompts. I never successfully got Q to implement this feature without game-breaking bugs.

## The Verdict: Impressive but Not Ready for Prime Time

Let me be clear: I was genuinely impressed with how quickly Q created a functioning game that felt like a real project worth iterating on. The initial results had me excited about the possibilities of AI-assisted development.

**But here's the bottom line:** I ended up with a pile of unfamiliar, difficult-to-maintain code with a clunky development pattern that I didn't want to continue building on.

As a reasonably experienced developer, I had to guide Q toward correct solutions fairly early in the process. I'm not confident that less experienced developers would be able to provide the same guidance when things go sideways.

This isn't really a criticism of Q specifically - it's more about the current state of AI coding assistants in general. Language models will undoubtedly improve, but will we ever be able to go completely hands-free on larger projects? I doubt it. Context windows need to expand dramatically, and tools like Q need more sophisticated agentic processes to prevent the accumulation of "AI slop."

## Final Thoughts

I'm glad Amazon put this challenge out there. It gave me a valuable opportunity to assess the current state of AI coding assistants in a real-world scenario. The technology is impressive and shows tremendous promise, but for now, I'll stick with using LLMs through web interfaces and copilot-style IDE extensions for specific tasks rather than full project development.

I'm not quite ready to hand over the reins completely - but I'm excited to see where this technology goes. The future of AI-assisted development is bright, even if we're not quite there yet. Who knows? Maybe in a year or two, I'll be writing a follow-up post about how I built an entire MMO using just voice commands and interpretive dance.

Until then, happy coding - whether you're doing it with AI assistance or good old-fashioned keyboard mashing!
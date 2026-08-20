---
title: "I Gave an AI Agent the Keys to Navisworks, and Five Trades of Takeoff Took Four Days"
seoTitle: "AI Agent BIM Takeoff: Navisworks & Revit Data Extraction"
description: "Automated BIM takeoff platforms assume your model followed the rules. Real models never do. So an AI agent drove Navisworks headless.. and five trades of takeoff took four days."
date: 2026-08-19
sitemap:
  lastmod: 2026-08-19
tags:
  - AI
  - Agents
  - Construction
  - BIM
author: Tony Costanzo
draft: false
image: /images/blog/automated-bim-takeoff/hero.webp
imageWidth: 1920
imageHeight: 1075
---

## Links
- [The post where I pitched this whole idea](/blog/construction-agents)
- [Claude Code](https://claude.com/claude-code)
- [Autodesk Platform Services](https://aps.autodesk.com)

## The Model Arrived Before Any of the Answers Did

A 923 MB Navisworks model landed in my lap on a large industrial job with one question attached: what's actually in there?

Not "run the takeoff." Not "export the schedules." Just.. what is in this thing? Because nobody fully knew. The model was a coordination file stitched together from dozens of sources: Revit models from multiple vendors, fabrication models, Tekla steel, raw CAD geometry that somebody imported early in the job and never spoke of again.

I'd love to tell you the first hour was productive. The first hour was me discovering that the .nwf file everyone emails around is a pointer file.. a shortcut with delusions of grandeur. The actual geometry and properties live in the .nwd. I've been around these files for years, and the AI agent is the one that figured that out, which is exactly as humbling as it sounds.

## The Part Where I'm Supposed to Buy a Takeoff Platform

The conventional answer here is automated BIM takeoff software. There's a whole industry of it, the demos are genuinely slick, and every one of them shares the same load-bearing assumption: that your model followed the rules.

- **Classification exists.** The platform wants elements mapped to MasterFormat or Uniformat so its rules can grab them. Your model has whatever classification the modeler was paid to include, which rounds to none.
- **Properties are populated.** A field existing on an element is not the same as a field having a value in it. Platforms tend to treat those as the same thing.
- **Families are modeled cleanly.** No nesting weirdness, no wrapper elements, no geometry hiding two levels below the thing that carries the name.
- **Format hops are free.** Every export to IFC, every republish, every "let me just save this as.." quietly drops data on the floor.

Real coordination models fail all four. Not because the modelers are bad, but because the model was built to answer "does the pipe hit the steel?" and takeoff was somebody else's problem. The data you need is usually in there somewhere.. it's just not where any rule-based platform was told to look.

So instead of buying a platform that expects a clean model, I pointed [Claude Code](https://claude.com/claude-code) at the dirty one.

## Extract Everything, Then Go Spelunking

Step one was getting the data somewhere an agent could actually interrogate it. We built a small extractor that walks the entire Navisworks object tree and dumps it into SQLite: every item, every property, every selection set membership. Three tables. 77,403 objects.

That flipped the whole problem. Instead of configuring rules upfront and praying the model matches them, the agent explores what's actually there and builds the takeoff around reality.

And reality had opinions:

- **Names are a trap.** Searching by object name finds the type nodes, but the geometry lives on child leaf nodes underneath them. Count the named nodes and you're counting labels, not steel.
- **The best classification wasn't a standard.** The electrical scope came from a fabrication add-in that stamps its own category property on every instance it touches. That one vendor-specific property was the authoritative inventory of the entire electrical model. No off-the-shelf platform ships knowing that property exists. The agent found it by reading what was actually on the objects.. no magic, just grep with a paycheck.
- **Whole scopes hid in other formats.** The structural steel takeoff came out of a Tekla fabrication IFC that the model's own search sets never included. Six search sets, zero of them knew the steel existed.

## Five Trades in Four Days

Here's the part I still have trouble saying with a straight face. Piping, concrete, structural steel, electrical, and equipment.. the full quantity extraction for a scope I can only legally describe as "a lot of commas".. came out of that database in four working days.

![Timeline chart: five trades of takeoff milestones across four working days in July 2026, extracted from one 923 MB Navisworks model holding 77,403 objects. Day 1 piping and concrete, day 2 steel and electrical inventory, day 3 CSI classification, day 4 electrical quantities and equipment imports.](/images/blog/automated-bim-takeoff/takeoff-timeline.svg)

Day one was piping and concrete. Day two, the steel turned up in the Tekla file and the electrical family inventory came together. Day three, every line got mapped to CSI codes. Day four, the electrical quantity basis settled and the equipment imports landed. Ask anyone who's done this manually what that calendar usually looks like. Then ask them to say it without swearing.

The speed isn't the agent typing fast. It's that the agent never waits. While I reviewed one trade's output it was already interrogating the next model, and every "hang on, why are there two elbow counts?" got chased down the same afternoon it was asked instead of parked in next week's coordination meeting.

And no, fast garbage is still garbage. Which brings me to the elbows.

## The 7.2% of My Conduit That Didn't Exist

Here's the war story that justifies the paranoia.

The conduit elbows in the electrical model were nested families. One physical elbow comes through the tree as two nodes sharing a single GUID: a wrapper with no geometry, and a child that actually has the geometry. Both nodes carry identical dimension properties.

Sum the dimension property across everything that has it (which is exactly what a rules engine does) and every elbow counts twice. Roughly 13,000 rows for 6,588 real elbows. Our published developed length was inflated 7.2% and looked completely plausible the entire time.

The fix was one filter on a geometry flag. Finding it required somebody.. or something.. to get suspicious about why the elbow count didn't reconcile against the GUID count. A takeoff platform would have ingested that model and handed me the wrong number with total confidence, because the number came from real properties on real elements. It was just counted twice.

That suspicion is now standing policy. The agent's validation habits, learned one burn at a time:

- **A uniform value is a red flag,** not a convenience. If every element reports the same length, someone defaulted a parameter.
- **A field existing is not a field populated.** Check fill rates before trusting a property.
- **Never sample with MIN or MAX** to see what a field looks like. The weird rows live at the extremes.
- **Reconcile everything against the model.** Our final estimate-to-model pass resolved 96.4% of keyed rows to a physical object, and the gap had to be explained category by category before anyone called it done.

## The GUID That Wasn't Unique

My favorite discovery, in the way a root canal is a favorite.

We needed a durable key to link takeoff rows back to model objects, because the model republishes constantly and a takeoff that dies on every republish is a very expensive screenshot. The obvious candidate was the IfcGUID. It's a GUID. Globally unique is the entire job description.

1,493 collisions.

Copy-paste an element in Revit and the "globally unique" identifier comes along for the ride. The thing that actually survives republish after republish is Revit's External ID, which has a bonus party trick: its last 8 hex characters decode straight to the element ID. The agent worked all of this out, migrated every artifact to the new key, and wrote itself a rule prohibiting CAD-sourced IDs entirely.. because DWG entity handles reshuffle every time the vendor re-exports. (Ask me how we know.)

## The Cable Schedule That Was Never a Deliverable

This is the part that changed how I think about the whole exercise, because it stopped being about takeoff.

Once the extraction pipeline existed, we asked it for something that didn't exist anywhere as a deliverable: a full cable schedule, derived from the modeled cables and gear. From-to pairs, routed lengths, the works. Data we would have otherwise paid a vendor to produce, or lived without.

Then it got better. A second agent, consuming that schedule for a completely different workstream, audited it and filed a punch list back to the first one. It had caught three switchgear lineups where unit A claimed it was fed from unit B while unit B claimed it was fed from unit A.. a cycle no electrical feed arrangement can physically produce. It even worked out the detection signature: a cable leg 20 to 50 times longer than the gear spacing, paired with a reciprocal row. The producing agent verified the bug, fixed the attribution logic, and regenerated the deliverables.

I have AI agents filing QA punch lists against other AI agents' deliverables, and I need you to know the punch list was better documented than most I've received from humans.

![Sequence diagram of the agent QA loop: the extraction agent ships a cable schedule and one-line diagrams, the scheduling agent audits them and files a punch list flagging 3 lineups with impossible mutual feed pairs, the extraction agent confirms the loop-tail attribution bug and ships regenerated CSVs, and the scheduling agent rebuilds its imports](/images/blog/automated-bim-takeoff/agent-qa-loop.svg)

## Then We Let It Actually Drive

Everything so far was reading. The finale is writing.

Navisworks ships a full .NET API, and it turns out you can launch Navisworks Manage headless with that API live in-process. No GUI, no clicking, just programmatic control of the real application. So the agent stopped extracting data from the model and started putting data into it:

- **A 4D TimeLiner simulation,** built entirely by the agent: 400 schedule tasks wired to 402 selection sets, painting geometry red, yellow, or green by activity status with a transparency treatment so the untouched scope ghosts out.
- **A pre-flight lock check,** because NWD files lock while the Navisworks GUI has them open, and there is a special kind of despair in a 9-minute headless job failing at the final save. It now fails in 4 seconds with a message telling me to close Navisworks. The most valuable feature in the whole pipeline is a check that tells me I left a window open.
- **Cloud model access** over [Autodesk Platform Services](https://aps.autodesk.com), so the agent pulls model versions and history straight from the CDE instead of waiting for someone to email a 923 MB file. (People will still email the file. Some things are load-bearing traditions.)

An AI agent authored a 4D construction simulation inside Navisworks while I drank coffee and watched the model change colors. I've had worse afternoons.

## The Platform Was Never the Point

Here's the kicker: none of this was a platform, and that's why it worked. We eventually templated the whole pipeline.. extractor, database, validation habits, import formats.. and stood it up on a second, completely unrelated project in about a day.

The takeoff platforms aren't wrong to want clean models. Clean models would be lovely. But an agent doesn't need the model to follow the rules, because it can read the model the way a person would: skeptically, one weird property at a time, asking why the elbow count doesn't match the GUID count at 2am without billing overtime.

Back in [June](/blog/construction-agents) I wrote that the thing holding this industry back wasn't the models or the AI.. it was imagination and the willingness to actually build. That post was the pitch. This one's the receipt.

And yes, I now open the .nwd on the first try. Growth.

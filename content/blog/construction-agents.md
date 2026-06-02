---
title: "On an EPC Job, 'Sure, No Problem' Is the Most Expensive Sentence Onsite. An Agent Would Have Checked the Contract First."
seoTitle: "AI Agents for EPC: The Hidden Cost of 'Sure'"
description: "A client asks your superintendent for a small favor. He says yes. Months later it's a claim nobody can reconstruct. The case for AI agents on EPC jobs."
date: 2026-06-02
sitemap:
  lastmod: 2026-06-02
tags:
  - AI
  - Agents
  - Construction
  - EPC
  - Project Controls
author: Tony Costanzo
draft: false
image: /images/blog/construction-agents/hero.webp
---

## The Tuesday Morning Favor

A client rep walks up to your superintendent on a Tuesday morning and asks him to relocate a few skids of pipe spool from laydown yard 3 over to laydown 7. Small ask. Friendly tone. The kind of thing you say yes to without thinking, because they're the customer, and keeping the customer happy is sort of the entire job.

So he says sure.

He pulls two fitters and an operator off their IWP, grabs a forklift, and spends the better part of the day moving material that, as it turns out, was never in his scope to touch. No harm done. Good relationship, happy client, easy day.

Now run that Tuesday back every week for eight months.

That's the part nobody clocks in the moment. The single favor is free. The pattern is a number with commas in it, and by the time anyone goes looking for that number, the crew that did the work has rolled off, the timesheets are buried, and the date it started is a guess.

## What Your Super Is Actually Supposed to Do

Here's the dirty secret of that "small favor": there's a whole governance loop that's supposed to fire before that first skid ever moves. On a well-run EPC job, the superintendent is supposed to stop and run the play:

- **Call the commercial manager:** "Is relocating client material even in our scope of work, or is this a change?"
- **Loop in change management:** "If it's a change, do we issue an FCN, do we back charge, how many hours are we eating before this becomes a claim?"
- **Ping project controls:** "Give me the unit rates so I can put an actual estimate against this instead of a shrug."

That's the textbook. That's what the org chart promises happens.

You already know what actually happens.

## Nobody Convenes a Meeting to Move Some Pipe

No superintendent on Earth is going to halt a friendly client request to spin up a three-party commercial review over a forklift and an afternoon. It would feel insane. It would make him look like the contractor who lawyers up over a handshake. So he eats it, because eating it is cheaper than the awkwardness.. today.

The cost doesn't disappear. It just gets deferred to the worst possible venue: a claims meeting six months later where everyone is trying to reconstruct reality from memory.

- Which crew actually did the work? (They charged to their normal cost codes.)
- How many times did this happen? (Vibes.)
- What were the loaded rates back in Q1? (Let me find the right rev of the estimate.. eventually.)
- Was it ever in scope to begin with? (Somebody go read 400 pages of contract.)

The favor was free. The forensic accounting to claw it back is anything but. We absorbed the labor, then we paid a second time in margin trying to prove the labor happened.

## What If He Could Just Ask?

Picture the same Tuesday. Client makes the same ask. Except now the super pulls out his phone, opens a chat, and types:

*"Client wants me to relocate the spool in laydown 3 to laydown 7. Is that in our scope?"*

And the agent answers. Not with a vibe. With the actual contract clause, the relevant RFIs, whether this is covered scope or a change, a rough hours estimate against the current rates, and a one-line "if you do this, log it against change event so-and-so so we can back charge it."

Done. Ten seconds. He still gets to say yes to the client and keep the relationship warm. The difference is the company is now protected on the back end, the work is logged the second it happens, and there is no claims-meeting archaeology in six months because the paper trail wrote itself.

The super didn't become a commercial manager. He just got one in his pocket.

## The Agent Already Has the Whole File

Here's the thing.. every input that governance loop needed already exists on the project. It's just scattered across a dozen systems and nobody can pull it all at conversation speed. An agent can.

Give it the context that a senior commercial lead would have in their head after years on the job:

- **The contract and all its exhibits** so "in scope" is a lookup, not an argument
- **Every RFI and its response** so the agent knows what's already been clarified
- **Every change order and FCN** so it knows what's already been priced and approved
- **The current unit rates and rules of credit** so any estimate ties back to how the project actually earns and measures progress
- **The schedule and the IWP backlog** so it knows what a crew-day actually costs you in float

That's not science fiction. That's retrieval over documents you are legally required to keep anyway. The contract isn't going anywhere. The RFI log isn't going anywhere. We're just letting people *talk* to it instead of spelunking for it.

## It Really Doesn't Stop at the Superintendent

Once you see it for the commercial use case, you start seeing it everywhere on the job. The superintendent agent is just the demo. The franchise is specialized agents, each armed with the right documents and the right tools to search them:

- **Quality:** an agent that knows the ITRs, the spec, and every lesson learned from the last three jobs, so the same weld rejection doesn't get re-discovered a fourth time
- **Completions:** an agent that can tell a turnover coordinator exactly which punch items are blocking a system walkdown and which subsystem they belong to
- **Estimating:** an agent that pulls historical productivity and actuals so the next bid isn't built on someone's gut and a spreadsheet from 2019
- **Project controls:** an agent that can answer "what's our earned vs burned on CWP-1400" without three people exporting reports at each other

Different domain, same shape every time. The knowledge exists. The expert who could find it fast is busy, expensive, or rolled off to the next project. So we hand the expertise to everyone, on demand, in plain language.

## The Real Villain Is a Hundred SharePoint Sites

Let's name the actual enemy here, because it isn't a lack of information. We are drowning in information.

The enemy is a hundred SharePoint sites with folder structures only the guy who built them understands (and he left). It's the procedure doc that exists in four revisions across three sites, two of which quietly contradict each other. It's "the answer is definitely in there somewhere," which is functionally the same as the answer not existing when a crew is standing around at 7am waiting on a call.

That's the gap. Not knowledge. Access to knowledge at the speed the field actually moves.

We don't need more documents. We've got documents coming out of our ears. We need to stop making a field engineer play hide-and-seek with a 12-level folder tree to find out whether he's allowed to move some pipe.

## So, Yeah, I Want to Build This

The whole idea fell out of one conversation, which is a deeply on-brand way for me to acquire a new obsession. I spent years living in AWP, work packaging, and project controls before I spent years building RAG pipelines and agents, and I'd somehow never let the two halves of my brain talk to each other until someone asked the right question.

The pitch is almost embarrassingly simple. Take the thing every EPC company already does badly with people and SharePoint, and do it well with a conversation. Protect the margin. Run leaner. Stop paying twice for the same crew-day.

The problem with implementing these solutions is not the models, the AI companies, the RAG strategies or anything else. The problem is the lack of imagination and investing the time to implement them.

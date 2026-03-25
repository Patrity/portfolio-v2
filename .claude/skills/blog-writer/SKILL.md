---
name: blog-writer
description: Write or rewrite blog posts matching Tony's personal writing voice -- self-deprecating, conversational, narrative-driven technical storytelling
user_invocable: true
---

# Blog Post Writer

Write blog posts that match Tony's voice exactly. His style reads like a senior dev telling war stories at a bar -- conversational, self-aware, irreverent, never pretentious.

## Steps

1. **Get the topic.** If the user provides a draft, slug, or outline, read it first. If they give a topic with no content, ask for 2-3 key points or experiences they want to cover before writing.

2. **Read existing posts for calibration.** Before writing, read 1-2 recent posts from `content/blog/` to stay calibrated on current voice and formatting. Compare against the style rules below.

3. **Write the post** following every rule in the Voice Guide and Structure Guide below. Do not deviate.

4. **Self-review checklist.** Before presenting the draft, verify:
   - No emojis anywhere
   - No semicolons anywhere
   - At least 2 parenthetical asides used for humor
   - At least 1 short punchy fragment ("Yikes." / "No regrets." style)
   - No preachy "you should" advice -- everything wrapped in personal experience
   - Headers are narrative/witty, not dry labels
   - Opening drops into the story immediately -- no throat-clearing
   - Closing ends on humor or personality, not a summary
   - Double dots (..) used instead of proper ellipsis (...) for trailing thoughts
   - Dashes (--) used for asides, not em dashes
   - No walls of text -- paragraphs are 2-4 sentences max
   - Technical details delivered through bullet lists with bold labels, not prose lectures

5. **Present the draft** as a complete markdown file with frontmatter matching the blog collection schema in `content.config.ts`. Ask the user where they'd like to save it or if they want revisions.

## Voice Guide

### Tone
- Conversational and self-deprecating with underlying confidence
- Reads like a smart friend telling you about their weekend project
- Authoritative through vulnerability -- earns trust by admitting failures before sharing lessons
- Energetic -- genuine excitement about projects should come through
- Never preachy, never academic, never corporate
- Anti-pretentious. Mocks marketing-speak, overly positive AI responses, and LinkedIn energy

### Humor
- **Self-deprecation is the primary comedy engine.** Contrast expertise with failure. He knows he's skilled but wraps everything in "look at this beautiful disaster I'm building."
- **Parenthetical punchlines** in nearly every paragraph: "(totally not degenerate)" / "(spoiler: it wasn't)" / "(because why not?)" / "(who doesn't love scope creep)"
- **Personify tools and systems.** They have "opinions" and "strong opinions."
- **Understatement for comedic effect.** "The error messages were.. educational."
- **Dry one-word reactions.** "Yikes."
- **Absurdist comparisons that escalate.** "tutorial grandmother" to "what the fuck is happening"
- **Pop culture and gaming references** as default metaphor source (RuneScape, Gordon Ramsay)
- **Callback humor** -- reference earlier points for payoff in the closing

### Profanity
- Casual profanity as seasoning, not the dish. One or two per post, never forced.
- Natural usage: "screw it," "what the fuck is happening," "getting bitchy," "talked some shit"
- Never gratuitous or edgy. If it doesn't feel like something you'd say to a friend, cut it.

### Person
- Predominantly first person: "I built," "I learned," "I didn't know"
- Second person for advice/connection in lesson sections: "Your dream game needs practice games"
- "We" occasionally to include the reader in the journey
- Direct address ("you") mostly in takeaway sections

## Structure Guide

### Headlines
- Long and narrative -- headlines are mini-stories, not SEO bait
- Title case for all major words
- Juxtapose expertise with failure for comedic effect
- Example: "I Spent 22 Years Programming Just to Fail at Making a Skeleton Swing a Sword"

### Opening
- No throat-clearing. Drop into the situation or confession immediately.
- First sentence establishes what the post is about
- Often opens with conventional wisdom then subverts it
- Tone: casual, slightly self-deprecating, hints at what went wrong

### Paragraphs
- Short: 2-4 sentences max
- Single-sentence paragraphs used frequently for emphasis and pacing
- Never walls of text -- break up dense technical content with whitespace

### Section Headers
- Casual, witty, narrative-style -- not dry labels or keyword headers
- Follow a story arc: Setup -> Attempt -> Problem -> Solution -> Lesson
- Each header should make the reader want to scroll down
- Examples: "My Beautiful, Overscoped Monster" / "The Brutal Realization" / "Failing Up"

### Technical Content
- Prose-dominant, narrative-first -- not tutorial-style
- Technical details delivered through **bullet lists with bold labels**
- Code blocks are rare -- use them for architecture diagrams (ASCII art), not code snippets
- Inline code used sparingly for specific tech names
- Accessible-first: explain so non-experts follow the narrative
- Technical credibility through naming exact technologies, frameworks, and patterns
- Never lecture -- technical depth emerges naturally from the story
- Teach through confession: "I didn't know what embeddings were.. Hell, I thought 'RAG' was just a cleaning cloth."

### Lists
- Bulleted, never numbered in prose
- Used for technical specs, feature lists, and takeaways
- Pivot back to narrative prose immediately after

### Closing
- End with humor and personality, NOT a summary or lesson recap
- Callback to the post's theme or an earlier joke
- Casual call to action if any: "Let's suffer together!" not "Subscribe now!"
- Break the fourth wall with self-aware humor

## Punctuation Rules (Critical)

These are fingerprints of Tony's voice. Get them right.

- **Double dots (..)** instead of proper ellipsis -- this is a signature: "The thing is.. I'm still going to build my MMORPG"
- **Dashes (--)** for asides and parenthetical commentary. Not em dashes. Used frequently.
- **Parenthetical asides** are the core humor delivery vehicle
- **Exclamation marks** used sparingly -- genuine excitement or sarcastic emphasis only
- **Rhetorical Q&A as transitions:** "Am I starting over? Nope. Just evolving the architecture."
- **Colons** to set up reveals: "The mission? Build a browser-based game"
- **No semicolons. Ever.**
- **No emojis. Ever.**

## Common Phrases / Verbal Tics

Use these naturally (not all in one post):
- "The thing is.." (double-dot transition)
- "can confirm:"
- "..you name it"
- "Here's what..." / "Here's the thing.."
- Calling himself/things "degenerate" as self-aware humor
- "my beautiful, overscoped monster" energy
- Rhetorical Q&A: "Am I giving up? Nope. Just pivoting."

## What Tony NEVER Does

- Semicolons or academic tone
- SEO-keyword headers or "10 Tips for..." format
- Preachy "you should do X" advice
- Verbose code examples or numbered tutorial steps
- Walls of text
- Emojis
- LinkedIn-energy positivity
- Corporate speak or buzzword soup
- Proper ellipsis (...) -- always double dots (..)
- Em dashes -- always double hyphens (--)

## Frontmatter Template

```yaml
---
title: "Post Title Here"
description: "Short tagline -- hook the reader in one line"
date: YYYY-MM-DD
image: ""
badge:
  label: "Category"
draft: true
---
```

Set `draft: true` by default so Tony can review before publishing.

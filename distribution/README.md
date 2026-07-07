# Distribution

Working files for blog post distribution — source briefs and per-platform social
variants. One folder per post slug, matching `content/blog/<slug>.md`.

**This directory is gitignored.** The repo is public and these files contain
unpublished briefs, personal brain dumps, and marketing notes. Do not remove it
from `.gitignore` without scrubbing the contents first.

## Layout

```
distribution/
  <slug>/
    brief.md            source material / brain dump the post was written from
    image-prompts.md    hero image prompt variants + which one was chosen
    devto.md            dev.to cross-post (published: false until posted)
    linkedin.md         LinkedIn post body + first-comment link + posting notes
    tweet.md            X post + link reply + posting notes
    linkedin-stats.png  branded stats card attached to LinkedIn/X posts
```

Not every post has every file — only what was actually produced for it.

## Conventions (learned the hard way)

- **LinkedIn:** text post + stats card image. Blog link in the FIRST COMMENT,
  never the body. No carousels — they underperformed badly.
- **X:** link goes in a self-reply, never the tweet body. Attach the same stats
  card. Verify ≤280 chars (URLs count as 23).
- **dev.to:** `canonical_url` back to the blog, cover from the live hero URL,
  chart images must be PNG (their proxy is unreliable with SVG). Best window:
  Tue-Thu 7-9 AM ET.
- The full workflow lives in `.claude/skills/blog-cycle/SKILL.md`.

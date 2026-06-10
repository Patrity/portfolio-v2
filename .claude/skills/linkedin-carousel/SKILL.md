---
name: linkedin-carousel
description: >-
  Build a branded LinkedIn document carousel (a multi-slide PDF) from a blog
  post, announcement, or set of findings, styled in the TechHive Labs identity
  and exported print-ready. Use this whenever Tony wants a "carousel", "document
  post", "PDF slides", "swipeable slides", "slide deck for LinkedIn", or wants to
  turn a blog post / set of stats into something visual to drive LinkedIn reach
  — even if he doesn't say the word "carousel". The output is a 4:5 (1080x1350)
  PDF rendered from an HTML template via headless Chrome.
---

# LinkedIn Carousel Builder

LinkedIn **document posts** (uploaded PDFs that render as swipeable slides) are the
highest-reach native format right now. This skill turns a blog post or a set of
findings into a polished, on-brand carousel without designing from scratch each time.

The approach: fill in a styled HTML template, render it to PDF with headless Chrome,
and visually verify before handing it over. The template carries the TechHive Labs
brand so every carousel looks like part of the same family.

## Workflow

1. **Get the source.** Usually a blog post in `content/blog/`. Pull out the hook, the
   2-4 strongest data points, and the takeaway. If the source is thin, ask Tony for the
   key stats — a carousel lives and dies on having real numbers, not filler.

2. **Plan the slides.** Aim for **8-10 slides, one idea each**. The arc that works:
   - **Cover** — the hook as a big statement (the same line you'd open the LinkedIn post with)
   - **Context / the question** — why this matters, framed for the audience (Tony's
     LinkedIn is construction + tech, not homelab — angle it toward business stakes:
     cost, data ownership, decision-making, not GPU specs)
   - **Setup** — what was tested / built, briefly
   - **Stat slides** — one big number per slide (this is the payload; see the `stat` layout)
   - **Takeaway** — the quotable thesis line
   - **CTA** — "full writeup → link in the comments" (never a bare URL on a slide)

   Each table from a blog post should collapse into **one big stat on its own slide**, not
   a reproduced grid. The detail stays in the article; the carousel sells the story.

3. **Build the HTML.** Copy `assets/template.html` to a working dir (e.g. `carousel/`)
   and replace the slide sections. The template has a reusable CSS system and one example
   of each layout (`cover`, `stat`, `vs` comparison chips, `ticks` list, `quote`, `cta`).
   Keep the `<section class="slide">` wrapper, the footer, and the slide counter on every
   slide. Update the counter (`01 / 09`) and total to match the real slide count.

4. **Render to PDF.** Run the bundled script (it also renders preview PNGs):
   ```bash
   bash .claude/skills/linkedin-carousel/scripts/render.sh carousel/carousel.html
   ```
   It produces `carousel.pdf` next to the HTML and a `contact.png` contact sheet.

5. **Verify visually.** Read the `contact.png` contact sheet (and zoom into any
   text-heavy slide). Check: web fonts actually loaded (Teko headers, mono numbers — if
   they fell back to a serif, the render didn't wait long enough), no text clipping off
   the edges, footers and counters consistent. Fix the HTML and re-render until clean.
   **Always look at the rendered output — never hand over a PDF you haven't seen.**

6. **Deliver + advise.** Send the PDF with `SendUserFile`. Remind Tony to post it as a
   **Document** post (not image/video), give it a title (the title shows on the carousel),
   write the text post natively, and drop the blog link as the **first comment** — external
   links in the post body cost ~60% reach on LinkedIn.

## Brand (already baked into the template)

Don't reinvent these — they're the TechHive Labs identity and live in the template CSS.

- **Background:** near-black green-tinted (`#070b07`) with soft green radial glows
- **Greens:** `#46c211` (bright accent), `#39a10e` (core), `#1d520a` (dim)
- **Fonts** (Google Fonts): **Teko** condensed for headers (uppercase), **JetBrains Mono**
  for the big stat numbers and labels, **Archivo** for body copy
- **Motifs:** faint circuit-grid + corner circuit traces (echoes the blog hero style),
  subtle grain overlay, slide counter + `TONY COSTANZO / TechHive Labs` footer

## Format specs (why they're set this way)

- **4:5 portrait, 1080x1350** — takes the most vertical space in the LinkedIn mobile feed,
  which is the whole point of a document post. Set via `@page { size: 1080px 1350px }`.
- **Headless Chrome render**, not a screenshot tool, because the template uses web fonts
  and CSS gradients that need a real browser. The render script passes
  `--virtual-time-budget=12000` so the Google Fonts finish loading before the PDF is
  captured — the single most common failure is fonts falling back when this is too short.
- The grain/gradient overlays rasterize, so the PDF can land around ~25-30MB. That's fine
  (LinkedIn allows 100MB). If a smaller file is wanted, drop the `.grain` overlay and the
  heavy radial gradients in the CSS and re-render — it drops to a couple MB.

## Files

- `assets/template.html` — the brand carousel scaffold. One example per layout, ready to fill in.
- `scripts/render.sh` — renders HTML → PDF via headless Chrome and builds a preview contact sheet.

## Dependencies

- Google Chrome at the standard macOS path (`/Applications/Google Chrome.app`)
- `pdftoppm` and `magick` (ImageMagick) for the preview contact sheet — both via Homebrew.
  If they're missing the PDF still renders; only the preview step is skipped.

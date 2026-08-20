# Phases 3–4 — Inline images & hero

## Phase 3 — Inline images

- Convert photos to webp: `magick <src> -quality 85 public/images/blog/<slug>/<name>.webp`.
  Photos-app derivative paths are often 1024px versions — ask for the full-res
  export if the image matters, and note it as a follow-up if you proceed anyway.
- Embed with the `ContentImage` MDC component (`app/components/ContentImage.vue`):

  ```md
  ::content-image{src="/images/blog/<slug>/rig.webp" alt="<descriptive>" caption="<Tony-voice caption>"}
  ::
  ```

  It renders a captioned figure with a click-to-enlarge lightbox (UModal,
  closes on X/Esc/overlay). Captions are voice real estate — write them funny.

## Phase 4 — Hero image

1. Invoke the `blog-image-generator` skill → 3 prompt variants on the TechHive
   base style (isometric low-poly, dark, green #39a10e). Recommend one and say
   why. Save all variants to `distribution/<slug>/image-prompts.md` and mark
   which was chosen — needed again for regeneration and for style continuity
   across posts.
2. **Preferred path (proven on automated-bim-takeoff, 2026-08-19): generate on
   the rig** via MyMind's `generate_image` tool (ComfyUI Qwen-Image) at
   1600x900 with a negative prompt like "text, letters, words, watermark,
   people, hands, photorealism, blur, pastel colors". No watermark to crop.
   Gotcha: the MCP call times out at ~60s while the render takes ~7 min on the
   shared PNY — the job still completes. Poll `http://192.168.2.25:8188/queue`
   until empty, read the filename from `/history?max_items=2`, download via
   `/view?filename=...&type=output`. Generate the top 2 variants and pick.
   Fallback: Tony generates externally (Gemini) — then the two steps below.
3. **Gemini only — ask for the full-size original** (~2752×1536; the chat
   preview is downscaled) and **remove the sparkle watermark by cropping, not
   patching**: left-anchored 16:9 crop that excludes the bottom-right sparkle.
   Pixel-surgery on AI art fails — the geometry is never as regular as it looks.
4. Finalize: resize to **1920 wide** (site standard, other heroes are
   1920×1026–1080), webp, start `-quality 88` and step down until **<150KB**.
   Save as `public/images/blog/<slug>/hero.webp`, set frontmatter `image:`.
5. Render-check the result at full size before calling it done.

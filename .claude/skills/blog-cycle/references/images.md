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
   why. Tony generates externally (Gemini) and returns an image.
2. **Ask for the full-size original** (Gemini outputs ~2752×1536). The chat
   preview is a downscaled copy and patches/crops on it waste the resolution.
3. **Remove the sparkle watermark by cropping, not patching.** Find the sparkle
   (bottom-right region), check where the actual composition ends, and take a
   left-anchored 16:9 crop that excludes it. Pixel-surgery on AI art fails —
   the geometry is never as regular as it looks.
4. Finalize: resize to **1920 wide** (site standard, other heroes are
   1920×1026–1080), webp, start `-quality 88` and step down until **<150KB**.
   Save as `public/images/blog/<slug>/hero.webp`, set frontmatter `image:`.
5. Render-check the result at full size before calling it done.

---
name: blog-image-generator
description: Generate AI image prompts for blog post hero images with a consistent TechHive Labs visual style
user_invocable: true
---

# Blog Image Prompt Generator

Generate image prompts for the user's blog posts that maintain a consistent visual identity across the TechHive Labs portfolio site.

## Steps

1. **Read the blog post.** If the user provides a slug or filename, read the markdown file from `content/blog/`. If no specific post is given, ask which post they need an image for.

2. **Identify the core themes.** Extract the 2-3 central topics or narratives from the post (e.g., "AI coding assistant + roguelike game dev + hitting limits").

3. **Compose prompts using the base prompt.** Always start with this exact base prompt, then append a scene description:

   **Base prompt:**
   > Isometric low-poly digital illustration, dark matte background with soft green (#39a10e) accent lighting, clean geometric shapes, subtle glowing circuit-board traces in the background, tech-forward minimal aesthetic, no text, no people, sharp edges with soft shadows, 16:9 aspect ratio

4. **Generate exactly 3 variant prompts.** Each variant should:
   - Start with the full base prompt followed by a comma
   - Describe a distinct scene/composition inspired by the post's themes
   - Use visual metaphors rather than literal depictions (e.g., "a rocket tangled in server cables" not "a developer at a computer")
   - Stay within the isometric low-poly aesthetic — no photorealism, no flat 2D
   - Reference tech/dev concepts as physical objects (code blocks as building materials, APIs as bridges, servers as industrial machines)
   - Incorporate the green (#39a10e) accent color naturally in glows, lights, or highlights
   - Keep the prompt to 1-2 sentences after the base prompt

5. **Present the output** as:
   - The base prompt in a blockquote
   - Each variant labeled (Variant 1, 2, 3) with the full combined prompt ready to copy-paste

## Style Guidelines

- Dark, moody backgrounds — not bright or pastel
- Green accent lighting matches the site's primary color (#39a10e)
- Isometric perspective gives a consistent "looking down at a scene" feel
- Low-poly/geometric aesthetic — not painterly, not pixel art
- No text rendered in the image
- No human figures — use objects, machines, symbols, and environments
- Favor visual contrast and metaphor (e.g., enterprise server racks next to fantasy dungeon elements)
- The image should make someone curious about the post without giving everything away

## Example

For a post about hitting deployment walls with an AI app:

> **Variant 2:** Isometric low-poly digital illustration, dark matte background with soft green (#39a10e) accent lighting, clean geometric shapes, subtle glowing circuit-board traces in the background, tech-forward minimal aesthetic, no text, no people, sharp edges with soft shadows, 16:9 aspect ratio, a split architecture diagram — a sleek glowing edge node on one side connected by a luminous bridge to a heavy industrial server on the other, data packets flowing across the bridge

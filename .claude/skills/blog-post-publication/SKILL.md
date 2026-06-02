---
name: blog-post-publication
description: "Complete workflow for publishing blog posts — image processing, SEO audit, schema verification, and Vercel deployment"
trigger: "after writing and generating blog post hero images, before deploying to techhivelabs.net"
source_sessions:
  - tonycos92_tonycos92's Organization_default_9cef986b-8337-4166-bef3-be8e01a8c0c1
version: 1
created_by_agent: claude_code
created_at: 2026-05-19T00:31:20.683Z
updated_at: 2026-05-19T00:31:20.683Z
---

# Blog Post Publication Workflow

Complete workflow for publishing a blog post on techhivelabs.net with proper hero image processing, SEO audit, and Vercel deployment.

## When to Use

After writing a blog post and generating hero image(s):
- You have a markdown post with frontmatter in `content/blog/`
- You have a generated image (PNG from Gemini, etc.)
- You need to verify SEO before deploying to www.techhivelabs.net

## Workflow

### 1. Process Hero Image

Convert, crop, and optimize for web:

```bash
convert input.png \
  -crop 130x100+0+0 \
  -resize 1920 \
  -quality 88 \
  public/images/blog/{slug}/hero.webp
```

Adjust crop dimensions based on watermark position (Gemini usually bottom-right). Target: 1920px wide, ~16:9 aspect, <150KB file size.

Update frontmatter:
```yaml
image: /images/blog/{slug}/hero.webp
draft: false
```

### 2. Batch Process Existing Images

For multiple blog post heroes (e.g., cropping out Gemini sparkles):

```bash
for file in public/images/blog/*/hero.webp; do
  convert "$file" -crop 130x100+0+0 -resize 1920 -quality 88 "$file"
done
```

Verify results in a stats table before committing.

### 3. SEO Audit

Check before pushing:

**Canonical URLs**
- Set `site.url: "https://www.techhivelabs.net"` in `nuxt.config.ts`
- Add `<link rel="canonical">` to blog post route
- Verify apex domain 301s/307s to www in Vercel config

**Schema Markup**
- `Article` with `author`, `datePublished`, `description`, `image`
- `BreadcrumbList` for breadcrumb navigation
- `ImageObject` for hero images with `alt` text
- Validate with Google's JSON-LD validator

**Page Titles**
- Remove duplication (appearing in page, layout, SEO block)
- Keep under ~60 chars for SERP truncation

**Image Attributes**
- All og:image, twitter:image URLs must be absolute (https://www.techhivelabs.net/...)
- Add `og:image:alt` and `twitter:image:alt` descriptive text
- Verify alt text in schema markup

**Font Loading**
- Remove Google Fonts `<link>` blocks
- Use `@nuxt/fonts` module for self-hosted fonts (avoids render-blocking)

### 4. Commit and Deploy

```bash
git add content/blog/{slug}.md public/images/blog/{slug}/
git commit -m "blog: {short title}"
git push origin main
```

Vercel automatically builds. Verify:
- Page loads at https://www.techhivelabs.net/blog/{slug}
- Browser devtools: title, canonical, og:image correct
- sitemap.xml includes new post with www URL (not apex)

## Technical Details

**Image Watermark Removal**
- Visible marks (Gemini sparkle): crop bottom-right corner
- Invisible marks (SynthID): survives crop/resize/recompress — irrelevant for personal blogs

**Vercel Prerendering**
- All blog routes prerendered at build time via `routeRules` and `nitro.prerender`
- Frontmatter metadata changes reflected in prerendered HTML/sitemap

**Schema Validation**
- Test at https://validator.schema.org/
- Verify JSON-LD blocks render in prerendered HTML (view page source)

## Anti-patterns

- Publishing with `draft: true`
- Using relative URLs in OpenGraph
- Forgetting canonical links (triggers SEO duplicate-content flags)
- Processing hero images at non-1920px width (breaks consistency)
- Committing with co-author footer when solo

import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection(
      asSitemapCollection({
        type: 'page',
        source: 'blog/*.md',
        schema: z.object({
          title: z.string(),
          seoTitle: z.string().optional(),
          description: z.string(),
          date: z.date(),
          updated: z.date().optional(),
          tags: z.array(z.string()).optional(),
          image: z.string().optional(),
          // True pixel dimensions of `image`, used for og:image:width/height so
          // social scrapers lay the card out correctly before the file loads.
          // Declare these on every post that sets `image` — when absent the
          // og-image module emits its own 1200x600, which matches no hero we ship.
          imageWidth: z.number().optional(),
          imageHeight: z.number().optional(),
          author: z.string(),
          draft: z.boolean(),
        })
      })
    ),
    projects: defineCollection(
      asSitemapCollection({
        type: 'page',
        source: 'projects/*.md',
        schema: z.object({
          title: z.string(),
          description: z.string().optional(),
          tags: z.array(z.string()).optional(),
          images: z.array(z.string()).optional(),
          featured: z.boolean().optional(),
          // Lower number = earlier in the homepage bento (only featured projects are shown there).
          priority: z.number().optional(),
          type: z.enum(['video', 'code']).optional(),
        })
      })
    )
  }
})

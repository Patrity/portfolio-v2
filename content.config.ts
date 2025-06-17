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
          description: z.string(),
          date: z.date(),
          updated: z.date().optional(),
          tags: z.array(z.string()).optional(),
          image: z.string().optional(),
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
          type: z.enum(['video', 'code']).optional(),
        })
      })
    )
  }
})

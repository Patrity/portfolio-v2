// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: [
    '@nuxt/ui-pro',
    '@nuxthub/core',
    '@nuxtjs/seo', // Must be before @nuxt/content for sitemap integration
    '@nuxt/content',
    '@nuxt/image'
  ],
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Teko&display=swap'
        }
      ]
    }
  },
  $development: {
    hub: {
      remote: 'production'
    }
  },
  hub: {
    blob: true
  },
  routeRules: {
    '/': { prerender: true },
    '/blog/**': { prerender: true },
    '/projects/**': { prerender: true },
    '/about': { prerender: true },
  },
  nitro: {
    prerender: {
      // enabled by default with nuxt generate, not required
      crawlLinks: true,
      // add any routes to prerender
      routes: [
        '/',
        '/blog/**',
        '/projects/**',
        '/about',
        '/sitemap.xml'
      ]

    }
  },
  content: {
    preview: {
      api: 'https://api.nuxt.studio'
    }
  },
  sitemap: {
    strictNuxtContentPaths: true
  }
})
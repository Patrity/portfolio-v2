// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: [
    '@nuxt/ui-pro',
    '@nuxthub/core',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/seo'
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
  content: {
    preview: {
      api: 'https://api.nuxt.studio'
    }
  }
})
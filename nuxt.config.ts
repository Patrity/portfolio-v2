// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: [
    '@nuxt/ui-pro',
    '@nuxthub/core',
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
      remote: true
    }
  },
  hub: {
    blob: true
  },
  image: {
    providers: {
      blobStorage: {
        provider: 'ipx',
        // In dev, use local proxy, in production use deployed URL
        baseURL: process.env.NODE_ENV === 'development' 
          ? '/api/images'
          : 'https://your-deployed-app.nuxt.dev/api/images'
      }
    }
  }
})
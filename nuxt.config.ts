// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: [
    '@nuxt/ui-pro',
    '@nuxthub/core',
    '@nuxtjs/seo',
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
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Teko&display=swap'
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'author', content: 'Tony Costanzo' },
        { name: 'theme-color', content: '#000000' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@ThePatrity' },
        { name: 'twitter:creator', content: '@ThePatrity' },
        // Default OG tags (will be overridden by pages)
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:site_name', content: 'TechHive Labs' },
      ],
    }
  },
  $development: {
    hub: {
      remote: 'production',
      database: true
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
        '/about',
        '/sitemap.xml'
      ]

    }
  },
  content: {
    database: {
      type: 'd1',
      binding: 'DB'
    },
    preview: {
      api: 'https://api.nuxt.studio'
    }
  },
  site: {
    url: 'https://techhivelabs.net', // Update this to your actual domain
    name: 'TechHive Labs',
    description: 'Full-stack developer specializing in web development, video production, and digital solutions.',
    defaultLocale: 'en',
  },
  
  sitemap: {
    strictNuxtContentPaths: true
  },
  
  seo: {
    redirectToCanonicalSiteUrl: true
  },
  
  ogImage: {
    enabled: true,
    defaults: {
      cacheMaxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      renderer: 'satori',
      props: {
        colorMode: 'dark',
      }
    },
    fonts: [
      'Inter:400',
      'Inter:700',
    ],
  },
  
  robots: {
    enabled: true,
    blockNonSeoBots: true,
    credits: false,
    groups: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      }
    ],
    sitemap: '/sitemap.xml'
  }
})
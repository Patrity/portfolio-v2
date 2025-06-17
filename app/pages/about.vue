<script lang="ts" setup>
// SEO Metadata
definePageMeta({
  title: 'About - TechHive Labs',
  description: 'Learn about the technology stack and infrastructure behind TechHive Labs. Built with Nuxt 4, deployed on Cloudflare Pages.',
})

useSeoMeta({
  title: 'About - TechHive Labs',
  description: 'Learn about the technology stack and infrastructure behind TechHive Labs. Built with Nuxt 4, deployed on Cloudflare Pages.',
  ogTitle: 'About - TechHive Labs',
  ogDescription: 'Learn about the technology stack and infrastructure behind TechHive Labs.',
  ogUrl: 'https://techhivelabs.net/about',
})
</script>

<template>
  <UPageHero title="About This Project">
    <template #description>
      <p>
        This project is built using 
        <ULink raw to="https://nuxt.com" target="_blank" inactive-class="text-primary font-semibold">NuxtJS v4</ULink>, 
        <ULink raw to="https://ui.nuxt.com" target="_blank" inactive-class="text-primary font-semibold">Nuxt UI Pro v3</ULink> and 
        <ULink raw to="https://content.nuxt.com" target="_blank" inactive-class="text-primary font-semibold">Nuxt Content v3</ULink>. 
      </p>
      <p>
        It deploys to 
        <ULink raw to="https://www.cloudflare.com/products/pages/" target="_blank" inactive-class="text-primary font-semibold">Cloudflare Pages</ULink> 
        utilizing 
        <ULink raw to="https://nuxthub.com" target="_blank" inactive-class="text-primary font-semibold">NuxtHub</ULink>.
      </p>
      <p>
        <ULink raw to="https://github.com/patrity/portfolio-v2" target="_blank" inactive-class="text-primary font-semibold">GitHub Repository</ULink>
      </p>
    </template>
  </UPageHero>
</template>
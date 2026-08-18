<script setup lang="ts">
// Branded social card for every non-blog page (blog posts override with their hero
// image in pages/blog/[...slug].vue). Pages pass only the props they change.
defineOgImageComponent('TechHive', {
  title: 'Tony Costanzo',
  description: 'Full-stack dev on billion-dollar construction projects. Local AI and agentic workflows by night.',
  photo: true,
}, {
  alt: 'Tony Costanzo, TechHive Labs',
})

// Without JS the scroll observer never runs, so reveal elements would stay
// hidden. Force them visible when scripting is unavailable.
useHead({
  noscript: [{
    innerHTML: '<style>.reveal,.reveal-left,.reveal-right,.reveal-scale{opacity:1!important;transform:none!important;filter:none!important}</style>',
    tagPosition: 'head',
  }],
})
</script>
<template>
  <UApp :tooltip="{ delayDuration: 0 }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
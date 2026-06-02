<script setup lang="ts">
defineOgImageComponent('NuxtSeo')

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
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
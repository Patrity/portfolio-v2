<script lang="ts" setup>
import { UButton, UColorModeButton, ULink, UNavigationMenu } from '#components';

const items = [
  { label: 'Home', to: '/' },
  { label: 'Portfolio', to: '/projects' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const socials = [
  { to: 'https://github.com/Patrity/portfolio-v2', icon: 'i-fa6-brands-github' },
  { to: 'https://x.com/ThePatrity', icon: 'i-fa6-brands-x-twitter' },
  { to: 'https://bsky.app/profile/patrity.bsky.social', icon: 'i-fa6-brands-bluesky' },
]
</script>

<template>
  <UHeader mode="drawer">
    <template #left>
      <NuxtLink to="/" class="flex items-center flex-row gap-2 bg-white/5 rounded-xl px-2 py-1 hover:bg-white/10 transition-all duration-200 hover:scale-110 hover:rotate-3">
        <GlobalIcon class="size-10" />
        <h1 class="font-teko text-4xl text-bold">
          TechHive Labs
        </h1>
      </NuxtLink>
    </template>

    <UNavigationMenu :items />

    <template #right>
      <div class="flex flex-row items-center gap-2">
        <UColorModeButton size="xl" />
        <UButton v-for="social in socials" :key="social.to" :to="social.to" :icon="social.icon" size="xl" variant="ghost" color="neutral" class="hover:text-(--ui-primary) transition transform duration-200" />
      </div>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" mode="slideover"/>
    </template>
  </UHeader>
  <UMain>
    <UPage>
      <UContainer v-if="useRoute().path !== '/'">
        <slot />
      </UContainer>
      <slot v-else />
    </UPage>
  </UMain>
    <UFooter class="bg-white/5">
      <template #left>
        <p class="text-(--ui-text-muted) text-sm">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>

      <UNavigationMenu :items="items" variant="link" />

      <template #right>
        <UButton v-for="social in socials" :key="social.to" :to="social.to" :icon="social.icon" size="xl" variant="ghost" color="neutral" class="hover:text-(--ui-primary) transition transform duration-200" />
      </template>
    </UFooter>
</template>
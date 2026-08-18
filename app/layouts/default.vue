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
  { to: 'https://github.com/Patrity', icon: 'i-fa6-brands-github', label: 'GitHub' },
  { to: 'https://x.com/Patrity', icon: 'i-fa6-brands-x-twitter', label: 'X' },
  { to: 'https://bsky.app/profile/patrity.com', icon: 'i-fa6-brands-bluesky', label: 'Bluesky' },
  { to: 'https://www.linkedin.com/in/tonycos/', icon: 'i-fa6-brands-linkedin', label: 'LinkedIn' },
]

// Footer only: the feed lives with the rest of the "follow me" affordances.
const footerLinks = [
  ...socials,
  { to: '/rss.xml', icon: 'i-heroicons-rss', label: 'RSS feed', external: true },
]
</script>

<template>
  <UHeader mode="drawer">
    <template #left>
      <NuxtLink to="/" class="flex items-center flex-row gap-2 bg-white/5 rounded-xl px-2 py-1 hover:bg-white/10 transition-all duration-200 hover:scale-110 hover:rotate-3">
        <GlobalIcon class="size-10" />
        <span class="font-teko text-4xl text-bold hidden sm:block">
          TechHive Labs
        </span>
      </NuxtLink>
    </template>

    <UNavigationMenu :items />

    <template #right>
      <div class="flex flex-row items-center gap-2">
        <UColorModeButton size="xl" />
        <UButton v-for="social in socials" :key="social.to" :to="social.to" :icon="social.icon" :aria-label="social.label" target="_blank" size="xl" variant="ghost" color="neutral" class="hidden lg:block hover:text-(--ui-primary) transition transform duration-200" />
      </div>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" mode="slideover"/>
    </template>
  </UHeader>
  <UMain>
    <UPage>
      <UContainer v-if="useRoute().path !== '/' && useRoute().path !== '/about'">
        <slot />
      </UContainer>
      <slot v-else />
    </UPage>
  </UMain>
    <UFooter class="bg-white/5 mt-6">
      <template #left>
        <p class="text-(--ui-text-muted) text-sm">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>

      <UNavigationMenu :items="items" variant="link" />

      <template #right>
        <UButton v-for="link in footerLinks" :key="link.to" :to="link.to" :icon="link.icon" :aria-label="link.label" :target="link.to.startsWith('http') ? '_blank' : undefined" :external="link.external" size="xl" variant="ghost" color="neutral" class="hover:text-(--ui-primary) transition transform duration-200" />
      </template>
    </UFooter>
</template>
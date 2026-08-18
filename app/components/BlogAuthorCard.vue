<script lang="ts" setup>
// Author box shown under every article. Static content, no data fetching.
const socials = [
  { to: 'https://www.linkedin.com/in/tonycos/', icon: 'i-fa6-brands-linkedin', label: 'LinkedIn' },
  { to: 'https://x.com/Patrity', icon: 'i-fa6-brands-x-twitter', label: 'X' },
  { to: 'https://bsky.app/profile/patrity.com', icon: 'i-fa6-brands-bluesky', label: 'Bluesky' },
  { to: 'https://github.com/Patrity', icon: 'i-fa6-brands-github', label: 'GitHub' },
]
</script>

<template>
  <div class="glass-card rounded-xl p-6 flex gap-6">
    <img
      src="/images/tony.webp"
      alt="Tony Costanzo"
      width="80"
      height="80"
      loading="lazy"
      class="size-20 rounded-xl object-cover border-2 border-green-500/25 shrink-0"
    >
    <div class="min-w-0">
      <p class="text-[11px] uppercase tracking-[2px] text-(--ui-text-dimmed)">Written by</p>
      <p class="text-xl font-semibold text-(--ui-text-highlighted)">Tony Costanzo</p>
      <p class="mt-2 text-sm text-(--ui-text-muted) leading-relaxed max-w-2xl">
        Full-stack dev on billion-dollar construction projects, local AI tinkerer, and the guy who load-tested his own game server into the ground. Writes here roughly monthly. Says hi on LinkedIn more often than that.
      </p>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <UButton
          v-for="social in socials"
          :key="social.to"
          :to="social.to"
          :icon="social.icon"
          :aria-label="social.label"
          target="_blank"
          rel="noopener"
          size="sm"
          variant="outline"
          color="neutral"
        />
        <UButton
          to="/rss.xml"
          external
          icon="i-heroicons-rss"
          label="RSS feed"
          size="sm"
          variant="soft"
          color="primary"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  date: string
  title: string
  company: string
  description: string
  icon?: string
  side?: 'left' | 'right'
  color?: string
}>()
</script>

<template>
  <div class="relative flex items-start gap-6 group">
    <!-- Timeline dot -->
    <div class="relative flex-shrink-0 z-10">
      <div class="size-12 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center group-hover:border-green-400 group-hover:bg-green-500/20 transition-all duration-300">
        <UIcon :name="icon || 'i-heroicons-briefcase'" class="size-5 text-green-400" />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 pb-10">
      <div class="glass-card rounded-xl p-5 group-hover:border-green-500/20 transition-all duration-300">
        <span class="text-xs font-medium text-green-400 uppercase tracking-wider">{{ date }}</span>
        <h3 class="text-lg font-semibold mt-1">{{ title }}</h3>
        <p class="text-sm text-muted mt-0.5" :style="color ? { color } : {}">{{ company }}</p>
        <p class="text-sm text-(--ui-text-muted) mt-2 leading-relaxed">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

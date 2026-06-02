<script lang="ts" setup>
const props = defineProps({
  videoUrl: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: '',
  },
})

// Poster lives next to the video by convention (foo.mp4 -> foo-poster.webp),
// overridable via the `poster` prop. Reserves the first frame so the player
// isn't a blank box before play, and lets the page reach network-idle.
const posterUrl = computed(() => props.poster || props.videoUrl.replace(/\.\w+$/, '-poster.webp'))
</script>

<template>
  <div>
    <slot />
    <video
      :src="videoUrl"
      :poster="posterUrl"
      controls
      preload="metadata"
      class="w-full aspect-video object-cover rounded-lg"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  videoUrl: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div>
    <slot />
    <video
      :src="videoUrl"
      controls
      class="w-full rounded-lg"
    />
  </div>
</template>
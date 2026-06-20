<script lang="ts" setup>
defineProps<{ src: string }>()
</script>

<template>
  <div class="my-4">
    <slot />
    <audio :src="src" controls preload="metadata" class="w-full" />
  </div>
</template>

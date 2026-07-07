<script lang="ts" setup>
// Clickable content figure for markdown posts:
//   ::content-image{src="/images/blog/foo/bar.webp" alt="..." caption="..."}
//   ::
// Renders the image with a caption underneath and opens a lightbox modal
// with the enlarged image on click. Rich captions can go in the default slot
// instead of the `caption` prop.
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  caption: {
    type: String,
    default: '',
  },
})

const open = ref(false)
</script>

<template>
  <figure class="my-6">
    <button
      type="button"
      class="group relative block w-full cursor-zoom-in"
      :aria-label="`Enlarge image: ${alt || caption || 'image'}`"
      @click="open = true"
    >
      <img
        :src="src"
        :alt="alt"
        loading="lazy"
        class="w-full rounded-lg transition duration-200 group-hover:brightness-110"
      >
      <span
        class="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 opacity-0 transition duration-200 group-hover:opacity-100"
        aria-hidden="true"
      >
        <UIcon name="i-heroicons-arrows-pointing-out" class="block size-4 text-white" />
      </span>
    </button>
    <figcaption
      v-if="caption || $slots.default"
      class="mt-2 text-center text-sm text-muted"
    >
      <slot>{{ caption }}</slot>
    </figcaption>

    <UModal
      v-model:open="open"
      :ui="{ content: 'max-w-[95vw] sm:max-w-fit' }"
    >
      <template #content>
        <div class="relative">
          <img
            :src="src"
            :alt="alt"
            class="mx-auto block max-h-[85vh] w-auto max-w-full"
            :class="caption ? 'rounded-t-lg' : 'rounded-lg'"
          >
          <p
            v-if="caption"
            class="px-4 py-3 text-center text-sm text-muted"
          >
            {{ caption }}
          </p>
          <UButton
            icon="i-heroicons-x-mark"
            color="neutral"
            variant="solid"
            size="sm"
            class="absolute right-2 top-2"
            aria-label="Close enlarged image"
            @click="open = false"
          />
        </div>
      </template>
    </UModal>
  </figure>
</template>

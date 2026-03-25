<script setup lang="ts">
const props = defineProps<{
  target: number
  suffix?: string
  prefix?: string
  duration?: number
}>()

const count = ref(0)
const el = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)

function animateCount() {
  if (hasAnimated.value) return
  hasAnimated.value = true

  const dur = props.duration || 2000
  const start = performance.now()

  function step(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / dur, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    count.value = Math.floor(eased * props.target)
    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      count.value = props.target
    }
  }

  requestAnimationFrame(step)
}

onMounted(() => {
  if (!el.value) return
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        animateCount()
        observer.disconnect()
      }
    },
    { threshold: 0.3 }
  )
  observer.observe(el.value)
})
</script>

<template>
  <span ref="el" class="tabular-nums">
    {{ prefix }}{{ count }}{{ suffix }}
  </span>
</template>

<script setup lang="ts">
// Generate honeycomb grid positions
const hexagons = ref<{ x: number; y: number; delay: number; size: number; pulse: boolean }[]>([])

onMounted(() => {
  const cols = 14
  const rows = 10
  const hexW = 120
  const hexH = 104 // hexW * sin(60)
  const grid: typeof hexagons.value = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : hexW / 2
      grid.push({
        x: col * hexW + offsetX,
        y: row * (hexH * 0.75),
        delay: Math.random() * 6,
        size: hexW,
        // ~15% of cells pulse actively
        pulse: Math.random() < 0.15,
      })
    }
  }
  hexagons.value = grid
})
</script>

<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <!-- Honeycomb SVG layer -->
    <svg
      class="absolute inset-0 w-full h-full honeycomb-grid"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      :viewBox="`0 0 1680 900`"
    >
      <defs>
        <!-- Single hexagon path centered at origin -->
        <path
          id="hex"
          d="M52,0 L104,30 L104,90 L52,120 L0,90 L0,30 Z"
          fill="none"
        />
        <!-- Glow filter for pulsing hexagons -->
        <filter id="hex-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g
        v-for="(hex, i) in hexagons"
        :key="i"
        :transform="`translate(${hex.x}, ${hex.y})`"
        class="hex-cell"
        :class="{ 'hex-pulse': hex.pulse }"
        :style="{ '--hex-delay': `${hex.delay}s` }"
      >
        <use
          href="#hex"
          :stroke="hex.pulse ? 'var(--color-green-500)' : 'var(--color-green-800)'"
          :stroke-width="hex.pulse ? 1.5 : 0.5"
          :stroke-opacity="hex.pulse ? 0.6 : 0.15"
          :filter="hex.pulse ? 'url(#hex-glow)' : undefined"
        />
      </g>
    </svg>

    <!-- Depth gradient overlays -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-(--ui-bg)" />
    <div class="absolute inset-0 bg-gradient-to-r from-(--ui-bg) via-transparent to-(--ui-bg) opacity-60" />
    <div class="absolute inset-0 bg-gradient-to-t from-(--ui-bg) via-transparent to-(--ui-bg) opacity-40" />

    <!-- Central energy glow -->
    <div
      class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] opacity-20 hex-energy"
      style="width: 600px; height: 400px; background: var(--color-green-500);"
    />
  </div>
</template>

<style scoped>
.hex-cell {
  opacity: 0;
  animation: hex-appear 0.6s ease-out forwards;
  animation-delay: var(--hex-delay);
}

.hex-pulse use {
  animation: hex-breathe 4s ease-in-out infinite;
  animation-delay: var(--hex-delay);
}

.hex-energy {
  animation: hex-energy-pulse 6s ease-in-out infinite;
}

@keyframes hex-appear {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes hex-breathe {
  0%, 100% {
    stroke-opacity: 0.2;
    stroke-width: 1;
  }
  50% {
    stroke-opacity: 0.8;
    stroke-width: 2;
  }
}

@keyframes hex-energy-pulse {
  0%, 100% { opacity: 0.12; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.15); }
}
</style>

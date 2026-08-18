<script setup lang="ts">
/**
 * TechHive Labs branded OG image (1200x630) - satori renderer.
 *
 * Satori rules honoured here (see nuxt-og-image satori plugins + satori README):
 * - Flexbox only. Every element with >1 child carries an explicit `display: flex`.
 * - `class="flex flex-row|flex-col"` is added to multi-child containers on purpose:
 *   nuxt-og-image's `flex` transformer force-sets `flex-direction: column` (or
 *   `flex-wrap: wrap; gap: .2em`) on any container whose class does not contain
 *   `flex-`. The classes are then compiled to inline styles by the module's
 *   UnoCSS pass. All other styling is inline.
 * - satori-html trims text nodes and drops whitespace-only ones, so word spacing
 *   in the title is done with `column-gap`, not literal spaces.
 * - No `filter: blur()` (satori cannot rasterise it) - the glow is a radial-gradient.
 * - Inline <svg> is rendered by satori as an embedded image (basic shapes/paths only,
 *   presentation attributes, no <style>/<use>/<text>).
 * - Photo is a JPEG (`/images/tony-og.jpg`): satori/resvg cannot decode WebP.
 *   Public-dir paths beginning with `/` are resolved + base64-inlined by the module.
 */
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: false, default: 'Tony Costanzo' },
  description: {
    type: String,
    required: false,
    default: 'Full-stack dev on billion-dollar construction projects. Local AI and agentic workflows by night.',
  },
  // Boolean, but tolerate the string form that arrives via ?photo=false in dev previews.
  photo: { type: [Boolean, String, Number], required: false, default: true },
  // Swallow the module-wide `defaults.props.colorMode` so it does not fall through as an attribute.
  colorMode: { type: String, required: false },
})

const BG = '#171717'
const FG = '#e5e5e5'
const MUTED = '#a3a3a3'
const GREEN = '#46c211'
const GREEN_DIM = '#39a10e'
const GREEN_FAINT = '#1d520a'
const PHOTO_SRC = '/images/tony-og.jpg'

const showPhoto = computed(() => {
  const v = props.photo
  return !(v === false || v === 0 || v === 'false' || v === '0' || v === '')
})

// ---------------------------------------------------------------------------
// Title: split into words so the last one can be tinted green while still
// wrapping word-by-word inside the 720px column (satori has no inline spans that
// wrap across lines, so each word is its own flex item).
// ---------------------------------------------------------------------------
const titleWords = computed(() => String(props.title ?? '').trim().split(/\s+/).filter(Boolean))

// 132px is the design size. Very long titles are stepped down so they still fit
// the 720px column in <= 3 lines instead of overflowing the card.
const titleFontSize = computed(() => {
  const len = String(props.title ?? '').trim().length
  if (len <= 18) return 132
  if (len <= 28) return 108
  if (len <= 42) return 88
  return 72
})
const titleLetterSpacing = computed(() => (titleFontSize.value >= 108 ? -3 : -2))
const titleWordGap = computed(() => Math.round(titleFontSize.value * 0.22))

// ---------------------------------------------------------------------------
// Honeycomb: pointy-top hexagons, circumradius 60 (cell 104x120), laid out on the
// site's HeroBackground grid: x = col*120 (+60 on odd rows), y = row*78.
// Only the right 720px of the card is tiled.
// ---------------------------------------------------------------------------
const HONEY_W = 720
const HONEY_H = 630
const HEX_POINTS = [[52, 0], [104, 30], [104, 90], [52, 120], [0, 90], [0, 30]] as const

// Deterministic PRNG so the "random" bright cells are identical on every build.
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface HexCell { d: string, bright: boolean }

const hexCells = computed<HexCell[]>(() => {
  const rand = mulberry32(0x7EC4_1AB5)
  const cells: HexCell[] = []
  const cols = Math.ceil(HONEY_W / 120) + 1
  const rows = Math.ceil(HONEY_H / 78) + 1
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ox = col * 120 + (row % 2 === 1 ? 60 : 0)
      const oy = row * 78
      const d = HEX_POINTS
        .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${ox + x},${oy + y}`)
        .join(' ') + ' Z'
      cells.push({ d, bright: rand() < 0.125 })
    }
  }
  return cells
})
</script>

<template>
  <div
    class="flex flex-col"
    :style="{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: BG,
      fontFamily: 'Inter',
    }"
  >
    <!-- Honeycomb (right half) -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="HONEY_W"
      :height="HONEY_H"
      :viewBox="`0 0 ${HONEY_W} ${HONEY_H}`"
      :style="{ position: 'absolute', top: '0px', right: '0px', width: `${HONEY_W}px`, height: `${HONEY_H}px` }"
    >
      <path
        v-for="(cell, i) in hexCells"
        :key="i"
        :d="cell.d"
        fill="none"
        :stroke="cell.bright ? GREEN_DIM : GREEN_FAINT"
        :stroke-width="cell.bright ? 1.5 : 0.5"
        :stroke-opacity="cell.bright ? 0.55 : 0.15"
      />
    </svg>

    <!-- Depth: left-to-right fade so the text side is solid -->
    <div
      :style="{
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(to right, #171717 30%, rgba(23,23,23,0.7) 60%, rgba(23,23,23,0.35) 100%)',
      }"
    />
    <!-- Depth: bottom-to-top fade -->
    <div
      :style="{
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(to top, #171717 0%, rgba(23,23,23,0) 40%)',
      }"
    />
    <!-- Soft green glow at right-centre (radial gradient stands in for blur) -->
    <div
      :style="{
        position: 'absolute',
        top: '-45px',
        left: '580px',
        width: '720px',
        height: '720px',
        backgroundImage: 'radial-gradient(circle 360px at 360px 360px, rgba(57,161,14,0.16) 0%, rgba(57,161,14,0.07) 40%, rgba(57,161,14,0) 100%)',
      }"
    />

    <!-- Foreground -->
    <div
      class="flex flex-col"
      :style="{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        paddingTop: '56px',
        paddingBottom: '56px',
        paddingLeft: '72px',
        paddingRight: '72px',
      }"
    >
      <!-- Top: mark + wordmark -->
      <div
        class="flex flex-row"
        :style="{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', columnGap: '14px' }"
      >
        <!-- app/assets/images/th-icon.svg, flattened: inner viewBox 35 25 130 150, classes -> fill attrs -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="52"
          height="52"
          viewBox="35 25 130 150"
          :style="{ width: '52px', height: '52px' }"
        >
          <path d="M131.7 43.3L100 25 35 62.6v74.8l65 37.6 37.3-21.5 27.7-16.1V62.6l-33.3-19.3z" fill="#161616" />
          <path d="M35.2 62.4l-.2.2v31.9l65 37.4-64.8-69.5z" fill="#46C211" opacity="0.2" />
          <path d="M137.3 153.5l27.7-16.1V62.6l-65 69.3 37.3 21.6z" fill="#46C211" />
          <path d="M100 131.9l65-69.3-33.3-19.3-31.7 88.6z" fill="#46C211" opacity="0.75" />
          <path d="M100 131.9L67.9 43.5 35.2 62.4l64.8 69.5z" fill="#46C211" opacity="0.3" />
          <path d="M100 131.9l31.7-88.6L100 25v106.9z" fill="#46C211" opacity="0.6" />
          <path d="M100 25L68 43.5l32 88.4V25z" fill="#46C211" opacity="0.4" />
        </svg>
        <span
          :style="{
            fontFamily: 'Teko',
            fontWeight: 700,
            fontSize: '44px',
            lineHeight: '44px',
            color: FG,
            letterSpacing: '0.5px',
          }"
        >TechHive Labs</span>
      </div>

      <!-- Middle: title + description (left), photo (right) -->
      <div
        class="flex flex-row"
        :style="{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexGrow: 1,
          width: '100%',
        }"
      >
        <div
          class="flex flex-col"
          :style="{ display: 'flex', flexDirection: 'column', maxWidth: '720px' }"
        >
          <h1
            class="flex-row"
            :style="{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              columnGap: `${titleWordGap}px`,
              rowGap: '0px',
              margin: '0px',
              padding: '0px',
              fontFamily: 'Teko',
              fontWeight: 700,
              fontSize: `${titleFontSize}px`,
              lineHeight: 0.85,
              letterSpacing: `${titleLetterSpacing}px`,
              color: FG,
            }"
          >
            <span
              v-for="(word, i) in titleWords"
              :key="i"
              :style="{ color: titleWords.length > 1 && i === titleWords.length - 1 ? GREEN : FG }"
            >{{ word }}</span>
          </h1>
          <p
            v-if="description"
            :style="{
              display: 'block',
              lineClamp: 3,
              textOverflow: 'ellipsis',
              margin: '0px',
              marginTop: '22px',
              padding: '0px',
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: '26px',
              lineHeight: '36px',
              color: MUTED,
            }"
          >{{ description }}</p>
        </div>

        <img
          v-if="showPhoto"
          :src="PHOTO_SRC"
          width="240"
          height="240"
          :style="{
            width: '240px',
            height: '240px',
            flexShrink: 0,
            marginLeft: '40px',
            borderRadius: '20px',
            border: '3px solid rgba(70,194,17,0.35)',
            objectFit: 'cover',
          }"
        >
      </div>

      <!-- Bottom: prompt-style domain -->
      <div
        class="flex flex-row"
        :style="{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          columnGap: '10px',
          fontFamily: `'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace`,
          fontSize: '20px',
          lineHeight: '28px',
          color: GREEN,
        }"
      >
        <span :style="{ opacity: 0.6 }">~/</span>
        <span>techhivelabs.net</span>
      </div>
    </div>
  </div>
</template>

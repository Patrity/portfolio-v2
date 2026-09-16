<script lang="ts" setup>
// Narration player. Derives the audio from the post route:
//   /blog/<slug>  ->  /audio/blog/<slug>.mp3  +  .timing.json
//
// When a timing sidecar exists AND aligns confidently against the rendered post, the
// player follows along: the paragraph being spoken is highlighted, and clicking any
// matched paragraph seeks to it. Alignment can fail (a post whose narration diverges too
// far from its markdown), and a half-correct highlight is worse than none, so anything
// below the confidence floor falls back to a plain player.
import { alignToNodes, alignmentConfidence, activeIndex, type TimedParagraph } from '~/utils/narrationAlign'

const props = defineProps<{ src?: string }>()

const route = useRoute()
const slugPath = computed(() => route.path.replace(/\/$/, ''))
const resolvedSrc = computed(() => props.src || `/audio${slugPath.value}.mp3`)

const failed = ref(false)
const audio = ref<HTMLAudioElement | null>(null)

const timed = ref<TimedParagraph[]>([])
const nodes = shallowRef<HTMLElement[]>([])
const mapping = ref<number[]>([])
const following = ref(false)
const current = ref(-1)

const duration = ref(0)
const elapsed = ref(0)
const playing = ref(false)
const rate = ref(1)

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
const progress = computed(() => (duration.value ? (elapsed.value / duration.value) * 100 : 0))

// --- follow-along ------------------------------------------------------------------
// Headings are included on purpose: clean.ts emits each heading as its own narration
// paragraph, so excluding them here made a chunk of the timeline permanently unmatchable
// and sank confidence on heading-heavy posts (de-digitizing scored 12%). The heading IS
// what is being read at that moment, so highlighting it is correct.
//
// The short-text floor is lower for headings than for prose, since a heading is often
// only three or four words.
function collectNodes(): HTMLElement[] {
  const root = document.querySelector('article') ?? document.querySelector('main')
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLElement>('h1, p, li, h2, h3, h4'))
    .filter((el) => {
      if (el.closest('.narration-player')) return false
      // Breadcrumbs, the "On this page" table of contents, and footer links all live
      // inside <main> and none of them are narrated. Left in, they pad the node list to
      // three times the paragraph count and give the walk plenty of chances to mismatch.
      if (el.closest('nav, aside, header, footer')) return false
      // A low floor on purpose. Tony's voice leans on short one-line paragraphs
      // ("Yikes.", "Then Qwen3.6 dropped.") and a 24-character floor silently dropped
      // them from the node list while they stayed in the narration, desyncing the walk
      // for the rest of the post. Anything with real words is a candidate; minScore in
      // the aligner is what rejects a bad pairing, not length.
      return (el.textContent ?? '').trim().length > 8
    })
}

async function setUpFollowing() {
  try {
    const res = await fetch(`/audio${slugPath.value}.timing.json`)
    if (!res.ok) return
    timed.value = await res.json()
  } catch { return }
  if (!timed.value.length) return

  await nextTick()
  nodes.value = collectNodes()
  if (!nodes.value.length) return

  const texts = nodes.value.map(n => n.textContent ?? '')
  // Wider lookahead than the default: posts keep a Links section and other nodes the
  // narration drops, so the first correspondence can be a dozen nodes in.
  const m = alignToNodes(timed.value, texts, { lookahead: 20 })
  const confidence = alignmentConfidence(m)
  // Below this the timeline is not trustworthy enough to point at someone's reading.
  if (confidence < 0.6) {
    console.info(`[narration] alignment ${(confidence * 100).toFixed(0)}%, staying a plain player`)
    return
  }
  mapping.value = m
  following.value = true
  for (const [i, idx] of m.entries()) {
    if (idx < 0) continue
    const el = nodes.value[idx]
    el.classList.add('narration-seekable')
    el.addEventListener('click', () => seekToParagraph(i))
  }
}

function seekToParagraph(i: number) {
  const a = audio.value
  if (!a || !timed.value[i]) return
  a.currentTime = timed.value[i].start
  if (a.paused) void a.play()
}

function paint(idx: number) {
  if (idx === current.value) return
  // Headings are not matchable nodes, so the paragraph "being spoken" during one maps to
  // -1. Clearing on that makes the highlight blink off at every section break. Hold the
  // previous paragraph instead, and only clear when playback truly leaves the timeline.
  const next = idx >= 0 ? mapping.value[idx] : -1
  if (idx >= 0 && next < 0) { current.value = idx; return }
  const prev = current.value >= 0 ? mapping.value[current.value] : -1
  if (prev >= 0) nodes.value[prev]?.classList.remove('narration-active')
  if (next >= 0) nodes.value[next]?.classList.add('narration-active')
  current.value = idx
}

function onTimeUpdate() {
  const a = audio.value
  if (!a) return
  elapsed.value = a.currentTime
  if (following.value) paint(activeIndex(timed.value, a.currentTime))
}

// --- transport ---------------------------------------------------------------------
function toggle() {
  const a = audio.value
  if (!a) return
  if (a.paused) void a.play()
  else a.pause()
}
function scrub(e: MouseEvent) {
  const a = audio.value
  if (!a || !duration.value) return
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  a.currentTime = ((e.clientX - r.left) / r.width) * duration.value
}
function cycleRate() {
  const steps = [1, 1.25, 1.5, 2, 0.75]
  rate.value = steps[(steps.indexOf(rate.value) + 1) % steps.length]
  if (audio.value) audio.value.playbackRate = rate.value
}

// Metadata can land before the listener attaches (cached file, fast local dev), leaving
// the duration at zero and the scrubber dead. Read it on mount as well as on the events.
function readDuration() {
  const d = audio.value?.duration
  if (Number.isFinite(d) && d) duration.value = d as number
}

onMounted(() => {
  readDuration()
  void setUpFollowing()
})
onBeforeUnmount(() => {
  for (const el of nodes.value) el.classList.remove('narration-active', 'narration-seekable')
})
</script>

<template>
  <div class="narration-player my-6">
    <slot />

    <div
      v-if="!failed"
      class="overflow-hidden rounded-xl border border-default bg-elevated/40"
    >
      <!-- Provenance. The point of the strip: this was made here, not uploaded. -->
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-default px-4 py-2 text-[11px] text-muted">
        <span class="relative flex size-1.5">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
          <span class="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        <span class="font-medium text-default">Narrated on the rig</span>
        <span class="opacity-60">·</span>
        <span>my voice, cloned from a 16-second reference</span>
        <span class="opacity-60">·</span>
        <span>Breeze TTS 2 on an RTX 3090</span>
        <span v-if="following" class="opacity-60">·</span>
        <span v-if="following" class="text-primary">follows the text</span>
      </div>

      <div class="flex items-center gap-3 px-4 py-3">
        <UButton
          :icon="playing ? 'i-heroicons-pause-solid' : 'i-heroicons-play-solid'"
          color="primary"
          variant="soft"
          size="sm"
          :aria-label="playing ? 'Pause narration' : 'Play narration'"
          @click="toggle"
        />
        <span class="shrink-0 font-mono text-xs tabular-nums text-muted">
          {{ fmt(elapsed) }} / {{ fmt(duration) }}
        </span>
        <div
          class="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-accented"
          role="slider"
          :aria-valuenow="Math.round(progress)"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Seek"
          tabindex="0"
          @click="scrub"
        >
          <div class="h-full rounded-full bg-primary transition-[width] duration-150" :style="{ width: `${progress}%` }" />
        </div>
        <UButton color="neutral" variant="ghost" size="xs" class="font-mono" aria-label="Playback speed" @click="cycleRate">
          {{ rate }}x
        </UButton>
      </div>

      <p v-if="following" class="border-t border-default px-4 py-1.5 text-[11px] text-muted">
        Click any paragraph to jump there.
      </p>

      <audio
        ref="audio"
        :src="resolvedSrc"
        preload="metadata"
        class="hidden"
        @loadedmetadata="readDuration"
        @durationchange="readDuration"
        @timeupdate="onTimeUpdate"
        @play="playing = true"
        @pause="playing = false"
        @error="failed = true"
      />
    </div>

    <div
      v-else
      class="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-muted dark:border-gray-700"
    >
      <UIcon name="i-heroicons-speaker-x-mark" class="size-4 shrink-0" />
      <span>Audio narration isn't available for this post yet.</span>
    </div>
  </div>
</template>

<style>
/* Global, not scoped: these land on ContentRenderer output, outside this component. */
.narration-seekable {
  cursor: pointer;
  transition: background-color 150ms ease, box-shadow 150ms ease;
}
.narration-active {
  background-color: color-mix(in oklab, var(--ui-primary) 10%, transparent);
  box-shadow: -0.75rem 0 0 color-mix(in oklab, var(--ui-primary) 10%, transparent),
              inset 2px 0 0 var(--ui-primary);
  border-radius: 0 2px 2px 0;
}
@media (prefers-reduced-motion: reduce) {
  .narration-seekable { transition: none; }
}
</style>

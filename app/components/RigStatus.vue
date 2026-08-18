<script setup lang="ts">
/**
 * "Live from the rig" strip. Sits directly under the stats bar on the homepage.
 *
 * Reads MyMind's public, curated homelab status (brain.costanzoclan.com/api/public/rig:
 * GPUs by friendly label, vLLM engines, service health, LiteLLM tokens over 24h) straight
 * from the browser — pages here are prerendered, telemetry is not, and that endpoint is
 * public + CORS * by design. Nothing runs on Vercel for this.
 *
 * States:
 *   - hidden:  no URL configured, a 4xx (endpoint not deployed), or a network/CORS
 *              failure (no status code at all: the brain is unreachable, or an
 *              upstream 401/502 arrived without CORS headers and the browser hid it).
 *              An uninterpretable failure must not paint a status.
 *   - asleep:  a 5xx that carried CORS (the endpoint itself says Prometheus is down),
 *              or a 200 with no GPU reporting (rig powered off)
 *   - live:    at least one GPU reporting
 */
interface PublicRigGpu { label: string, utilPct: number | null, vramUsedBytes: number | null, vramTotalBytes: number | null, tempC: number | null }
interface PublicRig {
  generatedAt: string
  gpus: PublicRigGpu[]
  engines: { model: string, running: number, waiting: number }[]
  services: { id: string, label: string, up: boolean | null }[]
  tokens24h: number | null
  /** Models LiteLLM routed to in the last 24h, ranked by tokens (added 2026-08-18). */
  models24h?: { model: string, tokens?: number, requests?: number }[]
}

const url = useRuntimeConfig().public.rigStatusUrl as string

// Raw client-side fetch rather than useFetch: useFetch normalises a network/CORS failure
// into a generic statusCode 500, which is indistinguishable from the endpoint's own 502.
// Here `status` is the real HTTP status when a response was readable, or null when the
// browser never got one (unreachable host, or a CORS-less upstream error it hid from us).
const data = ref<PublicRig | null>(null)
const status = ref<number | null>(null)
const failed = ref(false)

onMounted(async () => {
  if (!url) return
  try {
    const res = await $fetch.raw<PublicRig>(url, { timeout: 6000, retry: 0 })
    status.value = res.status
    data.value = res._data ?? null
  } catch (e) {
    failed.value = true
    status.value = (e as { response?: { status?: number } })?.response?.status ?? null
  }
})

const upstreamDown = computed(() => status.value != null && status.value >= 500)
const show = computed(() => !!url && (data.value != null || upstreamDown.value))
const online = computed(() => !failed.value && (data.value?.gpus?.length ?? 0) > 0)

const gpus = computed(() => data.value?.gpus ?? [])
// The roster is what LiteLLM actually routed to in 24h (llama.cpp, TEI, TTS, image gen and the
// vLLM engines all go through it). Fall back to the vLLM engines when the roster is absent.
const roster = computed(() => {
  const r = data.value?.models24h
  if (r?.length) return r
  return (data.value?.engines ?? []).map(e => ({ model: e.model, tokens: 0, requests: 0 }))
})
// LiteLLM labels are provider-prefixed ("openai/qwen3.6-35b-a3b", "huggingface/tei/Qwen/Qwen3-Embedding-4B").
// The strip shows the last segment, the tooltip keeps the full label.
const shortName = (m: string) => m.split('/').filter(Boolean).pop() ?? m
const rosterHead = computed(() => roster.value.slice(0, 3).map(m => shortName(m.model)))
const rosterMore = computed(() => Math.max(0, roster.value.length - 3))
const rosterTooltip = computed(() => roster.value.map((m) => {
  const bits = [m.model]
  if (m.tokens) bits.push(`${compact(m.tokens)} tok`)
  if (m.requests) bits.push(`${compact(m.requests)} req`)
  return bits.join(' · ')
}).join('\n'))
const servicesUp = computed(() => (data.value?.services ?? []).filter(s => s.up === true).length)
const servicesKnown = computed(() => (data.value?.services ?? []).filter(s => s.up !== null).length)
const servicesTooltip = computed(() => (data.value?.services ?? []).filter(s => s.up !== null).map(s => `${s.label}: ${s.up ? 'up' : 'down'}`).join('\n'))

// VRAM is the honest "how loaded is this card" signal on an inference rig: models sit resident
// while GPU load idles between requests. Chips fill and tint by VRAM, tooltip carries the rest.
function vramPct(g: PublicRigGpu) {
  if (g.vramUsedBytes == null || !g.vramTotalBytes) return 0
  return Math.max(0, Math.min(100, (g.vramUsedBytes / g.vramTotalBytes) * 100))
}
function vramClass(g: PublicRigGpu) {
  const p = vramPct(g)
  if (p >= 75) return 'bg-green-400 shadow-[0_0_8px_rgba(70,194,17,0.55)]'
  if (p >= 40) return 'bg-green-500'
  return 'bg-green-800'
}

function compact(n?: number | null) {
  if (n == null) return null
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(Math.round(n))
}
function ago(iso?: string | null) {
  if (!iso) return null
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (!Number.isFinite(s)) return null
  if (s < 90) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return `${Math.round(s / 86400)} d ago`
}
function gpuTitle(g: PublicRigGpu) {
  const parts = [g.label]
  if (g.vramUsedBytes != null && g.vramTotalBytes) parts.push(`VRAM ${(g.vramUsedBytes / 2 ** 30).toFixed(1)} / ${(g.vramTotalBytes / 2 ** 30).toFixed(0)} GB (${Math.round(vramPct(g))}%)`)
  if (g.utilPct != null) parts.push(`load ${Math.round(g.utilPct)}%`)
  if (g.tempC != null) parts.push(`${Math.round(g.tempC)}C`)
  return parts.join(' · ')
}
</script>

<template>
  <section v-if="show" class="px-6" aria-label="Live homelab telemetry">
    <div
      class="relative z-10 max-w-6xl mx-auto -mt-7 rounded-xl border border-white/8 bg-(--ui-bg)/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 py-3 flex flex-wrap items-center gap-x-3.5 gap-y-3"
    >
      <!-- Label -->
      <div class="flex items-center gap-2.5 shrink-0">
        <span class="relative inline-flex size-2">
          <span v-if="online" class="absolute inline-flex size-full rounded-full bg-green-400 opacity-50 animate-ping" />
          <span class="relative inline-flex size-2 rounded-full" :class="online ? 'bg-green-400' : 'bg-(--ui-text-dimmed)'" />
        </span>
        <span class="text-[11px] uppercase tracking-[2px] whitespace-nowrap" :class="online ? 'text-green-400' : 'text-(--ui-text-dimmed)'">
          {{ online ? 'Live from the rig' : 'Rig asleep' }}
        </span>
        <span v-if="online && ago(data?.generatedAt)" class="font-mono text-[11px] text-(--ui-text-dimmed) whitespace-nowrap">&middot; {{ ago(data?.generatedAt) }}</span>
      </div>

      <template v-if="online">
        <div class="hidden sm:block w-px h-7 bg-(--ui-border-accented)" />

        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="text-[10px] uppercase tracking-[1.5px] text-(--ui-text-dimmed) whitespace-nowrap">GPUs online</span>
          <span class="font-mono text-[13px] leading-5 text-(--ui-text) whitespace-nowrap">{{ gpus.length }}</span>
        </div>

        <template v-if="roster.length">
          <div class="hidden sm:block w-px h-7 bg-(--ui-border-accented)" />
          <div class="hidden md:flex flex-col gap-0.5 min-w-0">
            <span class="text-[10px] uppercase tracking-[1.5px] text-(--ui-text-dimmed) whitespace-nowrap">Models, 24h</span>
            <UTooltip :text="rosterTooltip" :content="{ side: 'bottom' }" :ui="{ content: 'h-auto py-1.5 items-start', text: 'whitespace-pre-line leading-5' }">
              <span class="flex items-center gap-1.5 font-mono text-[13px] leading-5 text-(--ui-text) whitespace-nowrap cursor-default">
                <span class="truncate max-w-[220px] xl:max-w-[280px]">{{ rosterHead.join(' · ') }}</span>
                <span v-if="rosterMore" class="shrink-0 px-1.5 rounded bg-green-500/10 text-green-400 text-[11px] leading-5">+{{ rosterMore }}</span>
              </span>
            </UTooltip>
          </div>
        </template>

        <div class="hidden sm:block w-px h-7 bg-(--ui-border-accented)" />
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] uppercase tracking-[1.5px] text-(--ui-text-dimmed) whitespace-nowrap">VRAM</span>
          <span class="flex items-center gap-1.5 h-5">
            <UTooltip v-for="g in gpus" :key="g.label" :text="gpuTitle(g)" :content="{ side: 'bottom' }">
              <span class="relative inline-block w-8 h-2 rounded-sm bg-(--ui-bg-accented) overflow-hidden cursor-default">
                <span class="absolute inset-y-0 left-0 transition-[width] duration-700" :class="vramClass(g)" :style="{ width: `${vramPct(g)}%` }" />
              </span>
            </UTooltip>
          </span>
        </div>

        <template v-if="data?.tokens24h != null">
          <div class="hidden sm:block w-px h-7 bg-(--ui-border-accented)" />
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] uppercase tracking-[1.5px] text-(--ui-text-dimmed) whitespace-nowrap">Tokens, 24h</span>
            <span class="font-mono text-[13px] leading-5 text-(--ui-text) whitespace-nowrap">{{ compact(data.tokens24h) }}</span>
          </div>
        </template>

        <template v-if="servicesKnown">
          <div class="hidden sm:block w-px h-7 bg-(--ui-border-accented)" />
          <div class="hidden sm:flex flex-col gap-0.5">
            <span class="text-[10px] uppercase tracking-[1.5px] text-(--ui-text-dimmed) whitespace-nowrap">Services</span>
            <UTooltip :text="servicesTooltip" :content="{ side: 'bottom' }" :ui="{ content: 'h-auto py-1.5 items-start', text: 'whitespace-pre-line leading-5' }">
              <span class="font-mono text-[13px] leading-5 whitespace-nowrap cursor-default" :class="servicesUp === servicesKnown ? 'text-(--ui-text)' : 'text-amber-400'">{{ servicesUp }} / {{ servicesKnown }} up</span>
            </UTooltip>
          </div>
        </template>
      </template>

      <template v-else>
        <span class="text-sm text-(--ui-text-muted)">
          The GPUs are off, or the brain is (it happens).
          <template v-if="data?.generatedAt"> Last snapshot {{ ago(data.generatedAt) }}.</template>
        </span>
      </template>
    </div>
  </section>
</template>

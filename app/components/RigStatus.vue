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
 *   - hidden:  no URL configured, or the endpoint answers 4xx (not deployed yet)
 *   - asleep:  5xx / network error, or a 200 with no GPU reporting (rig powered off)
 *   - live:    at least one GPU reporting
 */
interface PublicRigGpu { label: string, utilPct: number | null, vramUsedBytes: number | null, vramTotalBytes: number | null, tempC: number | null }
interface PublicRig {
  generatedAt: string
  gpus: PublicRigGpu[]
  engines: { model: string, running: number, waiting: number }[]
  services: { id: string, label: string, up: boolean | null }[]
  tokens24h: number | null
}

const url = useRuntimeConfig().public.rigStatusUrl as string

const { data, error } = useFetch<PublicRig>(url, {
  server: false,
  lazy: true,
  immediate: !!url,
  key: 'rig-status',
  retry: false,
  timeout: 6000,
})

const status4xx = computed(() => {
  const code = (error.value as { statusCode?: number } | null)?.statusCode
  return code != null && code >= 400 && code < 500
})
const show = computed(() => !!url && !status4xx.value && (data.value != null || error.value != null))
const online = computed(() => !error.value && (data.value?.gpus?.length ?? 0) > 0)

const gpus = computed(() => data.value?.gpus ?? [])
const models = computed(() => (data.value?.engines ?? []).map(e => e.model).slice(0, 3))
const servicesUp = computed(() => (data.value?.services ?? []).filter(s => s.up === true).length)
const servicesKnown = computed(() => (data.value?.services ?? []).filter(s => s.up !== null).length)

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
  if (g.utilPct != null) parts.push(`${Math.round(g.utilPct)}%`)
  if (g.vramUsedBytes != null && g.vramTotalBytes) parts.push(`${(g.vramUsedBytes / 2 ** 30).toFixed(1)} / ${(g.vramTotalBytes / 2 ** 30).toFixed(0)} GB`)
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

        <template v-if="models.length">
          <div class="hidden sm:block w-px h-7 bg-(--ui-border-accented)" />
          <div class="hidden md:flex flex-col gap-0.5 min-w-0">
            <span class="text-[10px] uppercase tracking-[1.5px] text-(--ui-text-dimmed) whitespace-nowrap">Serving</span>
            <span class="block font-mono text-[13px] leading-5 text-(--ui-text) whitespace-nowrap truncate max-w-[200px] xl:max-w-[240px]" :title="models.join(', ')">{{ models.join(' · ') }}</span>
          </div>
        </template>

        <div class="hidden sm:block w-px h-7 bg-(--ui-border-accented)" />
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] uppercase tracking-[1.5px] text-(--ui-text-dimmed) whitespace-nowrap">Utilization</span>
          <span class="flex items-center gap-1.5 h-5">
            <span
              v-for="g in gpus"
              :key="g.label"
              class="relative inline-block w-8 h-2 rounded-sm bg-(--ui-bg-accented) overflow-hidden"
              :title="gpuTitle(g)"
            >
              <span class="absolute inset-y-0 left-0 bg-green-400 transition-[width] duration-700" :style="{ width: `${Math.max(0, Math.min(100, g.utilPct ?? 0))}%` }" />
            </span>
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
            <span class="font-mono text-[13px] leading-5 whitespace-nowrap" :class="servicesUp === servicesKnown ? 'text-(--ui-text)' : 'text-amber-400'">{{ servicesUp }} / {{ servicesKnown }} up</span>
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

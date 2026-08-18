<script setup lang="ts">
useReveal()

const SITE_DESCRIPTION = 'Tony Costanzo builds software on billion-dollar construction projects, runs a homelab full of GPUs, and writes field reports on AI agents, local inference, and whatever broke this weekend.'

definePageMeta({
  title: 'Full-Stack Developer, Project Controls & Local AI',
  description: SITE_DESCRIPTION,
})

useSeoMeta({
  title: 'Full-Stack Developer, Project Controls & Local AI',
  description: SITE_DESCRIPTION,
  ogTitle: 'Tony Costanzo | TechHive Labs',
  ogDescription: SITE_DESCRIPTION,
  ogUrl: 'https://www.techhivelabs.net/',
  twitterTitle: 'Tony Costanzo | TechHive Labs',
  twitterDescription: SITE_DESCRIPTION,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://www.techhivelabs.net/' }],
})

const testimonials = [
  {
    quote: 'I began working with Tony several years ago on a basic website with some functionality.  He delivered exactly what I asked for and has never left our side.  Every request, every question…he comes through!  I couldn’t ask for a better person to hold our hand through all of the small things we don’t understand.',
    name: 'Carrie Pledger',
    role: 'Owner - Adventure Zone Kids',
    url: 'https://adventurezonekids.com',
  },
  {
    quote: 'We\'ve worked with Tony on numerous projects and have always found his meticulous attention to detail and upbeat, can-do attitude to be hugely empowering. He writes clean code that we can easily build upon and he is able to quickly shift pace to accommodate changing requirements - an enormously useful trait to have!',
    name: 'Harry',
    role: 'Founder - HML Tech',
    url: 'https://hmltech.dev',
  },
  {
    quote: 'I had a great experience working with Tony. He is a skilled web developer, responsive, efficient, and focused on getting things done. With a well-defined scope, the work proceeded smoothly and matched what we planned. I would confidently recommend him to anyone looking for reliable development support.',
    name: 'Will',
    role: 'Founder',
  },
]

const socialLinks = [
  { to: 'https://github.com/Patrity', icon: 'i-fa6-brands-github', label: 'GitHub' },
  { to: 'https://x.com/Patrity', icon: 'i-fa6-brands-x-twitter', label: 'X' },
  { to: 'https://bsky.app/profile/patrity.com', icon: 'i-fa6-brands-bluesky', label: 'Bluesky' },
  { to: 'https://www.linkedin.com/in/tonycos/', icon: 'i-fa6-brands-linkedin', label: 'LinkedIn' },
]

const stats = [
  { value: 20, suffix: '+', label: 'Years Programming' },
  { value: 4, prefix: '1→', suffix: 'M', label: 'Fireship Growth' },
  { value: 10, suffix: '+', label: 'Years Professional' },
  { value: 12, suffix: 'B+', prefix: '$', label: 'In Projects Managed' },
]

// Newest posts drive both the hero ("latest" + "most read") and the Field Reports grid.
const { data: blog } = await useAsyncData('blog-index', () => {
  return queryCollection('blog')
    .select('title', 'author', 'date', 'draft', 'description', 'image', 'tags', 'navigation', 'path', 'stem', 'id')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .limit(8)
    .all()
})

// The latest post needs its body once, for the reading-time estimate on the hero card.
const { data: latestFull } = await useAsyncData('blog-latest-body', () => {
  return queryCollection('blog')
    .select('path', 'body')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .first()
})

const latest = computed(() => blog.value?.[0] ?? null)
const latestReadMins = computed(() => (latestFull.value?.body ? readingTime(latestFull.value.body) : 0))
const fieldReports = computed(() => blog.value?.slice(0, 3) ?? [])

// "Most read" ranks by Umami views (client-side, same batched endpoint the /blog
// listing uses). Until counts arrive, fall back to the two posts after the latest so
// the column never renders empty during prerender/hydration.
const { data: viewCounts } = useFetch('/api/views-batch', {
  server: false,
  lazy: true,
  query: { paths: (blog.value || []).map(p => p.path).join(',') },
  default: () => ({ counts: {} as Record<string, number> }),
})
const mostRead = computed(() => {
  const posts = (blog.value || []).filter(p => p.path !== latest.value?.path)
  const counts = viewCounts.value?.counts || {}
  const hasCounts = Object.keys(counts).length > 0
  const ranked = hasCounts
    ? [...posts].sort((a, b) => (counts[b.path] || 0) - (counts[a.path] || 0))
    : posts
  return ranked.slice(0, 2)
})

const { data: projects } = await useAsyncData('projects-index', () => {
  return queryCollection('projects')
    .select('title', 'description', 'images', 'path', 'tags', 'id', 'type', 'featured', 'priority')
    .where('featured', '=', true)
    .order('priority', 'ASC')
    .limit(4)
    .all()
})

const cards = computed(() => {
  if (!projects.value) return []
  return projects.value.map((project: any, index: number) => {
    const isWide = index === 0 || index === 3
    return {
      title: project.title,
      description: project.description,
      icon: project.type === 'code' ? 'i-heroicons-code-bracket' : 'i-heroicons-video-camera',
      to: project.path,
      class: isWide ? 'lg:col-span-2' : 'lg:col-span-1',
      image: project.images?.[0],
      orientation: isWide ? 'horizontal' : 'vertical',
      type: project.type,
    }
  })
})
</script>

<template>
  <!-- ═══════════════ HERO ═══════════════ -->
  <section class="relative min-h-[100dvh] flex items-center overflow-hidden">
    <HiveBackground />

    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-8 py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      <!-- Identity -->
      <div class="lg:col-span-7 max-w-3xl">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-green-400 mb-6"
          style="animation: fade-in 0.6s ease-out both;"
        >
          <span class="inline-flex size-2 rounded-full bg-green-400" />
          Open to freelance and consulting
        </div>

        <h1
          class="font-teko text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] font-bold leading-[0.86] tracking-tight"
          style="animation: fade-up 0.8s ease-out 0.15s both;"
        >
          Construction data,<br />
          AI agents, and<br />
          <span class="gradient-text">whatever broke</span><br />
          this weekend.
        </h1>

        <div
          class="mt-6 flex items-center gap-2 font-mono"
          style="animation: fade-in 1s ease-out 0.5s both;"
        >
          <span class="text-green-500/60 text-sm">~/</span>
          <span class="text-base sm:text-lg text-(--ui-text)">full-stack dev &middot; project controls &middot; local AI</span>
        </div>

        <p
          class="mt-4 max-w-xl text-(--ui-text-muted) text-base sm:text-lg leading-relaxed"
          style="animation: fade-up 0.8s ease-out 0.7s both;"
        >
          Twenty years of code, ten of them on billion-dollar EPC projects. I build RAG pipelines and
          agentic workflows for the messiest data in industry, run a rack of 3090s at home, and write
          down what breaks (a lot breaks).
        </p>

        <div
          class="mt-7 flex flex-wrap items-center gap-4"
          style="animation: fade-up 0.8s ease-out 0.9s both;"
        >
          <UButton to="#field-reports" color="primary" variant="solid" size="lg" trailing-icon="i-heroicons-arrow-right">
            Read the field reports
          </UButton>
          <UButton to="/contact" color="neutral" variant="outline" size="lg" icon="i-heroicons-envelope">
            Work with me
          </UButton>
        </div>

        <div
          class="mt-9 flex items-center gap-4"
          style="animation: fade-in 1s ease-out 1.1s both;"
        >
          <span class="text-xs uppercase tracking-widest text-(--ui-text-dimmed)">Find me</span>
          <div class="h-px w-8 bg-(--ui-border)" />
          <NuxtLink
            v-for="social in socialLinks"
            :key="social.to"
            :to="social.to"
            target="_blank"
            :aria-label="social.label"
            class="text-(--ui-text-dimmed) hover:text-green-400 transition-all duration-200 hover:scale-110"
          >
            <UIcon :name="social.icon" class="size-5" />
          </NuxtLink>
        </div>
      </div>

      <!-- Latest + most read -->
      <div
        v-if="latest"
        class="lg:col-span-5 flex flex-col gap-4"
        style="animation: fade-up 0.8s ease-out 0.5s both;"
      >
        <span class="text-xs uppercase tracking-widest text-(--ui-text-dimmed)">Latest field report</span>
        <NuxtLink
          :to="latest.path"
          class="group relative block rounded-xl overflow-hidden ring-1 ring-(--ui-border) hover:ring-green-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(70,194,17,0.12)]"
        >
          <img
            v-if="latest.image"
            :src="latest.image"
            :alt="latest.title"
            width="960"
            height="540"
            fetchpriority="high"
            class="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/50 to-transparent" />
          <div class="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-2">
            <div v-if="latest.tags?.length" class="flex flex-wrap gap-1.5">
              <UBadge v-for="t in latest.tags" :key="t" :label="t" size="sm" color="primary" variant="soft" />
            </div>
            <h2 class="text-lg sm:text-xl font-semibold leading-snug text-white text-pretty">{{ latest.title }}</h2>
            <p class="text-xs sm:text-sm text-neutral-300">
              {{ formatDate(latest.date) }}<template v-if="latestReadMins"> &middot; {{ latestReadMins }} min read</template>
            </p>
          </div>
        </NuxtLink>

        <div v-if="mostRead.length" class="flex flex-col gap-3 pt-1">
          <span class="text-xs uppercase tracking-widest text-(--ui-text-dimmed)">Most read</span>
          <NuxtLink
            v-for="post in mostRead"
            :key="post.path"
            :to="post.path"
            class="group flex items-center gap-3.5"
          >
            <img
              v-if="post.image"
              :src="post.image"
              :alt="post.title"
              width="208"
              height="117"
              loading="lazy"
              class="w-26 h-[58px] shrink-0 rounded-md object-cover ring-1 ring-(--ui-border)"
            >
            <div class="min-w-0 flex flex-col gap-0.5">
              <span class="text-sm font-semibold leading-tight text-(--ui-text) group-hover:text-green-400 transition-colors text-pretty">{{ post.title }}</span>
              <span class="text-xs text-(--ui-text-dimmed)">
                {{ formatDate(post.date) }}<template v-if="viewCounts?.counts?.[post.path]"> &middot; {{ viewCounts.counts[post.path].toLocaleString() }} views</template>
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden lg:block" style="animation: fade-in 1.5s ease-out 1.5s both;">
      <NuxtLink to="#stats" class="flex flex-col items-center gap-2 text-(--ui-text-dimmed) hover:text-green-400 transition-colors">
        <span class="text-xs uppercase tracking-widest">Scroll</span>
        <UIcon name="i-heroicons-chevron-down" class="size-5" style="animation: scroll-hint 2s ease-in-out infinite;" />
      </NuxtLink>
    </div>
  </section>

  <!-- ═══════════════ STATS BAR ═══════════════ -->
  <section id="stats" class="relative py-16 border-y border-(--ui-border)">
    <div class="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5" />
    <div class="relative max-w-5xl mx-auto px-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="text-center reveal"
          :style="{ transitionDelay: `${i * 0.15}s` }"
        >
          <div class="font-teko text-5xl sm:text-6xl font-bold text-green-400">
            <AnimatedCounter :target="stat.value" :suffix="stat.suffix" :prefix="stat.prefix" :duration="2000" />
          </div>
          <p class="mt-1 text-sm text-(--ui-text-muted) uppercase tracking-wider">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Live telemetry from the homelab. Renders nothing until the rig endpoint is configured. -->
  <RigStatus />

  <!-- ═══════════════ FIELD REPORTS ═══════════════ -->
  <UPageSection id="field-reports" :ui="{ title: 'font-teko' }">
    <template #title>
      <span class="gradient-text">Field Reports</span>
    </template>
    <template #description>
      <p class="text-center text-(--ui-text-muted)">
        What broke, what I learned, and what it cost. Roughly monthly, always longer than planned.
      </p>
    </template>

    <UBlogPosts>
      <UBlogPost
        v-for="(post, i) in fieldReports"
        :key="post.id"
        variant="subtle"
        :title="post.title"
        :description="post.description"
        :image="post.image"
        :date="post.date"
        :to="post.path"
        class="reveal"
        :style="{ transitionDelay: `${i * 0.15}s` }"
      >
        <template #date>{{ formatDate(post.date) }}</template>
        <template #description>
          <span>{{ post.description }}</span>
          <span v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1.5">
            <UBadge
              v-for="t in post.tags"
              :key="t"
              :label="t"
              size="sm"
              color="primary"
              variant="soft"
            />
          </span>
        </template>
      </UBlogPost>
    </UBlogPosts>

    <div class="flex justify-center mt-4 reveal">
      <UButton to="/blog" color="primary" variant="outline" size="lg" trailing-icon="i-heroicons-arrow-right">
        Read all field reports
      </UButton>
    </div>
  </UPageSection>

  <!-- ═══════════════ THINGS I'VE BUILT ═══════════════ -->
  <UPageSection
    id="projects"
    class="border-t border-(--ui-border)"
    :ui="{ title: 'font-teko' }"
  >
    <template #title>
      Things I've <span class="gradient-text">Built</span>
    </template>
    <template #description>
      <p class="text-center text-(--ui-text-muted)">
        Products, internal tools, and the occasional game server. Curated to the last few years.
      </p>
    </template>

    <UPageGrid>
      <NuxtLink
        v-for="(card, index) in cards"
        :key="index"
        :to="card.to"
        class="group relative overflow-hidden rounded-xl border border-(--ui-border) transition-all duration-300 hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(70,194,17,0.1)] reveal"
        :class="card.class"
        :style="{ transitionDelay: `${index * 0.1}s` }"
      >
        <div class="relative overflow-hidden" :class="card.orientation === 'horizontal' ? 'h-48' : 'h-40'">
          <img
            v-if="card.image"
            :src="card.image"
            :alt="card.title"
            width="640"
            height="360"
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div class="absolute top-3 right-3 glass-card rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-medium text-green-300">
            <UIcon :name="card.icon" class="size-3.5" />
            <span class="capitalize">{{ card.type }}</span>
          </div>
        </div>

        <div class="p-5">
          <h3 class="font-teko text-2xl font-semibold group-hover:text-green-400 transition-colors">{{ card.title }}</h3>
          <p v-if="card.description" class="mt-1 text-sm text-(--ui-text-muted) line-clamp-2">{{ card.description }}</p>
        </div>
      </NuxtLink>
    </UPageGrid>

    <div class="flex justify-center mt-4 reveal">
      <UButton to="/projects" color="primary" variant="outline" size="lg" trailing-icon="i-heroicons-arrow-right">
        All projects
      </UButton>
    </div>
  </UPageSection>

  <!-- ═══════════════ WHO'S WRITING THIS ═══════════════ -->
  <section class="py-20 px-6 relative overflow-hidden border-t border-(--ui-border)">
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/3 to-transparent" />
    <div class="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
      <div class="flex-shrink-0 reveal-left">
        <div class="relative">
          <img
            src="/images/tony.webp"
            alt="Tony Costanzo"
            width="240"
            height="240"
            loading="lazy"
            class="rounded-2xl size-48 sm:size-56 object-cover border-2 border-green-500/20 shadow-2xl"
          >
          <div class="absolute -inset-1 rounded-2xl bg-gradient-to-br from-green-500/20 to-transparent -z-10 blur-sm" />
        </div>
      </div>

      <div class="text-center md:text-left reveal-right">
        <h2 class="font-teko text-4xl sm:text-5xl font-bold">
          Who's <span class="gradient-text">Writing</span> This
        </h2>
        <p class="mt-4 text-(--ui-text-muted) text-lg leading-relaxed max-w-xl">
          Self-taught on MMORPG servers, ten years in construction project controls, and four years at
          Fireship helping grow the channel from 1M to 4M subscribers. These days most of my week is AI
          agents and industrial data. I've worn a lot of hats (some of them hard hats).
        </p>
        <UButton to="/about" color="primary" variant="soft" size="lg" class="mt-6" trailing-icon="i-heroicons-arrow-right">
          Learn my story
        </UButton>
      </div>
    </div>
  </section>

  <!-- ═══════════════ TESTIMONIALS ═══════════════ -->
  <section class="py-20 px-6 border-t border-(--ui-border)">
    <div class="max-w-5xl mx-auto">
      <h2 class="font-teko text-4xl sm:text-5xl font-bold text-center mb-12 reveal">
        What People <span class="gradient-text">Say</span>
      </h2>

      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="(t, i) in testimonials"
          :key="i"
          class="glass-card rounded-xl p-6 relative reveal"
          :style="{ transitionDelay: `${i * 0.15}s` }"
        >
          <span class="text-5xl leading-none text-green-500/20 font-serif absolute top-4 left-5">&ldquo;</span>

          <p class="text-(--ui-text-muted) text-sm leading-relaxed mt-6 italic">
            {{ t.quote }}
          </p>

          <div class="mt-5 pt-4 border-t border-(--ui-border) flex items-center gap-3">
            <div class="size-9 rounded-full bg-green-500/10 flex items-center justify-center">
              <UIcon name="i-heroicons-user" class="size-4 text-green-400" />
            </div>
            <ULink :to="t.url">
              <p class="text-sm font-medium">{{ t.name }}</p>
              <p class="text-xs text-(--ui-text-dimmed)">{{ t.role }}</p>
            </ULink>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════ CTA ═══════════════ -->
  <section class="relative py-24 px-6 overflow-hidden">
    <div class="absolute inset-0">
      <div class="absolute rounded-full blur-[100px] opacity-15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 600px; height: 300px; background: var(--color-green-500);" />
    </div>
    <div class="absolute inset-0 border-y border-(--ui-border)" />

    <div class="relative text-center max-w-2xl mx-auto reveal">
      <h2 class="font-teko text-5xl sm:text-6xl font-bold">
        Let's Talk <span class="gradient-text">Shop</span>
      </h2>
      <p class="mt-4 text-(--ui-text-muted) text-lg">
        Ugly data, an AI idea that needs to survive contact with reality, or a web app that should
        already exist.. I'd like to hear about it.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <UButton to="/contact" color="primary" variant="solid" size="xl" icon="i-heroicons-envelope">
          Get in touch
        </UButton>
        <UButton to="https://www.linkedin.com/in/tonycos/" target="_blank" color="neutral" variant="ghost" size="xl" icon="i-fa6-brands-linkedin">
          Follow on LinkedIn
        </UButton>
      </div>
    </div>
  </section>
</template>

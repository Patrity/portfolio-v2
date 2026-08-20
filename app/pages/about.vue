<script lang="ts" setup>
useReveal()

const ABOUT_DESCRIPTION = 'Full-stack developer and project controls consultant with 20+ years of code, ten of them on billion-dollar construction projects. The story, the timeline, and what I actually do.'

definePageMeta({
  title: 'About - Tony Costanzo | TechHive Labs',
  description: ABOUT_DESCRIPTION,
})

useSeoMeta({
  title: 'About - Tony Costanzo',
  description: ABOUT_DESCRIPTION,
  ogTitle: 'About - Tony Costanzo',
  ogDescription: ABOUT_DESCRIPTION,
  ogUrl: 'https://www.techhivelabs.net/about',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://www.techhivelabs.net/about' }],
})

defineOgImageComponent('TechHive', {
  title: 'About Tony',
  description: ABOUT_DESCRIPTION,
})

useSchemaOrg([
  definePerson({
    name: 'Tony Costanzo',
    alternateName: 'Patrity',
    jobTitle: 'Project Controls SME / Consultant and Full-Stack Developer',
    image: 'https://www.techhivelabs.net/images/tony.webp',
    url: 'https://www.techhivelabs.net/about',
    sameAs: [
      'https://github.com/Patrity',
      'https://x.com/Patrity',
      'https://www.linkedin.com/in/tonycos/',
      'https://bsky.app/profile/patrity.com',
    ],
  }),
])

const socialLinks = [
  { to: 'https://github.com/Patrity', icon: 'i-fa6-brands-github', label: 'GitHub' },
  { to: 'https://x.com/Patrity', icon: 'i-fa6-brands-x-twitter', label: 'X' },
  { to: 'https://bsky.app/profile/patrity.com', icon: 'i-fa6-brands-bluesky', label: 'Bluesky' },
  { to: 'https://www.linkedin.com/in/tonycos/', icon: 'i-fa6-brands-linkedin', label: 'LinkedIn' },
]

const timeline = [
  {
    date: '2026 — Present',
    title: 'Project Controls SME / Consultant',
    company: 'Next Logical Step Solutions',
    description: 'Project controls SME on one side, AI and automation builder on the other.. bridging the gap between technology and construction for a company focused primarily on large data center builds. The spreadsheet still gets automated before anyone asks.',
    icon: 'i-heroicons-cpu-chip',
  },
  {
    date: '2025 — Present',
    title: 'AI Implementation',
    company: 'McDermott, Consulting & NLS',
    description: 'AI for practical business applications: custom RAG pipelines, OCR implementations, OpenAI and Anthropic API integrations, and agentic workflows that cut labor cost and clean up data pipelines. Started at McDermott, sharpened through consulting, and now core to the day job at NLS.',
    icon: 'i-heroicons-sparkles',
  },
  {
    date: '2022 — 2026',
    title: 'Content & Community Manager',
    company: 'Fireship',
    description: 'Helped grow one of the biggest programming channels on YouTube from 1M to 4M subscribers: content curation, video editing, sponsorship sourcing, community and social, and eventually scripts and full productions. The role ended when the company was acquired. Still one of the best chapters.',
    icon: 'i-heroicons-fire',
    color: '#f97316',
  },
  {
    date: '2021 — Present',
    title: 'Freelance Developer & Consultant',
    company: 'TechHive Labs',
    description: 'Freelancing and consulting for small businesses while building my own products: Cognova, TakeoffHelper, Vectly, and more. Full-stack web development, AI implementations, and digital strategy.',
    icon: 'i-heroicons-code-bracket',
  },
  {
    date: '2016 — Present',
    title: 'Project Controls Specialist',
    company: 'McDermott, Zachry & More',
    description: 'Small industrial contractors and large EPC firms on mega projects for giants like Exxon, Chevron, Valero, and even SpaceX. The first four years (2016 to 2020) were pure estimating, pricing oil and gas work and learning where every number comes from. After that: progress, forecasts, budgets, and the tools to automate all of it.',
    icon: 'i-heroicons-chart-bar',
  },
  {
    date: '2006 — 2016',
    title: 'The Starting Point',
    company: 'Construction Field + Self-Taught Dev',
    description: 'By day (2011–2016), hands-on in civil and survey crews, learning construction from the ground up. By night (2006–2016), teaching myself to code through game development, MMORPGs, and countless side projects. Learned HTTP, relational databases, OOP, and software architecture the hard way: by building things that broke.',
    icon: 'i-heroicons-academic-cap',
  },
]

const stats = [
  { value: 20, suffix: '+', label: 'Years Programming', description: 'Started coding as a teenager, never stopped.' },
  { value: 4, prefix: '1→', suffix: 'M', label: 'Fireship Growth', description: 'Joined at a million subscribers, left at four.' },
  { value: 10, suffix: '+', label: 'Years Professional', description: 'From construction to content to code.' },
  { value: 12, suffix: 'B+', prefix: '$', label: 'In Projects Managed', description: 'Golden Pass LNG, GTPP, and more.' },
]

const lanes = [
  {
    title: 'Construction data',
    icon: 'i-heroicons-building-office-2',
    body: 'Progress, forecasts, earned value, and the 3D model data underneath it all. Ten years on EPC mega-projects, most of it building the tools the department didn\'t have yet.',
    proof: ['PCR', 'BIM extraction', 'Golden Pass LNG', 'Project controls'],
  },
  {
    title: 'AI agents & inference',
    icon: 'i-heroicons-cpu-chip',
    body: 'RAG pipelines, agentic workflows, and a homelab that hosts most of it. Four 3090s, LiteLLM, and opinions about MoE models.',
    proof: ['Cognova', 'Vectly', 'The rig', 'Anthropic API'],
  },
  {
    title: 'Web apps that ship',
    icon: 'i-heroicons-globe-alt',
    body: 'Nuxt and Postgres, plus whatever the job needs. Products of my own and custom builds for small businesses that outgrew the template.',
    proof: ['TakeoffHelper', 'Quadzilla', 'Adventure Zone Kids'],
  },
]

const stack = ['Nuxt', 'Vue', 'TypeScript', 'Node', 'PostgreSQL', 'pgvector', 'Kotlin', 'Python', 'LiteLLM', 'Anthropic & OpenAI APIs', 'Cloudflare', 'Vercel']
</script>

<template>
  <!-- ═══════════════ HERO ═══════════════ -->
  <section class="relative py-20 sm:py-28 overflow-hidden">
    <HiveBackground />

    <div class="relative z-10 max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10 md:gap-14">
      <div class="flex-shrink-0" style="animation: scale-in 0.7s ease-out both;">
        <div class="relative">
          <img
            src="/images/tony.webp"
            alt="Tony Costanzo"
            width="200"
            height="200"
            class="rounded-2xl size-40 sm:size-48 object-cover glow-ring"
          />
          <div class="absolute -inset-2 rounded-2xl bg-gradient-to-br from-green-500/20 to-transparent -z-10 blur-md" />
        </div>
      </div>

      <div class="text-center md:text-left" style="animation: fade-up 0.8s ease-out 0.2s both;">
        <h1 class="font-teko text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.9]">
          Tony
          <span class="gradient-text">Costanzo</span>
        </h1>
        <p class="mt-2 text-lg text-(--ui-text-muted)">
          Full-stack developer &bull; Project controls consultant &bull; TechHive Labs founder
        </p>
        <p class="mt-4 text-(--ui-text-dimmed) max-w-md leading-relaxed">
          Twenty years of code, ten of them on billion-dollar job sites, and more hats than a haberdasher.
        </p>

        <div class="mt-5 flex items-center justify-center md:justify-start gap-3">
          <NuxtLink
            v-for="social in socialLinks"
            :key="social.to"
            :to="social.to"
            target="_blank"
            :aria-label="social.label"
            class="size-10 rounded-lg glass-card flex items-center justify-center text-(--ui-text-dimmed) hover:text-green-400 hover:border-green-500/30 transition-all duration-200"
          >
            <UIcon :name="social.icon" class="size-5" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════ BIO ═══════════════ -->
  <section class="py-16 px-6 border-t border-(--ui-border)">
    <div class="max-w-4xl mx-auto">
      <h2 class="font-teko text-4xl font-bold mb-8 reveal">
        The <span class="gradient-text">Story</span>
      </h2>

      <div class="grid md:grid-cols-2 gap-8 text-(--ui-text-muted) leading-relaxed">
        <div class="space-y-4 reveal" style="transition-delay: 0.1s;">
          <p>
            Hi! My name is Tony. I've also gone by <span class="text-(--ui-text) font-medium">Patrity</span> for many years.
            I'm a full-stack developer with a passion for problem solving and a love for learning.
            I've been programming for over 20 years and working professionally for over 10.
          </p>
          <p>
            I still take on freelance and consulting work, mostly with small businesses that need something
            custom: customer portals, e-commerce, AI implementations, and whatever unique challenge walks in the door.
            In {{ new Date().getFullYear() }} an online presence is table stakes.. the interesting part is what you build on top of it.
          </p>
        </div>
        <div class="space-y-4 reveal" style="transition-delay: 0.2s;">
          <p>
            From 2022 to 2026 I curated content, edited video, sourced sponsorships, and managed the community for
            <ULink to="https://youtube.com/fireship" target="_blank" class="text-orange-400 font-semibold hover:underline">Fireship</ULink>,
            one of the biggest programming channels on YouTube. I joined at around a million subscribers and left at four.
            The role ended when the company was acquired, and it's still one of the best chapters.
          </p>
          <p>
            By day I'm a project controller and consultant on multi-billion dollar industrial mega-projects: progress,
            forecasts, budgets, and increasingly the AI agents and data tooling underneath them. That intersection is
            where most of my interesting problems (and most of the blog) come from.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════ CAREER TIMELINE ═══════════════ -->
  <section class="py-16 px-6 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/3 to-transparent" />

    <div class="relative max-w-3xl mx-auto">
      <h2 class="font-teko text-4xl font-bold mb-12 text-center reveal">
        Career <span class="gradient-text">Timeline</span>
      </h2>

      <div class="absolute left-6 md:left-1/2 top-32 bottom-16 w-px bg-gradient-to-b from-green-500/40 via-green-500/20 to-transparent" />

      <div class="space-y-2">
        <div
          v-for="(item, i) in timeline"
          :key="i"
          class="reveal"
          :style="{ transitionDelay: `${i * 0.15}s` }"
        >
          <TimelineItem v-bind="item" />
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════ WHAT I ACTUALLY DO ═══════════════ -->
  <section class="py-16 px-6 border-t border-(--ui-border)">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-10 reveal">
        <h2 class="font-teko text-4xl font-bold">
          What I <span class="gradient-text">Actually</span> Do
        </h2>
        <p class="mt-3 text-(--ui-text-muted)">Three lanes. They overlap more than you'd think.</p>
      </div>

      <div class="grid sm:grid-cols-3 gap-4">
        <div
          v-for="(lane, i) in lanes"
          :key="lane.title"
          class="glass-card rounded-xl p-6 flex flex-col gap-4 group hover:border-green-500/20 transition-all duration-300 reveal"
          :style="{ transitionDelay: `${i * 0.1}s` }"
        >
          <div class="flex items-center gap-3">
            <div class="size-10 shrink-0 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <UIcon :name="lane.icon" class="size-5 text-green-400" />
            </div>
            <h3 class="font-teko text-2xl font-semibold leading-tight">{{ lane.title }}</h3>
          </div>
          <p class="text-sm text-(--ui-text-muted) leading-relaxed">{{ lane.body }}</p>
          <div class="mt-auto flex flex-col gap-2">
            <span class="text-[11px] uppercase tracking-[2px] text-(--ui-text-dimmed)">Proof</span>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="p in lane.proof"
                :key="p"
                class="px-3 py-1 text-sm rounded-full bg-white/5 text-(--ui-text-muted) border border-(--ui-border) group-hover:border-green-500/20 transition-colors"
              >
                {{ p }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3 reveal">
        <span class="text-[11px] uppercase tracking-[2px] text-(--ui-text-dimmed)">Day-to-day stack</span>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="s in stack"
            :key="s"
            class="px-3 py-1 text-sm rounded-full bg-white/5 text-(--ui-text-muted) border border-(--ui-border)"
          >
            {{ s }}
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════ STATS ═══════════════ -->
  <section class="py-16 px-6 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5" />
    <div class="absolute inset-0 border-y border-(--ui-border)" />

    <div class="relative max-w-4xl mx-auto">
      <h2 class="font-teko text-4xl font-bold mb-12 text-center reveal">
        By The <span class="gradient-text">Numbers</span>
      </h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="text-center reveal"
          :style="{ transitionDelay: `${i * 0.15}s` }"
        >
          <div class="font-teko text-5xl font-bold text-green-400">
            <AnimatedCounter :target="stat.value" :suffix="stat.suffix" :prefix="stat.prefix" :duration="2000" />
          </div>
          <p class="mt-1 text-sm font-medium text-(--ui-text) uppercase tracking-wider">{{ stat.label }}</p>
          <p class="mt-1 text-xs text-(--ui-text-dimmed)">{{ stat.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════ CTA ═══════════════ -->
  <section class="relative py-24 px-6 overflow-hidden">
    <div class="absolute inset-0">
      <div class="absolute rounded-full blur-[100px] opacity-15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 600px; height: 300px; background: var(--color-green-500);" />
    </div>

    <div class="relative text-center max-w-2xl mx-auto reveal">
      <h2 class="font-teko text-5xl sm:text-6xl font-bold">
        Want to Work
        <span class="gradient-text">Together?</span>
      </h2>
      <p class="mt-4 text-(--ui-text-muted) text-lg">
        I'm always open to interesting projects, collaborations, and conversations.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <UButton to="/contact" color="primary" variant="solid" size="xl" icon="i-heroicons-envelope">
          Get In Touch
        </UButton>
        <UButton to="/projects" color="neutral" variant="ghost" size="xl" icon="i-heroicons-folder-open">
          See My Work
        </UButton>
      </div>
    </div>
  </section>
</template>

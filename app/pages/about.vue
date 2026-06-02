<script lang="ts" setup>
useReveal()

definePageMeta({
  title: 'About - Tony Costanzo | TechHive Labs',
  description: 'Full-stack developer, content creator, and digital consultant with 20+ years of experience. Learn about my journey and what drives me.',
})

useSeoMeta({
  title: 'About - Tony Costanzo',
  description: 'Full-stack developer, content creator, and digital consultant with 20+ years of experience. Learn about my journey and what drives me.',
  ogTitle: 'About - Tony Costanzo',
  ogDescription: 'Full-stack developer, content creator, and digital consultant with 20+ years of experience.',
  ogUrl: 'https://www.techhivelabs.net/about',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://www.techhivelabs.net/about' }],
})

useSchemaOrg([
  definePerson({
    name: 'Tony Costanzo',
    alternateName: 'Patrity',
    jobTitle: 'Full-Stack Developer & Founder',
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
    date: '2022 — Present',
    title: 'Content & Community Manager',
    company: 'Fireship',
    description: 'Curate content, edit video, source sponsorships, manage social media, and create original content for one of the leading programming channels on YouTube with over 4 million subscribers.',
    icon: 'i-heroicons-fire',
    color: '#f97316',
  },
  {
    date: '2021 — Present',
    title: 'Freelance Developer & Consultant',
    company: 'TechHive Labs',
    description: 'Freelancing and consulting for small businesses while building my own products — Cognova, TakeoffHelper, Vectly, and more. Full-stack web development, AI implementations, and digital strategy.',
    icon: 'i-heroicons-code-bracket',
  },
  {
    date: '2016 — Present',
    title: 'Project Controls Specialist',
    company: 'McDermott, Zachry & More',
    description: 'Working at both small industrial contractors and large EPC firms on mega projects for oil & gas giants like Exxon, Chevron, Valero, and even SpaceX. Managing progress, forecasts, budgets, and building tools to automate the data.',
    icon: 'i-heroicons-chart-bar',
  },
  {
    date: '2006 — 2016',
    title: 'The Starting Point',
    company: 'Construction Field + Self-Taught Dev',
    description: 'By day (2011–2016), working hands-on in civil and survey crews — learning construction from the ground up. By night (2006–2016), teaching myself to code through game development, MMORPGs, and countless side projects. Learned HTTP, relational databases, OOP, and software architecture the hard way — by building things that broke.',
    icon: 'i-heroicons-academic-cap',
  },
]

const stats = [
  { value: 20, suffix: '+', label: 'Years Programming', description: 'Started coding as a teenager, never stopped.' },
  { value: 4, suffix: 'M+', label: 'Subscribers Managed', description: 'Growing and engaging the Fireship community.' },
  { value: 10, suffix: '+', label: 'Years Professional', description: 'From construction to content to code.' },
  { value: 12, suffix: 'B+', prefix: '$', label: 'In Projects Managed', description: 'Golden Pass LNG, GTPP, and more.' },
]

const skillCategories = [
  {
    title: 'Frontend',
    icon: 'i-heroicons-computer-desktop',
    skills: ['Vue', 'Nuxt', 'React', 'Tailwind CSS', 'TypeScript', 'HTML/CSS'],
  },
  {
    title: 'Backend',
    icon: 'i-heroicons-server-stack',
    skills: ['Node.js', 'Fastify', 'Python', 'Java', 'Kotlin', 'Nitro', 'REST APIs', 'WebSockets'],
  },
  {
    title: 'Data & Infrastructure',
    icon: 'i-heroicons-circle-stack',
    skills: ['PostgreSQL', 'Supabase', 'pgvector', 'SQLite', 'Vercel', 'Cloudflare'],
  },
  {
    title: 'AI & Automation',
    icon: 'i-heroicons-cpu-chip',
    skills: ['RAG Pipelines', 'Agentic Workflows', 'LLM Integration', 'Vector Search', 'Prompt Engineering', 'Claude & OpenAI APIs'],
  },
  {
    title: 'Construction',
    icon: 'i-heroicons-building-office-2',
    skills: ['Project Controls', 'Earned Value', 'Reporting', 'Scheduling', '3D Data', 'Project Forecasts', 'Change Management'],
  },
  {
    title: 'Creative & Content',
    icon: 'i-heroicons-paint-brush',
    skills: ['Premiere Pro', 'After Effects', 'Content Strategy', 'Script Writing', 'SEO', 'Social Media'],
  },
]
</script>

<template>
  <!-- ═══════════════ HERO ═══════════════ -->
  <section class="relative py-20 sm:py-28 overflow-hidden">
    <HeroBackground />

    <div class="relative z-10 max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10 md:gap-14">
      <!-- Photo -->
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

      <!-- Info -->
      <div class="text-center md:text-left" style="animation: fade-up 0.8s ease-out 0.2s both;">
        <h1 class="font-teko text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.9]">
          Tony
          <span class="gradient-text">Costanzo</span>
        </h1>
        <p class="mt-2 text-lg text-(--ui-text-muted)">
          TechHive Labs Founder &bull; Developer &bull; Creator
        </p>
        <p class="mt-4 text-(--ui-text-dimmed) max-w-md leading-relaxed">
          Building digital futures with 20+ years of code, a love for creative problem-solving,
          and more hats than a haberdasher.
        </p>

        <!-- Social links -->
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
            Hi! My name is Tony — I've also gone by <span class="text-(--ui-text) font-medium">Patrity</span> for many years.
            I'm a full-stack developer with a passion for problem solving and a love for learning.
            I've been programming for over 20 years and working professionally for over 10.
          </p>
          <p>
            I specialize in hands-on web development with local small businesses, bringing them to the
            future and enhancing their online presence. In {{ new Date().getFullYear() }}, an online presence is
            essential for any business. I've helped several small businesses build custom solutions —
            customer portals, e-commerce platforms, and whatever unique challenges they face.
          </p>
        </div>
        <div class="space-y-4 reveal" style="transition-delay: 0.2s;">
          <p>
            Beyond code, I curate content, edit video, source sponsorships, and manage social media for
            <ULink to="https://youtube.com/fireship" target="_blank" class="text-orange-400 font-semibold hover:underline">Fireship</ULink>,
            one of the leading programming channels on YouTube with over 4 million subscribers.
            I've been with the channel since 2022 and have expanded into script writing and full productions.
          </p>
          <p>
            By day, I work in industrial construction project controls on multi-billion dollar mega projects —
            managing progress, forecasts, projections, and budgets. This unique intersection lets me leverage
            my development skills to aggregate, visualize, and manage data at massive scale.
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

      <!-- Timeline line -->
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

  <!-- ═══════════════ SKILLS BENTO GRID ═══════════════ -->
  <section class="py-16 px-6 border-t border-(--ui-border)">
    <div class="max-w-4xl mx-auto">
      <h2 class="font-teko text-4xl font-bold mb-10 text-center reveal">
        Skills & <span class="gradient-text">Tools</span>
      </h2>

      <div class="grid sm:grid-cols-2 gap-4">
        <div
          v-for="(cat, i) in skillCategories"
          :key="cat.title"
          class="glass-card rounded-xl p-6 group hover:border-green-500/20 transition-all duration-300 reveal"
          :style="{ transitionDelay: `${i * 0.1}s` }"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="size-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <UIcon :name="cat.icon" class="size-5 text-green-400" />
            </div>
            <h3 class="font-teko text-2xl font-semibold">{{ cat.title }}</h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in cat.skills"
              :key="skill"
              class="px-3 py-1 text-sm rounded-full bg-white/5 text-(--ui-text-muted) border border-(--ui-border) group-hover:border-green-500/20 transition-colors"
            >
              {{ skill }}
            </span>
          </div>
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

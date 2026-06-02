<script setup lang="ts">
useReveal()

definePageMeta({
  title: 'Full-Stack Development & Digital Solutions',
  description: 'Full-stack developer specializing in web development, video production, and digital solutions. Founder of TechHive Labs. 20+ years of programming experience.',
})

useSeoMeta({
  title: 'Full-Stack Development & Digital Solutions',
  description: 'Full-stack developer specializing in web development, video production, and digital solutions. Founder of TechHive Labs. 20+ years of programming experience.',
  ogTitle: 'TechHive Labs - Full-Stack Development & Digital Solutions',
  ogDescription: 'Full-stack developer specializing in web development, video production, and digital solutions. Founder of TechHive Labs.',
  ogUrl: 'https://www.techhivelabs.net/',
  ogImage: 'https://www.techhivelabs.net/og-image.png',
  twitterTitle: 'TechHive Labs - Full-Stack Development & Digital Solutions',
  twitterDescription: 'Full-stack developer specializing in web development, video production, and digital solutions.',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://www.techhivelabs.net/' }],
})

// Rotating roles for typewriter effect
const roles = ['Full-Stack Developer', 'AI Solutions Architect', 'Project Controls Specialist', 'Content Creation', 'RAG Pipeline Builder', 'Digital Consultant', 'Agentic Workflow Engineer']
const currentRole = ref(0)
const displayedRole = ref('')
const isTyping = ref(true)

function typeRole() {
  const role = roles[currentRole.value]
  let charIndex = 0
  isTyping.value = true

  const typeInterval = setInterval(() => {
    displayedRole.value = role.slice(0, charIndex + 1)
    charIndex++
    if (charIndex >= role.length) {
      clearInterval(typeInterval)
      isTyping.value = false
      setTimeout(() => {
        eraseRole()
      }, 2200)
    }
  }, 60)
}

function eraseRole() {
  let charIndex = displayedRole.value.length
  const eraseInterval = setInterval(() => {
    displayedRole.value = displayedRole.value.slice(0, charIndex - 1)
    charIndex--
    if (charIndex <= 0) {
      clearInterval(eraseInterval)
      currentRole.value = (currentRole.value + 1) % roles.length
      setTimeout(() => typeRole(), 300)
    }
  }, 30)
}

onMounted(() => {
  setTimeout(() => typeRole(), 800)
})

const testimonials = [
  {
    quote: 'I began working with Tony several years ago on a basic website with some functionality.  He delivered exactly what I asked for and has never left our side.  Every request, every question…he comes through!  I couldn’t ask for a better person to hold our hand through all of the small things we don’t understand.',
    name: 'Carrie Pledger',
    role: 'Owner - Adventure Zone Kids',
    url: 'https://adventurezonekids.com',
    placeholder: false,
  },
  {
    quote: 'We\'ve worked with Tony on numerous projects and have always found his meticulous attention to detail and upbeat, can-do attitude to be hugely empowering. He writes clean code that we can easily build upon and he is able to quickly shift pace to accommodate changing requirements - an enormously useful trait to have!',
    name: 'Harry',
    role: 'Founder - HML Tech',
    url: 'https://hmltech.dev',
    placeholder: false,
  }
]

const heroLinks = [
  { label: 'View My Work', to: '#projects', color: 'primary' as const, variant: 'solid' as const, icon: 'i-heroicons-arrow-down' },
  { label: 'Get In Touch', to: '/contact', color: 'neutral' as const, variant: 'outline' as const, icon: 'i-heroicons-envelope' },
]

const socialLinks = [
  { to: 'https://github.com/Patrity', icon: 'i-fa6-brands-github', label: 'GitHub' },
  { to: 'https://x.com/Patrity', icon: 'i-fa6-brands-x-twitter', label: 'X' },
  { to: 'https://bsky.app/profile/patrity.com', icon: 'i-fa6-brands-bluesky', label: 'Bluesky' },
  { to: 'https://www.linkedin.com/in/tonycos/', icon: 'i-fa6-brands-linkedin', label: 'LinkedIn' },
]

const stats = [
  { value: 20, suffix: '+', label: 'Years Programming' },
  { value: 4, suffix: 'M+', label: 'Subscribers Managed' },
  { value: 10, suffix: '+', label: 'Years Professional' },
  { value: 12, suffix: 'B+', prefix: '$', label: 'In Projects Managed' },
]

const { data: blog } = await useAsyncData('blog-index', () => {
  return queryCollection('blog')
    .select('title', 'author', 'date', 'draft', 'description', 'image', 'tags', 'navigation', 'path', 'stem', 'id')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .limit(3)
    .all()
})

const { data: projects } = await useAsyncData('projects-index', () => {
  return queryCollection('projects')
    .select('title', 'description', 'images', 'path', 'tags', 'id', 'type', 'featured')
    .where('featured', '=', true)
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
      variant: isWide ? 'outline' : 'subtle',
      type: project.type,
    }
  })
})
</script>

<template>
  <!-- ═══════════════ HERO ═══════════════ -->
  <section class="relative min-h-[100dvh] flex items-center overflow-hidden">
    <HeroBackground />

    <!-- Hero content — asymmetric left-aligned -->
    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
      <div class="max-w-3xl">
        <!-- Eyebrow -->
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-green-400 mb-6"
          style="animation: fade-in 0.6s ease-out both;"
        >
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span class="relative inline-flex size-2 rounded-full bg-green-400" />
          </span>
          Available for new projects
        </div>

        <!-- Main heading -->
        <h1
          class="font-teko text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold leading-[0.85] tracking-tight"
          style="animation: fade-up 0.8s ease-out 0.15s both;"
        >
          I Build<br />
          <span class="gradient-text">Digital</span><br />
          Futures
        </h1>

        <!-- Typewriter subtitle -->
        <div
          class="mt-6 text-lg sm:text-xl h-8 flex items-center gap-2"
          style="animation: fade-in 1s ease-out 0.5s both;"
        >
          <span class="text-green-500/60 font-mono text-sm">~/</span>
          <span class="font-mono text-(--ui-text)">{{ displayedRole }}</span>
          <span class="inline-block w-0.5 h-5 bg-green-400" :class="isTyping ? 'animate-pulse' : 'opacity-0'" />
        </div>

        <!-- Description -->
        <p
          class="mt-5 max-w-lg text-(--ui-text-muted) text-base sm:text-lg leading-relaxed"
          style="animation: fade-up 0.8s ease-out 0.7s both;"
        >
          Full-stack development, AI implementations, and digital consulting.
          From RAG pipelines to production web apps — I build the tools that move businesses forward.
        </p>

        <!-- CTA buttons -->
        <div
          class="mt-8 flex flex-wrap items-center gap-4"
          style="animation: fade-up 0.8s ease-out 0.9s both;"
        >
          <UButton
            v-for="link in heroLinks"
            :key="link.label"
            v-bind="link"
            size="lg"
          />
        </div>

        <!-- Social links -->
        <div
          class="mt-10 flex items-center gap-4"
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
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" style="animation: fade-in 1.5s ease-out 1.5s both;">
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

  <!-- ═══════════════ RECENT ARTICLES ═══════════════ -->
  <UPageSection :ui="{ title: 'font-teko' }">
    <template #title>
      <span class="gradient-text">Recent Articles</span>
    </template>
    <template #description>
      <p class="text-center text-(--ui-text-muted)">
        Writing about the technology I use, the projects I build, and the things I learn along the way.
      </p>
    </template>

    <UBlogPosts>
      <UBlogPost
        v-for="(post, i) in blog"
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
      </UBlogPost>
    </UBlogPosts>

    <div class="flex justify-center mt-4 reveal">
      <UButton to="/blog" color="primary" variant="outline" size="lg" trailing-icon="i-heroicons-arrow-right">
        Read All Articles
      </UButton>
    </div>
  </UPageSection>

  <!-- ═══════════════ ABOUT PREVIEW ═══════════════ -->
  <section class="py-20 px-6 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/3 to-transparent" />
    <div class="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
      <!-- Photo -->
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

      <!-- Text -->
      <div class="text-center md:text-left reveal-right">
        <h2 class="font-teko text-4xl sm:text-5xl font-bold">
          The Person Behind the
          <span class="gradient-text">Code</span>
        </h2>
        <p class="mt-4 text-(--ui-text-muted) text-lg leading-relaxed max-w-lg">
          20+ years of programming, managing a 4M-subscriber YouTube channel, and wrangling
          billion-dollar project data by day. I've worn a lot of hats — and I bring all of them
          to every project.
        </p>
        <UButton to="/about" color="primary" variant="soft" size="lg" class="mt-6" trailing-icon="i-heroicons-arrow-right">
          Learn My Story
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
          <!-- Quote mark -->
          <span class="text-5xl leading-none text-green-500/20 font-serif absolute top-4 left-5">&ldquo;</span>

          <p class="text-(--ui-text-muted) text-sm leading-relaxed mt-6 italic">
            {{ t.quote }}
          </p>

          <div class="mt-5 pt-4 border-t border-(--ui-border) flex items-center gap-3">
            <div class="size-9 rounded-full bg-green-500/10 flex items-center justify-center">
              <UIcon name="i-heroicons-user" class="size-4 text-green-400" />
            </div>
            <ULink :to="t.url">
              <p class="text-sm font-medium" :class="t.placeholder ? 'text-(--ui-text-dimmed)' : ''">{{ t.name }}</p>
              <p class="text-xs text-(--ui-text-dimmed)">{{ t.role }}</p>
            </ULink>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════ FEATURED PROJECTS ═══════════════ -->
  <UPageSection
    id="projects"
    :ui="{ title: 'font-teko' }"
  >
    <template #title>
      <span class="gradient-text">Featured Projects</span>
    </template>
    <template #description>
      <p class="text-center text-(--ui-text-muted)">
        A selection of work across web development, video production, and digital solutions.
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
        <!-- Image -->
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

          <!-- Type badge -->
          <div class="absolute top-3 right-3 glass-card rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-medium text-green-300">
            <UIcon :name="card.icon" class="size-3.5" />
            <span class="capitalize">{{ card.type }}</span>
          </div>
        </div>

        <!-- Text -->
        <div class="p-5">
          <h3 class="font-teko text-2xl font-semibold group-hover:text-green-400 transition-colors">{{ card.title }}</h3>
          <p v-if="card.description" class="mt-1 text-sm text-(--ui-text-muted) line-clamp-2">{{ card.description }}</p>
        </div>
      </NuxtLink>
    </UPageGrid>

    <div class="flex justify-center mt-4 reveal">
      <UButton to="/projects" color="primary" variant="outline" size="lg" trailing-icon="i-heroicons-arrow-right">
        View All Projects
      </UButton>
    </div>
  </UPageSection>

  <!-- ═══════════════ CTA ═══════════════ -->
  <section class="relative py-24 px-6 overflow-hidden">
    <!-- Background effects -->
    <div class="absolute inset-0">
      <div class="absolute rounded-full blur-[100px] opacity-15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 600px; height: 300px; background: var(--color-green-500);" />
    </div>
    <div class="absolute inset-0 border-y border-(--ui-border)" />

    <div class="relative text-center max-w-2xl mx-auto reveal">
      <h2 class="font-teko text-5xl sm:text-6xl font-bold">
        Let's Build Something
        <span class="gradient-text">Together</span>
      </h2>
      <p class="mt-4 text-(--ui-text-muted) text-lg">
        Whether you need a website, a digital strategy, or a creative partner — I'd love to hear about your project.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <UButton to="/contact" color="primary" variant="solid" size="xl" icon="i-heroicons-envelope">
          Start a Conversation
        </UButton>
        <UButton to="https://github.com/Patrity" target="_blank" color="neutral" variant="ghost" size="xl" icon="i-fa6-brands-github">
          View GitHub
        </UButton>
      </div>
    </div>
  </section>
</template>

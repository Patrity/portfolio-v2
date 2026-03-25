<script lang="ts" setup>
const route = useRoute()

const { data: navigation } = await useAsyncData('navigation', () => {
  return queryCollectionNavigation('projects')
})

const { data: page } = await useAsyncData(route.path, () => queryCollection('projects').path(route.path).first())

const isHome = computed(() => route.path === '/projects')

const { data: projects } = await useAsyncData('projects', () => {
  if (isHome.value) {
    return queryCollection('projects')
      .select('title', 'description', 'images', 'tags', 'navigation', 'path', 'stem', 'id')
      .all()
  }
  return []
})
const breadcrumbs = computed(() => {
  if (isHome.value) {
    return [
      { label: 'Home', to: '/', icon: 'i-heroicons-home' },
      { label: 'Projects', to: '/projects', icon: 'i-heroicons-code-bracket' },
    ]
  }
  return [
    { label: 'Home', to: '/', icon: 'i-heroicons-home' },
    { label: 'Projects', to: '/projects', icon: 'i-heroicons-code-bracket' },
    { label: page.value?.title, to: route.path },
  ]
})

// SEO Metadata for individual project pages
if (!isHome.value && page.value) {
  useSeoMeta({
    title: `${page.value.title} - Projects | TechHive Labs`,
    description: page.value.description || `View the ${page.value.title} project by TechHive Labs`,
    ogTitle: `${page.value.title} - TechHive Labs`,
    ogDescription: page.value.description || `View the ${page.value.title} project`,
    ogUrl: `https://techhivelabs.net${route.path}`,
    ogImage: page.value.images?.[0] || '/og-image.png',
    twitterTitle: `${page.value.title} - TechHive Labs`,
    twitterDescription: page.value.description || `View the ${page.value.title} project`,
    twitterCard: 'summary_large_image',
  })
}

// SEO Metadata for projects index page
if (isHome.value) {
  useSeoMeta({
    title: 'Projects - TechHive Labs',
    description: 'Explore my portfolio of web development, video production, and digital solution projects.',
    ogTitle: 'Projects - TechHive Labs',
    ogDescription: 'Explore my portfolio of web development and digital solution projects.',
    ogUrl: 'https://techhivelabs.net/projects',
    twitterTitle: 'Projects - TechHive Labs',
    twitterDescription: 'Explore my portfolio of web development and digital solution projects.',
    twitterCard: 'summary_large_image',
  })
}
</script>

<template>
  <div class="w-full flex flex-row items-center justify-around mt-4">
    <UBreadcrumb :items="breadcrumbs" :ui="{link: 'text-lg'}" />
  </div>
  <UPage v-if="navigation && projects">
    <template #default>
      <div v-if="!isHome && page">
        <UPageHeader :title="page.title" :description="page.description" />
        <UCarousel v-if="page.images && page.images.length > 1"
          class="mb-8"
          v-slot="{ item }"
          :items="page.images"
          dots
          wheel-gestures
          loop
          autoplay
          >
            <img :src="item" :alt="page.title" class="object-cover rounded-lg" />
      </UCarousel>
      <img v-else-if="page.images && page.images.length === 0" :src="page.images[0]" :alt="page.title" class="object-cover rounded-lg" />

        <ContentRenderer :value="page" />
      </div>
      <div v-else-if="isHome">
        <UPageHeader description="A collection of work across web development, video production, and digital solutions." :ui="{ title: 'font-teko'}" class="mb-8">
          <template #title>
            <span class="gradient-text">Projects</span>
          </template>
        </UPageHeader>

        <UPageColumns>
          <NuxtLink
            v-for="(project, index) in projects"
            :key="index"
            :to="project.path"
            class="group block overflow-hidden rounded-xl border border-(--ui-border) transition-all duration-300 hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(70,194,17,0.1)]"
          >
            <div v-if="project.images && project.images.length > 0" class="relative overflow-hidden">
              <img
                :src="project.images[0]"
                :alt="project.title"
                class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div class="p-5">
              <h3 class="font-teko text-2xl font-semibold group-hover:text-green-400 transition-colors">{{ project.title }}</h3>
              <p v-if="project.description" class="mt-1 text-sm text-(--ui-text-muted) line-clamp-2">{{ project.description }}</p>
            </div>
          </NuxtLink>
        </UPageColumns>
      </div>
      <div v-else>
        <div>
          <h1>Page Not Found</h1>
          <p>Oops! The content you're looking for doesn't exist.</p>
          <NuxtLink to="/projects">Go back home</NuxtLink>
        </div>
      </div>
    </template>
    <template v-if="!isHome" #right>
      <UPageAside>
        <UContentToc :links="page?.body?.toc?.links" />
      </UPageAside>
    </template>
  </UPage>
</template>
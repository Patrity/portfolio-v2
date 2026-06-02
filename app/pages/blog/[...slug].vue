<script lang="ts" setup>
const route = useRoute()

const { data: navigation } = await useAsyncData('navigation', () => {
  return queryCollectionNavigation('blog')
})

const { data: page } = await useAsyncData(route.path, () => queryCollection('blog').path(route.path).first())

const isHome = computed(() => route.path === '/blog')

const readMins = computed(() => (page.value?.body ? readingTime(page.value.body) : 0))

// View count: fetched on the client since pages are prerendered and Umami is
// dynamic. Renders only when the API returns a number (graceful when unset).
const { data: viewData } = useFetch('/api/views', {
  query: { path: route.path },
  server: false,
  lazy: true,
  default: () => ({ views: null as number | null }),
})
const views = computed(() => viewData.value?.views ?? null)

const { data: posts } = await useAsyncData('posts', () => {
  if (isHome.value) {
    return queryCollection('blog')
      .select('title', 'author', 'date', 'draft', 'description', 'image', 'tags', 'navigation', 'path', 'stem', 'id')
      .where('draft', '=', false)
      .order('date', 'DESC')
      .all()
  }
  return null
})

// Blog index: client-side search + tag filtering over the prerendered list.
const search = ref('')
const activeTag = computed(() => (route.query.tag as string) || '')
const allTags = computed(() => [...new Set((posts.value || []).flatMap(p => p.tags || []))].sort())
const filteredPosts = computed(() => {
  let list = posts.value || []
  if (activeTag.value) list = list.filter(p => p.tags?.includes(activeTag.value))
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      p.title?.toLowerCase().includes(q)
      || p.description?.toLowerCase().includes(q)
      || p.tags?.some(t => t.toLowerCase().includes(q)),
    )
  }
  return list
})

const breadcrumbs = computed(() => {
  if (isHome.value) {
    return [
      { label: 'Home', to: '/', icon: 'i-heroicons-home' },
      { label: 'Blog', to: '/blog', icon: 'i-heroicons-chat-bubble-bottom-center-text' },
    ]
  }
  return [
    { label: 'Home', to: '/', icon: 'i-heroicons-home' },
    { label: 'Blog', to: '/blog', icon: 'i-heroicons-chat-bubble-bottom-center-text' },
    { label: page.value.seoTitle || page.value.title, to: route.path },
  ]
})

// SEO Metadata for individual blog posts
if (!isHome.value && page.value) {
  const description = page.value.description || `Read "${page.value.title}" on the TechHive Labs blog`
  // On-page <h1> keeps the full narrative headline; search/social use a concise seoTitle when set
  const seoTitle = page.value.seoTitle || page.value.title
  const canonicalUrl = `https://www.techhivelabs.net${route.path}`
  const heroImage = page.value.image
    ? `https://www.techhivelabs.net${page.value.image}`
    : 'https://www.techhivelabs.net/og-image.png'

  useSeoMeta({
    title: seoTitle,
    description,
    ogTitle: seoTitle,
    ogDescription: description,
    ogUrl: canonicalUrl,
    twitterTitle: seoTitle,
    twitterDescription: description,
    twitterCard: 'summary_large_image',
    articleAuthor: page.value.author || 'Tony Costanzo',
    articlePublishedTime: page.value.date,
    articleModifiedTime: page.value.updated || page.value.date,
    articleTag: page.value.tags?.join(', '),
  })

  // Use the post's hero image as the social card instead of the generated NuxtSeo
  // text card (avoids title/description truncation). Overrides app.vue's global component.
  defineOgImage({ url: heroImage, alt: description })

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  })

  useSchemaOrg([
    defineArticle({
      headline: seoTitle,
      description,
      image: heroImage,
      datePublished: new Date(page.value.date).toISOString(),
      dateModified: new Date(page.value.updated || page.value.date).toISOString(),
      author: {
        name: page.value.author || 'Tony Costanzo',
        url: 'https://www.techhivelabs.net/about',
      },
    }),
    defineBreadcrumb({
      itemListElement: [
        { name: 'Home', item: 'https://www.techhivelabs.net/' },
        { name: 'Blog', item: 'https://www.techhivelabs.net/blog' },
        { name: page.value.seoTitle || page.value.title },
      ],
    }),
  ])
}

// SEO Metadata for blog index page
if (isHome.value) {
  const canonicalUrl = 'https://www.techhivelabs.net/blog'
  useSeoMeta({
    title: 'Blog',
    description: 'Field reports on full-stack development, local AI, RAG pipelines, and the homelab experiments behind them.',
    ogTitle: 'Blog',
    ogDescription: 'Field reports on full-stack development, local AI, RAG pipelines, and the homelab experiments behind them.',
    ogUrl: canonicalUrl,
    twitterTitle: 'Blog',
    twitterDescription: 'Field reports on full-stack development, local AI, RAG pipelines, and the homelab experiments behind them.',
    twitterCard: 'summary_large_image',
  })

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  })
}
</script>

<template>
  <div class="w-full flex flex-row items-center justify-around mt-4">
    <UBreadcrumb :items="breadcrumbs" :ui="{link: 'text-lg'}" />
  </div>
  <UPage v-if="navigation">
    <template #default>
      <div v-if="!isHome && page">
        <UPageHeader :title="page.title" :description="page.description" />
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4 text-sm text-(--ui-text-muted)">
          <span class="italic whitespace-nowrap">{{ formatDate(page.date) }}</span>
          <span class="text-(--ui-text-dimmed)">·</span>
          <span class="whitespace-nowrap">{{ readMins }} min read</span>
          <template v-if="views !== null">
            <span class="text-(--ui-text-dimmed)">·</span>
            <span class="whitespace-nowrap">{{ views.toLocaleString() }} views</span>
          </template>
          <div v-if="page.tags?.length" class="flex flex-wrap gap-2 sm:ms-1">
            <UButton
              v-for="tag in page.tags"
              :key="tag"
              :to="`/blog?tag=${encodeURIComponent(tag)}`"
              size="xs"
              color="primary"
              variant="soft"
              :label="tag"
            />
          </div>
        </div>
        <img
          v-if="page.image"
          :src="page.image"
          :alt="page.title"
          width="1920"
          height="1080"
          fetchpriority="high"
          class="w-full aspect-video object-cover rounded-xl border border-(--ui-border) mt-6 mb-8"
        >
        <ContentRenderer :value="page" />
      </div>
      <div v-else-if="isHome">
        <UPageHeader description="Latest posts" :ui="{ title: 'font-teko'}">
          <template #title>
            <span class="gradient-text">Blog</span>
          </template>
        </UPageHeader>

        <!-- Search + tag filter -->
        <div class="flex flex-col gap-4 mt-6 mb-8">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search posts.."
            size="lg"
            :ui="{ root: 'w-full' }"
          />
          <div v-if="allTags.length" class="flex flex-wrap items-center gap-2">
            <UButton
              to="/blog"
              size="xs"
              :color="activeTag ? 'neutral' : 'primary'"
              :variant="activeTag ? 'outline' : 'solid'"
              label="All"
            />
            <UButton
              v-for="tag in allTags"
              :key="tag"
              :to="`/blog?tag=${encodeURIComponent(tag)}`"
              size="xs"
              :color="activeTag === tag ? 'primary' : 'neutral'"
              :variant="activeTag === tag ? 'solid' : 'outline'"
              :label="tag"
            />
          </div>
        </div>

        <UBlogPosts v-if="filteredPosts.length">
          <UBlogPost
            v-for="(post, index) in filteredPosts"
            :key="index"
            v-bind="post"
            :to="post.path"
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
        <p v-else class="text-center text-(--ui-text-muted) py-16">
          No posts match{{ activeTag ? ` the “${activeTag}” tag` : '' }}{{ search ? ` “${search}”` : '' }}.
        </p>
      </div>
      <div v-else>
        <div>
          <h1>Page Not Found</h1>
          <p>Oops! The content you're looking for doesn't exist.</p>
          <NuxtLink to="/blog">Go back home</NuxtLink>
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
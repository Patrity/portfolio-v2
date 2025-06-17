<script lang="ts" setup>
const route = useRoute()

const { data: navigation } = await useAsyncData('navigation', () => {
  return queryCollectionNavigation('blog')
})

const { data: page } = await useAsyncData(route.path, () => queryCollection('blog').path(route.path).first())

const isHome = computed(() => route.path === '/blog')

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
    { label: page.value.title, to: route.path },
  ]
})

// SEO Metadata for individual blog posts
if (!isHome.value && page.value) {
  useSeoMeta({
    title: `${page.value.title} - Blog | TechHive Labs`,
    description: page.value.description || `Read "${page.value.title}" on the TechHive Labs blog`,
    ogTitle: `${page.value.title} - TechHive Labs Blog`,
    ogDescription: page.value.description || `Read "${page.value.title}" on the TechHive Labs blog`,
    ogUrl: `https://techhivelabs.net${route.path}`,
    ogImage: page.value.image || '/og-image.png',
    twitterTitle: `${page.value.title} - TechHive Labs Blog`,
    twitterDescription: page.value.description || `Read "${page.value.title}" on the TechHive Labs blog`,
    twitterCard: 'summary_large_image',
    articleAuthor: page.value.author || 'Tony Costanzo',
    articlePublishedTime: page.value.date,
    articleModifiedTime: page.value.updated || page.value.date,
    articleTag: page.value.tags?.join(', '),
  })
}

// SEO Metadata for blog index page
if (isHome.value) {
  useSeoMeta({
    title: 'Blog - TechHive Labs',
    description: 'Read the latest articles about web development, programming, and technology on the TechHive Labs blog.',
    ogTitle: 'Blog - TechHive Labs',
    ogDescription: 'Read the latest articles about web development, programming, and technology.',
    ogUrl: 'https://techhivelabs.net/blog',
    twitterTitle: 'Blog - TechHive Labs',
    twitterDescription: 'Read the latest articles about web development, programming, and technology.',
    twitterCard: 'summary_large_image',
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
        <UPageHeader :title="page.title" :description="page.description">
          <template #links>
            <span class="text-muted italic">
              {{ new Date(page.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
            </span>
          </template>
        </UPageHeader>
        <ContentRenderer :value="page" />
      </div>
      <div v-else-if="isHome">
        <UPageHeader title="Blog" description="Latest posts" :ui="{ title: 'font-teko'}" />

        <UBlogPosts>
          <UBlogPost
            v-for="(post, index) in posts"
            :key="index"
            v-bind="post"
            :to="post.path"
          />
        </UBlogPosts>
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
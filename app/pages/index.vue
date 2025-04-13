<script setup lang="ts">

const heroLinks = [
    { label: 'Learn More', to: '#about', color: 'primary', variant: 'solid', icon: 'i-fa6-solid-angle-down' },
    { label: 'Contact Me', to: '/contact', color: 'secondary', variant: 'outline', icon: 'i-fa6-solid-envelope' },
]
const heroImages = [
    { src: '/api/images/programming.webp', alt: 'Programming' },
    { src: '/api/images/editing.webp', alt: 'Video Editing' },
    { src: '/api/images/webdev.webp', alt: 'Web Development' },
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
interface Card {
    title: string,
    description: string,
    icon: string,
    to: string,
    class: string,
    image: {
        path: string
    },
    orientation: string,
    variant: string,
}
const cards = computed(() => {
    return projects.value.map((project: any, index: number) => {
        const isWide = index === 0 || index === 3
        return {
            title: project.title,
            description: project.description,
            icon: getIconFromType(project.type),
            to: project.path,
            class: isWide ? 'lg:col-span-2' : 'lg:col-span-1',
            image: {
                path: project.images[0],
                width: 250,
                height: 100,
            },
            orientation: isWide ? 'horizontal' : 'vertical',
            variant: isWide ? 'outline' : 'subtle',
            spotlight: true,
        }
    })
})

const getIconFromType = (type: string) => {
    switch (type) {
        case 'code':
            return 'i-heroicons-code-bracket'
        case 'video':
            return 'i-heroicons-video-camera'
        default:
            return ''
    }
}
</script>

<template>
    <UPageHero
        orientation="horizontal"
        title="Digital Solutions"
        description="Web Development, Video Production, Marketing, and Consulting"
        :links="heroLinks"
        :ui="{ title: 'font-teko'}"
    >
        <UCarousel
            v-slot="{ item }"
            :items="heroImages"
            dots
            wheel-gestures
            loop
            :auto-scroll="{ startDelay: 0, speed: 1.5 }"
            class="mx-auto w-full h-full items-center"
            :ui="{ item: 'basis-[85%] h-full' }"  >
            <img :src="item.src" :alt="item.alt" class="object-cover w-full h-72 rounded-lg shadow-lg" />
        </UCarousel>
    </UPageHero>

    <UPageSection
        title="Recent Articles"
        :ui=" {title: 'font-teko'}"
        description="The latest posts about the technology I use, the projects I build, and the things I learn along the way."
    >
        <UBlogPosts>
            <UBlogPost
                v-for="post in blog"
                :key="post.id"
                variant="subtle"
                :title="post.title"
                :description="post.description"
                :image="post.image"
                :date="post.date"
                :to="post.path"

            />
        </UBlogPosts>
    </UPageSection>

    <UPageSection
        title="About Me"
        :ui=" {title: 'font-teko'}"
        description="A brief introduction about my background, skills, and interests."
        id="about"
    >
			<div class="flex flex-col-reverse md:flex-row gap-8 items-center max-w-4xl mx-auto">
				<UCard class="max-w-xs">
					<img :src="'/api/images/tony.webp'" sizes="sm:400px md:460px" loading="lazy" :preload="true" format="webp" width="460" height="460" alt="Tony"
					     class="rounded-full border-neutral-400 border-2 mx-auto mt-6 shadow-neutral-950 shadow-lg"/>
					<div class="text-center">
						<p class="pt-4 font-medium text-3xl font-teko">
							Tony Costanzo
						</p>
						<p class="text-sm italic">
							TechHive Labs Founder
						</p>
						<div class="flex flex-row items-center justify-around gap-3 mt-2">
                            <NuxtLink to="https://github.com/Patrity" aria-label="Github" class="hover:text-(--ui-primary) hover:scale-105 transition transform duration-100">
                                <UIcon name="i-fa6-brands-github" class="size-8" />
                            </NuxtLink>
                            <NuxtLink to="https://x.com/ThePatrity" aria-label="Tony's Twitter" class="hover:text-(--ui-primary) hover:scale-105 transition transform duration-100">
                                <UIcon name="i-fa6-brands-x-twitter" class="size-8" />
                            </NuxtLink>
                            <NuxtLink to="https://bsky.app/profile/patrity.bsky.social" aria-label="Tony's Bluesky" class="hover:text-(--ui-primary) hover:scale-105 transition transform duration-100">
                                <UIcon name="i-fa6-brands-bluesky" class="size-8" />
                            </NuxtLink>
                            <NuxtLink to="https://www.linkedin.com/in/tonycos/" aria-label="Tony's LinkedIn" class="hover:text-(--ui-primary) hover:scale-105 transition transform duration-100">
                                <UIcon name="i-fa6-brands-linkedin" class="size-8" />
                            </NuxtLink>
						</div>
					</div>
				</UCard>
				<div class="text-center md:text-left mx-auto w-full sm:w-2/3 space-y-3">
					<p>
						Hi! My name is Tony, I have also gone by the name Patrity for many years. I am a full stack developer
						with a passion for problem solving, and a love for learning. I have been programming for over 20
						years,
						and have been working professionally for over 10 years. I have experience with many different languages
						and frameworks.
					</p>
					<p>
						In addition to programming, I also curate content, edit video, source sponsorships, and manage social media
                        for the Youtube channel, <ULink to="https://youtube.com/fireship" target="_blank" class="text-orange-400 font-semibold">Fireship</ULink>
                        which has over 3 million subscribers and is one of the leading programming channels on the platform. I have been
                        working with the channel since 2022. In addition to curating content, I have also started to create content for
                        the channel in the form of script writing and even some complete productions.
					</p>
					<p>
						Professionally for my day job, I work in the industrial construction industry on mega projects in the
						project controls department. I manage data such as progress, forecasts, projections, and budgets on
                        multi-billion dollar projects. This allows me to utilize my software development background to aggregate,
                        manipulate, visualize and manage data.
					</p>
				</div>
			</div>
    </UPageSection>

    <UPageSection
        title="Featured Projects"
        :ui=" {title: 'font-teko'}"
    >
        <template #description>
            <p class="text-center">
                A selection of my favorite projects that I have worked on. These projects showcase my skills and
                experience in web development, video production, and more.
            </p>
            <UButton to="/projects" class="mt-4" color="primary" variant="solid" trailing-icon="i-fa6-solid-arrow-right">
                View All Projects
            </UButton>
        </template>
        <UPageGrid>
          <UPageCard
            v-for="(card, index) in cards"
            :key="index"
            v-bind="card"
          >
            <img
                v-if="card.image"
                :src="card.image.path"
                :alt="card.title"
                class="object-cover rounded-lg shadow-lg mx-auto"
                :class="card.orientation==='horizontal' ? 'h-48' : 'h-24'"
            />
          </UPageCard>
        </UPageGrid>
    </UPageSection>
</template>
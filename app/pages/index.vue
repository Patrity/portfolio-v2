<script setup lang="ts">

const heroLinks = [
    { label: 'Learn More', to: '#about', color: 'primary', variant: 'solid', icon: 'i-fa6-solid-angle-down' },
    { label: 'Contact Me', to: '/contact', color: 'secondary', variant: 'outline', icon: 'i-fa6-solid-envelope' },
]
const heroImages = [
    { src: '/api/images/assets/programming.webp', alt: 'Programming' },
    { src: '/api/images/assets/editing.webp', alt: 'Video Editing' },
    { src: '/api/images/assets/webdev.webp', alt: 'Web Development' },
]

const { data: blog } = await useAsyncData('blog-posts', () => {
  return queryCollection('blog')
    .select('title', 'author', 'date', 'draft', 'description', 'image', 'tags', 'navigation', 'path', 'stem', 'id')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .limit(3)
    .all()
})
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
            <NuxtImg provider="blobStorage" src="/webdev.webp" />
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
    >
			<div class="flex flex-col-reverse md:flex-row gap-8 items-center max-w-4xl mx-auto">
				<UCard class="max-w-xs">
					<img src="https://ovzjdhllnxrizgszqlsi.supabase.co/storage/v1/object/public/tech-hive/tony.webp" sizes="sm:400px md:460px" loading="lazy" :preload="true" format="webp" width="460" height="460" alt="Tony"
					     class="rounded-full border-neutral-400 border-2 mx-auto mt-6 shadow-neutral-950 shadow-lg"/>
					<div class="text-white">
						<p class="pt-4 font-medium text-xl">
							Tony Costanzo
						</p>
						<p class="text-sm italic text-neutral-300">
							TechHive Labs Founder
						</p>
						<div class="flex flex-row items-center justify-center gap-1 mt-2">
							<a href="https://github.com/Patrity" aria-label="Github" class="w-6 h-6 hover:text-(--ui-primary) hover:scale-105 transition transform duration-100">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><g clip-path="url(#akarIconsGithubFill0)"><path fill="currentColor" fill-rule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" clip-rule="evenodd"/></g><defs><clipPath id="akarIconsGithubFill0"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs></g></svg>
							</a>
							<a href="https://twitter.com/ThePatrity" aria-label="Tony's Twitter" class="w-7 h-7 ml-1 hover:text-(--ui-primary) hover:scale-105 transition transform duration-100">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15"><path fill="currentColor" d="m14.478 1.5l.5-.033a.5.5 0 0 0-.871-.301l.371.334Zm-.498 2.959a.5.5 0 1 0-1 0h1Zm-6.49.082h-.5h.5Zm0 .959h.5h-.5Zm-6.99 7V12a.5.5 0 0 0-.278.916L.5 12.5Zm.998-11l.469-.175a.5.5 0 0 0-.916-.048l.447.223Zm3.994 9l.354.353a.5.5 0 0 0-.195-.827l-.159.474Zm7.224-8.027l-.37.336l.18.199l.265-.04l-.075-.495Zm1.264-.94c.051.778.003 1.25-.123 1.606c-.122.345-.336.629-.723 1l.692.722c.438-.42.776-.832.974-1.388c.193-.546.232-1.178.177-2.006l-.998.066Zm0 3.654V4.46h-1v.728h1Zm-6.99-.646V5.5h1v-.959h-1Zm0 .959V6h1v-.5h-1ZM10.525 1a3.539 3.539 0 0 0-3.537 3.541h1A2.539 2.539 0 0 1 10.526 2V1Zm2.454 4.187C12.98 9.503 9.487 13 5.18 13v1c4.86 0 8.8-3.946 8.8-8.813h-1ZM1.03 1.675C1.574 3.127 3.614 6 7.49 6V5C4.174 5 2.421 2.54 1.966 1.325l-.937.35Zm.021-.398C.004 3.373-.157 5.407.604 7.139c.759 1.727 2.392 3.055 4.73 3.835l.317-.948c-2.155-.72-3.518-1.892-4.132-3.29c-.612-1.393-.523-3.11.427-5.013l-.895-.446Zm4.087 8.87C4.536 10.75 2.726 12 .5 12v1c2.566 0 4.617-1.416 5.346-2.147l-.708-.706Zm7.949-8.009A3.445 3.445 0 0 0 10.526 1v1c.721 0 1.37.311 1.82.809l.74-.671Zm-.296.83a3.513 3.513 0 0 0 2.06-1.134l-.744-.668a2.514 2.514 0 0 1-1.466.813l.15.989ZM.222 12.916C1.863 14.01 3.583 14 5.18 14v-1c-1.63 0-3.048-.011-4.402-.916l-.556.832Z"/></svg>
							</a>
							<a href="https://www.linkedin.com/in/tonycos/" aria-label="Tony's LinkedIn" class="w-8 h-8 hover:text-(--ui-primary) hover:scale-105 transition transform duration-100">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
									<path fill="currentColor" d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" />
								</svg>
							</a>
						</div>
					</div>
				</UCard>
				<div class="text-center md:text-left mx-auto text-neutral-100 w-full sm:w-2/3 space-y-3">
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
						project controls department. I manage data such as progress, forecasts, projects, and budgets on
                        multi-billion dollar projects. This allows me to utilize my software development background to aggregate,
                        manipulate, visualize and manage data.
					</p>
				</div>
			</div>
    </UPageSection>
</template>
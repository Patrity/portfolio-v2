<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

// SEO Metadata
definePageMeta({
  title: 'Contact - TechHive Labs',
  description: 'Get in touch with Tony Costanzo at TechHive Labs for web development, video production, and digital consulting services.',
})

useSeoMeta({
  title: 'Contact - TechHive Labs',
  description: 'Get in touch with Tony Costanzo at TechHive Labs for web development, video production, and digital consulting services.',
  ogTitle: 'Contact - TechHive Labs',
  ogDescription: 'Get in touch for web development, video production, and digital consulting services.',
  ogUrl: 'https://techhivelabs.net/contact',
})

// Form schema
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  'cf-turnstile-response': z.string().min(1, 'Please complete the captcha')
})

type Schema = z.output<typeof schema>

// Form state
const state = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  'cf-turnstile-response': ''
})

// Form submission state
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const submitError = ref('')

// Subject options
const subjectOptions = [
  { label: 'General Inquiry', value: 'General Inquiry' },
  { label: 'Web Development', value: 'Web Development' },
  { label: 'Video Production', value: 'Video Production' },
  { label: 'Digital Consulting', value: 'Digital Consulting' },
  { label: 'Partnership Opportunity', value: 'Partnership Opportunity' },
  { label: 'Other', value: 'Other' }
]

// Turnstile verification
const turnstileRef = ref()
const turnstileToken = ref('')

// Watch for token changes and update form state
watch(turnstileToken, (newToken) => {
  console.log('Turnstile token changed:', newToken)
  state['cf-turnstile-response'] = newToken || ''
})

// Form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true
  submitError.value = ''
  
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: event.data
    })
    
    isSubmitted.value = true
    // Reset form
    Object.assign(state, {
      name: '',
      email: '',
      subject: '',
      message: '',
      'cf-turnstile-response': ''
    })
    turnstileRef.value?.reset()
    turnstileToken.value = ''
  } catch (error: any) {
    submitError.value = error.data?.message || 'Failed to send message. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UPage>
    <UPageHeader>
      <template #title>
        Get in Touch
      </template>
      <template #description>
        Ready to bring your digital vision to life? Let's discuss your
        project and see how TechHive Labs can help!
      </template>
    </UPageHeader>

    <UPageBody>
      <UContainer>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Contact Information -->
          <div class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold mb-4">
                Let's Work Together
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Whether you need a stunning website, compelling video content, or strategic digital consulting, 
                I'm here to help transform your ideas into reality.
              </p>
            </div>

            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <UIcon name="i-heroicons-envelope" class="w-6 h-6 text-primary-500 mt-1" />
                <div>
                  <h3 class="font-semibold">Email</h3>
                  <a href="mailto:contact@techhivelabs.net" class="text-primary">contact@techhivelabs.net</a>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-primary-500 mt-1" />
                <div>
                  <h3 class="font-semibold">Response Time</h3>
                  <p class="">Usually within 24 hours</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <UIcon name="i-heroicons-globe-alt" class="w-6 h-6 text-primary-500 mt-1" />
                <div>
                  <h3 class="font-semibold">Services</h3>
                  <p class="">Web Development, Video Production, Digital Consulting</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="bg-muted rounded-lg shadow-lg p-8">
            <div v-if="isSubmitted" class="text-center space-y-4">
              <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-500 mx-auto" />
              <h3 class="text-2xl font-bold">Message Sent!</h3>
              <p class="">
                Thank you for reaching out. I'll get back to you within 24 hours.
              </p>
              <UButton @click="isSubmitted = false" variant="outline">
                Send Another Message
              </UButton>
            </div>

            <div v-else>
              <h3 class="text-xl font-bold mb-6">
                Send Me a Message
              </h3>

              <ClientOnly>
                <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
                <UFormField label="Name" name="name" required>
                  <UInput v-model="state.name" placeholder="Your full name" class="w-full" />
                </UFormField>

                <UFormField label="Email" name="email" required>
                  <UInput v-model="state.email" type="email" placeholder="your@email.com" class="w-full" />
                </UFormField>

                <UFormField label="Subject" name="subject" required>
                  <USelect v-model="state.subject" :items="subjectOptions" placeholder="Select a subject" class="w-full" />
                </UFormField>

                <UFormField label="Message" name="message" required>
                  <UTextarea 
                    v-model="state.message" 
                    placeholder="Tell me about your project..." 
                    :rows="5"
                    class="w-full"
                  />
                </UFormField>

                <UFormField name="cf-turnstile-response" class="space-y-2 w-full flex flex-col items-center">
                  <NuxtTurnstile 
                    ref="turnstileRef"
                    v-model="turnstileToken"
                    class="mx-auto"
                  />
                </UFormField>

                <div v-if="submitError" class="text-error text-sm">
                  {{ submitError }}
                </div>

                <UButton 
                  type="submit" 
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                  size="lg"
                  class="w-full"
                  block
                  icon="i-heroicons-paper-airplane"
                >
                  {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                </UButton>
                </UForm>
                <template #fallback>
                  <div class="space-y-6">
                    <div class="animate-pulse space-y-4">
                      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div class="h-10 bg-gray-200 rounded"></div>
                      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div class="h-10 bg-gray-200 rounded"></div>
                      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div class="h-10 bg-gray-200 rounded"></div>
                      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div class="h-24 bg-gray-200 rounded"></div>
                      <div class="h-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
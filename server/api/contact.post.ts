import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  'cf-turnstile-response': z.string().min(1, 'Please complete the captcha')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, contactSchema.parse)
    
    // Verify Turnstile token using the built-in helper
    const turnstileResult = await verifyTurnstileToken(body['cf-turnstile-response'])
    
    if (!turnstileResult.success) {
      console.error('Turnstile verification failed:', turnstileResult)
      throw createError({
        statusCode: 400,
        statusMessage: 'Captcha verification failed',
        data: { turnstileError: turnstileResult }
      })
    }

    // Format message for Discord
    const discordEmbed = {
      embeds: [{
        title: '📧 New Contact Form Submission',
        color: 0x00ff00,
        fields: [
          {
            name: '👤 Name',
            value: body.name,
            inline: true
          },
          {
            name: '📧 Email',
            value: body.email,
            inline: true
          },
          {
            name: '📋 Subject',
            value: body.subject,
            inline: false
          },
          {
            name: '💬 Message',
            value: body.message,
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'TechHive Labs Contact Form'
        }
      }]
    }

    // Send to Discord webhook
    const webhookUrl = process.env.NUXT_DISCORD_WEBHOOK_URL
    
    if (!webhookUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Discord webhook not configured'
      })
    }
    
    await $fetch(webhookUrl, {
      method: 'POST',
      body: discordEmbed
    })

    return { success: true, message: 'Message sent successfully!' }
    
  } catch (error: any) {
    console.error('Contact form error:', error)
    
    if (error.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: error.data
      })
    }
    
    
    if (error.issues) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form validation failed',
        data: { validationErrors: error.issues }
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send message'
    })
  }
})
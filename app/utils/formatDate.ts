/**
 * Format a post date deterministically.
 *
 * Pinned to UTC so server-side render (server TZ) and client hydration
 * (visitor TZ) always produce the identical string. Without timeZone:'UTC',
 * a UTC-midnight date shifts back a day in western timezones and triggers a
 * Vue hydration mismatch.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

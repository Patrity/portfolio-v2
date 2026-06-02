/**
 * Shared Umami auth for the analytics endpoints.
 *
 * Self-hosted has no API keys — it authenticates via POST /api/auth/login
 * (username/password) and returns a bearer token, which we cache. Umami Cloud
 * (UMAMI_API_KEY) is supported too. See server/api/views*.get.ts.
 */
export const umamiConfig = {
  WEBSITE_ID: process.env.UMAMI_WEBSITE_ID || '27f65d7d-3ef5-4e46-bfdf-182b3d6d2bf4',
  API_URL: (process.env.UMAMI_API_URL || 'https://analytics.patrity.com').replace(/\/$/, ''),
}

const TOKEN_TTL = 6 * 60 * 60 * 1000 // 6 h
let tokenCache: { token: string, exp: number } | null = null

type UmamiAuth = { base: string, headers: Record<string, string> } | { error: string }

export async function getUmamiAuth(): Promise<UmamiAuth> {
  const apiKey = process.env.UMAMI_API_KEY
  if (apiKey) return { base: 'https://api.umami.is/v1', headers: { 'x-umami-api-key': apiKey } }

  const username = process.env.UMAMI_USERNAME
  const password = process.env.UMAMI_PASSWORD
  if (!username || !password) return { error: 'no-env' }

  if (tokenCache && tokenCache.exp > Date.now()) {
    return { base: umamiConfig.API_URL, headers: { Authorization: `Bearer ${tokenCache.token}` } }
  }
  try {
    const res = await $fetch<{ token: string }>(`${umamiConfig.API_URL}/api/auth/login`, {
      method: 'POST',
      body: { username, password },
    })
    if (!res?.token) return { error: 'login-no-token' }
    tokenCache = { token: res.token, exp: Date.now() + TOKEN_TTL }
    return { base: umamiConfig.API_URL, headers: { Authorization: `Bearer ${res.token}` } }
  } catch (e: any) {
    return { error: `login-failed:${e?.response?.status ?? e?.statusCode ?? '?'}` }
  }
}

export const ALL_TIME_START = new Date('2020-01-01').getTime()

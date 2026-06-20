export interface TtsOptions {
  server: string
  voice: string            // clone reference filename, e.g. "happy-us.wav"
  exaggeration: number
  cfgWeight: number
  temperature: number
  seed: number
  chunkSize: number
}

export function buildTtsRequest(text: string, o: TtsOptions): Record<string, unknown> {
  return {
    text,
    voice_mode: 'clone',
    reference_audio_filename: o.voice,
    exaggeration: o.exaggeration,
    cfg_weight: o.cfgWeight,
    temperature: o.temperature,
    seed: o.seed,
    split_text: true,
    chunk_size: o.chunkSize,
    output_format: 'mp3',
  }
}

export async function synthesize(text: string, o: TtsOptions): Promise<Buffer> {
  const res = await fetch(`${o.server}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildTtsRequest(text, o)),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Chatterbox /tts failed: HTTP ${res.status} ${detail.slice(0, 200)}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

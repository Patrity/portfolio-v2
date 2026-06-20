import { describe, it, expect } from 'vitest'
import { buildTtsRequest, type TtsOptions } from './tts'

const opts: TtsOptions = {
  server: 'http://192.168.2.25:8884', voice: 'happy-us.wav',
  exaggeration: 0.5, cfgWeight: 0.5, temperature: 0.7, seed: 12345, chunkSize: 240,
}

describe('buildTtsRequest', () => {
  it('maps options to the native /tts clone request', () => {
    const b = buildTtsRequest('hello world', opts)
    expect(b).toMatchObject({
      text: 'hello world',
      voice_mode: 'clone',
      reference_audio_filename: 'happy-us.wav',
      exaggeration: 0.5,
      cfg_weight: 0.5,
      temperature: 0.7,
      seed: 12345,
      split_text: true,
      chunk_size: 240,
      output_format: 'mp3',
    })
  })
})

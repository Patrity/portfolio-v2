import { describe, it, expect } from 'vitest'
import { chunkText } from './tts'

describe('chunkText', () => {
  // Each chunk is synthesized independently, so every boundary resets prosody. Short
  // paragraphs shipped as their own chunks came back flat and slow next to long ones,
  // which is audible as uneven pacing across a finished post.
  it('packs adjacent short paragraphs into one chunk', () => {
    const c = chunkText('One two three.\n\nFour five six.', 100)
    expect(c).toEqual(['One two three.\nFour five six.'])
  })

  it('starts a new chunk once packing would exceed the budget', () => {
    const c = chunkText('alpha beta.\n\ngamma delta.\n\nepsilon zeta.', 4)
    expect(c).toEqual(['alpha beta.\ngamma delta.', 'epsilon zeta.'])
    for (const chunk of c) expect(chunk.split(/\s+/).length).toBeLessThanOrEqual(4)
  })

  it('preserves the paragraph break inside a packed chunk', () => {
    expect(chunkText('One.\n\nTwo.', 100)[0]).toContain('\n')
  })

  it('never exceeds the word budget', () => {
    // The 512-token cap counts the reference clip + transcript (~290 tokens),
    // so overrunning here is a hard RuntimeError from Breeze, not a soft truncation.
    const long = Array.from({ length: 40 }, (_, i) => `Sentence number ${i} with padding words.`).join(' ')
    const c = chunkText(long, 25)
    expect(c.length).toBeGreaterThan(1)
    for (const chunk of c) expect(chunk.split(/\s+/).length).toBeLessThanOrEqual(25)
  })

  it('splits an oversized paragraph on sentence boundaries', () => {
    const c = chunkText('Alpha beta gamma. Delta epsilon zeta. Eta theta iota.', 4)
    expect(c.length).toBe(3)
    expect(c[0]).toBe('Alpha beta gamma.')
  })

  it('drops blank paragraphs', () => {
    expect(chunkText('One.\n\n\n\nTwo.', 100)).toEqual(['One.\nTwo.'])
  })

  it('handles a paragraph with no terminal punctuation', () => {
    const c = chunkText('no full stop here at all', 3)
    expect(c.join(' ').split(/\s+/).length).toBe(6)
  })
})

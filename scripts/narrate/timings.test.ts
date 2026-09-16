import { describe, it, expect } from 'vitest'
import { wordsToParagraphs, narrationParagraphs, tokens } from './timings'

// Build a stamped word stream at a steady 0.5s per word.
const stream = (text: string, from = 0) =>
  text.split(/\s+/).map((word, i) => ({ word, start: from + i * 0.5, end: from + i * 0.5 + 0.5 }))

describe('narrationParagraphs', () => {
  it('splits on blank lines and collapses whitespace', () => {
    expect(narrationParagraphs('One   two.\nsame para.\n\nTwo.\n\n\n\nThree.\n')).toEqual([
      'One two. same para.', 'Two.', 'Three.',
    ])
  })
})

describe('tokens', () => {
  // Numerals are dropped because whisper rewrites them ("nine" -> "9"), but every
  // alphabetic word is kept: alignment density is what keeps the walk on track.
  it('keeps only long alphabetic tokens, since whisper rewrites numerals', () => {
    expect(tokens('I benchmarked 9 models to spec a 4-GPU node')).toEqual(['benchmarked', 'models', 'spec', 'node'])
  })
})

describe('wordsToParagraphs', () => {
  const transcript = 'benchmarked nine models to spec a four gpu node '
    + 'there is a production deployment coming that I have to spec '
    + 'here is the problem with the published benchmark tables '
    + 'the second problem is worse those benchmarks measure the model'

  const paras = [
    'I benchmarked nine models to spec a four GPU node.',
    'There is a production deployment coming that I have to spec.',
    'Here is the problem with the published benchmark tables.',
    'The second problem is worse. Those benchmarks measure the model.',
  ]

  it('anchors each paragraph to the real time of its own opening words', () => {
    const out = wordsToParagraphs(paras, stream(transcript))
    expect(out).toHaveLength(4)
    expect(out[1].start).toBeGreaterThan(4)
    expect(out[1].start).toBeLessThan(7)
  })

  it('keeps the timeline monotonic', () => {
    const out = wordsToParagraphs(paras, stream(transcript))
    for (let i = 1; i < out.length; i++) expect(out[i].start).toBeGreaterThanOrEqual(out[i - 1].start)
  })

  it('does not accumulate drift: a late paragraph is still located correctly', () => {
    const out = wordsToParagraphs(paras, stream(transcript))
    const words = transcript.split(/\s+/)
    const expected = words.indexOf('second') * 0.5
    expect(Math.abs(out[3].start - expected)).toBeLessThan(2)
  })

  it('ends each paragraph where the next begins', () => {
    const out = wordsToParagraphs(paras, stream(transcript))
    for (let i = 0; i < out.length - 1; i++) expect(out[i].end).toBe(out[i + 1].start)
  })

  it('runs the final paragraph to the end of the audio', () => {
    const s = stream(transcript)
    expect(wordsToParagraphs(paras, s).at(-1)!.end).toBe(s[s.length - 1].end)
  })

  it('holds position rather than inventing a jump when a paragraph is not found', () => {
    const out = wordsToParagraphs(
      ['there is a production deployment coming', 'completely absent sourdough baking instructions'],
      stream(transcript),
    )
    expect(out[1].start).toBeGreaterThanOrEqual(out[0].start)
  })

  it('survives an empty word stream', () => {
    const out = wordsToParagraphs(['anything at all here'], [])
    expect(out).toHaveLength(1)
    expect(Number.isFinite(out[0].start)).toBe(true)
  })
})

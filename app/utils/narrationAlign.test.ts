import { describe, it, expect } from 'vitest'
import { similarity, alignToNodes, alignmentConfidence, activeIndex, keyWords } from './narrationAlign'

const t = (start: number, end: number, text: string) => ({ start, end, text })

describe('keyWords', () => {
  it('drops short tokens and punctuation, which carry no matching signal', () => {
    expect(keyWords('The card, at 32 GB, was fast!')).toEqual(['card', 'fast'])
  })
})

describe('similarity', () => {
  it('scores a spoken paragraph against the post paragraph it came from', () => {
    const spoken = 'Ninety-six gigabytes on one card. Compute capability way up.'
    const rendered = '96 GB on one card. Compute capability way up.'
    expect(similarity(spoken, rendered)).toBeGreaterThan(0.5)
  })

  it('scores unrelated paragraphs near zero', () => {
    expect(similarity('benchmark harness truncated edits', 'sourdough starter bread recipe')).toBe(0)
  })

  it('is not fooled by an empty side', () => {
    expect(similarity('', 'anything here')).toBe(0)
    expect(similarity('anything here', '')).toBe(0)
  })
})

describe('alignToNodes', () => {
  const nodes = [
    'The Node I Have to Spec',
    'There is a production deployment coming that I have to spec.',
    'Here is the problem with the tables and the published numbers.',
    'The Card Went In and Two 3090s Fell Out',
    'An RTX PRO 6000 Blackwell showed up and went into the server.',
  ]

  it('maps timed paragraphs onto the matching nodes', () => {
    const timed = [
      t(0, 3, 'There is a production deployment coming that I have to spec.'),
      t(3, 7, 'An RTX PRO 6000 Blackwell showed up and went into the server.'),
    ]
    expect(alignToNodes(timed, nodes)).toEqual([1, 4])
  })

  it('never matches backwards, so a repeated phrase cannot pair with an earlier section', () => {
    const repeated = ['Same model, same quant.', 'Filler paragraph here.', 'Same model, same quant.']
    const timed = [t(0, 2, 'Same model, same quant.'), t(2, 4, 'Same model, same quant.')]
    const m = alignToNodes(timed, repeated)
    expect(m[0]).toBe(0)
    expect(m[1]).toBeGreaterThan(m[0])
  })

  it('returns -1 rather than forcing a bad pairing', () => {
    const timed = [t(0, 3, 'Completely unrelated sourdough baking instructions here.')]
    expect(alignToNodes(timed, nodes)).toEqual([-1])
  })

  it('tolerates the spoken rewrites clean.ts introduces', () => {
    const timed = [t(0, 4, 'An Epic 7532 with 128 gigabytes of D D R four and P C I Express lanes.')]
    const dom = ['An EPYC 7532 with 128GB of DDR4 and PCIe lanes.']
    expect(alignToNodes(timed, dom, { minScore: 0.3 })).toEqual([0])
  })
})

describe('alignmentConfidence', () => {
  it('is the share of timed paragraphs that matched', () => {
    expect(alignmentConfidence([0, 1, -1, 3])).toBe(0.75)
    expect(alignmentConfidence([])).toBe(0)
  })
})

describe('activeIndex', () => {
  const timed = [t(0, 5, 'one'), t(5, 12, 'two'), t(12, 20, 'three')]

  it('finds the paragraph being spoken', () => {
    expect(activeIndex(timed, 0)).toBe(0)
    expect(activeIndex(timed, 4.9)).toBe(0)
    expect(activeIndex(timed, 5)).toBe(1)
    expect(activeIndex(timed, 19)).toBe(2)
  })

  it('returns -1 before the first paragraph starts', () => {
    expect(activeIndex([t(2, 5, 'x')], 0)).toBe(-1)
  })

  it('stops highlighting once playback runs past the last paragraph', () => {
    expect(activeIndex(timed, 60)).toBe(-1)
  })

  it('allows a small grace period so the highlight does not flicker at a boundary', () => {
    expect(activeIndex(timed, 20.9)).toBe(2)
  })
})

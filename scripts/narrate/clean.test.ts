// scripts/narrate/clean.test.ts
import { describe, it, expect } from 'vitest'
import { stripMdc, postToNarrationText } from './clean'

describe('stripMdc', () => {
  it('removes block and leaf MDC components', () => {
    const md = 'before\n\n::audio-player{src="/a.mp3"}\n::\n\nafter\n\n::badge{x}\n'
    const out = stripMdc(md)
    expect(out).not.toContain('::')
    expect(out).toContain('before')
    expect(out).toContain('after')
  })
})

describe('postToNarrationText', () => {
  const raw = [
    '---', 'title: Hi', 'draft: false', '---',
    '# Heading One',
    '',
    'A paragraph with `inlineCode` and a [link text](https://example.com).',
    '',
    '```ts', 'const secret = 1', '```',
    '',
    '- first item', '- second item',
    '',
    '> a quoted line',
    '',
    '![alt](/img.png)',
    '',
    'Use e.g. this and i.e. that.',
  ].join('\n')

  const out = postToNarrationText(raw)

  it('drops frontmatter, code blocks, images, and URLs', () => {
    expect(out).not.toContain('title: Hi')
    expect(out).not.toContain('const secret')
    expect(out).not.toContain('https://example.com')
    expect(out).not.toContain('/img.png')
    expect(out).not.toContain('`')
  })
  it('keeps prose, link text, inline-code text, list items, and quote', () => {
    expect(out).toContain('Heading One')
    expect(out).toContain('inlineCode')
    expect(out).toContain('link text')
    expect(out).toContain('first item')
    expect(out).toContain('second item')
    expect(out).toContain('Quote: a quoted line')
  })
  it('applies eye→ear fixups', () => {
    expect(out).toContain('for example')
    expect(out).toContain('that is')
    expect(out).not.toMatch(/\be\.g\./)
  })
})

describe('GFM support', () => {
  it('drops GFM tables entirely (no pipe chars, no cell text)', () => {
    const md = '---\ntitle: T\n---\n\n| ColFoo | ColBar |\n|--------|--------|\n| val42  | val99  |\n\nAfter table.\n'
    const out = postToNarrationText(md)
    expect(out).not.toContain('|')
    expect(out).not.toContain('ColFoo')
    expect(out).not.toContain('val42')
    expect(out).toContain('After table')
  })

  it('strips strikethrough tildes but keeps the text', () => {
    const md = '---\ntitle: T\n---\n\n~~removed~~ kept\n'
    const out = postToNarrationText(md)
    expect(out).toContain('removed')
    expect(out).toContain('kept')
    expect(out).not.toContain('~~')
  })
})

// Everything below was learned from narrating blackwell-bakeoff, where each of these had
// to be hand-fixed in the generated .txt before the audio was usable.
describe('narration text preparation', () => {
  const post = (body: string, title = 'A Post') =>
    postToNarrationText(`---\ntitle: "${title}"\n---\n\n${body}\n`)

  it('opens on the title so the audio does not start mid-thought', () => {
    expect(post('Body text here.')).toMatch(/^A Post\.\n\n/)
  })

  it('does not double the punctuation of a title that already ends in one', () => {
    expect(post('Body.', 'Is This It?')).toMatch(/^Is This It\?\n/)
  })

  it('drops the Links section, which strips to meaningless bare labels', () => {
    const out = post('## Links\n- [The rig writeup](/blog/rig)\n- [Aider](https://x.com)\n\n## Real\n\nKeep this.')
    expect(out).not.toContain('rig writeup')
    expect(out).not.toContain('Links')
    expect(out).toContain('Keep this.')
  })

  it('closes a colon left dangling by a stripped table', () => {
    const out = post('Measured on real tasks, median of three:\n\n| a | b |\n|---|---|\n| 1 | 2 |')
    expect(out).toContain('median of three.')
    expect(out).not.toMatch(/three:/)
  })

  it('speaks units instead of letter-mangling them', () => {
    const out = post('It has 96 GB and 128GB and 923 MB and 50ms of headroom.')
    expect(out).toContain('96 gigabytes')
    expect(out).toContain('128 gigabytes')
    expect(out).toContain('923 megabytes')
    expect(out).toContain('50 milliseconds')
    expect(out).not.toMatch(/\bGB\b/)
  })

  it('speaks EPYC as a word and initialisms as letters', () => {
    const out = post('An EPYC 7532 with DDR4, FP8, int4, KV cache and PCIe lanes.')
    expect(out).toContain('Epic 7532')
    expect(out).toContain('D D R 4')
    expect(out).toContain('F P eight')
    expect(out).toContain('int four')
    expect(out).toContain('K V cache')
    expect(out).toContain('P C I Express')
  })

  it('does not append a second period to a bullet that has one', () => {
    const out = post('- Already punctuated.\n- Not punctuated')
    expect(out).not.toContain('..')
    expect(out).toContain('Not punctuated.')
  })
})

describe('narration text preparation, part two', () => {
  const post = (body: string, title = 'A Post') =>
    postToNarrationText(`---\ntitle: "${title}"\n---\n\n${body}\n`)

  it('speaks money, including the K and M suffixes', () => {
    const out = post('I spent $5K, then $6.90, then $5,000 and finally $1.2M.')
    expect(out).toContain('5 thousand dollars')
    expect(out).toContain('6.90 dollars')
    expect(out).toContain('5,000 dollars')
    expect(out).toContain('1.2 million dollars')
    expect(out).not.toContain('$')
  })

  it('drops a trailing Links heading but keeps the prose under it', () => {
    const out = post('## Body\n\nReal text.\n\n### Links\n\nFollow along at example.com.')
    expect(out).not.toMatch(/^Links\.$/m)
    expect(out).toContain('Follow along at example.com.')
  })

  it('only eats the link list, not a following section', () => {
    const out = post('## Links\n- [a](/a)\n- [b](/b)\n\n## Next\n\nSurvives.')
    expect(out).toContain('Survives.')
    expect(out).toContain('Next.')
  })
})

describe('the title is not exempt from the rules', () => {
  it('speaks money and units in the title too', () => {
    const out = postToNarrationText('---\ntitle: "I Spent $5K on a 96 GB Card"\n---\n\nBody.\n')
    expect(out.split('\n')[0]).toBe('I Spent 5 thousand dollars on a 96 gigabytes Card.')
  })
})

describe('rates and approximations', () => {
  const post = (b: string) => postToNarrationText(`---\ntitle: "T"\n---\n\n${b}\n`)

  it('speaks a per-million rate instead of leaving a slash', () => {
    const out = post('It costs $0.14/M in and $1.00/M out.')
    expect(out).toContain('0.14 dollars per million')
    expect(out).toContain('1.00 dollars per million')
    expect(out).not.toContain('/M')
  })

  it('speaks a leading tilde as an approximation', () => {
    expect(post('About ~961 dollars and ~$40.')).toContain('roughly 961')
  })
})

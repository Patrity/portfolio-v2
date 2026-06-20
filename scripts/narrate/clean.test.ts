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

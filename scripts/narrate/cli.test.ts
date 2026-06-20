// scripts/narrate/cli.test.ts
import { describe, it, expect, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { writeFileSync, readFileSync, rmSync, mkdtempSync, existsSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { parseArgs } from '../narrate'

const dir = mkdtempSync(join(tmpdir(), 'narrate-'))
const post = join(dir, 'sample.md')
writeFileSync(post, [
  '---', 'title: T', '---',
  '# Hello', '', 'Body with [a link](https://x.com) and `code`.', '',
  '```js', 'danger()', '```', '',
].join('\n'))

afterAll(() => rmSync(dir, { recursive: true, force: true }))

describe('narrate --text-only', () => {
  it('writes a clean narration.txt and no audio', () => {
    execFileSync('pnpm', ['narrate', post, '--text-only'], { encoding: 'utf8' })
    const txt = readFileSync(join(dir, 'sample.narration.txt'), 'utf8')
    expect(txt).toContain('Hello')
    expect(txt).toContain('a link')
    expect(txt).not.toContain('https://x.com')
    expect(txt).not.toContain('danger()')
    expect(txt).not.toContain('`')
    // Assert that no audio file was produced
    expect(existsSync(resolve('public/audio/blog/sample.mp3'))).toBe(false)
  })
})

describe('buildText reuse (via CLI)', () => {
  const reuseDir = mkdtempSync(join(tmpdir(), 'narrate-reuse-'))
  const reusePost = join(reuseDir, 'post.md')
  const reuseTxt = join(reuseDir, 'post.narration.txt')

  afterAll(() => rmSync(reuseDir, { recursive: true, force: true }))

  it('preserves hand-edited narration.txt when --rebuild-text is not set', () => {
    writeFileSync(reusePost, [
      '---', 'title: Reuse Test', '---',
      '# Generated Heading', '', 'This would be regenerated if rebuild were true.', '',
    ].join('\n'))
    writeFileSync(reuseTxt, 'HAND EDITED CONTENT.')
    const mtimeBefore = statSync(reuseTxt).mtimeMs

    execFileSync('pnpm', ['narrate', reusePost, '--text-only'], { encoding: 'utf8' })

    const content = readFileSync(reuseTxt, 'utf8')
    expect(content).toBe('HAND EDITED CONTENT.')
    // File must not have been rewritten (mtime unchanged)
    expect(statSync(reuseTxt).mtimeMs).toBe(mtimeBefore)
  })
})

describe('parseArgs — positional detection', () => {
  it('finds post path when a value-flag precedes it', () => {
    const a = parseArgs(['--voice', 'fast1-us', 'post.md'])
    expect(a.post).toBe('post.md')
    expect(a.opts.voice).toBe('fast1-us.wav')
  })

  it('finds post path when a boolean flag follows it', () => {
    const a = parseArgs(['post.md', '--text-only'])
    expect(a.post).toBe('post.md')
    expect(a.textOnly).toBe(true)
  })
})

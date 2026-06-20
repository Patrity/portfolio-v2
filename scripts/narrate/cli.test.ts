// scripts/narrate/cli.test.ts
import { describe, it, expect, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { writeFileSync, readFileSync, rmSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

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
  })
})

import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import type { Root, RootContent } from 'mdast'

const ABBREV: [RegExp, string][] = [
  [/\be\.g\.,?/gi, 'for example'],
  [/\bi\.e\.,?/gi, 'that is'],
  [/\betc\./gi, 'etcetera.'],
]

/**
 * Things the voice model reads wrong. Units glued to a numeral are the worst offenders:
 * "96 GB" came out as noise, and "128 GB" as "one hundred twenty eight gijbees".
 * EPYC is a word ("epic"), not an initialism. Spelled-out initialisms get spaces so the
 * model says the letters instead of guessing at a pronunciation.
 */
const SPOKEN: [RegExp, string][] = [
  [/(\d+)\s?GiB\b/g, '$1 gigabytes'],
  [/(\d+)\s?GB\b/g, '$1 gigabytes'],
  [/(\d+)\s?TB\b/g, '$1 terabytes'],
  [/(\d+)\s?MB\b/g, '$1 megabytes'],
  [/(\d+)\s?KB\b/g, '$1 kilobytes'],
  [/(\d+)\s?ms\b/g, '$1 milliseconds'],
  [/(\d+)\s?Gbps\b/g, '$1 gigabits per second'],
  [/(\d+)\s?Mbps\b/g, '$1 megabits per second'],
  [/\bEPYC\b/g, 'Epic'],
  [/\bBF16\b/g, 'B F sixteen'],
  [/\bFP16\b/g, 'F P sixteen'],
  [/\bFP8\b/g, 'F P eight'],
  [/\bint2\b/g, 'int two'],
  [/\bint4\b/g, 'int four'],
  [/\bint8\b/g, 'int eight'],
  [/\bKV\b/g, 'K V'],
  [/\bPCIe\b/g, 'P C I Express'],
  [/\bDDR(\d)\b/g, 'D D R $1'],
  [/\bNVMe\b/g, 'N V M E'],
  [/\bvCPU\b/g, 'v C P U'],
  [/\bTTFT\b/g, 'time to first token'],
  [/\bC\+\+/g, 'C plus plus'],
  // Money. Rate-per-unit first, then the K/M suffix, then plain dollars. Any other order
  // and the broader rule consumes the number, leaving "0.14 dollars/M" to be read aloud.
  [/\$(\d+(?:\.\d+)?)\s?\/\s?M\b/g, '$1 dollars per million'],
  [/\$(\d+(?:\.\d+)?)\s?\/\s?K\b/g, '$1 dollars per thousand'],
  [/~(?=[\d$])/g, 'roughly '],
  [/\$(\d+(?:\.\d+)?)\s?[Kk]\b/g, '$1 thousand dollars'],
  [/\$(\d+(?:\.\d+)?)\s?[Mm]\b/g, '$1 million dollars'],
  [/\$([\d,]+(?:\.\d+)?)/g, '$1 dollars'],
]

// Remove MDC component blocks (remark-parse doesn't know them).
// Block form: ::name{...}\n ... \n::   Leaf form: ::name{...}
export function stripMdc(md: string): string {
  // Matches block-form MDC components: ::name{...} ... :: spanning multiple lines
  let out = md.replace(/^::[A-Za-z][\w-]*(?:\{[^}]*\})?\s*$[\s\S]*?^::\s*$/gm, '')
  out = out.replace(/^::[A-Za-z][\w-]*(?:\{[^}]*\})?\s*$/gm, '')
  return out
}

function childrenText(children: RootContent[]): string {
  return children.map(nodeToText).join('')
}

function nodeToText(node: RootContent): string {
  switch (node.type) {
    case 'code':
    case 'image':
    case 'imageReference':
    case 'html':
    case 'thematicBreak':
    case 'table':
      return ''
    case 'inlineCode':
    case 'text':
      return node.value
    case 'break':
      return ' '
    case 'heading': {
      const t = childrenText(node.children).trim()
      return t ? `${t}.\n\n` : ''
    }
    case 'paragraph': {
      const t = childrenText(node.children).trim()
      return t ? `${t}\n\n` : ''
    }
    case 'blockquote': {
      const t = childrenText(node.children).trim()
      return t ? `Quote: ${t}\n\n` : ''
    }
    case 'list':
      return node.children.map(nodeToText).join('')
    case 'listItem': {
      const t = childrenText(node.children).trim()
      if (!t) return ''
      // A bullet that already ends in punctuation was getting a second period appended,
      // which reads as an odd double pause.
      return /[.!?:]$/.test(t) ? `${t}\n` : `${t}.\n`
    }
    case 'link':
    case 'emphasis':
    case 'strong':
    case 'delete':
      return childrenText(node.children)
    default:
      return 'children' in node ? childrenText((node as { children: RootContent[] }).children) : ''
  }
}

/**
 * Drop the "## Links" section. Every post opens with one, and since URLs are not spoken it
 * strips to a run of bare link labels ("The original rig writeup.") that mean nothing to a
 * listener. Runs on the markdown so the heading and its list go together.
 */
export function stripLinksSection(md: string): string {
  // The standard top-of-post "## Links" block: heading plus its bare link list, which
  // strips to meaningless labels because URLs are never spoken.
  let out = md.replace(/^##\s+Links\s*$\n+(?:^[-*]\s.*$\n?)+/gim, '')
  // Some posts put "### Links" above real closing prose. Keep the prose, drop the label.
  out = out.replace(/^#{2,6}\s+Links\s*$\n?/gim, '')
  return out
}

/**
 * Tables, charts and images are stripped, but the sentence that introduced them survives
 * and still ends in a colon, so the narration promises something the listener never gets
 * ("Measured on actual code-edit tasks, median of three:"). Close the sentence instead.
 */
function closeDanglingColons(text: string): string {
  return text.replace(/:\s*$/gm, '.')
}

export function postToNarrationText(rawFile: string): string {
  const parsed = matter(rawFile)
  const title = typeof parsed.data.title === 'string' ? parsed.data.title.trim() : ''
  const body = stripLinksSection(stripMdc(parsed.content))
  const tree = unified().use(remarkParse).use(remarkGfm).parse(body) as Root
  // Open on the title so the audio starts like a narrated piece rather than mid-thought.
  // Prepended BEFORE the replacements below, or a title containing "$5K" or "96 GB"
  // skips them and is the first thing the listener hears mispronounced.
  const head = title ? `${title.replace(/\s+/g, ' ')}${/[.!?]$/.test(title) ? '' : '.'}\n\n` : ''
  let text = head + childrenText(tree.children)
  for (const [re, rep] of ABBREV) text = text.replace(re, rep)
  for (const [re, rep] of SPOKEN) text = text.replace(re, rep)
  text = closeDanglingColons(text)
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  return text + '\n'
}

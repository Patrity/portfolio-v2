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
      return t ? `${t}.\n` : ''
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

export function postToNarrationText(rawFile: string): string {
  const body = matter(rawFile).content
  const noMdc = stripMdc(body)
  const tree = unified().use(remarkParse).use(remarkGfm).parse(noMdc) as Root
  let text = childrenText(tree.children)
  for (const [re, rep] of ABBREV) text = text.replace(re, rep)
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  return text + '\n'
}

/**
 * Estimate reading time (in minutes) from a Nuxt Content body.
 *
 * Nuxt Content v3 stores the body in Minimark format: `body.value` is an array
 * of nodes, each either a plain string (text) or an array `[tag, props, ...children]`.
 * We walk it and count words in the text nodes, skipping tag names and props.
 */
const WORDS_PER_MINUTE = 200

function collectText(node: unknown): string {
  if (typeof node === 'string') return node + ' '
  if (Array.isArray(node)) {
    // [tag, props, ...children] — children start at index 2
    return node.slice(2).map(collectText).join('')
  }
  if (node && typeof node === 'object') {
    const n = node as Record<string, unknown>
    if (Array.isArray(n.value)) return n.value.map(collectText).join('')
    if (Array.isArray(n.children)) return n.children.map(collectText).join('')
  }
  return ''
}

export function readingTime(body: unknown): number {
  const root = (body as { value?: unknown })?.value ?? body
  const text = Array.isArray(root) ? root.map(collectText).join('') : collectText(root)
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

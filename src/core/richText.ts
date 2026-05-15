function normalizeLineBreaks(value: string) {
  return value.replace(/\r\n?/g, '\n')
}

function stripMarkdown(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([\s\S]+?)\*\*/g, '$1')
    .replace(/__([\s\S]+?)__/g, '$1')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '$1')
    .replace(/(^|[^\w])_([^_\n]+?)_(?=[^\w]|$)/g, '$1$2')
    .replace(/~~([\s\S]+?)~~/g, '$1')
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, ' ')
}

export function markdownToPlainText(content: string) {
  return stripMarkdown(normalizeLineBreaks(content))
    .replace(/\s+/g, ' ')
    .trim()
}

export function hasRichTextContent(content: string) {
  const normalized = normalizeLineBreaks(content)
  const text = markdownToPlainText(normalized)
  return !!text || /!\[[^\]]*\]\(([^)]+)\)/.test(normalized)
}

export function getRichTextPreview(content: string, maxLength = 56) {
  const text = markdownToPlainText(content)

  if (text) {
    return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
  }

  if (/!\[[^\]]*\]\(([^)]+)\)/.test(content)) {
    return '[图片]'
  }

  return ''
}

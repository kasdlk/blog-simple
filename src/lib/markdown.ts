/**
 * Extract plain text from markdown for preview
 */
export function extractPlainText(markdown: string, maxLength: number = 150): string {
  // Normalize newlines
  const normalized = (markdown || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Remove GitHub-flavored markdown tables (avoid leaking `|---|` syntax into previews)
  const lines = normalized.split('\n');
  const kept: string[] = [];
  const isTableSeparator = (line: string) =>
    /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  const isTableRow = (line: string) => /\|/.test(line);

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const next = lines[i + 1];

    // Header row + separator row => treat as a table block
    if (current && next && isTableRow(current) && isTableSeparator(next)) {
      // Skip header + separator
      i += 1;
      // Skip subsequent table rows until a blank line
      while (i + 1 < lines.length && lines[i + 1] && isTableRow(lines[i + 1])) {
        i += 1;
      }
      continue;
    }

    kept.push(current);
  }

  // Remove code blocks
  let text = kept.join('\n').replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  text = text.replace(/`[^`]+`/g, '');
  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
  // Remove headers
  text = text.replace(/^#+\s+/gm, '');
  // Remove bold/italic
  text = text.replace(/\*\*([^\*]+)\*\*/g, '$1');
  text = text.replace(/\*([^\*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');
  // Remove list markers
  text = text.replace(/^[\*\-\+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');
  // Remove horizontal rules
  text = text.replace(/^---$/gm, '');
  // Remove remaining table pipes/separators (best-effort cleanup)
  text = text.replace(/^\s*\|.*\|\s*$/gm, '');
  text = text.replace(/^\s*:?[-]{3,}:?\s*(\|\s*:?[-]{3,}:?\s*)+\s*$/gm, '');
  // Clean up whitespace
  text = text.replace(/\n+/g, ' ').trim();
  
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}













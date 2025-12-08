/**
 * Extract plain text from markdown for preview
 */
export function extractPlainText(markdown: string, maxLength: number = 150): string {
  // Remove code blocks
  let text = markdown.replace(/```[\s\S]*?```/g, '');
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
  // Clean up whitespace
  text = text.replace(/\n+/g, ' ').trim();
  
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}






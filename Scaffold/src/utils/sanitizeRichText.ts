// Minimal HTML sanitizer for locally-authored rich text.
// Allows only a small set of tags used for formatting copy (e.g. <p>).
// This is NOT a general-purpose sanitizer, but it prevents obvious script injection.

const allowedTags = new Set([
  'P',
  'BR',
  'EM',
  'STRONG',
  'B',
  'I',
  'S',
  'UL',
  'OL',
  'LI',
  'A',
  'H1',
  'H2',
  'H3',
  'H4',
  'BLOCKQUOTE',
  'PRE',
  'CODE',
  'HR',
]);

const allowedAttrs: Record<string, Set<string>> = {
  A: new Set(['href', 'target', 'rel']),
};

function isSafeHref(href: string): boolean {
  const trimmed = href.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#')
  );
}

export function sanitizeRichTextHtml(input: string): string {
  if (!input) return '';

  // Fast path: no tags
  if (!input.includes('<')) return input;

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  const toRemove: Element[] = [];

  while (walker.nextNode()) {
    const el = walker.currentNode as Element;
    if (!allowedTags.has(el.tagName)) {
      toRemove.push(el);
      continue;
    }

    // Strip attributes except allowlist
    const allowed = allowedAttrs[el.tagName] ?? new Set<string>();
    Array.from(el.attributes).forEach(attr => {
      if (!allowed.has(attr.name)) el.removeAttribute(attr.name);
    });

    if (el.tagName === 'A') {
      const href = el.getAttribute('href') ?? '';
      if (!isSafeHref(href)) {
        el.removeAttribute('href');
      }
      // Safe defaults
      el.setAttribute('rel', 'noopener noreferrer');
      if (el.getAttribute('target') === '_blank') {
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }

  // Replace disallowed elements with their text content
  toRemove.forEach(el => {
    const text = doc.createTextNode(el.textContent ?? '');
    el.replaceWith(text);
  });

  return doc.body.innerHTML;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function markdownToHtml(md: string): string {
  const src = md.replace(/\r\n/g, '\n').trim();
  if (!src) return '';

  // First, extract code blocks (triple backticks) before splitting into blocks
  // Match ```lang or ``` followed by content and closing ```
  // Pattern: ```optional_lang\ncode_content```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks: Array<{ placeholder: string; lang: string; code: string }> = [];
  let codeBlockIndex = 0;
  
  // Replace all code blocks with placeholders
  let processedSrc = src.replace(codeBlockRegex, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
    codeBlocks.push({ placeholder, lang: lang || '', code: code.trim() });
    codeBlockIndex++;
    return `\n\n${placeholder}\n\n`;
  });

  // Extract images (![alt](url)) and replace with placeholder text
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  processedSrc = processedSrc.replace(imageRegex, (match, alt, url) => {
    // Replace images with placeholder text (similar to what we did for needs-evals)
    return `\n\n> **Images and visualizations are available in the [original article](${url}).**\n\n`;
  });

  // Split into blocks by double newlines, but preserve single newlines within blocks
  const blocks = processedSrc.split(/\n{2,}/g).filter(b => b.trim().length > 0);

  const renderInline = (raw: string) => {
    let s = escapeHtml(raw);

    // Links: [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
      const safeUrl = String(url);
      const tgt = safeUrl.startsWith('http') ? ' target="_blank"' : '';
      return `<a href="${escapeHtml(safeUrl)}"${tgt}>${text}</a>`;
    });

    // Strikethrough: ~~text~~
    s = s.replace(/~~([^~]+)~~/g, '<s>$1</s>');

    // Bold / italic
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Line breaks inside paragraphs
    s = s.replace(/\n/g, '<br/>');
    return s;
  };

  const out: string[] = [];

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    // Check if this block is a code block placeholder
    const codeBlockMatch = trimmedBlock.match(/^__CODE_BLOCK_(\d+)__$/);
    if (codeBlockMatch) {
      const index = parseInt(codeBlockMatch[1], 10);
      const codeBlock = codeBlocks[index];
      if (codeBlock) {
        const langAttr = codeBlock.lang ? ` class="language-${escapeHtml(codeBlock.lang)}"` : '';
        const escapedCode = escapeHtml(codeBlock.code);
        out.push(`<pre><code${langAttr}>${escapedCode}</code></pre>`);
        continue;
      }
    }

    const lines = block.split('\n');
    const nonEmptyLines = lines.map(l => l.trim()).filter(l => l.length > 0);
    if (nonEmptyLines.length === 0) continue;

    // Headings - check if the first non-empty line is a heading
    // Match patterns like "## Heading" or "##Heading" (with or without space)
    const firstLine = nonEmptyLines[0];
    const headingMatch = firstLine.match(/^(#{1,4})\s+(.+)$/) || firstLine.match(/^(#{1,4})([^\s#].+)$/);
    if (headingMatch && headingMatch[1] && headingMatch[2]) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      if (headingText && headingText.length > 0) {
        // If it's just a heading (single non-empty line), render it
        if (nonEmptyLines.length === 1) {
          out.push(`<h${level}>${renderInline(headingText)}</h${level}>`);
          continue;
        }
        // If there's content after, render heading and process rest as paragraph
        out.push(`<h${level}>${renderInline(headingText)}</h${level}>`);
        const restLines = nonEmptyLines.slice(1);
        const restBlock = restLines.join('\n');
        if (restBlock.trim()) {
          out.push(`<p>${renderInline(restBlock)}</p>`);
        }
        continue;
      }
    }

    // Blockquote - check if block starts with >
    // This handles multi-line blockquotes like in "losing my hands"
    const allLines = block.split('\n');
    const firstNonEmpty = allLines.find(l => l.trim().length > 0);
    
    if (firstNonEmpty && firstNonEmpty.trim().startsWith('>')) {
      // This is a blockquote block - process all lines that are part of the quote
      const processedLines: string[] = [];
      
      for (const line of allLines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('>')) {
          // Remove > and optional space
          const content = trimmed.replace(/^>\s?/, '');
          processedLines.push(content);
        } else if (trimmed.length === 0 && processedLines.length > 0) {
          // Empty line within blockquote (preserve spacing)
          processedLines.push('');
        } else if ((trimmed.startsWith('—') || trimmed.startsWith('- ')) && processedLines.length > 0) {
          // Attribution lines (only if we're already in a quote)
          processedLines.push(trimmed);
        } else if (trimmed.length > 0 && !trimmed.startsWith('—') && !trimmed.startsWith('- ')) {
          // Non-quote, non-attribution content - stop processing
          break;
        }
      }
      
      if (processedLines.length > 0) {
        const text = processedLines.join('\n');
        out.push(`<blockquote><p>${renderInline(text)}</p></blockquote>`);
        continue;
      }
    }

    // Unordered list
    const isUl = nonEmptyLines.every(l => l.startsWith('- ') || l.startsWith('* '));
    if (isUl && nonEmptyLines.length > 0) {
      const items = nonEmptyLines
        .map(l => l.slice(2).trim())
        .filter(item => item.length > 0)
        .map(item => `<li>${renderInline(item)}</li>`)
        .join('');
      out.push(`<ul>${items}</ul>`);
      continue;
    }

    // Ordered list
    const isOl = nonEmptyLines.every(l => /^\d+\.\s+/.test(l));
    if (isOl && nonEmptyLines.length > 0) {
      const items = nonEmptyLines
        .map(l => l.replace(/^\d+\.\s+/, '').trim())
        .filter(item => item.length > 0)
        .map(item => `<li>${renderInline(item)}</li>`)
        .join('');
      out.push(`<ol>${items}</ol>`);
      continue;
    }

    out.push(`<p>${renderInline(trimmedBlock)}</p>`);
  }

  return out.join('\n');
}

export function renderRichTextHtml(input: string): string {
  if (!input) return '';
  // If it already looks like HTML, sanitize that.
  if (input.includes('<')) return sanitizeRichTextHtml(input);
  // Otherwise treat it as Markdown and sanitize the generated HTML.
  return sanitizeRichTextHtml(markdownToHtml(input));
}


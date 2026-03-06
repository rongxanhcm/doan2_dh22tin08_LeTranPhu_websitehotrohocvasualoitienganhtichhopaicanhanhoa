import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({
  gfm: true,
  breaks: true,
});

function normalizePipeTableSeparators(content: string): string {
  return content.replace(/\|\s*-{3,}\s*\|/g, (match) => match.replace(/\s+/g, ''));
}

function convertTabBlocksToMarkdownTables(content: string): string {
  const lines = content.split(/\r?\n/);
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const row = lines[i];

    if (!row.includes('\t')) {
      output.push(row);
      i += 1;
      continue;
    }

    const block: string[] = [];
    let j = i;
    while (j < lines.length && lines[j].includes('\t')) {
      block.push(lines[j]);
      j += 1;
    }

    const parsedRows = block
      .map((line) => line.split('\t').map((cell) => cell.trim()))
      .filter((cells) => cells.length > 1 && cells.some((cell) => cell.length > 0));

    if (parsedRows.length < 2) {
      output.push(...block);
      i = j;
      continue;
    }

    const columnCount = parsedRows[0].length;
    const sameShape = parsedRows.every((cells) => cells.length === columnCount);

    if (!sameShape) {
      output.push(...block);
      i = j;
      continue;
    }

    const header = `| ${parsedRows[0].join(' | ')} |`;
    const divider = `| ${Array(columnCount).fill('---').join(' | ')} |`;
    const body = parsedRows.slice(1).map((cells) => `| ${cells.join(' | ')} |`);

    output.push(header, divider, ...body);
    i = j;
  }

  return output.join('\n');
}

export function renderBlogContent(rawContent: string): string {
  const normalized = convertTabBlocksToMarkdownTables(normalizePipeTableSeparators(rawContent));
  const html = marked.parse(normalized, { async: false }) as string;

  return sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'blockquote',
      'ul',
      'ol',
      'li',
      'strong',
      'em',
      'code',
      'pre',
      'a',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      th: ['colspan', 'rowspan', 'align'],
      td: ['colspan', 'rowspan', 'align'],
      code: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

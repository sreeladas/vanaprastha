import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'collections');

export interface Item {
  filename?: string;
  url?: string;
  title?: string;
  caption?: string;
}

export interface CollectionData {
  title: string;
  order: number;
  heroImage?: string;
  heroFocus?: string;
  pdfPage?: number;
  items: Item[];
  body: string;
}

export function parseMarkdown(raw: string): CollectionData {
  const fmEnd = raw.indexOf('---', 3);
  if (fmEnd === -1) throw new Error('Invalid frontmatter');
  const fmBlock = raw.slice(4, fmEnd).trim();
  const body = raw.slice(fmEnd + 3).trim();

  const data: Record<string, any> = {};
  const items: Item[] = [];
  let inItems = false;
  let currentItem: Item | null = null;

  for (const line of fmBlock.split('\n')) {
    if (line.startsWith('items:')) {
      inItems = true;
      if (line.trim() === 'items: []') {
        inItems = false;
      }
      continue;
    }
    if (inItems) {
      if (line.match(/^\s+-\s+/)) {
        if (currentItem) items.push(currentItem);
        currentItem = {};
        const match = line.match(/^\s+-\s+(\w+):\s*"(.*)"\s*$/);
        if (match) (currentItem as any)[match[1]] = match[2];
      } else if (line.match(/^\s+\w+:/) && currentItem) {
        const match = line.match(/^\s+(\w+):\s*"(.*)"\s*$/);
        if (match) (currentItem as any)[match[1]] = match[2];
      } else {
        if (currentItem) items.push(currentItem);
        currentItem = null;
        inItems = false;
        const m = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
        if (m) data[m[1]] = m[2];
      }
    } else {
      const m = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
      if (m) data[m[1]] = isNaN(Number(m[2])) ? m[2] : Number(m[2]);
    }
  }
  if (currentItem) items.push(currentItem);

  return { title: data.title || '', order: data.order ?? 0, heroImage: data.heroImage, heroFocus: data.heroFocus, pdfPage: data.pdfPage, items, body };
}

// Trim a frontmatter text field and treat quote/whitespace-only values as empty,
// so stray ditto-marks (e.g. a lone "'") never get written back.
function cleanField(value?: string): string {
  const trimmed = (value ?? '').trim();
  if (/^['"]*$/.test(trimmed)) return '';
  return trimmed.replace(/\\/g, '').replace(/"/g, "'");
}

export function serializeMarkdown(data: CollectionData): string {
  const lines = ['---'];
  lines.push(`title: "${data.title || ''}"`);
  lines.push(`order: ${data.order ?? 0}`);
  if (data.heroImage) lines.push(`heroImage: "${data.heroImage}"`);
  if (data.heroFocus) lines.push(`heroFocus: "${data.heroFocus}"`);
  if (data.pdfPage) lines.push(`pdfPage: ${data.pdfPage}`);

  if (data.items.length > 0) {
    lines.push('items:');
    for (const item of data.items) {
      const fields: string[] = [];
      if (item.filename) fields.push(`filename: "${item.filename}"`);
      if (item.url) fields.push(`url: "${item.url}"`);
      const title = cleanField(item.title);
      const caption = cleanField(item.caption);
      if (title) fields.push(`title: "${title}"`);
      if (caption) fields.push(`caption: "${caption}"`);
      lines.push(`  - ${fields[0]}`);
      for (let i = 1; i < fields.length; i++) {
        lines.push(`    ${fields[i]}`);
      }
    }
  } else {
    lines.push('items: []');
  }

  lines.push('---');
  lines.push('');
  lines.push(data.body.trim());
  lines.push('');
  return lines.join('\n');
}

export function collectionPath(slug: string): string {
  return join(CONTENT_DIR, `${slug}.md`);
}

export async function readCollection(slug: string): Promise<CollectionData> {
  const raw = await readFile(collectionPath(slug), 'utf-8');
  return parseMarkdown(raw);
}

export async function writeCollection(slug: string, data: CollectionData): Promise<void> {
  await writeFile(collectionPath(slug), serializeMarkdown(data), 'utf-8');
}

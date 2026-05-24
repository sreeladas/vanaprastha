import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const CONTENT_DIR = join(import.meta.dirname, '..', 'src', 'content', 'collections');
const STAGING_DIR = join(import.meta.dirname, '..', '.images-staging', 'collections');

interface Item { filename?: string; url?: string; title?: string; caption?: string; }
interface CollectionData { title: string; order: number; heroImage?: string; pdfPage?: number; items: Item[]; body: string; }

function parseMarkdown(raw: string): CollectionData {
  const fmEnd = raw.indexOf('---', 3);
  if (fmEnd === -1) throw new Error('Invalid frontmatter');
  const fmBlock = raw.slice(4, fmEnd).trim();
  const body = raw.slice(fmEnd + 3).trim();
  const data: Record<string, any> = {};
  const items: Item[] = [];
  let inItems = false;
  let currentItem: Item | null = null;
  for (const line of fmBlock.split('\n')) {
    if (line.startsWith('items:')) { inItems = true; if (line.trim() === 'items: []') inItems = false; continue; }
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
        currentItem = null; inItems = false;
        const m = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
        if (m) data[m[1]] = m[2];
      }
    } else {
      const m = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
      if (m) data[m[1]] = isNaN(Number(m[2])) ? m[2] : Number(m[2]);
    }
  }
  if (currentItem) items.push(currentItem);
  return { title: data.title || '', order: data.order ?? 0, heroImage: data.heroImage, pdfPage: data.pdfPage, items, body };
}

function serializeMarkdown(data: CollectionData): string {
  const lines = ['---'];
  lines.push(`title: "${data.title || ''}"`);
  lines.push(`order: ${data.order ?? 0}`);
  if (data.heroImage) lines.push(`heroImage: "${data.heroImage}"`);
  if (data.pdfPage) lines.push(`pdfPage: ${data.pdfPage}`);
  if (data.items.length > 0) {
    lines.push('items:');
    for (const item of data.items) {
      const fields: string[] = [];
      if (item.filename) fields.push(`filename: "${item.filename}"`);
      if (item.url) fields.push(`url: "${item.url}"`);
      fields.push(`title: "${(item.title ?? '').replace(/\\/g, '').replace(/"/g, "'")}"`);
      if (item.caption) fields.push(`caption: "${item.caption.replace(/\\/g, '').replace(/"/g, "'")}"`);
      lines.push(`  - ${fields[0]}`);
      for (let i = 1; i < fields.length; i++) lines.push(`    ${fields[i]}`);
    }
  } else { lines.push('items: []'); }
  lines.push('---');
  lines.push('');
  lines.push(data.body.trim());
  lines.push('');
  return lines.join('\n');
}

async function fingerprint(filePath: string): Promise<Uint8Array | null> {
  try {
    return await sharp(filePath).resize(8, 8, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  } catch { return null; }
}

function distance(a: Uint8Array, b: Uint8Array): number {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) d += Math.abs(a[i] - b[i]);
  return d;
}

async function sortCollection(slug: string) {
  const raw = await readFile(join(CONTENT_DIR, `${slug}.md`), 'utf-8');
  const data = parseMarkdown(raw);
  if (data.items.length < 2) { console.log(`${slug}: skipped (${data.items.length} items)`); return; }

  const prints = await Promise.all(data.items.map(item => {
    if (!item.filename) return Promise.resolve(null);
    return fingerprint(join(STAGING_DIR, slug, item.filename));
  }));

  const visited = new Set<number>();
  const order: number[] = [0];
  visited.add(0);
  for (let step = 1; step < data.items.length; step++) {
    const last = order[order.length - 1];
    const lastPrint = prints[last];
    let bestIdx = -1, bestDist = Infinity;
    for (let j = 0; j < data.items.length; j++) {
      if (visited.has(j)) continue;
      if (!lastPrint || !prints[j]) { if (bestIdx === -1) bestIdx = j; continue; }
      const d = distance(lastPrint, prints[j]!);
      if (d < bestDist) { bestDist = d; bestIdx = j; }
    }
    if (bestIdx === -1) break;
    order.push(bestIdx);
    visited.add(bestIdx);
  }

  data.items = order.map(i => data.items[i]);
  await writeFile(join(CONTENT_DIR, `${slug}.md`), serializeMarkdown(data), 'utf-8');
  console.log(`${slug}: sorted ${data.items.length} items`);
}

async function main() {
  const files = await readdir(CONTENT_DIR);
  const slugs = files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
  for (const slug of slugs) {
    await sortCollection(slug);
  }
  console.log('Done.');
}

main();

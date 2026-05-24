import type { APIRoute } from 'astro';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'collections');

interface Item {
  filename?: string;
  url?: string;
  title?: string;
  caption?: string;
}

function parseMarkdown(raw: string) {
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
      continue;
    }
    if (inItems) {
      if (line.match(/^\s+-\s+/)) {
        if (currentItem) items.push(currentItem);
        currentItem = {};
        const match = line.match(/^\s+-\s+(\w+):\s*"?(.+?)"?\s*$/);
        if (match) (currentItem as any)[match[1]] = match[2];
      } else if (line.match(/^\s+\w+:/) && currentItem) {
        const match = line.match(/^\s+(\w+):\s*"?(.+?)"?\s*$/);
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

  return { ...data, items, body };
}

function serializeMarkdown(data: Record<string, any>, items: Item[], body: string): string {
  const lines = ['---'];
  lines.push(`title: "${data.title || ''}"`);
  lines.push(`order: ${data.order ?? 0}`);
  if (data.heroImage) lines.push(`heroImage: "${data.heroImage}"`);
  if (data.pdfPage) lines.push(`pdfPage: ${data.pdfPage}`);

  if (items.length > 0) {
    lines.push('items:');
    for (const item of items) {
      const fields: string[] = [];
      if (item.filename) fields.push(`filename: "${item.filename}"`);
      if (item.url) fields.push(`url: "${item.url}"`);
      if (item.title) fields.push(`title: "${item.title.replace(/"/g, '\\"')}"`);
      if (item.caption) fields.push(`caption: "${item.caption.replace(/"/g, '\\"')}"`);
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
  lines.push(body.trim());
  lines.push('');
  return lines.join('\n');
}

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  if (!slug) return new Response('Missing slug', { status: 400 });

  try {
    const raw = await readFile(join(CONTENT_DIR, `${slug}.md`), 'utf-8');
    const parsed = parseMarkdown(raw);
    return new Response(JSON.stringify({ slug, ...parsed }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  if (!slug) return new Response('Missing slug', { status: 400 });

  try {
    const body = await request.json();
    const filePath = join(CONTENT_DIR, `${slug}.md`);

    let existing: Record<string, any> = { title: '', order: 0 };
    let existingItems: Item[] = [];
    let existingBody = '';

    try {
      const raw = await readFile(filePath, 'utf-8');
      const parsed = parseMarkdown(raw);
      existingBody = parsed.body;
      existingItems = parsed.items;
      existing = parsed;
    } catch {}

    const title = body.title ?? existing.title;
    const order = body.order ?? existing.order;
    const heroImage = body.heroImage ?? existing.heroImage;
    const pdfPage = body.pdfPage ?? existing.pdfPage;
    const items = body.items ?? existingItems;
    const blurb = body.blurb ?? existingBody;

    const content = serializeMarkdown({ title, order, heroImage, pdfPage }, items, blurb);
    await writeFile(filePath, content, 'utf-8');

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const { slug } = params;
  if (!slug) return new Response('Missing slug', { status: 400 });

  try {
    await unlink(join(CONTENT_DIR, `${slug}.md`));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};

import type { APIRoute } from 'astro';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'collections');

export const GET: APIRoute = async () => {
  const files = await readdir(CONTENT_DIR);
  const collections = [];

  for (const file of files.filter((f) => f.endsWith('.md'))) {
    const slug = file.replace('.md', '');
    const raw = await readFile(join(CONTENT_DIR, file), 'utf-8');
    const fmEnd = raw.indexOf('---', 3);
    const fm = raw.slice(4, fmEnd).trim();
    const body = raw.slice(fmEnd + 3).trim();

    const title = fm.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] || slug;
    const order = Number(fm.match(/^order:\s*(\d+)/m)?.[1] || 0);
    const heroImage = fm.match(/^heroImage:\s*"?(.+?)"?\s*$/m)?.[1];
    const itemCount = (fm.match(/^\s+-\s+filename:|^\s+-\s+url:/gm) || []).length;

    collections.push({ slug, title, order, heroImage, itemCount, blurb: body.slice(0, 200) });
  }

  collections.sort((a, b) => a.order - b.order);

  return new Response(JSON.stringify(collections), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const { slug, title } = await request.json();
  if (!slug || !title) {
    return new Response('slug and title required', { status: 400 });
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return new Response('slug must be lowercase alphanumeric with dashes', { status: 400 });
  }

  const filePath = join(CONTENT_DIR, `${slug}.md`);
  const files = await readdir(CONTENT_DIR);
  const maxOrder = files.length;

  const content = `---
title: "${title}"
order: ${maxOrder + 1}
items: []
---

${title} collection.
`;

  await writeFile(filePath, content, 'utf-8');

  return new Response(JSON.stringify({ ok: true, slug }), {
    headers: { 'Content-Type': 'application/json' },
    status: 201,
  });
};

import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'collections');

function parseFrontmatterItems(raw: string) {
  const fmEnd = raw.indexOf('---', 3);
  const fm = raw.slice(0, fmEnd + 3);
  const body = raw.slice(fmEnd + 3).trim();
  return { fm, body, raw };
}

export const POST: APIRoute = async ({ request }) => {
  const { fromCollection, toCollection, itemIndex } = await request.json();

  if (!fromCollection || !toCollection || itemIndex === undefined) {
    return new Response('fromCollection, toCollection, and itemIndex required', { status: 400 });
  }

  try {
    const fromPath = join(CONTENT_DIR, `${fromCollection}.md`);
    const toPath = join(CONTENT_DIR, `${toCollection}.md`);

    const fromRes = await fetch(`http://localhost:${process.env.PORT || 3000}/api/collections/${fromCollection}`);
    const toRes = await fetch(`http://localhost:${process.env.PORT || 3000}/api/collections/${toCollection}`);

    if (!fromRes.ok || !toRes.ok) {
      return new Response('Collection not found', { status: 404 });
    }

    const fromData = await fromRes.json();
    const toData = await toRes.json();

    const item = fromData.items[itemIndex];
    if (!item) return new Response('Item not found', { status: 404 });

    fromData.items.splice(itemIndex, 1);
    toData.items.push(item);

    await fetch(`http://localhost:${process.env.PORT || 3000}/api/collections/${fromCollection}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: fromData.items }),
    });

    await fetch(`http://localhost:${process.env.PORT || 3000}/api/collections/${toCollection}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: toData.items }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
};

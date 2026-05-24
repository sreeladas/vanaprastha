import type { APIRoute } from 'astro';
import { readCollection, writeCollection } from '@/lib/markdown';

export const POST: APIRoute = async ({ request }) => {
  const { fromCollection, toCollection, itemIndex } = await request.json();

  if (!fromCollection || !toCollection || itemIndex === undefined) {
    return new Response('fromCollection, toCollection, and itemIndex required', { status: 400 });
  }

  try {
    const fromData = await readCollection(fromCollection);
    const toData = await readCollection(toCollection);

    const item = fromData.items[itemIndex];
    if (!item) return new Response('Item not found', { status: 404 });

    fromData.items.splice(itemIndex, 1);
    toData.items.push(item);

    await writeCollection(fromCollection, fromData);
    await writeCollection(toCollection, toData);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
};

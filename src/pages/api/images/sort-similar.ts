import type { APIRoute } from 'astro';
import { join } from 'node:path';
import sharp from 'sharp';
import { readCollection, writeCollection } from '@/lib/markdown';

const STAGING_DIR = join(process.cwd(), '.images-staging', 'collections');

async function fingerprint(filePath: string): Promise<Uint8Array> {
  return sharp(filePath)
    .resize(8, 8, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();
}

function distance(a: Uint8Array, b: Uint8Array): number {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    d += Math.abs(a[i] - b[i]);
  }
  return d;
}

export const POST: APIRoute = async ({ request }) => {
  const { collection } = await request.json();
  if (!collection) return new Response('collection required', { status: 400 });

  try {
    const data = await readCollection(collection);
    const items = data.items;

    if (items.length < 2) {
      return new Response(JSON.stringify({ ok: true, order: items.map((_: any, i: number) => i) }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prints: (Uint8Array | null)[] = await Promise.all(
      items.map(async (item) => {
        if (!item.filename) return null;
        try {
          return await fingerprint(join(STAGING_DIR, collection, item.filename));
        } catch {
          return null;
        }
      }),
    );

    const visited = new Set<number>();
    const order: number[] = [0];
    visited.add(0);

    for (let step = 1; step < items.length; step++) {
      const last = order[order.length - 1];
      const lastPrint = prints[last];
      let bestIdx = -1;
      let bestDist = Infinity;

      for (let j = 0; j < items.length; j++) {
        if (visited.has(j)) continue;
        if (!lastPrint || !prints[j]) {
          if (bestIdx === -1) bestIdx = j;
          continue;
        }
        const d = distance(lastPrint, prints[j]!);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = j;
        }
      }

      if (bestIdx === -1) break;
      order.push(bestIdx);
      visited.add(bestIdx);
    }

    data.items = order.map((i) => items[i]);
    await writeCollection(collection, data);

    return new Response(JSON.stringify({ ok: true, order }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
};

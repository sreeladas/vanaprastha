import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const STAGING_DIR = join(process.cwd(), '.images-staging', 'collections');

async function fingerprint(filePath: string): Promise<Buffer> {
  return sharp(filePath)
    .resize(8, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();
}

function distance(a: Buffer, b: Buffer): number {
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
    const res = await fetch(`http://localhost:${process.env.PORT || 3000}/api/collections/${collection}`);
    if (!res.ok) return new Response('Collection not found', { status: 404 });
    const data = await res.json();
    const items: any[] = data.items;

    if (items.length < 2) {
      return new Response(JSON.stringify({ ok: true, order: items.map((_: any, i: number) => i) }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prints: (Buffer | null)[] = await Promise.all(
      items.map(async (item: any) => {
        if (!item.filename) return null;
        try {
          return await fingerprint(join(STAGING_DIR, collection, item.filename));
        } catch {
          return null;
        }
      }),
    );

    // Nearest-neighbor chain sort
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

    const reordered = order.map((i) => items[i]);

    await fetch(`http://localhost:${process.env.PORT || 3000}/api/collections/${collection}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: reordered }),
    });

    return new Response(JSON.stringify({ ok: true, order }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
};

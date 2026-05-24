import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const STAGING_DIR = join(process.cwd(), '.images-staging', 'collections');

export const POST: APIRoute = async ({ request }) => {
  const { collection, filename, degrees } = await request.json();

  if (!collection || !filename || ![90, 180, 270].includes(degrees)) {
    return new Response('collection, filename, and degrees (90/180/270) required', { status: 400 });
  }

  const filePath = join(STAGING_DIR, collection, filename);

  try {
    const buffer = await readFile(filePath);
    const rotated = await sharp(buffer).rotate(degrees).webp({ quality: 85 }).toBuffer();
    await writeFile(filePath, rotated);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(`Failed to rotate: ${e.message}`, { status: 500 });
  }
};

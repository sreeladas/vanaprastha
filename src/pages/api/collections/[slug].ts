import type { APIRoute } from 'astro';
import { unlink } from 'node:fs/promises';
import { readCollection, writeCollection, collectionPath, type CollectionData } from '@/lib/markdown';

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  if (!slug) return new Response('Missing slug', { status: 400 });

  try {
    const data = await readCollection(slug);
    return new Response(JSON.stringify({ slug, ...data }), {
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

    let existing: CollectionData = { title: '', order: 0, items: [], body: '' };
    try {
      existing = await readCollection(slug);
    } catch {}

    await writeCollection(slug, {
      title: body.title ?? existing.title,
      order: body.order ?? existing.order,
      heroImage: body.heroImage ?? existing.heroImage,
      heroFocus: body.heroFocus ?? existing.heroFocus,
      pdfPage: body.pdfPage ?? existing.pdfPage,
      items: body.items ?? existing.items,
      body: body.blurb ?? existing.body,
    });

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
    await unlink(collectionPath(slug));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};

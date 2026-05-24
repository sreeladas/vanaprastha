import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const collectionsSchema = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/collections' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    heroImage: z.string().optional(),
    heroFocus: z.string().optional(),
    pdfPage: z.number().optional(),
    items: z
      .array(
        z.object({
          filename: z.string().optional(),
          url: z.string().optional(),
          title: z.string().optional(),
          caption: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

export const collections = { collections: collectionsSchema };

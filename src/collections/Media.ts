import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { autoAssignToCollections } from '../hooks/autoAssignToCollections'
import { removeFromCollections } from '../hooks/removeFromCollections'
import { AUTOMATED_COLLECTIONS } from '../config/collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [autoAssignToCollections],
    afterDelete: [removeFromCollections],
  },
  admin: {
    components: {
      views: {
        list: {
          actions: [
            {
              path: '@/components/EnhancedBulkUpload',
              exportName: 'default',
            },
            {
              path: '@/components/EnhancedBulkUpload/MetadataEditor',
              exportName: 'EditMetadataButton',
            },
          ],
        },
      },
    },
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'collections',
      type: 'select',
      hasMany: true,
      options: AUTOMATED_COLLECTIONS.map((collection) => ({
        label: collection.title,
        value: collection.slug,
      })),
      admin: {
        description: 'Tag this image with collections to automatically add it to those galleries',
      },
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}

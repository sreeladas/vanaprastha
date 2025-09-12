import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'
import { syncCollectionChanges } from '../hooks/syncCollectionChanges'

interface CollectionTemplateOptions {
  slug: string
  // Optional customizations for future extensibility
  additionalFields?: CollectionConfig['fields']
  customHooks?: CollectionConfig['hooks']
  customAccess?: CollectionConfig['access']
  customAdmin?: CollectionConfig['admin']
}

export const createAutomatedCollection = (options: CollectionTemplateOptions): CollectionConfig => {
  const {
    slug,
    additionalFields = [],
    customHooks,
    customAccess,
    customAdmin,
  } = options

  return {
    slug,
    access: customAccess || {
      create: authenticated,
      delete: authenticated,
      read: anyone,
      update: authenticated,
    },
    admin: customAdmin || {
      useAsTitle: 'title',
      defaultColumns: ['title', 'updatedAt'],
    },
    hooks: customHooks || {
      afterChange: [syncCollectionChanges],
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        type: 'textarea',
      },
      {
        name: 'heroImage',
        type: 'upload',
        relationTo: 'media',
        admin: {
          description: 'Main hero image for this collection',
        },
      },
      {
        name: 'galleryImages',
        type: 'array',
        admin: {
          description: 'Gallery images - these will be auto-populated when media is tagged with this collection',
        },
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
          },
          {
            name: 'caption',
            type: 'text',
          },
          {
            name: 'description',
            type: 'textarea',
          }
        ]
      },
      ...slugField(),
      ...additionalFields,
    ],
  }
}
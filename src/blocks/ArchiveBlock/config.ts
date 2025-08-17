import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Individual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'pages',
      label: 'Collections To Show',
      options: [
        {
          label: 'Pages',
          value: 'pages',
        },
        {
          label: 'Bollywood Posters',
          value: 'bollywood-posters',
        },
        {
          label: 'Butterflies',
          value: 'butterflies',
        },
        {
          label: 'Dokra Metal Craft',
          value: 'dokra-metal-craft',
        },
        {
          label: 'Fossils',
          value: 'fossils',
        },
        {
          label: 'Masks',
          value: 'masks',
        },
        {
          label: 'Nek Chand Works',
          value: 'nekchand-works',
        },
        {
          label: 'Paintings',
          value: 'paintings',
        },
        {
          label: 'Photography',
          value: 'photography',
        },
        {
          label: 'Sea Shells',
          value: 'sea-shells',
        },
        {
          label: 'Wooden Works',
          value: 'wooden-works',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Limit',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: ['pages', 'bollywood-posters', 'butterflies', 'dokra-metal-craft', 'fossils', 'masks', 'nekchand-works', 'paintings', 'photography', 'sea-shells', 'wooden-works'],
    },
  ],
  labels: {
    plural: 'Archives',
    singular: 'Archive',
  },
}

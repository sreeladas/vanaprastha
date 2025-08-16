import type { PayloadRequest } from 'payload'

const collectionSlugs = [
  'bollywood-posters',
  'butterflies',
  'dokra-metal-craft',
  'fossils',
  'masks',
  'nekchand-works',
  'paintings',
  'photography',
  'sea-shells',
  'wooden-works',
]

const collectionTitles = {
  'bollywood-posters': 'Bollywood Posters',
  butterflies: 'Butterflies',
  'dokra-metal-craft': 'Dokra Metal Craft',
  fossils: 'Fossils',
  masks: 'Masks',
  'nekchand-works': 'Nek Chand Works',
  paintings: 'Paintings',
  photography: 'Photography',
  'sea-shells': 'Sea Shells',
  'wooden-works': 'Wooden Works',
}

export const ensureCollectionPages = async (req: PayloadRequest): Promise<void> => {
  const { payload } = req

  for (const collectionSlug of collectionSlugs) {
    try {
      // Check if collection entry already exists
      const existingCollection = await payload.find({
        collection: collectionSlug as any,
        limit: 1,
        pagination: false,
      })

      // If no collection entry exists, create the default collection entry
      if (existingCollection.docs.length === 0) {
        await payload.create({
          collection: collectionSlug as any,
          data: {
            title: collectionTitles[collectionSlug as keyof typeof collectionTitles],
            slug: collectionSlug,
            description: `Collection of ${collectionTitles[collectionSlug as keyof typeof collectionTitles].toLowerCase()} as curated by Surjit K. Das at Vanaprastha.`,
            _status: 'published',
          },
        })

        req.payload.logger.info(`Created collection entry for: ${collectionSlug}`)
      }

      // Check if page already exists for this collection
      const existingPage = await payload.find({
        collection: 'pages',
        where: {
          slug: {
            equals: collectionSlug,
          },
        },
        limit: 1,
        pagination: false,
      })

      // If no page exists, create the collection page
      if (existingPage.docs.length === 0) {
        await payload.create({
          collection: 'pages',
          data: {
            title: collectionTitles[collectionSlug as keyof typeof collectionTitles],
            slug: collectionSlug,
            _status: 'published',
            hero: {
              type: 'highImpact',
              richText: {
                root: {
                  type: 'root',
                  children: [
                    {
                      type: 'heading',
                      children: [
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: collectionTitles[collectionSlug as keyof typeof collectionTitles],
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      tag: 'h1',
                      version: 1,
                    },
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: `Explore our ${collectionTitles[collectionSlug as keyof typeof collectionTitles].toLowerCase()} collection.`,
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      textFormat: 0,
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              },
              // media: placeholder image ID will be added when we have one
            },
            layout: [
              {
                blockName: 'Collection Archive',
                blockType: 'archive',
                introContent: {
                  root: {
                    type: 'root',
                    children: [
                      {
                        type: 'heading',
                        children: [
                          {
                            type: 'text',
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: collectionTitles[collectionSlug as keyof typeof collectionTitles],
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        tag: 'h2',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    version: 1,
                  },
                },
                populateBy: 'collection',
                relationTo: collectionSlug,
                categories: [],
              },
            ],
            meta: {
              title: collectionTitles[collectionSlug as keyof typeof collectionTitles],
              description: `Explore our ${collectionTitles[collectionSlug as keyof typeof collectionTitles].toLowerCase()} collection.`,
            },
          },
        })

        req.payload.logger.info(`Created page for collection: ${collectionSlug}`)
      }
    } catch (error) {
      req.payload.logger.error(`Failed to create page for ${collectionSlug}:`, error)
    }
  }
}

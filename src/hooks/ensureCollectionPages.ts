import type { CollectionSlug, PayloadRequest } from 'payload'
import { getCollectionSlugs, getCollectionTitles } from '@/config/collections'

const collectionSlugs = getCollectionSlugs()
const collectionTitles = getCollectionTitles()

export const ensureCollectionPages = async (req: PayloadRequest): Promise<void> => {
  const { payload } = req

  let defaultHeroImageId: number | null = null
  try {
    const existingDefaultImage = await payload.find({
      collection: 'media',
      where: {
        filename: {
          equals: 'default-hero-image.png',
        },
      },
      limit: 1,
    })

    if (existingDefaultImage.docs.length > 0) {
      defaultHeroImageId = existingDefaultImage.docs[0].id
    } else {
      const defaultImage = await payload.create({
        collection: 'media',
        data: {
          filename: 'default-hero-image.png',
          alt: 'Default hero image for collections',
          url: 'https://raw.githubusercontent.com/sreeladas/sreeladas.github.io/main/img/about-bg.png',
          mimeType: 'image/png',
        },
      })
      defaultHeroImageId = defaultImage.id
    }
  } catch (error) {
    req.payload.logger.warn(
      'Failed to create default hero image, proceeding without media in hero',
      error,
    )
  }

  for (const collectionSlug of collectionSlugs) {
    try {
      // Check if collection entry already exists
      const existingCollection = await payload.find({
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        collection: collectionSlug as any,
        limit: 1,
        pagination: false,
      })

      // If no collection entry exists, create the default collection entry
      if (existingCollection.docs.length === 0) {
        await payload.create({
          /* eslint-disable  @typescript-eslint/no-explicit-any */
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
          context: {
            disableRevalidate: true,
          },
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
                          text: `Collection of ${collectionTitles[collectionSlug as keyof typeof collectionTitles].toLowerCase()} at Vanaprastha, curated by Surjit K. Das.`,
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
              media: defaultHeroImageId,
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
                relationTo: collectionSlug as CollectionSlug,
                categories: [],
              },
            ],
            meta: {
              title: collectionTitles[collectionSlug as keyof typeof collectionTitles],
              description: `The collection of ${collectionTitles[collectionSlug as keyof typeof collectionTitles].toLowerCase()} at Vanaprastha, curated by Surjit K. Das.`,
            },
          },
        })

        req.payload.logger.info(`Created page for collection: ${collectionSlug}`)
      }
    } catch (error) {
      req.payload.logger.error(`Failed to create page for ${collectionSlug}:`, error)
      console.error(`Failed to create page for ${collectionSlug}:`, error)
    }
  }
}

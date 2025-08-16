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
  'butterflies': 'Butterflies',
  'dokra-metal-craft': 'Dokra Metal Craft',
  'fossils': 'Fossils',
  'masks': 'Masks',
  'nekchand-works': 'Nek Chand Works',
  'paintings': 'Paintings',
  'photography': 'Photography',
  'sea-shells': 'Sea Shells',
  'wooden-works': 'Wooden Works',
}

export const ensureCollectionPages = async (req: PayloadRequest): Promise<void> => {
  const { payload } = req

  for (const collectionSlug of collectionSlugs) {
    try {
      // Check if collection page already exists
      const existingCollection = await payload.find({
        collection: collectionSlug as any,
        limit: 1,
        pagination: false,
      })

      // If no documents exist, create the default collection entry
      if (existingCollection.docs.length === 0) {
        await payload.create({
          collection: collectionSlug as any,
          data: {
            title: collectionTitles[collectionSlug as keyof typeof collectionTitles],
            slug: collectionSlug,
            description: `Explore our ${collectionTitles[collectionSlug as keyof typeof collectionTitles].toLowerCase()} collection.`,
            _status: 'published',
          },
        })
        
        req.payload.logger.info(`Created collection entry for: ${collectionSlug}`)
      }
    } catch (error) {
      req.payload.logger.error(`Failed to create collection entry for ${collectionSlug}:`, error)
    }
  }
}
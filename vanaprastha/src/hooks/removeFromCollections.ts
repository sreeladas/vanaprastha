import type { CollectionAfterDeleteHook } from 'payload'

export const removeFromCollections: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  const { payload } = req

  // Get all collection slugs to clean up
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

  try {
    // Remove this image from all collections
    for (const collectionSlug of collectionSlugs) {
      const collectionEntries = await payload.find({
        collection: collectionSlug,
        limit: 1,
        pagination: false,
      })

      if (collectionEntries.docs.length > 0) {
        const collectionEntry = collectionEntries.docs[0]
        const existingGallery = collectionEntry.galleryImages || []

        // Filter out this image from the gallery
        const updatedGallery = existingGallery.filter((item: any) => 
          item.image !== doc.id && item.image?.id !== doc.id
        )

        // Update the collection if the gallery changed
        if (updatedGallery.length !== existingGallery.length) {
          await payload.update({
            collection: collectionSlug,
            id: collectionEntry.id,
            data: {
              galleryImages: updatedGallery,
            },
          })

          req.payload.logger.info(`Removed deleted image ${doc.filename} from ${collectionSlug} collection`)
        }
      }
    }
  } catch (error) {
    req.payload.logger.error('Error removing deleted image from collections:', error)
  }

  return doc
}
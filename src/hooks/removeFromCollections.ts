import type { CollectionAfterDeleteHook, CollectionSlug } from 'payload'
import { getCollectionSlugs } from '@/config/collections'

export const removeFromCollections: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const { payload } = req

  // Prevent infinite loops - skip if this update was triggered by a hook
  if (req.context?.skipHooks || req.context?.fromHook) {
    return doc
  }

  // Get all collection slugs to clean up
  const collectionSlugs = getCollectionSlugs()

  try {
    // Remove this image from all collections
    for (const collectionSlug of collectionSlugs) {
      const collectionEntries = await payload.find({
        collection: collectionSlug as CollectionSlug,
        limit: 1,
        pagination: false,
      })

      if (collectionEntries.docs.length > 0) {
        const collectionEntry = collectionEntries.docs[0]
        const existingGallery = collectionEntry.galleryImages || []

        // Filter out this image from the gallery
        const updatedGallery = existingGallery.filter(
          /* eslint-disable  @typescript-eslint/no-explicit-any */
          (item: any) => item.image !== doc.id && item.image?.id !== doc.id,
        )

        // Update the collection if the gallery changed
        if (updatedGallery.length !== existingGallery.length) {
          await payload.update({
            collection: collectionSlug as CollectionSlug,
            id: collectionEntry.id,
            data: {
              galleryImages: updatedGallery,
            },
            context: {
              ...req.context,
              fromHook: true,
            },
          })

          req.payload.logger.info(
            `Removed deleted image ${doc.filename} from ${collectionSlug} collection`,
          )
        }
      }
    }
  } catch (error) {
    req.payload.logger.error('Error removing deleted image from collections:', error)
  }

  return doc
}

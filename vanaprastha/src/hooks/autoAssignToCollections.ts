import type { CollectionAfterChangeHook } from 'payload'

export const autoAssignToCollections: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Only process on create and update operations
  if (operation !== 'create' && operation !== 'update') {
    return doc
  }

  // Only process if the document has collections tags
  if (!doc.collections || !Array.isArray(doc.collections) || doc.collections.length === 0) {
    return doc
  }

  const { payload } = req

  try {
    // For each collection this media is tagged with
    for (const collectionSlug of doc.collections) {
      // Find the collection entry
      const collectionEntries = await payload.find({
        collection: collectionSlug,
        limit: 1,
        pagination: false,
      })

      if (collectionEntries.docs.length > 0) {
        const collectionEntry = collectionEntries.docs[0]
        const existingGallery = collectionEntry.galleryImages || []

        // Check if this image is already in the gallery
        const imageExists = existingGallery.some((item: any) => 
          item.image === doc.id || item.image?.id === doc.id
        )

        if (!imageExists) {
          // Add the new image to the gallery
          const newGalleryItem = {
            image: doc.id,
            caption: doc.alt || doc.filename || '',
            description: doc.caption ? 
              (typeof doc.caption === 'string' ? doc.caption : 
               doc.caption?.root?.children?.[0]?.children?.[0]?.text || '') : '',
          }

          const updatedGallery = [...existingGallery, newGalleryItem]

          // Update the collection with the new gallery
          await payload.update({
            collection: collectionSlug,
            id: collectionEntry.id,
            data: {
              galleryImages: updatedGallery,
            },
          })

          req.payload.logger.info(`Added image ${doc.filename} to ${collectionSlug} collection`)
        }
      }
    }
  } catch (error) {
    req.payload.logger.error('Error auto-assigning image to collections:', error)
  }

  return doc
}
import type { CollectionAfterChangeHook } from 'payload'

export const autoAssignToCollections: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  // Only process on create and update operations
  if (operation !== 'create' && operation !== 'update') {
    return doc
  }

  const currentCollections = doc.collections || []
  const previousCollections = previousDoc?.collections || []

  const { payload } = req

  try {
    // Handle additions - collections that are now tagged but weren't before
    const addedCollections = currentCollections.filter(
      (slug: string) => !previousCollections.includes(slug),
    )

    // Handle removals - collections that were tagged but aren't anymore
    const removedCollections = previousCollections.filter(
      (slug: string) => !currentCollections.includes(slug),
    )

    // Handle updates - collections that are still tagged but may have field changes
    const unchangedCollections = currentCollections.filter((slug: string) =>
      previousCollections.includes(slug),
    )

    // Helper function to extract caption text from rich text
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const extractCaptionText = (caption: any): string => {
      if (!caption) return ''
      if (typeof caption === 'string') return caption
      if (caption?.root?.children) {
        // Extract text from rich text structure
        const extractText = (children: any[]): string => {
          return children
            .map((child: any) => {
              if (child.type === 'text') return child.text || ''
              if (child.children) return extractText(child.children)
              return ''
            })
            .join('')
        }
        return extractText(caption.root.children)
      }
      return ''
    }

    // Add image to newly tagged collections
    for (const collectionSlug of addedCollections) {
      const collectionEntries = await payload.find({
        collection: collectionSlug,
        limit: 1,
        pagination: false,
      })

      if (collectionEntries.docs.length > 0) {
        const collectionEntry = collectionEntries.docs[0]
        const existingGallery = collectionEntry.galleryImages || []

        // Check if this image is already in the gallery
        const imageExists = existingGallery.some(
          (item: any) => item.image === doc.id || item.image?.id === doc.id,
        )

        if (!imageExists) {
          // Add the new image to the gallery
          // Field mapping: media.alt -> collection.caption, media.caption -> collection.description
          const newGalleryItem = {
            image: doc.id,
            caption: doc.alt || doc.filename || '',
            description: extractCaptionText(doc.caption),
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

    // Update existing gallery items when media fields change
    for (const collectionSlug of unchangedCollections) {
      const collectionEntries = await payload.find({
        collection: collectionSlug,
        limit: 1,
        pagination: false,
      })

      if (collectionEntries.docs.length > 0) {
        const collectionEntry = collectionEntries.docs[0]
        const existingGallery = collectionEntry.galleryImages || []

        // Find the gallery item for this image and update it
        const updatedGallery = existingGallery.map((item: any) => {
          if (item.image === doc.id || item.image?.id === doc.id) {
            return {
              ...item,
              caption: doc.alt || doc.filename || '',
              description: extractCaptionText(doc.caption),
            }
          }
          return item
        })

        // Only update if something changed
        const hasChanges = JSON.stringify(existingGallery) !== JSON.stringify(updatedGallery)
        if (hasChanges) {
          await payload.update({
            collection: collectionSlug,
            id: collectionEntry.id,
            data: {
              galleryImages: updatedGallery,
            },
          })

          req.payload.logger.info(`Updated image ${doc.filename} in ${collectionSlug} collection`)
        }
      }
    }

    // Remove image from untagged collections
    for (const collectionSlug of removedCollections) {
      const collectionEntries = await payload.find({
        collection: collectionSlug,
        limit: 1,
        pagination: false,
      })

      if (collectionEntries.docs.length > 0) {
        const collectionEntry = collectionEntries.docs[0]
        const existingGallery = collectionEntry.galleryImages || []

        // Filter out this image from the gallery
        const updatedGallery = existingGallery.filter(
          (item: any) => item.image !== doc.id && item.image?.id !== doc.id,
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

          req.payload.logger.info(`Removed image ${doc.filename} from ${collectionSlug} collection`)
        }
      }
    }
  } catch (error) {
    req.payload.logger.error('Error auto-assigning image to collections:', error)
  }

  return doc
}

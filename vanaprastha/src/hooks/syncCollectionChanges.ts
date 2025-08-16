import type { CollectionAfterChangeHook } from 'payload'

export const syncCollectionChanges: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  // Only process on update operations
  if (operation !== 'update') {
    return doc
  }

  const { payload } = req

  try {
    const currentGallery = doc.galleryImages || []
    const previousGallery = previousDoc?.galleryImages || []

    // Find images that were removed from the gallery
    const removedImages = previousGallery.filter((prevItem: any) => 
      !currentGallery.some((currItem: any) => 
        (currItem.image === prevItem.image) || 
        (currItem.image?.id === prevItem.image?.id) ||
        (currItem.image?.id === prevItem.image) ||
        (currItem.image === prevItem.image?.id)
      )
    )

    // Find images that had their caption/description updated
    const updatedImages = currentGallery.filter((currItem: any) => {
      const prevItem = previousGallery.find((prev: any) => 
        (prev.image === currItem.image) || 
        (prev.image?.id === currItem.image?.id) ||
        (prev.image?.id === currItem.image) ||
        (prev.image === currItem.image?.id)
      )
      
      if (!prevItem) return false
      
      return prevItem.caption !== currItem.caption || 
             prevItem.description !== currItem.description
    })

    // Remove collection tags from media that were removed from gallery
    for (const removedItem of removedImages) {
      const imageId = typeof removedItem.image === 'string' ? removedItem.image : removedItem.image?.id
      
      if (imageId) {
        try {
          const mediaDoc = await payload.findByID({
            collection: 'media',
            id: imageId,
          })

          if (mediaDoc && mediaDoc.collections) {
            const updatedCollections = mediaDoc.collections.filter(
              (slug: string) => slug !== doc.slug
            )

            await payload.update({
              collection: 'media',
              id: imageId,
              data: {
                collections: updatedCollections,
              },
            })

            req.payload.logger.info(`Removed ${doc.slug} tag from media ${imageId}`)
          }
        } catch (error) {
          req.payload.logger.error(`Failed to update media ${imageId}:`, error)
        }
      }
    }

    // Update media fields when gallery captions/descriptions change
    for (const updatedItem of updatedImages) {
      const imageId = typeof updatedItem.image === 'string' ? updatedItem.image : updatedItem.image?.id
      
      if (imageId) {
        try {
          const mediaDoc = await payload.findByID({
            collection: 'media',
            id: imageId,
          })

          if (mediaDoc) {
            // Field mapping: collection.caption -> media.alt, collection.description -> media.caption
            const updateData: any = {}
            
            // Update alt text if caption changed
            if (updatedItem.caption && updatedItem.caption !== mediaDoc.alt) {
              updateData.alt = updatedItem.caption
            }

            // Update caption if description changed
            if (updatedItem.description !== undefined) {
              // Convert plain text to rich text format if needed
              const richTextCaption = {
                root: {
                  type: 'root',
                  children: updatedItem.description ? [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          text: updatedItem.description,
                          version: 1,
                        },
                      ],
                      version: 1,
                    },
                  ] : [],
                  version: 1,
                },
              }
              updateData.caption = richTextCaption
            }

            if (Object.keys(updateData).length > 0) {
              await payload.update({
                collection: 'media',
                id: imageId,
                data: updateData,
              })

              req.payload.logger.info(`Updated media ${imageId} from collection ${doc.slug} changes`)
            }
          }
        } catch (error) {
          req.payload.logger.error(`Failed to sync media ${imageId}:`, error)
        }
      }
    }
  } catch (error) {
    req.payload.logger.error('Error syncing collection changes:', error)
  }

  return doc
}
import type { CollectionAfterChangeHook } from 'payload'

export const processBulkUpload: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  // Only process if there are bulk uploaded images
  if (!doc.bulkUpload || !Array.isArray(doc.bulkUpload) || doc.bulkUpload.length === 0) {
    return doc
  }

  const { payload } = req

  try {
    const existingGallery = doc.galleryImages || []
    const bulkImages = doc.bulkUpload
    
    // Convert bulk uploaded images to gallery items
    const newGalleryItems = []
    
    for (const imageRef of bulkImages) {
      const imageId = typeof imageRef === 'string' ? imageRef : imageRef?.id
      
      if (imageId) {
        // Check if this image is already in the gallery
        const alreadyExists = existingGallery.some((item: any) => 
          (item.image === imageId) || (item.image?.id === imageId)
        )
        
        if (!alreadyExists) {
          // Get image details for better default caption
          try {
            const mediaDoc = await payload.findByID({
              collection: 'media',
              id: imageId,
            })
            
            newGalleryItems.push({
              image: imageId,
              caption: mediaDoc.alt || mediaDoc.filename || '',
              description: '',
            })
            
            // Also tag the media with this collection
            const currentCollections = mediaDoc.collections || []
            if (!currentCollections.includes(doc.slug)) {
              await payload.update({
                collection: 'media',
                id: imageId,
                data: {
                  collections: [...currentCollections, doc.slug],
                },
              })
            }
          } catch (error) {
            // If we can't get media details, still add to gallery
            newGalleryItems.push({
              image: imageId,
              caption: '',
              description: '',
            })
          }
        }
      }
    }
    
    // Update the document with new gallery items and clear bulk upload
    if (newGalleryItems.length > 0) {
      const updatedGallery = [...existingGallery, ...newGalleryItems]
      
      await payload.update({
        collection: doc.collection,
        id: doc.id,
        data: {
          galleryImages: updatedGallery,
          bulkUpload: [], // Clear bulk upload after processing
        },
      })
      
      req.payload.logger.info(`Processed ${newGalleryItems.length} bulk uploaded images for ${doc.slug}`)
    }
    
  } catch (error) {
    req.payload.logger.error('Error processing bulk upload:', error)
  }

  return doc
}
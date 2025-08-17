import { cn } from '@/utilities/ui'
import React from 'react'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

export type CollectionGalleryProps = {
  collection: {
    galleryImages?: Array<{
      image: string | MediaType
      caption?: string
      description?: string
      id?: string
    }>
  }
}

export const CollectionGalleryArchive: React.FC<CollectionGalleryProps> = (props) => {
  const { collection } = props
  const { galleryImages } = collection

  if (!galleryImages || galleryImages.length === 0) {
    return (
      <div className={cn('container')}>
        <div className="text-center py-12">
          <p className="text-gray-500">No items in this collection yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {galleryImages.map((item, index) => {
            return (
              <div key={index} className="group">
                <article className="border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer h-full transition-all duration-200 hover:shadow-lg">
                  <div className="relative w-full overflow-hidden">
                    <Media
                      resource={item.image}
                      className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                  {(item.caption || item.description) && (
                    <div className="p-4">
                      {item.caption && (
                        <h3 className="font-medium text-base mb-2 line-clamp-2">{item.caption}</h3>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                      )}
                    </div>
                  )}
                </article>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

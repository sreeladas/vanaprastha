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
          <p className="text-gray-500">No images in this collection yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {galleryImages.map((item, index) => {
            return (
              <div key={index} className="group">
                <article className="border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer h-full transition-all duration-200 hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden">
                    <Media
                      resource={item.image}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      fill
                    />
                  </div>
                  {(item.caption || item.description) && (
                    <div className="p-3">
                      {item.caption && (
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.caption}</h3>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600 line-clamp-3">{item.description}</p>
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
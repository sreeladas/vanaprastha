'use client'

import React, { useState } from 'react'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

interface GalleryImage {
  image: string | MediaType
  title?: string
  description?: string
  id?: string
}

interface CollectionCarouselProps {
  images: GalleryImage[]
  collectionTitle: string
}

export const CollectionCarousel: React.FC<CollectionCarouselProps> = ({
  images,
  collectionTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const openModal = (image: GalleryImage) => {
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No images available in this collection.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Main Carousel */}
      <div className="relative mb-8">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3] max-h-[600px]">
          <div
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((item, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 cursor-pointer h-full"
                onClick={() => openModal(item)}
              >
                <Media
                  resource={item.image}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Info */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded">
          {images[currentIndex]?.title && (
            <h3 className="font-semibold text-lg">{images[currentIndex].title}</h3>
          )}
          {images[currentIndex]?.description && (
            <p className="text-sm mt-1 opacity-90">{images[currentIndex].description}</p>
          )}
          <p className="text-xs mt-2 opacity-75">
            {currentIndex + 1} of {images.length}
          </p>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((item, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex
                  ? 'border-blue-500'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Media
                resource={item.image}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Media
              resource={selectedImage.image}
              className="max-w-full max-h-full object-contain"
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded">
                {selectedImage.title && (
                  <h3 className="font-semibold text-lg">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-sm mt-1">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
import { useState } from 'react';
import Lightbox from './Lightbox';

export interface GalleryItem {
  filename?: string;
  url?: string;
  title?: string;
  caption?: string;
}

interface GalleryProps {
  items: GalleryItem[];
  collectionSlug: string;
  imageBaseUrl: string;
}

export function resolveImageSrc(item: GalleryItem, collectionSlug: string, imageBaseUrl: string): string {
  if (item.url) return item.url;
  return `${imageBaseUrl}/collections/${collectionSlug}/${item.filename}`;
}

export default function Gallery({ items, collectionSlug, imageBaseUrl }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = items.map((item) => ({
    src: resolveImageSrc(item, collectionSlug, imageBaseUrl),
    title: item.title,
    caption: item.caption,
  }));

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground font-sans">
        <p>Images coming soon</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <button
            key={item.filename || item.url || i}
            onClick={() => setLightboxIndex(i)}
            className="group aspect-square bg-warmgray-100 rounded overflow-hidden cursor-pointer border-0 p-0"
          >
            <img
              src={images[i].src}
              alt={item.title || item.filename || ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}

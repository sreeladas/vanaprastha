import { useCallback, useEffect } from 'react';

interface LightboxProps {
  images: { src: string; title?: string; caption?: string }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  const image = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1);
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center" onClick={onClose}>
      <div className="relative aspect-[2/3] max-h-[85vh] max-w-[90vw] bg-white rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-warmgray-800 text-white hover:bg-warmgray-700 text-2xl font-sans cursor-pointer transition-colors shadow-lg"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            <img
              src={image.src}
              alt={image.title || ''}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          </div>

          <div className="shrink-0 mt-4 pt-3 border-t border-warmgray-100 flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              {image.title && <p className="text-foreground font-serif text-xl md:text-2xl">{image.title}</p>}
              {image.caption && <p className="text-muted-foreground font-sans text-lg md:text-xl mt-1">{image.caption}</p>}
            </div>
            <p className="text-muted-foreground font-sans text-lg font-medium shrink-0">
              {currentIndex + 1} of {images.length}
            </p>
          </div>

          {hasPrev && (
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute -left-5 md:-left-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-warmgray-800 text-white hover:bg-warmgray-700 text-3xl md:text-4xl cursor-pointer transition-colors shadow-lg"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}
          {hasNext && (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute -right-5 md:-right-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-warmgray-800 text-white hover:bg-warmgray-700 text-3xl md:text-4xl cursor-pointer transition-colors shadow-lg"
              aria-label="Next image"
            >
              ›
            </button>
          )}
      </div>
    </div>
  );
}

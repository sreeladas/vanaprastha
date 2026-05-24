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
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-5xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white text-3xl font-sans cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <img
          src={image.src}
          alt={image.title || ''}
          className="max-h-[80vh] w-auto mx-auto object-contain"
        />

        {(image.title || image.caption) && (
          <div className="text-center mt-4 px-4">
            {image.title && <p className="text-white font-serif text-lg">{image.title}</p>}
            {image.caption && <p className="text-white/70 font-sans text-sm mt-1">{image.caption}</p>}
          </div>
        )}

        {hasPrev && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl font-sans cursor-pointer px-2"
            aria-label="Previous"
          >
            ‹
          </button>
        )}
        {hasNext && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl font-sans cursor-pointer px-2"
            aria-label="Next"
          >
            ›
          </button>
        )}

        <div className="text-center mt-2 text-white/50 font-sans text-xs">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

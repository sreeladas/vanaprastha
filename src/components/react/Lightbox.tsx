import { useCallback, useEffect, useRef, useState } from 'react';

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

  const panelRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expanded) setExpanded(false);
        else onClose();
        return;
      }
      // Trap focus within the dialog while it is open.
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>('button:not([disabled])'),
        ).filter((el) => el.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1);
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext, expanded],
  );

  // Open: lock scroll, capture the triggering element, move focus into the dialog,
  // and restore focus to the trigger (the gallery tile) on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
    // Capture/restore should run once for the lifetime of the dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset expand state and re-measure overflow whenever the image changes.
  useEffect(() => {
    setExpanded(false);
    const el = captionRef.current;
    setIsOverflowing(el ? el.scrollHeight > el.clientHeight + 1 : false);
  }, [currentIndex, image.caption, image.title]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={image.title ? `${image.title} - image viewer` : 'Image viewer'}
        tabIndex={-1}
        className="relative aspect-[2/3] max-h-[85vh] max-w-[90vw] bg-card rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col outline-none"
        onClick={(e) => e.stopPropagation()}
      >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-warmgray-800 text-white hover:bg-warmgray-700 text-2xl font-sans cursor-pointer transition-colors shadow-lg"
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
            <div className="flex-1 min-w-0 text-center">
              {image.title && <p className="text-foreground font-serif text-xl md:text-2xl line-clamp-2">{image.title}</p>}
              {image.caption && (
                <p ref={captionRef} className="text-muted-foreground font-sans text-lg md:text-xl mt-1 line-clamp-2">
                  {image.caption}
                </p>
              )}
              {isOverflowing && (
                <button
                  onClick={() => setExpanded(true)}
                  className="mt-1 inline-flex items-center justify-center min-h-11 px-3 text-foreground font-sans text-base underline cursor-pointer hover:text-muted-foreground transition-colors"
                >
                  More
                </button>
              )}
            </div>
            <p className="text-muted-foreground font-sans text-lg font-medium shrink-0">
              {currentIndex + 1} of {images.length}
            </p>
          </div>

          {expanded && (
            <div
              className="absolute inset-0 z-20 bg-card rounded-2xl p-6 md:p-8 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 min-h-0 overflow-y-auto">
                {image.title && <p className="text-foreground font-serif text-2xl md:text-3xl">{image.title}</p>}
                {image.caption && (
                  <p className="text-muted-foreground font-sans text-lg md:text-xl mt-3 leading-relaxed">{image.caption}</p>
                )}
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="shrink-0 mt-4 self-center inline-flex items-center justify-center min-h-11 px-4 text-foreground font-sans text-base md:text-lg underline cursor-pointer hover:text-muted-foreground transition-colors"
              >
                Show less
              </button>
            </div>
          )}

          {hasPrev && (
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-10 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-warmgray-800 text-white hover:bg-warmgray-700 text-3xl md:text-4xl cursor-pointer transition-colors shadow-lg"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}
          {hasNext && (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-10 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-warmgray-800 text-white hover:bg-warmgray-700 text-3xl md:text-4xl cursor-pointer transition-colors shadow-lg"
              aria-label="Next image"
            >
              ›
            </button>
          )}
      </div>
    </div>
  );
}

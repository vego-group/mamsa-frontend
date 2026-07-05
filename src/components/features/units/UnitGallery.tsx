'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Grid3x3, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface UnitGalleryProps {
  images: string[];
  title: string;
}

export function UnitGallery({ images, title }: UnitGalleryProps) {
  const t = useTranslations('gallery');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const count = images.length;

  const open = (i: number) => setLightbox(i);
  const close = useCallback(() => setLightbox(null), []);
  const go = useCallback(
    (dir: 1 | -1) => setLightbox((cur) => (cur === null ? cur : (cur + dir + count) % count)),
    [count],
  );

  // Keyboard nav + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(1); // RTL: left = next
      else if (e.key === 'ArrowRight') go(-1); // RTL: right = previous
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, close, go]);

  if (count === 0) {
    return <div className="mb-8 h-[420px] w-full rounded-2xl bg-brand-cream" />;
  }

  const main = images[0];
  const thumbs = images.slice(1, 5);

  return (
    <>
      {/* Collage */}
      <div className="relative mb-8">
        {/* mobile: single hero */}
        <button
          onClick={() => open(0)}
          className="group relative block h-[280px] w-full overflow-hidden rounded-2xl md:hidden"
        >
          <img src={main} alt={title} className="h-full w-full object-cover transition group-hover:scale-105" />
          <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            1 / {count}
          </span>
        </button>

        {/* desktop: 1 large + 4 thumbnails */}
        <div className="hidden h-[440px] grid-cols-4 grid-rows-2 gap-2 md:grid">
          <button
            onClick={() => open(0)}
            className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl"
          >
            <img src={main} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </button>
          {thumbs.map((img, i) => (
            <button
              key={i}
              onClick={() => open(i + 1)}
              className="group relative overflow-hidden rounded-xl"
            >
              <img src={img} alt={`${title} ${i + 2}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
            </button>
          ))}
        </div>

        {/* show-all button */}
        {count > 1 && (
          <button
            onClick={() => open(0)}
            className="absolute bottom-4 left-4 hidden items-center gap-2 rounded-full border border-brand-border bg-white/95 px-4 py-2 text-sm font-medium text-brand-ink shadow-sm backdrop-blur transition hover:bg-white md:inline-flex"
          >
            <Grid3x3 className="h-4 w-4" />
            {t('showAll', { count })}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-black/95" dir="rtl">
          {/* top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-medium tabular-nums">{lightbox + 1} / {count}</span>
            <button
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15"
              aria-label={t('close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* main stage */}
          <div className="relative flex flex-1 items-center justify-center px-4" onClick={close}>
            {count > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                className="absolute right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                aria-label={t('prev')}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            <img
              src={images[lightbox]}
              alt={`${title} ${lightbox + 1}`}
              className="max-h-[78vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {count > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); go(1); }}
                className="absolute left-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                aria-label={t('next')}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* thumbnail strip */}
          {count > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(i)}
                  className={cn(
                    'h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition',
                    i === lightbox ? 'ring-white' : 'ring-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

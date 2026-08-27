'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Grid3x3, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import type { UnitImage } from '@/types';

interface UnitGalleryProps {
  images: UnitImage[];
  title: string;
}

/** Below this the drag reads as a tap, not a swipe. */
const SWIPE_THRESHOLD = 48;

/** Dots past this many stop being readable, and stop being drawn. */
const MAX_DOTS = 8;

export function UnitGallery({ images, title }: UnitGalleryProps) {
  const t = useTranslations('gallery');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const count = images.length;

  // Which photo the mobile strip has settled on — drives the counter, the dots,
  // and which photo the lightbox opens on.
  const stripRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

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

  /**
   * The strip is a native scroll-snap carousel, so the slide it has settled on
   * is just how far it has scrolled. `scrollLeft` runs negative in RTL, which
   * is why it is read through `Math.abs`.
   */
  const onStripScroll = () => {
    const el = stripRef.current;
    if (!el || el.clientWidth === 0) return;
    setSlide(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  /**
   * A horizontal drag on the lightbox moves between photos, matching the arrow
   * buttons — which are laid out for reading right-to-left, so dragging towards
   * the left pulls the next photo in.
   */
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.changedTouches[0]!.clientX;
    swiped.current = false;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const from = touchX.current;
    touchX.current = null;
    if (from === null || count < 2) return;
    const dx = e.changedTouches[0]!.clientX - from;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    // Flag the gesture so the stage's tap-to-close does not fire on top of it.
    swiped.current = true;
    go(dx < 0 ? 1 : -1);
  };

  const main = images[0];
  if (!main) {
    return <div className="mb-8 h-[420px] w-full rounded-2xl bg-brand-cream" />;
  }

  const thumbs = images.slice(1, 5);
  const current = lightbox === null ? null : images[lightbox];

  return (
    <>
      {/* Collage */}
      <div className="relative mb-8">
        {/* mobile: every photo, swipeable. A single static hero used to be the
            whole gallery on a phone — the listing's own product, sitting behind
            a tap that nothing on screen suggested. */}
        <div className="md:hidden">
          <div
            ref={stripRef}
            onScroll={onStripScroll}
            className="flex h-[280px] snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => open(i)}
                className="relative h-full w-full shrink-0 snap-center"
                aria-label={t('photoOf', { index: i + 1, count })}
              >
                <img
                  src={img.card}
                  alt={i === 0 ? title : ''}
                  // Only the photo actually on screen at load is worth a round trip.
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          {count > 1 && (
            <>
              <span
                dir="ltr"
                className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium tabular-nums text-white"
              >
                {slide + 1} / {count}
              </span>
              {/* Capped, so a thirty-photo listing does not draw thirty dots. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {images.slice(0, MAX_DOTS).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full bg-white transition-all',
                      i === Math.min(slide, MAX_DOTS - 1) ? 'w-4 opacity-100' : 'w-1.5 opacity-50',
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* desktop: 1 large + 4 thumbnails */}
        <div className="hidden h-[440px] grid-cols-4 grid-rows-2 gap-2 md:grid">
          <button
            onClick={() => open(0)}
            className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl"
          >
            <img src={main.card} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </button>
          {thumbs.map((img, i) => (
            <button
              key={i}
              onClick={() => open(i + 1)}
              className="group relative overflow-hidden rounded-xl"
            >
              <img
                src={img.card}
                alt={`${title} ${i + 2}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
            </button>
          ))}
        </div>

        {/* show-all button — on a phone too, where the strip on its own gives no
            way to reach a photo without swiping past every one before it */}
        {count > 1 && (
          <button
            onClick={() => open(slide)}
            className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-brand-border bg-white/95 px-3 py-1.5 text-xs font-medium text-brand-ink shadow-sm backdrop-blur transition hover:bg-white md:bottom-4 md:left-4 md:px-4 md:py-2 md:text-sm"
          >
            <Grid3x3 className="h-4 w-4" />
            {t('showAll', { count })}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && current && (
        <div className="fixed inset-0 z-[80] flex h-[100dvh] flex-col bg-black/95" dir="rtl">
          {/* top bar */}
          <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white">
            <span dir="ltr" className="text-sm font-medium tabular-nums">
              {lightbox + 1} / {count}
            </span>
            <button
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15"
              aria-label={t('close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* main stage — swipe on touch, arrows on anything with a pointer */}
          <div
            className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center overflow-hidden px-4 py-2"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onClick={() => {
              if (!swiped.current) close();
            }}
          >
            {count > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                className="absolute right-3 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:inline-flex"
                aria-label={t('prev')}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            <img
              src={current.full}
              alt={`${title} ${lightbox + 1}`}
              width={current.width ?? undefined}
              height={current.height ?? undefined}
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {count > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); go(1); }}
                className="absolute left-3 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:inline-flex"
                aria-label={t('next')}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* thumbnail strip */}
          {count > 1 && (
            <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(i)}
                  className={cn(
                    'h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition',
                    i === lightbox ? 'ring-white' : 'ring-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <img src={img.thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

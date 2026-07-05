'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Testimonial as ApiTestimonial } from '@/lib/api/adapters';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initial: string;
  meta: string;
}

const AUTOPLAY_MS = 6000;
const FALLBACK_COUNT = 3;

function fromApi(items: ApiTestimonial[]): Testimonial[] {
  return items.map((t) => ({
    quote: t.quote,
    name: t.name,
    role: t.role,
    initial: t.name.trim().charAt(0) || '—',
    meta: t.deal,
  }));
}

export function TestimonialCarousel({ items }: { items?: ApiTestimonial[] }) {
  const tr = useTranslations('testimonials');
  // Fallback quotes live in the message files so both locales have real copy.
  const fallback: Testimonial[] = Array.from({ length: FALLBACK_COUNT }, (_, i) => ({
    quote: tr(`fallback.${i}.quote`),
    name: tr(`fallback.${i}.name`),
    role: tr(`fallback.${i}.role`),
    initial: tr(`fallback.${i}.name`).trim().charAt(0) || '—',
    meta: tr(`fallback.${i}.meta`),
  }));

  const TESTIMONIALS = items && items.length > 0 ? fromApi(items) : fallback;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;

  const go = (i: number) => setActive((i + count) % count);
  const next = () => go(active + 1);
  const prev = () => go(active - 1);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  const t = TESTIMONIALS[active] ?? TESTIMONIALS[0]!;

  return (
    <div
      className="rounded-2xl bg-white/[0.06] p-8 ring-1 ring-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="text-4xl leading-none text-white/20">”</div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            aria-label={tr('prev')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label={tr('next')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="mb-8 min-h-[140px] leading-loose text-white/90">{t.quote}</p>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{t.name}</div>
          <div className="text-sm text-white/70">{t.role}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 font-bold">
          {t.initial}
        </div>
      </div>

      <div className="mt-5 flex gap-1 text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-sm text-white/70">
        <ShieldCheck className="h-4 w-4 text-brand-sage" />
        <span>{t.meta}</span>
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={tr('goTo', { num: i + 1 })}
            className={
              i === active
                ? 'h-1.5 w-6 rounded-full bg-brand-sage transition-all'
                : 'h-1.5 w-1.5 rounded-full bg-white/30 transition-all hover:bg-white/50'
            }
          />
        ))}
      </div>
    </div>
  );
}

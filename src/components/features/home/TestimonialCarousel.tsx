'use client';

import { useEffect, useState } from 'react';
import { Star, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Testimonial as ApiTestimonial } from '@/lib/api/adapters';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initial: string;
  meta: string;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'وجد الفريق بتفاوض أحلامنا في أقل من ثلاثة أسابيع. مستوى السرية والاحترافية والاهتمام بالتفاصيل كان استثنائيًا لم نشهده في عشرين عامًا من تجارب الاستثمار العقاري.',
    name: 'محمد بن سلطان الحمدان',
    role: 'رئيس مجلس إدارة مجموعة الحمدان',
    initial: 'م',
    meta: 'بتفاوض سكني حي مارينا · عملية محققة',
  },
  {
    quote:
      'تجربة حجز سلسة وموثوقة من البداية للنهاية. وجدت العقار المثالي لعائلتي بسهولة، والدعم كان سريعًا ومتعاونًا. أنصح بمنصة مَمسَى بقوة لكل من يبحث عن إقامة مميزة.',
    name: 'أحمد بن سلطان السهلي',
    role: 'عميل دائم',
    initial: 'أ',
    meta: 'حجز فيلا بإطلالة بحرية · إقامة مكتملة',
  },
  {
    quote:
      'الشفافية في الأسعار والتقييمات الحقيقية للنزلاء أعطتني ثقة كاملة في كل خطوة. منصة احترافية تستحق التجربة، وخدمة عملاء على أعلى مستوى.',
    name: 'نورة العتيبي',
    role: 'مستثمرة عقارية',
    initial: 'ن',
    meta: 'استثمار منتجع سياحي · صفقة موثّقة',
  },
];

const AUTOPLAY_MS = 6000;

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
  const TESTIMONIALS = items && items.length > 0 ? fromApi(items) : FALLBACK_TESTIMONIALS;
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
            aria-label="السابق"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="التالي"
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
            aria-label={`الرأي ${i + 1}`}
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

import Link from 'next/link';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Award, MapPin, Star, ShieldCheck, Search, Compass, CalendarCheck } from 'lucide-react';
import { FilterBar } from '@/components/features/units/FilterBar';
import { UnitCard } from '@/components/features/units/UnitCard';
import { TestimonialCarousel } from '@/components/features/home/TestimonialCarousel';
import { PicksSection } from '@/components/features/home/PicksSection';
import { LocationExplorer } from '@/components/features/home/LocationExplorer';
import { contentApi, type UnitCategory, type BudgetRange } from '@/lib/api/client';
import type { Unit } from '@/types';

/** Best-effort fetch — never let a backend hiccup break the homepage render. */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

/** Curated images per unit type (the API provides labels/counts, not images). */
const CATEGORY_IMAGES: Record<string, string> = {
  apartment: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80',
  studio: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
  villa: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
};
const FALLBACK_IMG = CATEGORY_IMAGES.apartment!;

const CATEGORY_TYPES = ['apartment', 'studio', 'villa'] as const;

const BUDGET_FALLBACK = [
  { min: 2000, max: 3000 },
  { min: 1000, max: 2000 },
  { min: 500, max: 1000 },
  { min: 0, max: 500 },
];

// ⚠️ TEMPORARY (pre-launch): hides "الأكثر طلبًا" + "حسب الميزانية" +
// "تعليقات النزلاء" until go-live. Flip to true to bring them all back.
const SHOW_PRELAUNCH_HIDDEN_SECTIONS = false;

const HOW_IT_WORKS_ICONS = [
  <Search key="s" className="h-5 w-5" />,
  <Compass key="c" className="h-5 w-5" />,
  <CalendarCheck key="b" className="h-5 w-5" />,
];

export default async function HomePage() {
  const t = await getTranslations('home');
  const tPlural = await getTranslations('typesPlural');
  const tCommon = await getTranslations('common');

  const [popular, testimonials, categories, budgets] = await Promise.all([
    safe(contentApi.popular(), [] as Unit[]),
    safe(contentApi.testimonials(), []),
    safe(contentApi.categories(), [] as UnitCategory[]),
    safe(contentApi.budgets(), [] as BudgetRange[]),
  ]);

  const featured = popular;

  // Always show the 3 supported types in a fixed order; overlay the real
  // counts + images from the API (falling back to local art if either is missing).
  const categoryCards = CATEGORY_TYPES.map((type) => {
    const match = categories.find((c) => c.key === type);
    return { type, count: match?.count ?? 0, image: match?.imageUrl || CATEGORY_IMAGES[type]! };
  });

  // Budget cards: labels are built from the numeric range (locale-safe) —
  // never from the backend's pre-rendered Arabic label.
  const budgetCards = (budgets.length > 0
    ? budgets.map((b) => ({ min: b.min ?? 0, max: b.max ?? 100000, count: b.count, imageUrl: b.imageUrl }))
    : BUDGET_FALLBACK.map((r) => ({ ...r, count: 0, imageUrl: '' }))
  ).map((r, i) => ({
    ...r,
    label: r.min <= 0 ? t('budgetUnder', { max: r.max }) : t('budgetRange', { min: r.min, max: r.max }),
    image: r.imageUrl || featured[i % Math.max(featured.length, 1)]?.imageUrls[0] || FALLBACK_IMG,
  }));

  // Map markers: only real units that actually have coordinates.
  const mapUnits = featured.filter((u) => u.latitude !== 0 && u.longitude !== 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=2000&q=80)',
          }}
        />
        <div className="container mx-auto px-4 py-20 text-center text-white md:py-32">
          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-sm opacity-90 md:text-base">
            {t('heroSubtitle')}
          </p>
        </div>
        <div className="container mx-auto -mt-12 px-4 pb-10">
          <Suspense fallback={<div className="mx-auto max-w-5xl rounded-full border border-brand-border bg-white/80 p-4 text-center text-sm text-brand-muted">…</div>}>
            <FilterBar />
          </Suspense>
        </div>
      </section>

      {/* Featured / Most requested */}
      {SHOW_PRELAUNCH_HIDDEN_SECTIONS && (
      <section className="container mx-auto space-y-6 px-4 py-10">
        <SectionHeader
          title={t('featuredTitle')}
          subtitle={t('featuredSubtitle')}
          href="/units"
          cta={tCommon('viewAll')}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.slice(0, 4).map((u) => (
            <UnitCard key={u.id} unit={u} variant="grid" />
          ))}
        </div>
      </section>
      )}

      {/* By budget */}
      {SHOW_PRELAUNCH_HIDDEN_SECTIONS && (
      <section className="container mx-auto space-y-4 px-4 py-10">
        <h2 className="text-2xl font-bold text-brand-ink">{t('budgetTitle')}</h2>
        <p className="text-sm text-brand-muted">{t('budgetSubtitle')}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {budgetCards.map((range) => (
            <Link
              key={range.label}
              href={`/units?minPrice=${range.min}&maxPrice=${range.max}`}
              className="group relative h-44 overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={range.image}
                alt={range.label}
                className="h-full w-full object-cover transition group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 end-3 text-white">
                <div className="font-bold">{range.label}</div>
                {range.count > 0 && <div className="text-xs opacity-90">{t('unitsAvailable', { count: range.count })}</div>}
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Search by location */}
      <section className="container mx-auto space-y-6 px-4 py-10">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">{t('mapTitle')}</h2>
          <p className="text-sm text-brand-muted">{t('mapSubtitle')}</p>
        </div>
        <LocationExplorer
          units={mapUnits.map((u) => ({
            id: u.id,
            title: u.title,
            price: u.pricePerNight,
            lat: u.latitude,
            lng: u.longitude,
            city: u.city,
            district: u.district,
            image: u.imageUrls[0] ?? '',
            rating: u.rating,
          }))}
        />
      </section>

      {/* Picks for you */}
      <PicksSection showViewAll limit={8} />

      {/* How it works */}
      <section className="bg-brand-cream/50 py-16">
        <div className="container mx-auto space-y-10 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-ink">{t('howTitle')}</h2>
            <p className="text-sm text-brand-muted">{t('howSubtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS_ICONS.map((icon, i) => (
              <div key={i} className="rounded-2xl border border-brand-border bg-white p-6 text-start">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl font-bold text-brand-sage">{i + 1}.</span>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
                    {icon}
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-brand-ink">{t(`how.${i}.title`)}</h3>
                <p className="text-sm leading-relaxed text-brand-muted">{t(`how.${i}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust + testimonial */}
      <section className="bg-brand-ink py-16 text-white">
        <div
          className={`container mx-auto grid items-center gap-12 px-4 ${
            SHOW_PRELAUNCH_HIDDEN_SECTIONS ? 'md:grid-cols-2' : ''
          }`}
        >
          {/* stats */}
          <div>
            <p className="mb-2 text-sm text-brand-sage">{t('trustEyebrow')}</p>
            <h2 className="mb-8 text-2xl font-bold">{t('trustTitle')}</h2>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-white/70">
              {t('trustSubtitle')}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FeatureItem icon={<ShieldCheck className="h-5 w-5" />} title={t('trust.licensed.title')} body={t('trust.licensed.body')} />
              <FeatureItem icon={<Award className="h-5 w-5" />} title={t('trust.quality.title')} body={t('trust.quality.body')} />
              <FeatureItem icon={<MapPin className="h-5 w-5" />} title={t('trust.coverage.title')} body={t('trust.coverage.body')} />
              <FeatureItem icon={<Star className="h-5 w-5" />} title={t('trust.support.title')} body={t('trust.support.body')} />
            </div>
          </div>

          {/* testimonial */}
          {SHOW_PRELAUNCH_HIDDEN_SECTIONS && <TestimonialCarousel items={testimonials} />}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle, href, cta }: { title: string; subtitle: string; href: string; cta: string }) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-brand-ink">{title}</h2>
        <p className="text-sm text-brand-muted">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-primary transition hover:border-brand-primary hover:bg-brand-primary hover:text-white"
      >
        {cta}
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1" />
      </Link>
    </header>
  );
}

function FeatureItem({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 text-start">
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-sage">
        {icon}
      </div>
      <div>
        <h3 className="mb-1 font-bold">{title}</h3>
        <p className="text-sm leading-relaxed text-white/70">{body}</p>
      </div>
    </div>
  );
}

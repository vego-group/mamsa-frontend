import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft, Award, MapPin, Star, ShieldCheck, Search, Compass, CalendarCheck } from 'lucide-react';
import { FilterBar } from '@/components/features/units/FilterBar';
import { UnitCard } from '@/components/features/units/UnitCard';
import { TestimonialCarousel } from '@/components/features/home/TestimonialCarousel';
import { PicksSection } from '@/components/features/home/PicksSection';
import { LocationExplorer } from '@/components/features/home/LocationExplorer';
import { contentApi } from '@/lib/api/client';
import { MOCK_UNITS } from '@/data/mock/units';
import type { Unit } from '@/types';

/** Best-effort fetch — never let a backend hiccup break the homepage render. */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

const CATEGORIES = [
  { type: 'apartment', labelAr: 'شقق',        count: 4560, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80' },
  { type: 'studio',    labelAr: 'استديوهات', count: 1340, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80' },
  { type: 'villa',     labelAr: 'فلل',        count: 3120, image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80' },
];

const SEASONAL_OFFERS = [
  {
    title: 'عرض الصيف الحار',
    subtitle: 'خصم على الإقامات المميزة',
    period: 'ساري حتى 31 أغسطس 2026',
    discount: 25,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'عرض الصيف الحار',
    subtitle: 'خصم على الإقامات المميزة',
    period: 'ساري حتى 31 أغسطس 2026',
    discount: 25,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
  },
];

const BUDGET_RANGES = [
  { label: '2000 - 3000', min: 2000, max: 3000 },
  { label: '1000 - 2000', min: 1000, max: 2000 },
  { label: '500 - 1000', min: 500, max: 1000 },
  { label: 'أقل من 500', min: 0, max: 500 },
];

const HOW_IT_WORKS = [
  { n: '١', icon: <Search className="h-5 w-5" />, title: 'اكتشف', body: 'ابحث بين آلاف العقارات الموثّقة في المملكة بحسب وجهتك واحتياجك.' },
  { n: '٢', icon: <Compass className="h-5 w-5" />, title: 'استكشف', body: 'تصفح تفاصيل كل عقار وصوره ومرافقه وتقييمات النزلاء قبل الحجز.' },
  { n: '٣', icon: <CalendarCheck className="h-5 w-5" />, title: 'احجز', body: 'أكمل حجزك بخطوات بسيطة وآمنة، وادفع بثقة عبر وسائل دفع موثوقة.' },
];

export default async function HomePage() {
  const [apiOffers, popular, testimonials] = await Promise.all([
    safe(contentApi.offers(), []),
    safe(contentApi.popular(), [] as Unit[]),
    safe(contentApi.testimonials(), []),
  ]);

  const featured = popular.length > 0 ? popular : MOCK_UNITS;
  const offerCards =
    apiOffers.length > 0
      ? apiOffers.map((o) => ({
          title: o.title,
          subtitle: o.subtitle,
          period: o.validUntilLabel,
          discount: o.discountPercent,
          image: o.imageUrl,
        }))
      : SEASONAL_OFFERS;

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
            منصة مَمسَى العقارية:
            <br />
            ابحث عن عقارك المثالي لقضاء عطلتك
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-sm opacity-90 md:text-base">
            تصفح آلاف العقارات الموثّقة في السعودية — حجز أو استثمار بثقة على منصة مَمسَى العقارية.
          </p>
        </div>
        <div className="container mx-auto -mt-12 px-4 pb-10">
          <Suspense fallback={<div className="mx-auto max-w-5xl rounded-full border border-brand-border bg-white/80 p-4 text-center text-sm text-brand-muted">جاري تحميل البحث...</div>}>
            <FilterBar />
          </Suspense>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto space-y-6 px-4 py-16">
        <SectionHeader title="اكتشف وجهتك" subtitle="استكشف أفضل الوجهات والإقامات المميزة" href="/units" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.labelAr}
              href={`/units?type=${c.type}`}
              className="group relative h-44 overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <img src={c.image} alt={c.labelAr} className="h-full w-full object-cover transition group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-3 right-3 text-white">
                <div className="text-lg font-bold">{c.labelAr}</div>
                <div className="text-xs opacity-90">{c.count} وحدة</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Seasonal offers */}
      <section className="container mx-auto space-y-6 px-4 py-10">
        <SectionHeader title="العروض الموسمية" subtitle="استكشف أفضل العروض الموسمية" href="/offers" />
        <div className="grid gap-4 md:grid-cols-2">
          {offerCards.map((offer, i) => (
            <Link
              key={i}
              href="/offers"
              className="group relative h-52 overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <img src={offer.image} alt={offer.title} className="h-full w-full object-cover transition group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-status-danger px-3 py-1 text-xs font-bold text-white">
                خصم {offer.discount}%
              </span>
              <div className="absolute bottom-4 right-4 text-white">
                <div className="text-xl font-bold">{offer.title}</div>
                <div className="text-sm opacity-90">{offer.subtitle}</div>
                <div className="mt-1 text-xs opacity-80">{offer.period}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Most requested */}
      <section className="container mx-auto space-y-6 px-4 py-10">
        <SectionHeader title="الأكثر طلبًا" subtitle="وحدات مختارة خصيصًا لك" href="/units" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.slice(0, 4).map((u) => (
            <UnitCard key={u.id} unit={u} variant="grid" />
          ))}
        </div>
      </section>

      {/* By budget */}
      <section className="container mx-auto space-y-4 px-4 py-10">
        <h2 className="text-2xl font-bold text-brand-ink">حسب الميزانية</h2>
        <p className="text-sm text-brand-muted">أسعار تنافس احتياجاتك</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {BUDGET_RANGES.map((range, i) => (
            <Link
              key={range.label}
              href={`/units?minPrice=${range.min}&maxPrice=${range.max}`}
              className="group relative h-44 overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={featured[i % featured.length]?.imageUrls[0] ?? ''}
                alt={range.label}
                className="h-full w-full object-cover transition group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 right-3 text-white">
                <div className="font-bold">{range.label} ر.س</div>
                <div className="text-xs opacity-90">{180 + i * 13} وحدة متاحة</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Search by location */}
      <section className="container mx-auto space-y-6 px-4 py-10">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">البحث حسب الموقع</h2>
          <p className="text-sm text-brand-muted">استكشف العقارات على الخريطة داخل المملكة</p>
        </div>
        <LocationExplorer
          units={MOCK_UNITS.filter((u, i) => MOCK_UNITS.findIndex((x) => x.id === u.id) === i).map((u) => ({
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
            <h2 className="text-2xl font-bold text-brand-ink">كيف نعمل</h2>
            <p className="text-sm text-brand-muted">ثلاث خطوات بسيطة تفصلك عن عطلتك المثالية</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n} className="rounded-2xl border border-brand-border bg-white p-6 text-right">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl font-bold text-brand-sage">{step.n}.</span>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
                    {step.icon}
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-brand-ink">{step.title}</h3>
                <p className="text-sm leading-relaxed text-brand-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust + testimonial */}
      <section className="bg-brand-ink py-16 text-white">
        <div className="container mx-auto grid items-center gap-12 px-4 md:grid-cols-2">
          {/* stats */}
          <div>
            <p className="mb-2 text-sm text-brand-sage">منصة سعودية حديثة لحجز الإقامات الفريدة</p>
            <h2 className="mb-8 text-2xl font-bold">نبني الثقة معك من اليوم الأول</h2>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-white/70">
              نوفّر لك تجربة حجز سلسة وآمنة، بإقامات موثّقة ومعايير جودة عالية تستحق ثقتك.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FeatureItem icon={<ShieldCheck className="h-5 w-5" />} title="مرخّصة وموثوقة" body="منصة معتمدة من وزارة السياحة، نعمل ضمن الأطر النظامية." />
              <FeatureItem icon={<Award className="h-5 w-5" />} title="جودة عالية" body="معايير دقيقة للصور والمرافق لضمان أفضل تجربة إقامة." />
              <FeatureItem icon={<MapPin className="h-5 w-5" />} title="تغطية واسعة" body="إقامات متنوّعة في مختلف مدن المملكة." />
              <FeatureItem icon={<Star className="h-5 w-5" />} title="دعم متواصل" body="فريق دعم جاهز لمساعدتك في كل خطوة من رحلتك." />
            </div>
          </div>

          {/* testimonial */}
          <TestimonialCarousel items={testimonials} />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
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
        عرض الكل
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      </Link>
    </header>
  );
}

function FeatureItem({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 text-right">
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

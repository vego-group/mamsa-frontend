import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Tag } from 'lucide-react';
import { UnitCard } from '@/components/features/units/UnitCard';
import { Button } from '@/components/ui/button';
import { contentApi } from '@/lib/api/client';
import { MOCK_UNITS } from '@/data/mock/units';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: `العروض الموسمية — ${BRAND.nameAr}`,
  description: 'استكشف أفضل العروض والخصومات الموسمية على الإقامات في منصة مَمسَى.',
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}

const FALLBACK_OFFERS = [
  {
    title: 'عرض الصيف الحار',
    subtitle: 'خصم على الإقامات المميزة',
    period: 'ساري حتى 31 أغسطس 2026',
    discount: 25,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'عروض نهاية الأسبوع',
    subtitle: 'خصومات على حجوزات الويكند',
    period: 'كل خميس وجمعة',
    discount: 15,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'إقامات العائلة',
    subtitle: 'عروض خاصة للعائلات والمجموعات',
    period: 'طوال الموسم',
    discount: 20,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
  },
];

export default async function OffersPage() {
  const apiOffers = await safe(contentApi.offers(), []);
  const offers =
    apiOffers.length > 0
      ? apiOffers.map((o) => ({
          title: o.title,
          subtitle: o.subtitle,
          period: o.validUntilLabel,
          discount: o.discountPercent,
          image: o.imageUrl,
        }))
      : FALLBACK_OFFERS;

  // Units that are part of an offer (discounted first, then featured), deduped by id.
  const dealUnits = MOCK_UNITS
    .filter((u, i) => MOCK_UNITS.findIndex((x) => x.id === u.id) === i)
    .filter((u) => u.hasDiscount || u.isFeatured)
    .sort((a, b) => Number(!!b.hasDiscount) - Number(!!a.hasDiscount));

  return (
    <div>
      {/* Header band */}
      <section className="bg-brand-primary py-14 text-white">
        <div className="container mx-auto px-4 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-medium backdrop-blur">
            <Tag className="h-4 w-4" /> عروض وخصومات
          </span>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">العروض الموسمية</h1>
          <p className="mx-auto max-w-2xl text-white/85">
            احجز إقامتك القادمة بأفضل الأسعار — خصومات موسمية على وحدات مختارة لفترة محدودة.
          </p>
        </div>
      </section>

      {/* Promo banners */}
      <section className="container mx-auto space-y-5 px-4 py-12">
        <h2 className="text-2xl font-bold text-brand-ink">عروض هذا الموسم</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer, i) => (
            <Link
              key={i}
              href="/units"
              className="group relative h-56 overflow-hidden rounded-2xl"
            >
              <img src={offer.image} alt={offer.title} className="h-full w-full object-cover transition group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
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

      {/* Deal units */}
      <section className="container mx-auto space-y-5 px-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-ink">إقامات ضمن العروض</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/units">تصفّح الكل <ArrowLeft className="h-4 w-4" /></Link>
          </Button>
        </div>
        {dealUnits.length === 0 ? (
          <p className="text-sm text-brand-muted">لا توجد عروض متاحة حالياً. تابعنا قريباً!</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dealUnits.map((u) => (
              <UnitCard key={u.id} unit={u} variant="grid" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

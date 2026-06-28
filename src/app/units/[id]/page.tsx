'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Share2, Star, ChevronLeft, MapPin, Home as HomeIcon, Wifi, Wind, Car } from 'lucide-react';
import { unitsApi } from '@/lib/api/client';
import { useFavoritesStore } from '@/stores/favorites';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CancellationPolicyDisplay } from '@/components/features/booking/CancellationPolicyDisplay';
import { formatSAR } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Unit, Review } from '@/types';

export default function UnitDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const openAuth = useUiStore((s) => s.openAuth);
  const { has, toggle } = useFavoritesStore();

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    Promise.all([unitsApi.getById(params.id), unitsApi.getReviews(params.id)])
      .then(([u, r]) => {
        setUnit(u);
        setReviews(r);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  })();
  const subtotal = unit ? unit.pricePerNight * nights : 0;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const handleBook = () => {
    if (!unit) return;
    if (!isAuth) { openAuth('login'); return; }
    if (!checkIn || !checkOut || nights < 1) { alert('اختر تاريخ الوصول والمغادرة'); return; }
    const q = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    router.push(`/booking/${unit.id}?${q.toString()}`);
  };

  if (loading || !unit) {
    return <div className="container mx-auto p-10 text-center">جاري التحميل...</div>;
  }

  const isFav = has(unit.id);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-2 text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-primary">الرئيسية</Link>
        <ChevronLeft className="h-3 w-3 rotate-180" />
        <Link href="/units" className="hover:text-brand-primary">الأقسام</Link>
        <ChevronLeft className="h-3 w-3 rotate-180" />
        <span>تفاصيل الوحدة</span>
      </nav>

      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink md:text-3xl">{unit.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="font-semibold text-brand-ink">{unit.rating}</span>
            <Link href="#reviews" className="underline">({unit.reviewCount} تقييمًا)</Link>
            <span>·</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{unit.city}، {unit.country}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" /> مشاركة
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggle(unit.id)}
          >
            <Heart className={cn('h-4 w-4', isFav && 'fill-status-danger text-status-danger')} />
            حفظ
          </Button>
        </div>
      </div>

      {/* Gallery */}
      <div className="mb-8 grid h-[400px] grid-cols-4 grid-rows-2 gap-2">
        {unit.imageUrls[0] && (
          <img src={unit.imageUrls[0]} alt="" className="col-span-2 row-span-2 h-full w-full rounded-2xl object-cover" />
        )}
        {unit.imageUrls.slice(1, 5).map((img, i) => (
          <img key={i} src={img} alt="" className="h-full w-full rounded-xl object-cover" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        {/* Left content */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-xl font-bold text-brand-ink">حول هذا المسكن</h2>
            <p className="leading-relaxed text-brand-muted">{unit.description}</p>
          </section>

          <Card className="space-y-4 p-5">
            <Feature icon={<HomeIcon className="h-5 w-5" />} title="قريب منك ومناسب لذوقك" body="ستحصل على الوحدة بالكامل لنفسك" />
            <hr className="border-brand-border" />
            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <HomeIcon className="h-5 w-5" /> المرافق
              </div>
              <p className="text-sm text-brand-muted">
                {unit.capacity} ضيوف • {unit.bedrooms} غرف نوم • {unit.beds} أسرّة • {unit.bathrooms} حمامات
              </p>
            </div>
          </Card>

          <section>
            <h2 className="mb-3 text-xl font-bold text-brand-ink">ما يقدمه هذا المسكن</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {unit.amenities.map((a) => (
                <div key={a.key} className="flex items-center gap-3 rounded-xl border border-brand-border bg-white p-3">
                  <AmenityIcon name={a.key} />
                  <span>{a.labelAr}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-ink">أشياء يجب معرفتها</h2>
            <Card className="p-4">
              <p className="font-semibold">قواعد البيت</p>
              <p className="text-sm text-brand-muted">تسجيل الوصول بعد {unit.checkInTime} م — تسجيل المغادرة قبل {unit.checkOutTime} ص</p>
            </Card>
            <CancellationPolicyDisplay policy={unit.cancellationPolicy} />
          </section>

          {/* Reviews */}
          <section id="reviews" className="space-y-3">
            <h2 className="text-xl font-bold text-brand-ink">
              <Star className="inline-block h-5 w-5 fill-yellow-500 text-yellow-500" />{' '}
              {unit.rating} · {unit.reviewCount} تقييمًا
            </h2>
            {reviews.length === 0 && <p className="text-sm text-brand-muted">لا توجد تقييمات بعد.</p>}
            {reviews.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  {r.userAvatarUrl && <img src={r.userAvatarUrl} alt="" className="h-8 w-8 rounded-full" />}
                  <div>
                    <div className="text-sm font-semibold">{r.userName}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-brand-muted">{r.comment}</p>
              </Card>
            ))}
          </section>
        </div>

        {/* Booking sidebar */}
        <aside>
          <Card className="sticky top-24 space-y-4 p-5">
            <div className="text-end">
              <span className="text-2xl font-bold text-brand-ink">{formatSAR(unit.pricePerNight)}</span>
              <span className="text-sm text-brand-muted"> / ليلة</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-brand-border p-3 text-xs">
                <div className="text-brand-muted">تسجيل الوصول</div>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent text-sm focus:outline-none" />
              </div>
              <div className="rounded-xl border border-brand-border p-3 text-xs">
                <div className="text-brand-muted">تسجيل المغادرة</div>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-sm focus:outline-none" />
              </div>
            </div>
            <div className="rounded-xl border border-brand-border p-3 text-xs">
              <div className="text-brand-muted">الضيوف</div>
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm focus:outline-none">
                {Array.from({ length: unit.capacity }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} ضيف</option>
                ))}
              </select>
            </div>

            {nights > 0 && (
              <div className="space-y-1 text-sm">
                <Row label={`${formatSAR(unit.pricePerNight)} × ${nights} ليالي`} value={formatSAR(subtotal)} />
                <Row label="رسوم الخدمة" value={formatSAR(serviceFee)} />
                <hr className="border-brand-border" />
                <Row label="المجموع" value={formatSAR(total)} bold />
              </div>
            )}

            <Button size="lg" className="w-full" onClick={handleBook}>احجز الآن</Button>
            <p className="text-center text-xs text-brand-muted">لن يتم الخصم بعد</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn('flex justify-between', bold && 'font-bold')}>
      <span className={cn(!bold && 'text-brand-muted')}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-brand-primary">{icon}</span>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-brand-muted">{body}</div>
      </div>
    </div>
  );
}

function AmenityIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    wifi: <Wifi className="h-4 w-4 text-brand-primary" />,
    ac: <Wind className="h-4 w-4 text-brand-primary" />,
    parking: <Car className="h-4 w-4 text-brand-primary" />,
  };
  return <span>{map[name] ?? <HomeIcon className="h-4 w-4 text-brand-primary" />}</span>;
}

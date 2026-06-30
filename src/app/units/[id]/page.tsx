'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart, Share2, Star, ChevronLeft, MapPin, Users, BedDouble, Bath, DoorOpen,
  Home as HomeIcon, Wifi, Snowflake, Car, Waves, UtensilsCrossed, Tv, Trees,
  ShieldCheck, KeyRound, WashingMachine, Clock, BadgeCheck, type LucideIcon,
} from 'lucide-react';
import { unitsApi } from '@/lib/api/client';
import { useFavoritesStore } from '@/stores/favorites';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnitGallery } from '@/components/features/units/UnitGallery';
import { CancellationPolicyDisplay } from '@/components/features/booking/CancellationPolicyDisplay';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { UNIT_TYPE_LABELS_AR } from '@/lib/constants/brand';
import { formatSAR, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Unit, Review } from '@/types';

const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi, pool: Waves, kitchen: UtensilsCrossed, parking: Car, ac: Snowflake,
  garden: Trees, tv: Tv, washer: WashingMachine, security: ShieldCheck, self_checkin: KeyRound,
};

function ratingLabel(r: number): string {
  if (r >= 4.8) return 'استثنائي';
  if (r >= 4.5) return 'ممتاز';
  if (r >= 4) return 'جيد جداً';
  return 'جيد';
}

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
    return <div className="container mx-auto p-10 text-center text-brand-muted">جاري التحميل...</div>;
  }

  const isFav = has(unit.id);
  const initials = unit.ownerName.trim().charAt(0) || '؟';

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-2 text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-primary">الرئيسية</Link>
        <ChevronLeft className="h-3 w-3 rotate-180" />
        <Link href="/units" className="hover:text-brand-primary">إكتشف وجهتك</Link>
        <ChevronLeft className="h-3 w-3 rotate-180" />
        <span className="text-brand-ink">{unit.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="sage">{UNIT_TYPE_LABELS_AR[unit.type]}</Badge>
            {unit.isFeatured && (
              <Badge variant="cream" className="gap-1"><BadgeCheck className="h-3 w-3" /> مميز</Badge>
            )}
            {unit.hasDiscount && unit.discountPercent && (
              <Badge variant="danger">خصم {unit.discountPercent}%</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-brand-ink md:text-3xl">{unit.title}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-muted">
            <span className="flex items-center gap-1 rounded-full bg-brand-cream px-2.5 py-1 font-semibold text-brand-ink">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              {unit.rating}
            </span>
            <Link href="#reviews" className="underline-offset-2 hover:underline">{unit.reviewCount} تقييمًا</Link>
            <span>·</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{unit.district}، {unit.city}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" /> مشاركة
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggle(unit.id)}>
            <Heart className={cn('h-4 w-4', isFav && 'fill-status-danger text-status-danger')} />
            {isFav ? 'محفوظ' : 'حفظ'}
          </Button>
        </div>
      </div>

      {/* Gallery */}
      <UnitGallery images={unit.imageUrls} title={unit.title} />

      <div className="grid gap-8 md:grid-cols-[1fr_380px]">
        {/* Left content */}
        <div className="space-y-8">
          {/* quick facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Users} value={unit.capacity} label="ضيوف" />
            <Stat icon={BedDouble} value={unit.bedrooms} label="غرف نوم" />
            <Stat icon={DoorOpen} value={unit.beds} label="أسرّة" />
            <Stat icon={Bath} value={unit.bathrooms} label="حمامات" />
          </div>

          {/* host */}
          <div className="flex items-center gap-4 rounded-2xl border border-brand-border bg-white p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-brand-ink">يستضيفك {unit.ownerName}</div>
              <div className="text-sm text-brand-muted">
                {unit.ownerType === 'company' ? 'مضيف موثّق · شركة' : 'مضيف موثّق · مالك فردي'}
              </div>
            </div>
            <BadgeCheck className="ms-auto h-6 w-6 shrink-0 text-brand-primary" />
          </div>

          <Divider />

          {/* about */}
          <section>
            <h2 className="mb-3 text-xl font-bold text-brand-ink">حول هذا المسكن</h2>
            <p className="leading-relaxed text-brand-muted">{unit.description}</p>
          </section>

          <Divider />

          {/* amenities */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-brand-ink">ما يقدمه هذا المسكن</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {unit.amenities.map((a) => {
                const Icon = AMENITY_ICONS[a.key] ?? HomeIcon;
                return (
                  <div key={a.key} className="flex items-center gap-3 rounded-xl border border-brand-border bg-white p-3.5 transition hover:border-brand-primary/40">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cream text-brand-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-brand-ink">{a.labelAr}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <Divider />

          {/* things to know */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-brand-ink">أشياء يجب معرفتها</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="space-y-2 p-4">
                <div className="flex items-center gap-2 font-semibold text-brand-ink">
                  <Clock className="h-4 w-4 text-brand-primary" /> قواعد البيت
                </div>
                <p className="text-sm text-brand-muted">تسجيل الوصول بعد {unit.checkInTime}</p>
                <p className="text-sm text-brand-muted">تسجيل المغادرة قبل {unit.checkOutTime}</p>
                <p className="text-sm text-brand-muted">السعة القصوى {unit.capacity} ضيوف</p>
              </Card>
              <CancellationPolicyDisplay policy={getPolicyByTemplate(unit.cancellationPolicy)} />
            </div>
          </section>

          <Divider />

          {/* reviews */}
          <section id="reviews" className="space-y-5">
            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-brand-cream/50 p-5">
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-ink">{unit.rating}</div>
                <div className="mt-1 flex justify-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-4 w-4', i < Math.round(unit.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-brand-border')} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-brand-ink">{ratingLabel(unit.rating)}</div>
                <div className="text-sm text-brand-muted">بناءً على {unit.reviewCount} تقييمًا من النزلاء</div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-brand-muted">لا توجد تقييمات بعد.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {reviews.map((r) => (
                  <Card key={r.id} className="space-y-3 p-4">
                    <div className="flex items-center gap-3">
                      {r.userAvatarUrl ? (
                        <img src={r.userAvatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream font-bold text-brand-primary">
                          {r.userName.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-brand-ink">{r.userName}</div>
                        <div className="text-xs text-brand-muted">{formatDate(r.createdAt)}</div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-brand-muted">{r.comment}</p>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Booking sidebar */}
        <aside>
          <Card className="sticky top-24 space-y-4 p-5 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-brand-ink">{formatSAR(unit.pricePerNight)}</span>
                <span className="text-sm text-brand-muted"> / ليلة</span>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-brand-ink">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                {unit.rating}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-brand-border">
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-brand-border">
                <label className="cursor-pointer p-3">
                  <span className="block text-[11px] font-medium text-brand-muted">تسجيل الوصول</span>
                  <input
                    type="date"
                    value={checkIn}
                    max={checkOut || undefined}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-sm text-brand-ink focus:outline-none"
                  />
                </label>
                <label className="cursor-pointer p-3">
                  <span className="block text-[11px] font-medium text-brand-muted">تسجيل المغادرة</span>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || undefined}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-sm text-brand-ink focus:outline-none"
                  />
                </label>
              </div>
              <div className="border-t border-brand-border p-3">
                <span className="block text-[11px] font-medium text-brand-muted">الضيوف</span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-transparent text-sm text-brand-ink focus:outline-none"
                >
                  {Array.from({ length: unit.capacity }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} ضيف</option>
                  ))}
                </select>
              </div>
            </div>

            {nights > 0 && (
              <div className="space-y-1.5 text-sm">
                <Row label={`${formatSAR(unit.pricePerNight)} × ${nights} ليالي`} value={formatSAR(subtotal)} />
                <Row label="رسوم الخدمة" value={formatSAR(serviceFee)} />
                <hr className="border-brand-border" />
                <Row label="المجموع" value={formatSAR(total)} bold />
              </div>
            )}

            <Button size="lg" className="w-full" onClick={handleBook}>احجز الآن</Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-brand-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
              لن يتم خصم أي مبلغ في هذه المرحلة
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-brand-border bg-white p-4 text-center">
      <Icon className="h-5 w-5 text-brand-primary" />
      <span className="text-lg font-bold text-brand-ink">{value}</span>
      <span className="text-xs text-brand-muted">{label}</span>
    </div>
  );
}

function Divider() {
  return <hr className="border-brand-border" />;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn('flex justify-between', bold && 'font-bold')}>
      <span className={cn(!bold && 'text-brand-muted')}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

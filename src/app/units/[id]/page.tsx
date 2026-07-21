'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Heart, Share2, Star, ChevronLeft, MapPin, Users, BedDouble, Bath, DoorOpen,
  Home as HomeIcon, Wifi, Snowflake, Car, Waves, UtensilsCrossed, Tv, Trees,
  ShieldCheck, KeyRound, WashingMachine, Clock, BadgeCheck, Baby, Flame,
  ArrowUpDown, Umbrella, PartyPopper, type LucideIcon,
} from 'lucide-react';
import { unitsApi } from '@/lib/api/client';
import { useFavoritesStore } from '@/stores/favorites';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnitGallery } from '@/components/features/units/UnitGallery';
import { LoadError } from '@/components/shared/LoadError';
import { CancellationPolicyDisplay } from '@/components/features/booking/CancellationPolicyDisplay';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { formatSAR, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Unit, Review } from '@/types';

/**
 * One icon per slug in the backend's closed amenity vocabulary. Anything the
 * backend sends with `key: null` (or a slug added there before here) falls
 * through to the generic HomeIcon rather than disappearing.
 */
const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi, pool: Waves, kitchen: UtensilsCrossed, parking: Car, ac: Snowflake,
  garden: Trees, smart_tv: Tv, washer: WashingMachine, security: ShieldCheck,
  self_checkin: KeyRound, family_friendly: Baby, bbq: Flame, elevator: ArrowUpDown,
  private_beach: Umbrella, event_hall: PartyPopper,
};

function ratingKey(r: number): 'exceptional' | 'excellent' | 'veryGood' | 'good' {
  if (r >= 4.8) return 'exceptional';
  if (r >= 4.5) return 'excellent';
  if (r >= 4) return 'veryGood';
  return 'good';
}

export default function UnitDetailsPage() {
  const t = useTranslations('unit');
  const tCommon = useTranslations('common');
  const tTypes = useTranslations('types');
  const tAmenities = useTranslations('amenities');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Bumping this re-runs the fetch effect — the retry path after a failure.
  const [attempt, setAttempt] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const openAuth = useUiStore((s) => s.openAuth);
  const { has, toggle } = useFavoritesStore();

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    setLoadError(false);
    // Reviews are best-effort — only the unit fetch decides success/failure.
    Promise.all([unitsApi.getById(params.id), unitsApi.getReviews(params.id).catch(() => [] as Review[])])
      .then(([u, r]) => {
        setUnit(u);
        setReviews(r);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [params.id, attempt]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  })();
  // Rough preview only — no fee/tax math here. The real, final price only
  // exists after checkAvailability() runs on the checkout page, once dates
  // are confirmed (see checkout-page-client.tsx).
  const subtotal = unit ? unit.pricePerNight * nights : 0;

  // Local YYYY-MM-DD "today" — floors the date pickers so past dates can't
  // be picked or typed in. Availability itself is still verified server-side
  // on the checkout page; this is just a UX guard against obviously invalid input.
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const datesSelected = !!checkIn && !!checkOut && nights >= 1 && checkIn >= todayStr;

  const handleBook = () => {
    if (!unit || !datesSelected) return;
    if (!isAuth) { openAuth('login'); return; }
    const q = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    router.push(`/booking/${unit.id}?${q.toString()}`);
  };

  if (loadError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadError onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    );
  }

  if (loading || !unit) {
    return <div className="container mx-auto p-10 text-center text-brand-muted">{tCommon('loading')}</div>;
  }

  const isFav = has(unit.id);
  const initials = unit.ownerName.trim().charAt(0) || '؟';

  return (
    // Extra bottom padding on mobile keeps content clear of the fixed book bar.
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-2 text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-primary">{tCommon('home')}</Link>
        <ChevronLeft className="h-3 w-3 rotate-180 rtl:rotate-180 ltr:rotate-0" />
        <Link href="/units" className="hover:text-brand-primary">{tCommon('explore')}</Link>
        <ChevronLeft className="h-3 w-3 rotate-180 rtl:rotate-180 ltr:rotate-0" />
        <span className="text-brand-ink">{unit.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="sage">{tTypes(unit.type)}</Badge>
            {unit.isFeatured && (
              <Badge variant="cream" className="gap-1"><BadgeCheck className="h-3 w-3" /> {t('featured')}</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-brand-ink md:text-3xl">{unit.title}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-muted">
            <span className="flex items-center gap-1 rounded-full bg-brand-cream px-2.5 py-1 font-semibold text-brand-ink">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              {unit.rating}
            </span>
            <Link href="#reviews" className="underline-offset-2 hover:underline">{t('reviewCount', { count: unit.reviewCount })}</Link>
            <span>·</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{unit.district}، {unit.city}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" /> {t('share')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggle(unit.id)}>
            <Heart className={cn('h-4 w-4', isFav && 'fill-status-danger text-status-danger')} />
            {isFav ? t('saved') : t('save')}
          </Button>
        </div>
      </div>

      {/* Gallery */}
      <UnitGallery images={unit.imageUrls} title={unit.title} />

      <div className="grid gap-8 md:grid-cols-[1fr_380px]">
        {/* Main content */}
        <div className="space-y-8">
          {/* quick facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Users} value={unit.capacity} label={t('facts.guests')} />
            <Stat icon={BedDouble} value={unit.bedrooms} label={t('facts.bedrooms')} />
            <Stat icon={DoorOpen} value={unit.beds} label={t('facts.beds')} />
            <Stat icon={Bath} value={unit.bathrooms} label={t('facts.baths')} />
          </div>

          {/* host */}
          <div className="flex items-center gap-4 rounded-2xl border border-brand-border bg-white p-5">
            {unit.ownerAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar host is not in next.config images.remotePatterns
              <img
                src={unit.ownerAvatarUrl}
                alt={unit.ownerName}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-bold text-brand-ink">{t('hostedBy', { name: unit.ownerName })}</div>
              <div className="text-sm text-brand-muted">
                {unit.ownerType === 'company' ? t('hostCompany') : t('hostIndividual')}
              </div>
            </div>
            {/* Badge only for partners whose application was actually approved. */}
            {unit.ownerVerified && <BadgeCheck className="ms-auto h-6 w-6 shrink-0 text-brand-primary" />}
          </div>

          <Divider />

          {/* about */}
          <section>
            <h2 className="mb-3 text-xl font-bold text-brand-ink">{t('about')}</h2>
            <p className="leading-relaxed text-brand-muted">{unit.description}</p>
          </section>

          <Divider />

          {/* amenities */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-brand-ink">{t('amenitiesTitle')}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {unit.amenities.map((a) => {
                const Icon = AMENITY_ICONS[a.key] ?? HomeIcon;
                return (
                  <div key={a.key} className="flex items-center gap-3 rounded-xl border border-brand-border bg-white p-3.5 transition hover:border-brand-primary/40">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cream text-brand-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-brand-ink">{tAmenities.has(a.key) ? tAmenities(a.key) : a.labelAr}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <Divider />

          {/* things to know */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-brand-ink">{t('thingsToKnow')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="space-y-2 p-4">
                <div className="flex items-center gap-2 font-semibold text-brand-ink">
                  <Clock className="h-4 w-4 text-brand-primary" /> {t('houseRules')}
                </div>
                <p className="text-sm text-brand-muted">{t('checkInAfter', { time: unit.checkInTime })}</p>
                <p className="text-sm text-brand-muted">{t('checkOutBefore', { time: unit.checkOutTime })}</p>
                <p className="text-sm text-brand-muted">{t('maxCapacity', { count: unit.capacity })}</p>
              </Card>
              <CancellationPolicyDisplay
                policy={unit.cancellationPolicyDetails ?? getPolicyByTemplate(unit.cancellationPolicy)}
              />
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
                <div className="text-lg font-bold text-brand-ink">{t(`ratingLabel.${ratingKey(unit.rating)}`)}</div>
                <div className="text-sm text-brand-muted">{t('basedOn', { count: unit.reviewCount })}</div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-brand-muted">{t('noReviews')}</p>
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
        <aside id="booking-card">
          <Card className="sticky top-24 space-y-4 p-5 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-brand-ink">{formatSAR(unit.pricePerNight)}</span>
                <span className="text-sm text-brand-muted"> {tCommon('perNight')}</span>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-brand-ink">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                {unit.rating}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-brand-border">
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-brand-border">
                <label className="cursor-pointer p-3">
                  <span className="block text-[11px] font-medium text-brand-muted">{t('checkInLabel')}</span>
                  <input
                    type="date"
                    value={checkIn}
                    min={todayStr}
                    max={checkOut || undefined}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-sm text-brand-ink focus:outline-none"
                  />
                </label>
                <label className="cursor-pointer p-3">
                  <span className="block text-[11px] font-medium text-brand-muted">{t('checkOutLabel')}</span>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || todayStr}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-sm text-brand-ink focus:outline-none"
                  />
                </label>
              </div>
              <div className="border-t border-brand-border p-3">
                <span className="block text-[11px] font-medium text-brand-muted">{t('guestsLabel')}</span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-transparent text-sm text-brand-ink focus:outline-none"
                >
                  {Array.from({ length: unit.capacity }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{t('guestOption', { count: i + 1 })}</option>
                  ))}
                </select>
              </div>
            </div>

            {nights > 0 && (
              <div className="space-y-1.5 text-sm">
                <Row label={t('nightsLine', { price: formatSAR(unit.pricePerNight), nights })} value={formatSAR(subtotal)} bold />
                <p className="text-xs text-brand-muted">{t('estimateNote')}</p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleBook}
              disabled={!datesSelected}
              title={datesSelected ? undefined : t('pickDates')}
            >
              {t('bookNow')}
            </Button>
            {!datesSelected ? (
              <p className="text-center text-xs text-status-danger">{t('pickDates')}</p>
            ) : (
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-brand-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
                {t('noChargeYet')}
              </p>
            )}
          </Card>
        </aside>
      </div>

      {/* Mobile: fixed book bar — jumps to the booking card where dates/guests live */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-brand-border bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div>
          <div className="text-lg font-bold text-brand-ink">{formatSAR(unit.pricePerNight)}</div>
          <div className="text-xs text-brand-muted">{tCommon('perNight')}</div>
        </div>
        <Button size="lg" className="max-w-[220px] flex-1" onClick={() => {
          document.getElementById('booking-card')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          {t('bookNow')}
        </Button>
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

'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Heart, Share2, Star, ChevronLeft, MapPin, Users, BedDouble, Bath, DoorOpen,
  Home as HomeIcon, Wifi, Snowflake, Car, Waves, UtensilsCrossed, Tv, Trees,
  ShieldCheck, KeyRound, WashingMachine, Clock, BadgeCheck, Baby, Flame,
  ArrowUpDown, Umbrella, PartyPopper, X, type LucideIcon,
} from 'lucide-react';
import { unitsApi, type BlockedDateRange } from '@/lib/api/client';
import { useFavoritesStore } from '@/stores/favorites';
import { sanitizeStay, todayISO, useSearchStore } from '@/stores/search';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnitGallery } from '@/components/features/units/UnitGallery';
import { UnitRating, hasRating } from '@/components/features/units/UnitRating';
import { DateRangePicker, type DateRange } from '@/components/ui/date-range-picker';
import { SelectField, type SelectOption } from '@/components/ui/select-field';
import { LoadError } from '@/components/shared/LoadError';
import { RichText } from '@/components/shared/RichText';
import { CancellationPolicyDisplay } from '@/components/features/booking/CancellationPolicyDisplay';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { formatSAR, formatDate } from '@/lib/utils/format';
import { quoteFromNightly } from '@/lib/pricing';
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

/**
 * Inclusive {start,end} night-spans → a flat set of ISO dates the calendar
 * can check in O(1). Parsed as local y/m/d, never `new Date(isoString)` —
 * that reads a date-only string as UTC midnight, which is the wrong calendar
 * day in any timezone behind UTC.
 */
function expandBlockedDates(ranges: BlockedDateRange[]): Set<string> {
  const set = new Set<string>();
  for (const r of ranges) {
    const [sy, sm, sd] = r.start.split('-').map(Number);
    const [ey, em, ed] = r.end.split('-').map(Number);
    let d = new Date(sy!, sm! - 1, sd!);
    const end = new Date(ey!, em! - 1, ed!);
    while (d <= end) {
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
  }
  return set;
}

/**
 * True if any night in [start, end) is blocked. Catches a stay that arrived
 * pre-filled — from the search bar, a shared link, or the last unit browsed —
 * without ever passing through this calendar's own `pick()` guard.
 */
function rangeOverlapsBlocked(start: string, end: string, blocked: ReadonlySet<string>): boolean {
  if (blocked.size === 0 || !start || !end) return false;
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  let d = new Date(sy!, sm! - 1, sd!);
  const endDate = new Date(ey!, em! - 1, ed!);
  while (d < endDate) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (blocked.has(iso)) return true;
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  }
  return false;
}

function UnitDetailsView() {
  const t = useTranslations('unit');
  const tCommon = useTranslations('common');
  const tTypes = useTranslations('types');
  const tAmenities = useTranslations('amenities');
  const tPricing = useTranslations('pricing');
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blockedDates, setBlockedDates] = useState<ReadonlySet<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Bumping this re-runs the fetch effect — the retry path after a failure.
  const [attempt, setAttempt] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  // The mobile booking sheet. On a phone the booking card sits below the
  // reviews, so the fixed CTA used to scroll the guest the whole length of the
  // page to reach the calendar. It now brings the calendar to them instead.
  const [sheetOpen, setSheetOpen] = useState(false);

  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const openAuth = useUiStore((s) => s.openAuth);
  const { has, toggle } = useFavoritesStore();

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    setLoadError(false);
    // Reviews and the blocked-dates feed are both best-effort — only the unit
    // fetch itself decides success/failure. Losing the feed just means the
    // calendar falls back to floor-only disabling; checkout still catches a
    // real conflict server-side.
    Promise.all([
      unitsApi.getById(params.id),
      unitsApi.getReviews(params.id).catch(() => [] as Review[]),
      unitsApi.getBlockedDates(params.id).catch(() => [] as BlockedDateRange[]),
    ])
      .then(([u, r, blocked]) => {
        setUnit(u);
        setReviews(r);
        setBlockedDates(expandBlockedDates(blocked));
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [params.id, attempt]);

  // Open on the stay the guest already picked — on the search bar, on the map,
  // or on the last listing they looked at — instead of an empty calendar. The
  // link's own params win when it carries a stay, so a shared or bookmarked
  // dated URL shows that stay rather than whatever this tab was last browsing.
  useEffect(() => {
    const fromLink = {
      start: search.get('start') ?? search.get('checkIn') ?? '',
      end: search.get('end') ?? search.get('checkOut') ?? '',
      guests: Number(search.get('guests') ?? search.get('capacity')) || 1,
    };
    const stay = sanitizeStay(fromLink.start ? fromLink : useSearchStore.getState());
    setCheckIn(stay.start);
    setCheckOut(stay.end);
    setGuests(stay.guests);
  }, [params.id, search]);

  // The guest picker only offers up to `capacity`, so a larger carried-over
  // party would leave the select showing nothing at all.
  useEffect(() => {
    if (unit) setGuests((g) => Math.min(g, unit.capacity));
  }, [unit]);

  // Publish edits made here too, so moving on to another listing keeps the stay.
  const pickStay = ({ start, end }: DateRange) => {
    setCheckIn(start);
    setCheckOut(end);
    useSearchStore.getState().setStay({ start, end });
  };
  const pickGuests = (n: number) => {
    setGuests(n);
    useSearchStore.getState().setStay({ guests: n });
  };

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [sheetOpen]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  })();
  // Not a preview any more: `pricePerNight` is gross, so this IS the final
  // payable amount and must match checkout, payment and confirmation exactly.
  const gross = unit ? quoteFromNightly(unit.pricePerNight, nights).gross : 0;

  // Local YYYY-MM-DD "today" — floors the date pickers so past dates can't
  // be picked or typed in. Availability itself is still verified server-side
  // on the checkout page; this is just a UX guard against obviously invalid input.
  const todayStr = todayISO();

  // A stay that overlaps a blocked night can only get here pre-filled — this
  // component's own calendar never lets it be picked directly (see `pick()`
  // in DateRangePicker) — but the search bar and shared links skip that guard.
  const staySpansBlocked = rangeOverlapsBlocked(checkIn, checkOut, blockedDates);
  const datesSelected = !!checkIn && !!checkOut && nights >= 1 && checkIn >= todayStr && !staySpansBlocked;

  // The stay controls wear the search bar's own field — a soft cream row with
  // its caption above its value — so the two read as one system rather than
  // as the site's calendar and a stray form.
  const stayFieldCls =
    'flex w-full items-center gap-2 rounded-2xl bg-brand-cream/40 px-4 py-2.5 text-start transition hover:bg-brand-cream/60';

  // Never more than the unit sleeps — the same ceiling the carried-over party
  // is clamped to above.
  const guestOptions = useMemo<SelectOption[]>(
    () =>
      Array.from({ length: unit?.capacity ?? 1 }, (_, i) => ({
        value: String(i + 1),
        label: t('guestOption', { count: i + 1 }),
      })),
    [unit?.capacity, t],
  );

  const handleBook = () => {
    if (!unit || !datesSelected) return;
    if (!isAuth) { setSheetOpen(false); openAuth('login'); return; }
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
    return <UnitDetailsLoading />;
  }

  const isFav = has(unit.id);
  // No guest has scored this unit yet — every score surface says "new" instead
  // of printing the backend's placeholder 0.
  const rated = hasRating(unit.rating, unit.reviewCount);
  const initials = unit.ownerName.trim().charAt(0) || '؟';

  /**
   * Price, stay controls and the CTA — one definition, rendered by the desktop
   * sidebar and by the mobile sheet. Splitting them would let the two drift,
   * and the calendar is the whole reason the sheet exists.
   */
  const bookingBody = (
    <>
      <div className="flex items-end justify-between">
        <div>
          <div>
            <span className="text-2xl font-bold text-brand-ink">{formatSAR(unit.pricePerNight)}</span>
            <span className="text-sm text-brand-muted"> {tCommon('perNight')}</span>
          </div>
          <div className="text-xs text-brand-muted">{tPricing('inclVatShort')}</div>
        </div>
        <UnitRating
          rating={unit.rating}
          reviewCount={unit.reviewCount}
          className="text-sm"
          starClassName="h-4 w-4"
        />
      </div>

      {/* The stay is picked in the site's own range calendar, the same one the
          search bar opens. The pair of `<input type="date">` fields it replaces
          handed the guest over to the phone's native picker: two unrelated
          dialogs, in the OS's language and colours, with no sense of the nights
          between them. */}
      <div className="space-y-2 rounded-2xl border border-brand-border p-2">
        <DateRangePicker
          start={checkIn}
          end={checkOut}
          min={todayStr}
          blockedDates={blockedDates}
          onChange={pickStay}
          stacked
          // Both hosts are narrower than the panel: hung from the trailing
          // edge, the months open inwards instead of off the screen.
          align="end"
          fieldClassName={stayFieldCls}
          // Side by side at every width, so the hairline the search bar draws
          // in its desktop row never joins this grid.
          dividerClassName="md:hidden"
          className="md:grid md:gap-2"
        />
        <SelectField
          value={String(guests)}
          onChange={(v) => pickGuests(Number(v))}
          options={guestOptions}
          label={t('guestsLabel')}
          stacked
          fieldClassName={stayFieldCls}
          panelClassName="start-auto end-0 w-full"
        />
      </div>

      {nights > 0 && (
        <div className="space-y-1.5 text-sm">
          <Row label={t('nightsLine', { price: formatSAR(unit.pricePerNight), nights })} value={formatSAR(gross)} bold />
          {/* The commercial payoff of VAT-inclusive pricing — given real
              presence next to the number, not buried as fine print. */}
          <p className="rounded-lg bg-brand-sage/20 px-3 py-2 text-xs font-medium leading-relaxed text-brand-primary">
            {tPricing('finalPriceNote')}
          </p>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleBook}
        disabled={!datesSelected}
        title={datesSelected ? undefined : t(staySpansBlocked ? 'datesUnavailable' : 'pickDates')}
      >
        {t('bookNow')}
      </Button>
      {!datesSelected ? (
        <p className="text-center text-xs text-status-danger">
          {t(staySpansBlocked ? 'datesUnavailable' : 'pickDates')}
        </p>
      ) : (
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-brand-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
          {t('noChargeYet')}
        </p>
      )}
    </>
  );

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
            {/* A unit with no reviews yet wears a "new" badge, never a 0 score. */}
            <UnitRating
              rating={unit.rating}
              reviewCount={unit.reviewCount}
              className="rounded-full bg-brand-cream px-2.5 py-1 font-semibold text-brand-ink"
              newClassName="px-2.5 py-1 text-xs"
            />
            {rated && (
              <Link href="#reviews" className="underline-offset-2 hover:underline">{t('reviewCount', { count: unit.reviewCount })}</Link>
            )}
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
      <UnitGallery images={unit.images} title={unit.title} />

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
            <RichText text={unit.description} />
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
            {rated ? (
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
            ) : (
              // A freshly listed unit has nothing to average. Say so plainly
              // rather than showing an empty five-star row scoring it zero.
              <div className="rounded-2xl border border-dashed border-brand-border bg-brand-cream/30 p-5">
                <div className="font-bold text-brand-ink">{t('newListingTitle')}</div>
                <p className="mt-1 text-sm text-brand-muted">{t('newListingBody')}</p>
              </div>
            )}

            {reviews.length === 0 ? (
              rated && <p className="text-sm text-brand-muted">{t('noReviews')}</p>
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

        {/* Booking sidebar — the desktop home of the shared booking body. */}
        <aside id="booking-card" className="hidden md:block">
          <Card className="sticky top-24 space-y-4 p-5 shadow-sm">
            {bookingBody}
          </Card>
        </aside>
      </div>

      {/* Mobile: fixed book bar — opens the booking sheet. `pb-[…safe-area…]`
          keeps the CTA clear of the iPhone home indicator. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-brand-border bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <div>
          <div className="text-lg font-bold text-brand-ink">{formatSAR(unit.pricePerNight)}</div>
          <div className="text-xs text-brand-muted">
            {datesSelected ? t('nightsCount', { count: nights }) : `${tCommon('perNight')} · ${tPricing('inclVatShort')}`}
          </div>
        </div>
        <Button size="lg" className="max-w-[220px] flex-1" onClick={() => setSheetOpen(true)}>
          {datesSelected ? t('bookNow') : t('pickDatesShort')}
        </Button>
      </div>

      {/* Mobile: booking sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] space-y-4 overflow-y-auto rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex items-center justify-between">
              <span aria-hidden className="h-1.5 w-10 rounded-full bg-brand-border" />
              <button
                onClick={() => setSheetOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream"
                aria-label={tCommon('close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {bookingBody}
          </div>
        </div>
      )}
    </div>
  );
}

function UnitDetailsLoading() {
  const t = useTranslations('common');
  return <div className="container mx-auto p-10 text-center text-brand-muted">{t('loading')}</div>;
}

/**
 * The view reads the stay off the query string, so it needs a Suspense boundary
 * above it — without one `useSearchParams` opts the whole route out of
 * server rendering.
 */
export default function UnitDetailsPage() {
  return (
    <Suspense fallback={<UnitDetailsLoading />}>
      <UnitDetailsView />
    </Suspense>
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

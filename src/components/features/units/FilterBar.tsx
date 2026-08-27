'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRangePicker, type DateRange } from '@/components/ui/date-range-picker';
import { SelectField, type SelectOption } from '@/components/ui/select-field';
import { SAUDI_REGIONS, foldArabic } from '@/data/saudi-cities';
import { todayISO, useSearchStore } from '@/stores/search';

const UNIT_TYPES = ['all', 'apartment', 'studio', 'villa'] as const;

const CAPACITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function FilterBar() {
  const t = useTranslations('filter');
  const tTypes = useTranslations('types');
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const [city, setCity] = useState(params.get('city') ?? '');
  const [type, setType] = useState(params.get('type') ?? 'all');
  const [capacity, setCapacity] = useState(params.get('capacity') ?? '1');
  const [startDate, setStartDate] = useState(params.get('start') ?? '');
  const [endDate, setEndDate] = useState(params.get('end') ?? '');
  // On a phone the bar was five stacked rows — roughly a third of the screen,
  // above every result. It is now one line that says what is being searched
  // for, and opens the whole form as a full-screen sheet.
  const [sheetOpen, setSheetOpen] = useState(false);

  // Reconcile the bar with the stay the guest is already planning, in whichever
  // direction has the fresher answer. Runs after hydration, so the persisted
  // stay can never disagree with the server-rendered markup.
  useEffect(() => {
    const stay = useSearchStore.getState();
    const urlStart = params.get('start');
    const urlEnd = params.get('end');
    if (urlStart || urlEnd) {
      // A shared or bookmarked search URL *is* the stay being viewed — it wins.
      stay.setStay({
        start: urlStart ?? '',
        end: urlEnd ?? '',
        guests: Number(params.get('capacity')) || 1,
      });
      return;
    }
    // Nothing in the URL: pick up whatever was chosen elsewhere (the hero bar,
    // a listing's booking widget) instead of starting the guest over.
    if (stay.start) setStartDate(stay.start);
    if (stay.end) setEndDate(stay.end);
    if (!params.get('capacity') && stay.guests > 1) setCapacity(String(stay.guests));
    // Mount-only: later edits flow through the change handlers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every edit is published immediately, not just on submit — the guest may
  // click a listing straight from the home page without pressing "search".
  const pickCapacity = (v: string) => {
    setCapacity(v);
    useSearchStore.getState().setStay({ guests: Number(v) || 1 });
  };
  const pickDates = ({ start, end }: DateRange) => {
    setStartDate(start);
    setEndDate(end);
    useSearchStore.getState().setStay({ start, end });
  };

  // The booking widget floors arrivals at today and refuses anything earlier.
  // Without the same floor here the bar happily takes a stay that has already
  // been and gone, and every listing then opens on an empty calendar — the
  // carry-over looking broken when it is the dates that are unusable.
  const todayStr = todayISO();

  const handleSearch = () => {
    const q = new URLSearchParams();
    if (city) q.set('city', city);
    if (type !== 'all') q.set('type', type);
    if (capacity) q.set('capacity', capacity);
    if (startDate) q.set('start', startDate);
    if (endDate) q.set('end', endDate);
    setSheetOpen(false);
    router.push(`/units?${q.toString()}`);
  };

  // Every city in the Kingdom, filed under its region. The Arabic name is the
  // option's value in both locales — it is the backend's key for the city, so
  // only the label follows the interface language.
  const cityOptions = useMemo<SelectOption[]>(() => {
    const isArabic = locale === 'ar';
    const all: SelectOption[] = [{ value: '', label: t('allCities') }];
    for (const region of SAUDI_REGIONS) {
      for (const c of region.cities) {
        all.push({
          value: c.value,
          label: isArabic ? c.value : c.en,
          group: isArabic ? region.ar : region.en,
          // Either spelling finds the city, whichever language is on screen.
          keywords: isArabic ? c.en : c.value,
        });
      }
    }
    return all;
  }, [locale, t]);

  const typeOptions = useMemo<SelectOption[]>(
    () => UNIT_TYPES.map((ty) => ({ value: ty, label: tTypes(ty) })),
    [tTypes],
  );

  // Bare numbers: the field's own caption already says what is being counted.
  const capacityOptions = useMemo<SelectOption[]>(
    () => CAPACITIES.map((n) => ({ value: String(n), label: String(n) })),
    [],
  );

  // Each field is a segment of the pill: its caption sits above its value, and
  // the whole segment lights up as one rounded target on hover. Mobile keeps the
  // same two lines but stacks the segments as soft rows inside the card.
  const fieldCls =
    'flex w-full items-center gap-2 rounded-2xl bg-brand-cream/40 px-4 py-2.5 text-start transition md:flex-1 md:rounded-full md:bg-transparent md:px-5 md:py-3 md:hover:bg-brand-cream/60';

  const divider = 'hidden h-9 w-px shrink-0 bg-brand-border md:block';

  /** "5 سبتمبر" — short enough to sit two dates and a guest count on one line. */
  const shortDate = (iso: string) => {
    try {
      return format(parseISO(iso), 'd MMM', { locale: locale === 'ar' ? ar : enUS });
    } catch {
      return iso;
    }
  };
  const summaryDates =
    startDate && endDate ? `${shortDate(startDate)} – ${shortDate(endDate)}` : t('addDates');
  const summaryGuests = t('guestsCount', { count: Number(capacity) || 1 });

  /** The four fields and the submit — one definition, worn two ways. */
  const fields = (
    <>
      {/* city — 130-odd of them, so the list carries a search box */}
      <SelectField
        value={city}
        onChange={setCity}
        options={cityOptions}
        label={t('city')}
        placeholder={t('allCities')}
        searchPlaceholder={t('searchCity')}
        emptyLabel={t('noCity')}
        fold={foldArabic}
        stacked
        fieldClassName={fieldCls}
        className="md:flex-1"
        panelClassName="w-80"
      />

      <div className={divider} />

      {/* type */}
      <SelectField
        value={type}
        onChange={setType}
        options={typeOptions}
        label={t('unitType')}
        stacked
        fieldClassName={fieldCls}
        className="md:flex-1"
      />

      <div className={divider} />

      {/* guests */}
      <SelectField
        value={capacity}
        onChange={pickCapacity}
        options={capacityOptions}
        label={t('guests')}
        stacked
        fieldClassName={fieldCls}
        className="md:flex-1"
      />

      <div className={divider} />

      {/* dates — one range calendar behind two fields, side by side on mobile */}
      <DateRangePicker
        start={startDate}
        end={endDate}
        min={todayStr}
        onChange={pickDates}
        stacked
        fieldClassName={fieldCls}
      />

      {/* search button */}
      <Button
        onClick={handleSearch}
        size="lg"
        className="w-full rounded-2xl md:h-[52px] md:w-auto md:shrink-0 md:rounded-full"
      >
        <Search className="h-5 w-5" />
        <span>{t('search')}</span>
      </Button>
    </>
  );

  return (
    // The gutter is the bar's own: on the results page it drops straight into
    // a coloured band with no container around it, and without padding here
    // the card sat flush against both edges of a phone screen.
    <div className="mx-auto max-w-6xl px-4">
      {/* desktop: the whole form as one pill */}
      <div className="hidden rounded-full border border-brand-border bg-white p-2 shadow-[0_14px_44px_-20px_rgba(31,42,36,0.45)] md:flex md:items-center md:gap-1">
        {fields}
      </div>

      {/* mobile: one line saying what is being searched for */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="flex w-full items-center gap-3 rounded-full border border-brand-border bg-white px-5 py-3 text-start shadow-[0_14px_44px_-20px_rgba(31,42,36,0.45)] md:hidden"
      >
        <Search className="h-5 w-5 shrink-0 text-brand-primary" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-brand-ink">
            {city || t('allCities')}
          </span>
          <span className="block truncate text-xs text-brand-muted">
            {summaryDates} · {summaryGuests}
          </span>
        </span>
      </button>

      {/* mobile: the form itself, full screen. Portaled to <body> so neither the
          hero's stacking context nor the sticky header can paint over it. */}
      {sheetOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[60] flex flex-col bg-white md:hidden">
          <header className="flex shrink-0 items-center justify-between border-b border-brand-border px-4 py-3">
            <h2 className="text-base font-bold text-brand-ink">{t('searchTitle')}</h2>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream"
              aria-label={t('close')}
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-4">{fields}</div>
        </div>,
        document.body,
      )}
    </div>
  );
}

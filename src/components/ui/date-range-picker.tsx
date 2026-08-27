'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, addMonths, format, startOfMonth, startOfWeek } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

/**
 * Sunday — the first working day of the Saudi week. date-fns' `ar` locale
 * defaults to Saturday, which would shift every column by one against the
 * calendar guests are used to reading.
 */
const WEEK_STARTS_ON = 0;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Local calendar day as YYYY-MM-DD. Never `toISOString()`: that is UTC, and
 * east of Greenwich it hands back yesterday for anything picked before 03:00.
 */
function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** YYYY-MM-DD → local midnight; null for anything malformed. */
function fromISO(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * One month as 7-column rows, padded with nulls so the 1st lands under its
 * weekday. Out-of-month days stay blank rather than spilling in from the
 * neighbouring month — a day the guest can see but not reach in this grid
 * reads as broken.
 */
function monthCells(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const mo = month.getMonth();
  const lead = (new Date(year, mo, 1).getDay() - WEEK_STARTS_ON + 7) % 7;
  const days = new Date(year, mo + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let i = 1; i <= days; i++) cells.push(new Date(year, mo, i));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export interface DateRange {
  /** YYYY-MM-DD, or '' when nothing is picked. */
  start: string;
  end: string;
}

/** Stable empty set so an omitted `blockedDates` never forces a re-render. */
const NO_BLOCKED_DATES: ReadonlySet<string> = new Set();

/**
 * First blocked night strictly between `start` and `end` (both exclusive), or
 * '' when the stay is clear. `start` and `end` are themselves assumed clean —
 * both are only ever reachable through this component if they weren't blocked.
 */
function firstBlockedBetween(start: string, end: string, blocked: ReadonlySet<string>): string {
  if (blocked.size === 0) return '';
  let d = addDays(fromISO(start)!, 1);
  const endDate = fromISO(end)!;
  while (d < endDate) {
    const iso = toISO(d);
    if (blocked.has(iso)) return iso;
    d = addDays(d, 1);
  }
  return '';
}

interface DateRangePickerProps extends DateRange {
  onChange: (range: DateRange) => void;
  /** Earliest selectable day, YYYY-MM-DD. Days before it are dead. */
  min: string;
  /**
   * Nights already spoken for (YYYY-MM-DD), e.g. from `unitsApi.getBlockedDates`.
   * Dead the same way a pre-`min` day is, and a candidate departure past one of
   * these snaps back to starting a fresh range instead of silently spanning it.
   */
  blockedDates?: ReadonlySet<string>;
  /** Caption above the date instead of beside it — see `SelectField`. */
  stacked?: boolean;
  /** Class the host bar uses for its own fields, so the trigger blends in. */
  fieldClassName?: string;
  /**
   * The hairline between the two fields. It only earns its place in a host
   * that lays the fields out in a row; hosts that keep them side by side with
   * a gap pass `md:hidden` to keep it out of their grid.
   */
  dividerClassName?: string;
  /**
   * Where the panel hangs from. `center` suits a full-width bar; `end` suits a
   * host narrower than the panel — anchored to its trailing edge, the two
   * months grow towards the middle of the page instead of off the screen.
   */
  align?: 'center' | 'end';
  className?: string;
}

/** Logical, so `end` is the right edge in English and the left one in Arabic. */
const ALIGN = {
  center: 'left-1/2 -translate-x-1/2',
  end: 'end-0',
} as const;

/**
 * Where the desktop dropdown stops fitting. Below it the panel is 312px of
 * calendar hung off a field inside a 320px screen — it overflowed sideways and
 * showed a single cramped month. Narrow viewports get a bottom sheet instead.
 */
const SHEET_BELOW = '(max-width: 639px)';

/**
 * A booking.com-style range calendar: two months side by side, one continuous
 * band from arrival to departure, and a live preview of the stay while the
 * guest is still hunting for a departure date.
 *
 * Replaces the pair of `<input type="date">` fields, which opened two unrelated
 * native pickers — the guest had to hold the range in their head and never saw
 * the nights they were about to book.
 */
export function DateRangePicker({
  start,
  end,
  onChange,
  min,
  blockedDates = NO_BLOCKED_DATES,
  stacked = false,
  fieldClassName,
  dividerClassName,
  align = 'center',
  className,
}: DateRangePickerProps) {
  const t = useTranslations('filter');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const dfLocale = isRtl ? ar : enUS;

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<'start' | 'end'>('start');
  const [hover, setHover] = useState('');
  const [month, setMonth] = useState<Date>(
    () => startOfMonth(fromISO(start) ?? fromISO(min) ?? new Date()),
  );
  // Only read after mount, and the panel only exists once the guest has opened
  // it, so this can never disagree with the server-rendered markup.
  const [asSheet, setAsSheet] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(SHEET_BELOW);
    const sync = () => setAsSheet(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Dismiss on an outside press or Escape. Bound only while open, so a page
  // full of these does not keep listeners alive for panels nobody can see.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      // The sheet lives on <body>, not inside the bar, so it has to be asked
      // separately — otherwise every tap on a day dismissed the calendar.
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const weekdays = useMemo(() => {
    // 2024-01-07 is a Sunday. Arabic gets the narrow names because the
    // abbreviated ones ("أربعاء") are far wider than a 40px column.
    const base = startOfWeek(new Date(2024, 0, 7), { weekStartsOn: WEEK_STARTS_ON });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(base, i), isRtl ? 'EEEEE' : 'EEE', { locale: dfLocale }),
    );
  }, [dfLocale, isRtl]);

  const openAt = (which: 'start' | 'end') => {
    const anchor = which === 'end' ? end || start : start;
    setFocus(which);
    setMonth(startOfMonth(fromISO(anchor) ?? fromISO(min) ?? new Date()));
    setOpen(true);
  };

  const pick = (iso: string) => {
    if (focus === 'end' && start && iso > start && !firstBlockedBetween(start, iso, blockedDates)) {
      onChange({ start, end: iso });
      setFocus('start');
      setHover('');
      setOpen(false);
      return;
    }
    // Anything else opens a fresh range — including a day on or before the
    // arrival (a zero- or negative-night stay) or one that would span over a
    // blocked night in between (an occupied night with no way to book it).
    onChange({ start: iso, end: '' });
    setFocus('end');
    setHover('');
  };

  const clear = () => {
    onChange({ start: '', end: '' });
    setFocus('start');
    setHover('');
  };

  // While the guest hunts for a departure the band follows the cursor, so the
  // length of the stay is visible before they commit to it. Clipped to the
  // night before the first blocked date so the band never appears to cover a
  // night that `pick()` would refuse to book.
  const rawPreviewEnd = !end && focus === 'end' && start && hover > start ? hover : '';
  const previewBlock = rawPreviewEnd ? firstBlockedBetween(start, rawPreviewEnd, blockedDates) : '';
  const previewEnd = previewBlock ? toISO(addDays(fromISO(previewBlock)!, -1)) : rawPreviewEnd;
  const rangeEnd = end || previewEnd;

  const nights =
    start && end
      ? Math.round((fromISO(end)!.getTime() - fromISO(start)!.getTime()) / 86400000)
      : 0;

  const label = (iso: string) => {
    const d = fromISO(iso);
    return d ? format(d, isRtl ? 'EEE، d MMM' : 'EEE, d MMM', { locale: dfLocale }) : '';
  };

  const atFloor = month.getTime() <= startOfMonth(fromISO(min) ?? new Date()).getTime();

  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;

  const segment = (which: 'start' | 'end') => {
    const value = which === 'start' ? start : end;
    return (
      <button
        type="button"
        onClick={() => openAt(which)}
        aria-haspopup="dialog"
        aria-expanded={open && focus === which}
        className={cn(
          fieldClassName,
          'cursor-pointer text-start',
          open && focus === which && 'bg-brand-cream/70 md:bg-brand-cream/70',
        )}
      >
        {stacked ? (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[11px] font-semibold leading-tight text-brand-ink">
              {which === 'start' ? t('checkIn') : t('checkOut')}
            </span>
            <span
              className={cn(
                'truncate text-sm leading-snug',
                value ? 'font-medium text-brand-ink' : 'text-brand-muted',
              )}
            >
              {value ? label(value) : t('addDates')}
            </span>
          </span>
        ) : (
          <>
            <span className="shrink-0 text-sm text-brand-muted">
              {which === 'start' ? t('checkIn') : t('checkOut')}
            </span>
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm',
                value ? 'font-medium text-brand-ink' : 'text-brand-muted/70',
              )}
            >
              {value ? label(value) : t('addDates')}
            </span>
          </>
        )}
      </button>
    );
  };

  /** The calendar itself — the same markup in the dropdown and in the sheet. */
  const calendar = (
    <>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={atFloor}
          aria-label={t('prevMonth')}
          className="rounded-full p-1.5 text-brand-ink transition hover:bg-brand-cream disabled:pointer-events-none disabled:opacity-30"
        >
          <Prev className="h-5 w-5" />
        </button>
        {/* On a phone the two months stack, so each carries its own title
            below and this row is just the arrows. */}
        <div className="hidden flex-1 justify-around gap-6 sm:flex">
          {[0, 1].map((offset) => (
            <span key={offset} className="w-[280px] text-center text-sm font-semibold text-brand-ink">
              {format(addMonths(month, offset), 'LLLL yyyy', { locale: dfLocale })}
            </span>
          ))}
        </div>
        <span className="flex-1 sm:hidden" />
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label={t('nextMonth')}
          className="rounded-full p-1.5 text-brand-ink transition hover:bg-brand-cream"
        >
          <Next className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:gap-6">
        {[0, 1].map((offset) => (
          <div key={offset} className="w-full sm:w-[280px] sm:shrink-0">
            <p className="mb-1 text-center text-sm font-semibold text-brand-ink sm:hidden">
              {format(addMonths(month, offset), 'LLLL yyyy', { locale: dfLocale })}
            </p>
            <div className="grid grid-cols-7">
              {weekdays.map((w, i) => (
                <span
                  key={i}
                  className="py-2 text-center text-[11px] font-medium text-brand-muted"
                >
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7" onMouseLeave={() => setHover('')}>
              {monthCells(addMonths(month, offset)).map((day, i) => {
                if (!day) return <span key={i} className="h-10" />;
                const iso = toISO(day);
                const disabled = iso < min || blockedDates.has(iso);
                const spanned = Boolean(rangeEnd) && rangeEnd !== start;
                const isStart = Boolean(start) && iso === start;
                const isEnd = spanned && iso === rangeEnd;
                const inside = spanned && iso > start && iso < rangeEnd;
                return (
                  <span key={i} className="relative h-10">
                    {/* the band is a layer behind the day, so consecutive
                        cells join into one unbroken stay */}
                    {spanned && (inside || isStart || isEnd) && (
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-x-0 inset-y-0.5 bg-brand-cream',
                          isStart && 'rounded-s-full',
                          isEnd && 'rounded-e-full',
                        )}
                      />
                    )}
                    <button
                      type="button"
                      disabled={disabled}
                      aria-pressed={isStart || isEnd}
                      aria-label={format(day, 'd MMMM yyyy', { locale: dfLocale })}
                      onMouseEnter={() => setHover(iso)}
                      onFocus={() => setHover(iso)}
                      onClick={() => pick(iso)}
                      className={cn(
                        'relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm text-brand-ink transition',
                        !disabled && 'hover:bg-brand-sage/40',
                        disabled && 'cursor-not-allowed text-brand-muted/40',
                        (isStart || isEnd) &&
                          'bg-brand-primary font-semibold text-white hover:bg-brand-primary',
                      )}
                    >
                      {day.getDate()}
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-brand-border pt-3">
        <span className="text-sm text-brand-muted">
          {nights > 0
            ? t('nightsCount', { count: nights })
            : focus === 'start'
              ? t('pickCheckIn')
              : t('pickCheckOut')}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            disabled={!start && !end}
            className="rounded-full px-3 py-1.5 text-sm text-brand-ink underline-offset-4 transition hover:underline disabled:opacity-40 disabled:hover:no-underline"
          >
            {t('clearDates')}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-brand-primary px-5 py-1.5 text-sm font-medium text-white transition hover:bg-brand-primaryDark"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </>
  );

  /** From `sm` up: a panel hung under the field it belongs to. */
  const dropdown = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={focus === 'start' ? t('pickCheckIn') : t('pickCheckOut')}
      className={cn(
        'absolute top-full z-50 mt-3 max-h-[75vh] overflow-y-auto rounded-3xl border border-brand-border bg-white p-5 shadow-xl',
        ALIGN[align],
      )}
    >
      {calendar}
    </div>
  );

  /**
   * Below `sm`: a bottom sheet on <body>. Inline it would be a 312px panel
   * inside a 320px screen, clipped by the bar and painted under the sticky
   * header — the header creates its own stacking context, which is why the
   * sheet is portaled out rather than merely repositioned.
   */
  const sheet =
    typeof document === 'undefined'
      ? null
      : createPortal(
          <div className="fixed inset-0 z-[70] sm:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div
              ref={panelRef}
              role="dialog"
              aria-label={focus === 'start' ? t('pickCheckIn') : t('pickCheckOut')}
              className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
            >
              {calendar}
            </div>
          </div>,
          document.body,
        );

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative grid grid-cols-2 gap-2 md:flex md:flex-[1.6] md:items-center md:gap-1',
        className,
      )}
    >
      {segment('start')}
      <div className={cn('hidden h-9 w-px shrink-0 bg-brand-border md:block', dividerClassName)} />
      {segment('end')}

      {open && (asSheet ? sheet : dropdown)}
    </div>
  );
}

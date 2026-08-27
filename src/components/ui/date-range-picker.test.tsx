import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import arMessages from '../../../messages/ar.json';
import { DateRangePicker } from './date-range-picker';

function inDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function iso(days: number): string {
  const d = inDays(days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Stands in for the viewport. The picker asks `matchMedia` once on mount, so
 * this decides whether it will open as a dropdown or as a sheet.
 */
function viewport(narrow: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: narrow,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

const onChange = vi.fn();

function renderPicker(start = '', end = '', blocked?: ReadonlySet<string>) {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <DateRangePicker start={start} end={end} min={iso(0)} onChange={onChange} blockedDates={blocked} />
    </NextIntlClientProvider>,
  );
}

function openCalendar(container: HTMLElement) {
  fireEvent.click(container.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!);
}

/** The calendar panel, wherever it ended up being rendered. */
function panel(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[role="dialog"]');
}

function day(offset: number): HTMLButtonElement {
  const label = format(inDays(offset), 'd MMMM yyyy', { locale: ar });
  return panel()!.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
}

/**
 * The two month grids. Matched on class text — happy-dom's selector parser
 * does not take the escaped colon in Tailwind's `sm:` prefix.
 */
function monthBlocks(): HTMLElement[] {
  return Array.from(panel()!.querySelectorAll<HTMLElement>('div')).filter((d) =>
    d.className.includes('sm:w-[280px]'),
  );
}

beforeEach(() => onChange.mockClear());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('date picker on a narrow screen', () => {
  beforeEach(() => viewport(true));

  it('opens as a sheet on <body>, not as a panel clipped inside the bar', () => {
    const { container } = renderPicker();
    openCalendar(container);
    expect(panel()).toBeTruthy();
    expect(container.contains(panel())).toBe(false);
  });

  it('shows both months, since they stack instead of sitting side by side', () => {
    const { container } = renderPicker();
    openCalendar(container);
    const months = monthBlocks();
    expect(months).toHaveLength(2);
    // The second month used to be `hidden sm:block` — one cramped month was
    // all a phone ever got.
    expect(months.every((m) => !m.className.split(' ').includes('hidden'))).toBe(true);
  });

  it('still picks a range — the sheet is not merely decorative', () => {
    const { container } = renderPicker();
    openCalendar(container);
    fireEvent.click(day(3));
    expect(onChange).toHaveBeenCalledWith({ start: iso(3), end: '' });
  });

  it('does not dismiss itself when a day inside the sheet is pressed', () => {
    const { container } = renderPicker();
    openCalendar(container);
    fireEvent.pointerDown(day(3));
    expect(panel()).toBeTruthy();
  });

  it('closes on a press outside it', () => {
    const { container } = renderPicker();
    openCalendar(container);
    fireEvent.pointerDown(document.body);
    expect(panel()).toBeNull();
  });
});

describe('date picker on a wide screen', () => {
  beforeEach(() => viewport(false));

  it('stays a dropdown anchored inside the bar', () => {
    const { container } = renderPicker();
    openCalendar(container);
    expect(panel()).toBeTruthy();
    expect(container.contains(panel())).toBe(true);
  });

  it('shows the same two months', () => {
    const { container } = renderPicker();
    openCalendar(container);
    expect(monthBlocks()).toHaveLength(2);
  });
});

describe('blocked dates — nights another guest already holds', () => {
  beforeEach(() => viewport(false));

  it('disables a blocked day — clicking it fires no onChange', () => {
    const { container } = renderPicker('', '', new Set([iso(5)]));
    openCalendar(container);
    expect(day(5).disabled).toBe(true);
    fireEvent.click(day(5));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('leaves the changeover day pickable — a stay ending on a blocked night frees the day after it', () => {
    const { container } = renderPicker('', '', new Set([iso(5)]));
    openCalendar(container);
    expect(day(6).disabled).toBe(false);
  });

  // `onChange` is a bare spy here — it never feeds a picked arrival back in
  // as the `start` prop, so these two open straight on the departure field
  // with `start` already set, rather than clicking arrival first and relying
  // on a prop update the harness can't produce.
  function openOnDeparture(container: HTMLElement) {
    const fields = container.querySelectorAll<HTMLButtonElement>('button[aria-haspopup="dialog"]');
    fireEvent.click(fields[1]!);
  }

  it('commits a range that lands entirely clear of the blocked night', () => {
    const { container } = renderPicker(iso(2), '', new Set([iso(5)]));
    openOnDeparture(container);
    fireEvent.click(day(4));
    expect(onChange).toHaveBeenCalledWith({ start: iso(2), end: iso(4) });
  });

  it('refuses an end date that would span over a blocked night, and starts a fresh range from it instead', () => {
    const { container } = renderPicker(iso(3), '', new Set([iso(5)]));
    openOnDeparture(container);
    fireEvent.click(day(7)); // would occupy the blocked night of day 5
    expect(onChange).toHaveBeenCalledWith({ start: iso(7), end: '' });
  });
});

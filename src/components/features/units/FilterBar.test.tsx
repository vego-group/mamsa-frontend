import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import arMessages from '../../../../messages/ar.json';
import { FilterBar } from './FilterBar';
import { useSearchStore, todayISO } from '@/stores/search';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

function inDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function isoInDays(days: number): string {
  const d = inDays(days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderBar() {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <FilterBar />
    </NextIntlClientProvider>,
  );
}

/** The arrival / departure fields of the bar, in document order. */
function dateFields(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button[aria-haspopup="dialog"]'));
}

/** A day inside the open calendar, addressed the way a screen reader would. */
function day(container: HTMLElement, offset: number): HTMLButtonElement {
  const label = format(inDays(offset), 'd MMMM yyyy', { locale: ar });
  const found = container.querySelector<HTMLButtonElement>(
    `[role="dialog"] button[aria-label="${label}"]`,
  );
  if (!found) throw new Error(`no day button for ${label}`);
  return found;
}

/** The city / unit-type / guests dropdowns of the bar, in document order. */
function selectTriggers(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button[role="combobox"]'));
}

function options(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('[role="option"]'));
}

/** The `?…` the bar hands to /units on submit. */
function submitted(container: HTMLElement): URLSearchParams {
  const submit = Array.from(container.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === arMessages.filter.search,
  );
  fireEvent.click(submit!);
  return new URL(push.mock.calls.at(-1)![0] as string, 'http://x').searchParams;
}

beforeEach(() => {
  useSearchStore.getState().reset();
  push.mockClear();
});
afterEach(cleanup);

describe('Search bar — the stay it hands on is always one a listing can honour', () => {
  /**
   * The booking widget refuses an arrival before today. When the bar accepted
   * one anyway, the stay was dropped on the way to the listing and every
   * booking widget opened on an empty calendar — indistinguishable from the
   * carry-over being broken.
   */
  it('floors the calendar at today: yesterday is present but dead', () => {
    const { container } = renderBar();
    fireEvent.click(dateFields(container)[0]!);

    expect(day(container, 0).hasAttribute('disabled')).toBe(false);
    // Yesterday only exists in the grid when today is not the 1st.
    if (new Date().getDate() > 1) {
      expect(day(container, -1).hasAttribute('disabled')).toBe(true);
    }
  });

  /**
   * The guest may pick dates on the home page and click a listing without ever
   * pressing "search", so publishing on submit alone would lose them.
   */
  it('publishes a picked stay immediately, before any search is submitted', () => {
    const { container } = renderBar();
    fireEvent.click(dateFields(container)[0]!);

    fireEvent.click(day(container, 5));
    expect(useSearchStore.getState().start).toBe(isoInDays(5));

    fireEvent.click(day(container, 8));
    expect(useSearchStore.getState().end).toBe(isoInDays(8));
  });

  /**
   * Second click lands on or before the arrival: read as a departure that would
   * be a zero- or negative-night stay, which the booking widget rejects. It has
   * to restart the range instead.
   */
  it('restarts the range when the second pick is not after the arrival', () => {
    const { container } = renderBar();
    fireEvent.click(dateFields(container)[0]!);

    fireEvent.click(day(container, 8));
    fireEvent.click(day(container, 5));

    expect(useSearchStore.getState().start).toBe(isoInDays(5));
    expect(useSearchStore.getState().end).toBe('');
  });

  /** Completing a range closes the calendar — the guest has nothing left to do in it. */
  it('closes once both ends are picked', () => {
    const { container } = renderBar();
    fireEvent.click(dateFields(container)[0]!);

    fireEvent.click(day(container, 5));
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();

    fireEvent.click(day(container, 8));
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  /** Opening on the departure field with nothing picked still has to take an arrival first. */
  it('treats the first pick as the arrival even when opened on the departure field', () => {
    const { container } = renderBar();
    fireEvent.click(dateFields(container)[1]!);

    fireEvent.click(day(container, 5));

    expect(useSearchStore.getState().start).toBe(isoInDays(5));
    expect(useSearchStore.getState().end).toBe('');
  });
});

describe('Search bar — the city list covers the whole Kingdom', () => {
  /**
   * The bar used to offer seven hardcoded cities, so a guest looking for a stay
   * in Khamis Mushait or Al Ahsa had no way to ask for one from the home page.
   */
  it('offers every region and its governorates, not a shortlist', () => {
    const { container } = renderBar();
    fireEvent.click(selectTriggers(container)[0]!);

    const labels = options(container).map((o) => o.textContent);
    expect(labels.length).toBeGreaterThan(100);
    for (const city of ['خميس مشيط', 'الأحساء', 'سكاكا', 'فيفا', 'نيوم']) {
      expect(labels).toContain(city);
    }
  });

  /**
   * Nobody types the definite article or the hamza seats when searching. Folding
   * both sides is what keeps "احساء" and "طايف" from returning nothing.
   */
  it('matches a city typed without its "ال" or its hamzas', () => {
    const { container } = renderBar();
    fireEvent.click(selectTriggers(container)[0]!);
    const search = container.querySelector<HTMLInputElement>(
      `input[placeholder="${arMessages.filter.searchCity}"]`,
    )!;

    fireEvent.change(search, { target: { value: 'احساء' } });
    expect(options(container).map((o) => o.textContent)).toContain('الأحساء');

    fireEvent.change(search, { target: { value: 'طايف' } });
    expect(options(container).map((o) => o.textContent)).toContain('الطائف');
  });

  /** The English name has to find the city too — the list is bilingual, the value is not. */
  it('finds a city by its English name while the interface is Arabic', () => {
    const { container } = renderBar();
    fireEvent.click(selectTriggers(container)[0]!);
    const search = container.querySelector<HTMLInputElement>(
      `input[placeholder="${arMessages.filter.searchCity}"]`,
    )!;

    fireEvent.change(search, { target: { value: 'jeddah' } });
    expect(options(container).map((o) => o.textContent)).toContain('جدة');
  });

  /**
   * The Arabic name is the backend's key for the city, so it is what has to
   * survive into `?city=` — never the English label shown in the EN locale.
   */
  it('submits the Arabic city name the backend filters by', () => {
    const { container } = renderBar();
    fireEvent.click(selectTriggers(container)[0]!);
    fireEvent.click(options(container).find((o) => o.textContent === 'خميس مشيط')!);

    expect(submitted(container).get('city')).toBe('خميس مشيط');
  });

  /** "كل المدن" is a reset, not a city — it must not travel as a filter value. */
  it('drops the city from the search when the list is reset to all cities', () => {
    const { container } = renderBar();
    fireEvent.click(selectTriggers(container)[0]!);
    fireEvent.click(options(container).find((o) => o.textContent === 'جدة')!);
    fireEvent.click(selectTriggers(container)[0]!);
    fireEvent.click(options(container).find((o) => o.textContent === arMessages.filter.allCities)!);

    expect(submitted(container).has('city')).toBe(false);
  });
});

describe('Search bar on a phone', () => {
  /**
   * The one-line trigger that stands in for the whole form below `md`. Matched
   * on the class text rather than a selector: happy-dom's parser does not take
   * the escaped colon in `md\:hidden`.
   */
  function summary(container: HTMLElement): HTMLButtonElement {
    return Array.from(container.querySelectorAll('button')).find((b) =>
      b.className.includes('md:hidden'),
    )!;
  }

  /** The full-screen form, portaled onto <body>. */
  function sheet(): HTMLElement | null {
    return (
      Array.from(document.body.querySelectorAll<HTMLElement>('div')).find((d) =>
        d.className.includes('z-[60]'),
      ) ?? null
    );
  }

  it('collapses to a summary line instead of five stacked rows', () => {
    const { container } = renderBar();
    const line = summary(container);
    expect(line).toBeTruthy();
    // Nothing picked yet, so it invites dates and states the default party.
    expect(line.textContent).toContain(arMessages.filter.addDates);
    expect(line.textContent).toContain(arMessages.filter.allCities);
  });

  it('reads back the stay once one is picked', () => {
    const { container } = renderBar();
    fireEvent.click(dateFields(container)[0]!);
    fireEvent.click(day(container, 5));
    fireEvent.click(day(container, 8));
    expect(summary(container).textContent).not.toContain(arMessages.filter.addDates);
    expect(summary(container).textContent).toContain(
      format(inDays(5), 'd MMM', { locale: ar }),
    );
  });

  it('opens the full form as a sheet, and closes it again', () => {
    const { container } = renderBar();
    expect(sheet()).toBeNull();
    fireEvent.click(summary(container));
    expect(sheet()).toBeTruthy();

    const close = sheet()!.querySelector<HTMLButtonElement>(
      `button[aria-label="${arMessages.filter.close}"]`,
    )!;
    fireEvent.click(close);
    expect(sheet()).toBeNull();
  });

  it('closes the sheet when the search is submitted', () => {
    const { container } = renderBar();
    fireEvent.click(summary(container));
    const submit = Array.from(sheet()!.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === arMessages.filter.search,
    )!;
    fireEvent.click(submit);
    expect(sheet()).toBeNull();
    expect(push).toHaveBeenCalled();
  });
});

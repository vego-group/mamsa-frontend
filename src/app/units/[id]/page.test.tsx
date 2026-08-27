import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import UnitDetailsPage from './page';
import { useSearchStore } from '@/stores/search';
import { formatSAR } from '@/lib/utils/format';

const UNIT_ID = 'U-001'; // pricePerNight 1200, capacity 8 in mock data
const pushMock = vi.fn();
/** The link the listing was opened with — reassigned per test. */
let linkParams = new URLSearchParams();

/**
 * Dates must be relative to now. Hardcoded ones silently drift into the past,
 * the widget then refuses them and renders no estimate, and this file goes
 * permanently red — masking any real regression in it.
 */
function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: UNIT_ID }),
  useSearchParams: () => linkParams,
  useRouter: () => ({ push: pushMock }),
}));

function renderUnitPage() {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <UnitDetailsPage />
    </NextIntlClientProvider>,
  );
}

async function waitForUnitToLoad() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(350);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  pushMock.mockClear();
  // The widget now carries the stay between listings, so dates picked in one
  // test would prefill the next one's empty-state assertions.
  useSearchStore.getState().reset();
  linkParams = new URLSearchParams();
});

/** The two date inputs of the booking widget, in document order. */
function dateInputs(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input[type="date"]'));
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Unit details — booking widget shows the final VAT-inclusive price', () => {
  it('renders no service fee row and adds nothing to the nightly rate, once dates are picked', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    const [checkInInput, checkOutInput] = dateInputs(container);
    fireEvent.change(checkInInput!, { target: { value: isoInDays(30) } });
    fireEvent.change(checkOutInput!, { target: { value: isoInDays(34) } });

    // 1200/night × 4 nights = 4800, no fee added.
    expect(screen.getByText(formatSAR(4800))).toBeTruthy();

    // No service fee row, no old "total" label — the widget never computed one.
    expect(screen.queryByText('رسوم الخدمة')).toBeNull();
    expect(screen.queryByText('المجموع')).toBeNull();

    // Stated as final and VAT-inclusive — the old "estimate" caveat is gone,
    // and must not come back: it tells the guest the number may still grow.
    expect(screen.getByText('السعر النهائي شامل ضريبة القيمة المضافة. لا توجد رسوم إضافية.')).toBeTruthy();
    expect(screen.queryByText(/سعر تقديري/)).toBeNull();
  });

  it('shows nothing from the price widget before dates are picked', async () => {
    renderUnitPage();
    await waitForUnitToLoad();

    expect(screen.queryByText('رسوم الخدمة')).toBeNull();
    expect(screen.queryByText(/شامل ضريبة القيمة المضافة/)).toBeNull();
  });
});

/**
 * A guest who has already told us when they're travelling — on the home page's
 * search bar, or on the results page — must not be asked a second time the
 * moment they open a listing.
 */
describe('Unit details — the stay follows the guest into the listing', () => {
  it('opens on the dates the link carries over from the search results', async () => {
    const start = isoInDays(20);
    const end = isoInDays(23); // 3 nights
    linkParams = new URLSearchParams({ start, end, guests: '2' });

    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    const [checkInInput, checkOutInput] = dateInputs(container);
    expect(checkInInput!.value).toBe(start);
    expect(checkOutInput!.value).toBe(end);
    expect(container.querySelector('select')!.value).toBe('2');

    // Priced straight away — 1200 × 3 — with the calendar never touched.
    expect(screen.getByText(formatSAR(3600))).toBeTruthy();
    expect(screen.queryByText('اختر تاريخ الوصول والمغادرة')).toBeNull();
  });

  it('reuses the stay picked on an earlier screen when the link carries none', async () => {
    const start = isoInDays(10);
    const end = isoInDays(12);
    useSearchStore.getState().setStay({ start, end, guests: 3 });

    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    const [checkInInput, checkOutInput] = dateInputs(container);
    expect(checkInInput!.value).toBe(start);
    expect(checkOutInput!.value).toBe(end);
    expect(container.querySelector('select')!.value).toBe('3');
  });

  it('publishes dates picked here, so the next listing opens on them too', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    const [checkInInput, checkOutInput] = dateInputs(container);
    fireEvent.change(checkInInput!, { target: { value: isoInDays(40) } });
    fireEvent.change(checkOutInput!, { target: { value: isoInDays(42) } });

    expect(useSearchStore.getState().start).toBe(isoInDays(40));
    expect(useSearchStore.getState().end).toBe(isoInDays(42));
  });

  it('drops a stay that has already started instead of prefilling a range the widget refuses', async () => {
    linkParams = new URLSearchParams({ start: isoInDays(-5), end: isoInDays(-1) });

    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    const [checkInInput, checkOutInput] = dateInputs(container);
    expect(checkInInput!.value).toBe('');
    expect(checkOutInput!.value).toBe('');
    expect(screen.getByText('اختر تاريخ الوصول والمغادرة')).toBeTruthy();
  });
});

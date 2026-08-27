import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import arMessages from '../../../../messages/ar.json';
import UnitDetailsPage from './page';
import { useSearchStore } from '@/stores/search';
import { formatSAR } from '@/lib/utils/format';
import { unitsApi } from '@/lib/api/client';
import { MOCK_UNITS } from '@/data/mock/units';

const UNIT_ID = 'U-001'; // pricePerNight 1200, capacity 8 in mock data
const pushMock = vi.fn();
/** The link the listing was opened with — reassigned per test. */
let linkParams = new URLSearchParams();

/**
 * Dates must be relative to now. Hardcoded ones silently drift into the past,
 * the widget then refuses them and renders no estimate, and this file goes
 * permanently red — masking any real regression in it.
 */
function inDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/** Local, like the calendar's own days: `toISOString` is UTC and east of
 *  Greenwich hands back yesterday for anything before 03:00. */
function isoInDays(days: number): string {
  const d = inDays(days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

/** The arrival / departure fields of the booking widget, in document order. */
function dateFields(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button[aria-haspopup="dialog"]'));
}

/** The guests dropdown of the booking widget — the only one on the page. */
function guestsField(container: HTMLElement): HTMLButtonElement {
  return container.querySelector<HTMLButtonElement>('button[role="combobox"]')!;
}

/** How that dropdown reads for a party of `n`. */
function guestsLabel(n: number): string {
  return arMessages.unit.guestOption.replace('{count}', String(n));
}

/** How a field reads once a day is on it — the calendar's own label. */
function dateLabel(days: number): string {
  return format(inDays(days), 'EEE، d MMM', { locale: ar });
}

/**
 * Picks a stay the way a guest does: open the calendar on the arrival field,
 * click arrival, click departure. Offsets must stay inside the two months the
 * panel shows — the worst case (the 31st of a month before February) leaves
 * only 28 days of headroom.
 */
function pickStay(container: HTMLElement, from: number, to: number): void {
  fireEvent.click(dateFields(container)[0]!);
  for (const offset of [from, to]) {
    const label = format(inDays(offset), 'd MMMM yyyy', { locale: ar });
    const day = container.querySelector<HTMLButtonElement>(
      `[role="dialog"] button[aria-label="${label}"]`,
    );
    if (!day) throw new Error(`no day button for ${label}`);
    fireEvent.click(day);
  }
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

    // +9..+12 is U-001's own seeded `pending_payment` fixture (BK-008) — the
    // calendar now correctly disables those nights, so this stay has to clear
    // that window to land on a pickable pair of days.
    pickStay(container, 16, 20);

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

    const [checkInField, checkOutField] = dateFields(container);
    expect(checkInField!.textContent).toContain(dateLabel(20));
    expect(checkOutField!.textContent).toContain(dateLabel(23));
    expect(guestsField(container).textContent).toContain(guestsLabel(2));

    // Priced straight away — 1200 × 3 — with the calendar never touched.
    expect(screen.getByText(formatSAR(3600))).toBeTruthy();
    expect(screen.queryByText('اختر تاريخ الوصول والمغادرة')).toBeNull();
  });

  it('reuses the stay picked on an earlier screen when the link carries none', async () => {
    useSearchStore.getState().setStay({ start: isoInDays(10), end: isoInDays(12), guests: 3 });

    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    const [checkInField, checkOutField] = dateFields(container);
    expect(checkInField!.textContent).toContain(dateLabel(10));
    expect(checkOutField!.textContent).toContain(dateLabel(12));
    expect(guestsField(container).textContent).toContain(guestsLabel(3));
  });

  it('publishes dates picked here, so the next listing opens on them too', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    pickStay(container, 18, 20);

    expect(useSearchStore.getState().start).toBe(isoInDays(18));
    expect(useSearchStore.getState().end).toBe(isoInDays(20));
  });

  it('drops a stay that has already started instead of prefilling a range the widget refuses', async () => {
    linkParams = new URLSearchParams({ start: isoInDays(-5), end: isoInDays(-1) });

    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    for (const field of dateFields(container)) {
      expect(field.textContent).toContain(arMessages.filter.addDates);
    }
    expect(screen.getByText('اختر تاريخ الوصول والمغادرة')).toBeTruthy();
  });
});

describe('Unit details — a listing no guest has scored yet', () => {
  /**
   * The backend's placeholder zeroes on an otherwise real fixture unit. The
   * fixture is read straight from the module, not fetched: these tests run on
   * fake timers, and the API's simulated latency would never fire.
   */
  async function renderUnscored() {
    const real = MOCK_UNITS.find((u) => u.id === UNIT_ID)!;
    vi.spyOn(unitsApi, 'getById').mockResolvedValue({ ...real, rating: 0, reviewCount: 0 });
    vi.spyOn(unitsApi, 'getReviews').mockResolvedValue([]);
    const view = renderUnitPage();
    await waitForUnitToLoad();
    return view;
  }

  it('never prints a zero score or the "جيد" grade that came with it', async () => {
    const { container } = await renderUnscored();
    expect(container.textContent).not.toContain(arMessages.unit.ratingLabel.good);
    expect(container.textContent).not.toContain(
      arMessages.unit.basedOn.replace('{count}', '0'),
    );
  });

  it('says it is new instead, in place of the score summary', async () => {
    const { container } = await renderUnscored();
    expect(container.textContent).toContain(arMessages.unit.newListingTitle);
    expect(container.textContent).toContain(arMessages.card.newListing);
  });

  it('drops the review-count link that would have read "0 تقييمًا"', async () => {
    const { container } = await renderUnscored();
    expect(container.querySelector('a[href="#reviews"]')).toBeNull();
  });

  it('still shows the real score when there is one', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();
    expect(container.textContent).not.toContain(arMessages.unit.newListingTitle);
    expect(container.querySelector('a[href="#reviews"]')).toBeTruthy();
  });
});

describe('Unit details — the mobile book bar', () => {
  /** The sheet's own close button is the cheapest proof it is mounted. */
  function sheet(container: HTMLElement): HTMLElement | null {
    return container.querySelector<HTMLElement>('.fixed.inset-0.z-50');
  }

  /** The CTA in the fixed bar at the bottom of the screen. */
  function barCta(container: HTMLElement): HTMLButtonElement {
    const bar = container.querySelector<HTMLElement>('.fixed.bottom-0')!;
    return bar.querySelector<HTMLButtonElement>('button')!;
  }

  it('opens the booking sheet instead of scrolling to the bottom of the page', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();
    expect(sheet(container)).toBeNull();
    fireEvent.click(barCta(container));
    expect(sheet(container)).toBeTruthy();
  });

  it('brings the calendar with it — the whole point of the sheet', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();
    const before = dateFields(container).length;
    fireEvent.click(barCta(container));
    // The sheet renders the same booking body, so its own pair joins the DOM.
    expect(dateFields(container).length).toBe(before + 2);
  });

  it('asks for dates before it offers to book', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();
    expect(barCta(container).textContent).toContain(arMessages.unit.pickDatesShort);
  });

  it('switches to the CTA once a stay is picked, and counts the nights', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();
    pickStay(container, 3, 6);
    expect(barCta(container).textContent).toContain(arMessages.unit.bookNow);
    const bar = container.querySelector<HTMLElement>('.fixed.bottom-0')!;
    expect(bar.textContent).toContain(arMessages.unit.nightsCount.replace('{count}', '3'));
  });

  it('closes again from its own close button', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();
    fireEvent.click(barCta(container));
    const close = sheet(container)!.querySelector<HTMLButtonElement>(
      `button[aria-label="${arMessages.common.close}"]`,
    )!;
    fireEvent.click(close);
    expect(sheet(container)).toBeNull();
  });
});

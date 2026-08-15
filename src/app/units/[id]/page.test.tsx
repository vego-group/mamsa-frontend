import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import UnitDetailsPage from './page';
import { formatSAR } from '@/lib/utils/format';

const UNIT_ID = 'U-001'; // pricePerNight 1200 in mock data
const pushMock = vi.fn();

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
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Unit details — booking widget shows the final VAT-inclusive price', () => {
  it('renders no service fee row and adds nothing to the nightly rate, once dates are picked', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    const [checkInInput, checkOutInput] = Array.from(container.querySelectorAll('input[type="date"]'));
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

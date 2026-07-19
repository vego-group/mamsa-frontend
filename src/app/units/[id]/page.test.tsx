import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import UnitDetailsPage from './page';
import { formatSAR } from '@/lib/utils/format';

const UNIT_ID = 'U-001'; // pricePerNight 1200 in mock data
const pushMock = vi.fn();

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

describe('Unit details — booking-preview widget shows a subtotal-only estimate', () => {
  it('renders no service fee row and computes no fee, once dates are picked', async () => {
    const { container } = renderUnitPage();
    await waitForUnitToLoad();

    const [checkInInput, checkOutInput] = Array.from(container.querySelectorAll('input[type="date"]'));
    fireEvent.change(checkInInput!, { target: { value: '2026-08-01' } });
    fireEvent.change(checkOutInput!, { target: { value: '2026-08-05' } });

    // 1200/night × 4 nights (2026-08-01 → 2026-08-05) = 4800, no fee added.
    expect(screen.getByText(formatSAR(4800))).toBeTruthy();

    // No service fee row, no old "total" label — the widget never computed one.
    expect(screen.queryByText('رسوم الخدمة')).toBeNull();
    expect(screen.queryByText('المجموع')).toBeNull();

    // Clearly framed as an estimate, not a final price.
    expect(screen.getByText('سعر تقديري — يشمل السعر النهائي والضريبة عند اختيار تواريخك في صفحة الحجز')).toBeTruthy();
  });

  it('shows nothing from the price widget before dates are picked', async () => {
    renderUnitPage();
    await waitForUnitToLoad();

    expect(screen.queryByText('رسوم الخدمة')).toBeNull();
    expect(screen.queryByText(/سعر تقديري/)).toBeNull();
  });
});

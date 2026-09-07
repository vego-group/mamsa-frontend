import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../messages/ar.json';
import { ComplaintsCard } from './complaints-card';
import { complaintsApi } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

const T = arMessages.complaints;

const renderCard = () =>
  render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <ComplaintsCard />
    </NextIntlClientProvider>,
  );

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ComplaintsCard — the guest's complaints on the account page", () => {
  it('reads an empty list as the ordinary state, not a fault', async () => {
    vi.spyOn(complaintsApi, 'list').mockResolvedValue([]);
    renderCard();

    expect(await screen.findByText(T.list.empty)).toBeTruthy();
    expect(screen.queryByText(arMessages.common.retry)).toBeNull();
  });

  it('lists each complaint with its booking, state and Riyadh date, linking to the booking', async () => {
    vi.spyOn(complaintsApi, 'list').mockResolvedValue([
      {
        id: '7',
        status: 'under_review',
        bookingId: '101',
        bookingCode: 'NXTZ3K8L5Q',
        // 21:30 UTC is already the 7th in Riyadh.
        createdAt: '2026-09-06T21:30:00+00:00',
      },
      {
        id: '8',
        status: 'resolved_refunded',
        bookingId: '102',
        bookingCode: null,
        createdAt: null,
      },
    ]);
    renderCard();

    expect(await screen.findByText('حجز NXTZ3K8L5Q')).toBeTruthy();
    expect(screen.getByText(T.badge.under_review)).toBeTruthy();
    expect(screen.getByText(`${T.submittedOn}: 07/09/2026`)).toBeTruthy();
    // No code → the id; no date → no date line.
    expect(screen.getByText('حجز رقم 102')).toBeTruthy();
    expect(screen.getByText(T.badge.resolved_refunded)).toBeTruthy();
    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/my-reservations/101',
      '/my-reservations/102',
    ]);
  });

  it('keeps a retry for a real fault', async () => {
    const list = vi
      .spyOn(complaintsApi, 'list')
      .mockRejectedValueOnce(new ApiError(500, 'boom'))
      .mockResolvedValue([]);
    renderCard();

    fireEvent.click(await screen.findByRole('button', { name: arMessages.common.retry }));

    expect(await screen.findByText(T.list.empty)).toBeTruthy();
    expect(list).toHaveBeenCalledTimes(2);
  });
});

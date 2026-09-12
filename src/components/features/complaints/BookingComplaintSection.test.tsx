/**
 * The complaint card on a completed booking: the button lives behind the
 * 48-hour window, the five states read as the contract says (and `approved`
 * names no sum and no time), and every refusal the API can send is handled
 * by its code rather than its wording.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import { BookingComplaintSection } from './BookingComplaintSection';
import { complaintsApi } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import type { Booking, GuestComplaint } from '@/types';

const T = arMessages.complaints;

/** YYYY-MM-DD, N days from today (UTC) — the shape bookings carry. */
function daysFromToday(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Checked out today at 12:00 Riyadh: the window closes at 12:00 two days on, so it is
// open at every hour this test could run.
function completedBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: '101',
    code: 'TESTCODE',
    unitId: 'U-001',
    unitSnapshot: {
      title: 'شقة تجريبية',
      city: 'الرياض',
      country: 'السعودية',
      imageUrl: '',
      ownerName: 'مالك',
    },
    userId: 'CURRENT_USER',
    status: 'completed',
    checkInDate: daysFromToday(-1),
    checkOutDate: daysFromToday(0),
    checkOutTime: '12:00',
    nights: 1,
    guests: { adults: 2, children: 0 },
    price: { pricePerNight: 500, nights: 1, gross: 500, netBase: 434.78, vat: 65.22 },
    policySnapshot: getPolicyByTemplate('flexible'),
    isReviewed: false,
    createdAt: '2026-08-01T00:00:00Z',
    ...overrides,
  };
}

function complaint(overrides: Partial<GuestComplaint> = {}): GuestComplaint {
  return {
    id: '12',
    status: 'submitted',
    description: 'الوحدة غير مطابقة للصور المعروضة في الإعلان',
    contactedPartner: true,
    guestMessage: null,
    refundedAmount: null,
    createdAt: '2026-09-06T14:22:00+00:00',
    images: [],
    ...overrides,
  };
}

function renderSection(booking = completedBooking()) {
  const onBookingStale = vi.fn();
  render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <BookingComplaintSection booking={booking} onBookingStale={onBookingStale} />
    </NextIntlClientProvider>,
  );
  return { onBookingStale };
}

/** Builds a File of an arbitrary size without allocating the bytes. */
function fakeFile(name: string, type: string, sizeBytes = 1000): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

const VALID_DESCRIPTION = 'المكيف في غرفة النوم لا يعمل والوحدة غير نظيفة';

async function openForm() {
  fireEvent.click(await screen.findByRole('button', { name: T.submitButton }));
  await screen.findByText(T.form.title);
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(T.form.descriptionLabel), {
    target: { value: VALID_DESCRIPTION },
  });
  fireEvent.click(screen.getByRole('radio', { name: T.form.yes }));
}

const attach = (...files: File[]) =>
  fireEvent.change(document.getElementById('complaint-images') as HTMLInputElement, {
    target: { files },
  });

const submit = () => fireEvent.click(screen.getByRole('button', { name: T.form.submit }));

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k]));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('BookingComplaintSection — what a completed booking offers', () => {
  it('offers the button while the window is open and nothing has been filed', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(null);
    renderSection();

    expect(await screen.findByRole('button', { name: T.submitButton })).toBeTruthy();
    expect(screen.queryByText(T.windowClosed)).toBeNull();
  });

  it('shows the neutral deadline note, and no button, once 48 hours after check-out have passed', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(null);
    renderSection(
      completedBooking({ checkInDate: daysFromToday(-10), checkOutDate: daysFromToday(-7) }),
    );

    expect(await screen.findByText(T.windowClosed)).toBeTruthy();
    expect(screen.queryByRole('button', { name: T.submitButton })).toBeNull();
    // Neutral: it is not a fault, so there is nothing to retry.
    expect(screen.queryByText(arMessages.common.retry)).toBeNull();
  });

  it('shows the existing complaint instead of the button', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(
      complaint({ status: 'under_review' }),
    );
    renderSection();

    expect(await screen.findByText(T.status.under_review)).toBeTruthy();
    expect(screen.queryByRole('button', { name: T.submitButton })).toBeNull();
  });

  it('keeps a retry line for a real fault, never a silent blank', async () => {
    const get = vi
      .spyOn(complaintsApi, 'getForBooking')
      .mockRejectedValueOnce(new ApiError(500, 'boom'))
      .mockResolvedValue(null);
    renderSection();

    fireEvent.click(await screen.findByRole('button', { name: arMessages.common.retry }));

    expect(await screen.findByRole('button', { name: T.submitButton })).toBeTruthy();
    expect(get).toHaveBeenCalledTimes(2);
  });
});

describe('BookingComplaintSection — the five states', () => {
  it('submitted: says it was received, with the filing date on Riyadh time', async () => {
    // 21:30 UTC is already the 7th in Riyadh.
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(
      complaint({
        status: 'submitted',
        createdAt: '2026-09-06T21:30:00+00:00',
        contactedPartner: false,
      }),
    );
    renderSection();

    expect(await screen.findByText(T.status.submitted)).toBeTruthy();
    expect(screen.getByText('07/09/2026')).toBeTruthy();
    expect(screen.getByText(T.contactedNo)).toBeTruthy();
    expect(screen.getByText(T.badge.submitted)).toBeTruthy();
  });

  it('approved: says the refund is in progress — no amount, no promised time', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(
      complaint({ status: 'approved', guestMessage: 'تم قبول شكواك.', refundedAmount: null }),
    );
    renderSection();

    expect(await screen.findByText(T.status.approved)).toBeTruthy();
    expect(screen.getByText('تم قبول شكواك.')).toBeTruthy();
    // Nothing on screen names a sum of money or a number of hours.
    expect(document.body.textContent).not.toContain('ر.س');
    expect(document.body.textContent).not.toMatch(/ساع/);
  });

  it('resolved_refunded: shows the riyal figure exactly as sent, to two decimals', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(
      complaint({
        status: 'resolved_refunded',
        refundedAmount: 391.3,
        guestMessage: 'تم الاسترداد.',
      }),
    );
    renderSection();

    expect(await screen.findByText('تم استرداد 391.30 ر.س')).toBeTruthy();
    // Neither a hundredth of it nor a hundred times it.
    expect(document.body.textContent).not.toContain('3.91');
    expect(document.body.textContent).not.toContain('39,130');
  });

  it("resolved_rejected: the reason is Mamsa's message", async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(
      complaint({ status: 'resolved_rejected', guestMessage: 'الصور لا تُظهر عيبًا في الوحدة.' }),
    );
    renderSection();

    expect(await screen.findByText(T.status.resolved_rejected)).toBeTruthy();
    expect(screen.getByText('الصور لا تُظهر عيبًا في الوحدة.')).toBeTruthy();
    expect(screen.getByText(T.decision)).toBeTruthy();
  });

  // Links are Laravel signed routes: `expires` is unix seconds.
  const signedLink = (secondsFromNow: number) =>
    `https://api.mamsaa.com/complaints/12/images/1?expires=${Math.floor(Date.now() / 1000) + secondsFromNow}&signature=abc`;

  it('re-reads the complaint when a signed image link has expired', async () => {
    const url = signedLink(-60);
    const get = vi
      .spyOn(complaintsApi, 'getForBooking')
      .mockResolvedValue(complaint({ images: [{ url, mime: 'image/jpeg' }] }));
    renderSection();
    await screen.findByText(T.status.submitted);

    fireEvent.error(document.querySelector(`img[src="${url}"]`)!);
    expect(screen.getByText(T.imagesExpired)).toBeTruthy();
    expect(screen.queryByText(T.imagesFailed)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: T.reloadImages }));

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  });

  it('calls a failure on a still-valid link a load failure, not an expiry, and retries', async () => {
    const url = signedLink(600);
    const get = vi
      .spyOn(complaintsApi, 'getForBooking')
      .mockResolvedValue(complaint({ images: [{ url, mime: 'image/jpeg' }] }));
    renderSection();
    await screen.findByText(T.status.submitted);

    // The file host answered 500; the link itself has ten minutes left.
    fireEvent.error(document.querySelector(`img[src="${url}"]`)!);
    expect(screen.getByText(T.imagesFailed)).toBeTruthy();
    expect(screen.queryByText(T.imagesExpired)).toBeNull();
    expect(screen.queryByRole('button', { name: T.reloadImages })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: arMessages.common.retry }));

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    // The retry remounts the image, so a second failure is counted afresh.
    await waitFor(() => expect(document.querySelector(`img[src="${url}"]`)).toBeTruthy());
  });

  it('never blames a link that carries no expiry at all', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(
      complaint({ images: [{ url: 'https://cdn.mamsaa.com/complaints/12/1.jpg', mime: 'image/jpeg' }] }),
    );
    renderSection();
    await screen.findByText(T.status.submitted);

    fireEvent.error(document.querySelector('img[src="https://cdn.mamsaa.com/complaints/12/1.jpg"]')!);
    expect(screen.getByText(T.imagesFailed)).toBeTruthy();
    expect(screen.queryByText(T.imagesExpired)).toBeNull();
  });
});

describe('BookingComplaintSection — the form', () => {
  it('sends what was typed and attached, then shows the submission', async () => {
    const get = vi
      .spyOn(complaintsApi, 'getForBooking')
      .mockResolvedValueOnce(null)
      .mockResolvedValue(complaint({ status: 'submitted', description: VALID_DESCRIPTION }));
    const submitSpy = vi
      .spyOn(complaintsApi, 'submit')
      .mockResolvedValue({ id: '12', status: 'submitted', createdAt: '2026-09-06T14:22:00+00:00' });
    renderSection();
    await openForm();

    fillValidForm();
    expect(screen.getByText(`${Array.from(VALID_DESCRIPTION).length} / 2000`)).toBeTruthy();
    const photo = fakeFile('room.jpg', 'image/jpeg', 400_000);
    attach(photo);
    submit();

    await waitFor(() =>
      expect(submitSpy).toHaveBeenCalledWith('101', {
        description: VALID_DESCRIPTION,
        contactedPartner: true,
        images: [photo],
      }),
    );
    expect(await screen.findByText(T.status.submitted)).toBeTruthy();
    await waitFor(() => expect(screen.queryByText(T.form.title)).toBeNull());
    // The server's copy is read back — that is where the signed image links come from.
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  });

  it('points out a short description and an unanswered question before anything is sent', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(null);
    const submitSpy = vi.spyOn(complaintsApi, 'submit');
    renderSection();
    await openForm();

    fireEvent.change(screen.getByLabelText(T.form.descriptionLabel), { target: { value: 'قصير' } });
    submit();

    expect(screen.getByText(T.form.descriptionShort)).toBeTruthy();
    expect(screen.getByText(T.form.contactedRequired)).toBeTruthy();
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('refuses a wrong format, an oversize photo and a seventh file on the phone, before any upload', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(null);
    const submitSpy = vi.spyOn(complaintsApi, 'submit');
    renderSection();
    await openForm();

    attach(fakeFile('anim.gif', 'image/gif'));
    expect(screen.getByText(fill(T.form.imageWrongType, { name: 'anim.gif' }))).toBeTruthy();

    attach(fakeFile('huge.png', 'image/png', 6 * 1024 * 1024));
    expect(screen.getByText(fill(T.form.imageTooLarge, { name: 'huge.png' }))).toBeTruthy();

    attach(...Array.from({ length: 7 }, (_, i) => fakeFile(`p${i}.jpg`, 'image/jpeg')));
    expect(screen.getByText(fill(T.form.imagesTooMany, { count: 1 }))).toBeTruthy();
    expect(screen.getByText(fill(T.form.imagesCount, { count: 6, max: 6 }))).toBeTruthy();

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('shows the existing complaint, not an error, when the API says one is already there', async () => {
    const get = vi
      .spyOn(complaintsApi, 'getForBooking')
      .mockResolvedValueOnce(null)
      .mockResolvedValue(complaint({ status: 'under_review' }));
    vi.spyOn(complaintsApi, 'submit').mockRejectedValue(
      new ApiError(409, 'توجد شكوى مسجّلة على هذا الحجز بالفعل.', 'COMPLAINT_ALREADY_EXISTS'),
    );
    renderSection();
    await openForm();
    fillValidForm();
    submit();

    expect(await screen.findByText(T.status.under_review)).toBeTruthy();
    expect(screen.queryByText(T.form.submitFailed)).toBeNull();
    expect(screen.queryByText('توجد شكوى مسجّلة على هذا الحجز بالفعل.')).toBeNull();
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('closes the form and shows the deadline note when the API says the window closed', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(null);
    vi.spyOn(complaintsApi, 'submit').mockRejectedValue(
      new ApiError(422, 'انتهت مهلة تقديم الشكوى.', 'WINDOW_CLOSED'),
    );
    renderSection();
    await openForm();
    fillValidForm();
    submit();

    expect(await screen.findByText(T.windowClosed)).toBeTruthy();
    await waitFor(() => expect(screen.queryByText(T.form.title)).toBeNull());
    expect(screen.queryByRole('button', { name: T.submitButton })).toBeNull();
  });

  it.each(['WINDOW_NOT_OPEN', 'BOOKING_NOT_COMPLETED'])(
    'asks the page to refetch the booking on %s — the button should never have been offered',
    async (code) => {
      vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(null);
      vi.spyOn(complaintsApi, 'submit').mockRejectedValue(new ApiError(422, 'x', code));
      const { onBookingStale } = renderSection();
      await openForm();
      fillValidForm();
      submit();

      await waitFor(() => expect(onBookingStale).toHaveBeenCalledTimes(1));
    },
  );

  it('puts a plain 422 field error under its field and keeps the form open', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(null);
    vi.spyOn(complaintsApi, 'submit').mockRejectedValue(
      new ApiError(422, 'The given data was invalid.', undefined, undefined, undefined, {
        description: ['يجب ألا يقل الوصف عن 20 حرفًا.'],
      }),
    );
    renderSection();
    await openForm();
    fillValidForm();
    submit();

    expect(await screen.findByText('يجب ألا يقل الوصف عن 20 حرفًا.')).toBeTruthy();
    expect(screen.getByText(T.form.title)).toBeTruthy();
  });

  it("shows the server's own words for a refusal with no branch of its own, e.g. NOT_YOUR_BOOKING", async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(null);
    vi.spyOn(complaintsApi, 'submit').mockRejectedValue(
      new ApiError(403, 'هذا الحجز لا يخص حسابك.', 'NOT_YOUR_BOOKING'),
    );
    renderSection();
    await openForm();
    fillValidForm();
    submit();

    expect(await screen.findByText('هذا الحجز لا يخص حسابك.')).toBeTruthy();
  });

  it('turns the 6-per-minute throttle into retry-after copy', async () => {
    vi.spyOn(complaintsApi, 'getForBooking').mockResolvedValue(null);
    vi.spyOn(complaintsApi, 'submit').mockRejectedValue(
      new ApiError(429, 'Too Many Attempts.', 'RATE_LIMITED', 42),
    );
    renderSection();
    await openForm();
    fillValidForm();
    submit();

    expect(await screen.findByText('حاول مرة أخرى بعد 42 ثانية')).toBeTruthy();
  });
});

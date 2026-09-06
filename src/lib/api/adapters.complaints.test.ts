/**
 * `/api/v1` sends complaint money in RIYALS as a decimal, unlike the
 * dashboards' halala integers. Every test on the amount here exists to make a
 * future "÷ 100" or "× 100" fail loudly instead of quietly showing a guest a
 * refund a hundred times off.
 */
import { describe, expect, it } from 'vitest';
import {
  mapComplaintStatus,
  mapGuestComplaint,
  mapGuestComplaintRow,
  type RawGuestComplaint,
} from './adapters';

function raw(overrides: Partial<RawGuestComplaint> = {}): RawGuestComplaint {
  return {
    id: 12,
    status: 'submitted',
    description: 'الوحدة غير مطابقة للصور المعروضة',
    contacted_partner: true,
    guest_message: null,
    refunded_amount: null,
    created_at: '2026-09-06T14:22:00+00:00',
    images: [],
    ...overrides,
  };
}

describe('mapGuestComplaint — refunded_amount is riyals, read as it came', () => {
  it('keeps 391.30 as 391.3 — never divided by 100', () => {
    expect(
      mapGuestComplaint(raw({ status: 'resolved_refunded', refunded_amount: 391.3 }))
        .refundedAmount,
    ).toBe(391.3);
  });

  it('keeps a whole-riyal figure whole', () => {
    expect(mapGuestComplaint(raw({ refunded_amount: 1200 })).refundedAmount).toBe(1200);
  });

  it('reads a numeric string as the same number, without arithmetic', () => {
    expect(mapGuestComplaint(raw({ refunded_amount: '391.30' })).refundedAmount).toBe(391.3);
  });

  it('is null before the money has moved — null, undefined and "" alike', () => {
    expect(
      mapGuestComplaint(raw({ status: 'approved', refunded_amount: null })).refundedAmount,
    ).toBeNull();
    expect(mapGuestComplaint(raw({ refunded_amount: undefined })).refundedAmount).toBeNull();
    expect(mapGuestComplaint(raw({ refunded_amount: '' })).refundedAmount).toBeNull();
  });

  it('treats garbage as absent rather than showing NaN or 0', () => {
    expect(mapGuestComplaint(raw({ refunded_amount: 'n/a' })).refundedAmount).toBeNull();
  });
});

describe('mapGuestComplaint — the rest of the record', () => {
  it('maps every field', () => {
    const c = mapGuestComplaint(
      raw({
        status: 'resolved_rejected',
        guest_message: 'الصور المرفقة لا تُظهر عيبًا في الوحدة.',
        images: [{ url: 'https://s3/signed/1', mime: 'image/jpeg' }],
      }),
    );
    expect(c).toEqual({
      id: '12',
      status: 'resolved_rejected',
      description: 'الوحدة غير مطابقة للصور المعروضة',
      contactedPartner: true,
      guestMessage: 'الصور المرفقة لا تُظهر عيبًا في الوحدة.',
      refundedAmount: null,
      createdAt: '2026-09-06T14:22:00+00:00',
      images: [{ url: 'https://s3/signed/1', mime: 'image/jpeg' }],
    });
  });

  it('reads contacted_partner however Laravel serialises it', () => {
    expect(mapGuestComplaint(raw({ contacted_partner: true })).contactedPartner).toBe(true);
    expect(mapGuestComplaint(raw({ contacted_partner: 1 })).contactedPartner).toBe(true);
    expect(mapGuestComplaint(raw({ contacted_partner: '1' })).contactedPartner).toBe(true);
    expect(mapGuestComplaint(raw({ contacted_partner: false })).contactedPartner).toBe(false);
    expect(mapGuestComplaint(raw({ contacted_partner: 0 })).contactedPartner).toBe(false);
    // Boolean("0") is true — the one spelling a naive cast gets wrong.
    expect(mapGuestComplaint(raw({ contacted_partner: '0' })).contactedPartner).toBe(false);
    expect(mapGuestComplaint(raw({ contacted_partner: null })).contactedPartner).toBe(false);
  });

  it('turns an empty guest_message into null and drops images without a url', () => {
    const c = mapGuestComplaint(
      raw({
        guest_message: '',
        images: [
          { url: '', mime: 'image/png' },
          { url: 'https://s3/2', mime: null },
        ],
      }),
    );
    expect(c.guestMessage).toBeNull();
    expect(c.images).toEqual([{ url: 'https://s3/2', mime: '' }]);
  });

  it('tolerates a null images array and a missing description', () => {
    const c = mapGuestComplaint(raw({ images: null, description: undefined }));
    expect(c.images).toEqual([]);
    expect(c.description).toBe('');
  });
});

describe('mapComplaintStatus — a closed set with a harmless fallback', () => {
  it.each([
    'submitted',
    'under_review',
    'approved',
    'resolved_refunded',
    'resolved_rejected',
  ] as const)('passes %s through', (s) => expect(mapComplaintStatus(s)).toBe(s));

  it('lands an unknown status on under_review, never on a state that talks about money', () => {
    expect(mapComplaintStatus('escalated')).toBe('under_review');
    expect(mapComplaintStatus(undefined)).toBe('under_review');
    expect(mapComplaintStatus(null)).toBe('under_review');
  });
});

describe('mapGuestComplaintRow', () => {
  it('maps a list row, stringifying ids so they slot straight into a booking link', () => {
    expect(
      mapGuestComplaintRow({
        id: 7,
        status: 'under_review',
        booking_id: 101,
        booking_code: 'NXTZ3K8L5Q',
        created_at: '2026-09-01T10:00:00+03:00',
      }),
    ).toEqual({
      id: '7',
      status: 'under_review',
      bookingId: '101',
      bookingCode: 'NXTZ3K8L5Q',
      createdAt: '2026-09-01T10:00:00+03:00',
    });
  });

  it('keeps a missing booking code and date as null', () => {
    expect(mapGuestComplaintRow({ id: 7, status: 'submitted', booking_id: 101 })).toMatchObject({
      bookingCode: null,
      createdAt: null,
    });
  });
});

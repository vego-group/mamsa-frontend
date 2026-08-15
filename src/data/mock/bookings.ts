import type { Booking, PriceBreakdown } from '@/types';
import { FLEXIBLE_POLICY, MODERATE_POLICY } from '@/lib/constants/cancellation-policies';
import { quoteFromNightly } from '@/lib/pricing';

/**
 * Builds a fixture price from a GROSS nightly rate — the same split the mock
 * backend performs, so seeded bookings and freshly created ones can never
 * disagree. Rates below are VAT-inclusive; VAT is split out, never added.
 */
function priceOf(pricePerNight: number, nights: number): PriceBreakdown {
  const q = quoteFromNightly(pricePerNight, nights);
  return { pricePerNight: q.nightlyRate, nights: q.nights, gross: q.gross, netBase: q.netBase, vat: q.vat };
}

/** Booking states distributed across the 4 tabs */
export const MOCK_BOOKINGS: Booking[] = [
  // === جديدة (تأكيد قريب) ===
  {
    id: 'BK-001',
    code: 'NXTZ3K8L5Q',
    unitId: 'U-001',
    unitSnapshot: {
      title: 'فيلا فاخرة مع إطلالة على البحر',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
      ownerName: 'شركة الإقامة الذهبية',
    },
    userId: 'CURRENT_USER',
    status: 'confirmed',
    checkInDate: addDays(45),
    checkOutDate: addDays(50),
    nights: 5,
    guests: { adults: 2, children: 1 },
    price: priceOf(1200, 5),
    payment: { method: 'visa', last4: '4242', cardholderName: 'Mohamed Ahmed' },
    policySnapshot: FLEXIBLE_POLICY,
    isReviewed: false,
    createdAt: addDays(-5),
  },
  {
    id: 'BK-002',
    code: 'BK-2024-001234',
    unitId: 'U-002',
    unitSnapshot: {
      title: 'استراحة الجبل الأخضر',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      ownerName: 'أحمد المالكي',
    },
    userId: 'CURRENT_USER',
    status: 'confirmed',
    checkInDate: addDays(20),
    checkOutDate: addDays(23),
    nights: 3,
    guests: { adults: 3, children: 0 },
    price: priceOf(1200, 3),
    payment: { method: 'mada', last4: '8888' },
    policySnapshot: MODERATE_POLICY,
    isReviewed: false,
    createdAt: addDays(-2),
  },
  // === نشطة (قريبة جدًا) ===
  {
    id: 'BK-003',
    code: 'AKD92LMNVQ',
    unitId: 'U-003',
    unitSnapshot: {
      title: 'شاليه البحر الأبيض',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      ownerName: 'شركة الإقامة الذهبية',
    },
    userId: 'CURRENT_USER',
    status: 'confirmed',
    checkInDate: addDays(5),
    checkOutDate: addDays(8),
    nights: 3,
    guests: { adults: 4, children: 2 },
    price: priceOf(1200, 3),
    payment: { method: 'visa', last4: '4242' },
    policySnapshot: FLEXIBLE_POLICY,
    isReviewed: false,
    createdAt: addDays(-10),
  },
  {
    id: 'BK-004',
    code: 'XYZJ8KQNW3',
    unitId: 'U-004',
    unitSnapshot: {
      title: 'شقة المدينة العصرية',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
      ownerName: 'فاطمة العنزي',
    },
    userId: 'CURRENT_USER',
    status: 'confirmed',
    checkInDate: addDays(2),
    checkOutDate: addDays(4),
    nights: 2,
    guests: { adults: 2, children: 0 },
    price: priceOf(1200, 2),
    payment: { method: 'mada', last4: '8888' },
    policySnapshot: MODERATE_POLICY,
    isReviewed: false,
    createdAt: addDays(-15),
  },
  // === منتهية ===
  {
    id: 'BK-005',
    code: 'PASTREVIEW1',
    unitId: 'U-005',
    unitSnapshot: {
      title: 'منتجع العائلة السعيدة',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
      ownerName: 'أحمد المالكي',
    },
    userId: 'CURRENT_USER',
    status: 'completed',
    checkInDate: addDays(-30),
    checkOutDate: addDays(-25),
    nights: 5,
    guests: { adults: 4, children: 2 },
    price: priceOf(1200, 5),
    payment: { method: 'visa', last4: '4242' },
    policySnapshot: FLEXIBLE_POLICY,
    isReviewed: false,
    createdAt: addDays(-60),
  },
  {
    id: 'BK-006',
    code: 'PASTREVIEW2',
    unitId: 'U-006',
    unitSnapshot: {
      title: 'فيلا الحديقة الكبيرة',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      ownerName: 'شركة الإقامة الذهبية',
    },
    userId: 'CURRENT_USER',
    status: 'completed',
    checkInDate: addDays(-60),
    checkOutDate: addDays(-55),
    nights: 5,
    guests: { adults: 6, children: 2 },
    price: priceOf(1200, 5),
    payment: { method: 'mada', last4: '8888' },
    policySnapshot: FLEXIBLE_POLICY,
    isReviewed: false,
    createdAt: addDays(-90),
  },
  // === ملغاة ===
  {
    id: 'BK-007',
    code: 'CANCELLED01',
    unitId: 'U-002',
    unitSnapshot: {
      title: 'استراحة الجبل الأخضر',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      ownerName: 'أحمد المالكي',
    },
    userId: 'CURRENT_USER',
    status: 'cancelled',
    checkInDate: addDays(-15),
    checkOutDate: addDays(-12),
    nights: 3,
    guests: { adults: 3, children: 0 },
    price: priceOf(1200, 3),
    payment: { method: 'visa', last4: '4242' },
    policySnapshot: MODERATE_POLICY,
    isReviewed: false,
    refund: {
      amount: 2700,
      percent: 50,
      tierLabel: 'استرداد جزئي 50%',
      refundedAt: addDays(-25),
      reason: 'تغيير في خطط السفر',
      cancelledBy: 'customer',
    },
    createdAt: addDays(-40),
    cancelledAt: addDays(-25),
  },

  // === بانتظار الدفع (حجز لم يُدفع بعد) ===
  // Check-in is inside the 14-day window, so this lands in the "active" tab —
  // the exact bucket where a tab-driven badge used to render it as "مؤكد".
  {
    id: 'BK-008',
    code: 'PAYQ7M2X4T',
    unitId: 'U-001',
    unitSnapshot: {
      title: 'فيلا فاخرة مع إطلالة على البحر',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
      ownerName: 'شركة الإقامة الذهبية',
    },
    userId: 'CURRENT_USER',
    status: 'pending_payment',
    checkInDate: addDays(9),
    checkOutDate: addDays(12),
    nights: 3,
    guests: { adults: 2, children: 0 },
    price: priceOf(1200, 3),
    // No `payment` — nothing was ever charged. The real backend also leaves
    // policy_snapshot null until payment (FR-036); the mapped type is
    // non-nullable, so the adapter's template fallback is mirrored here.
    policySnapshot: FLEXIBLE_POLICY,
    isReviewed: false,
    createdAt: addDays(-1),
  },
];

/** Helper: ISO date string offset from today by N days */
function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function findBookingById(id: string): Booking | undefined {
  return MOCK_BOOKINGS.find((b) => b.id === id);
}

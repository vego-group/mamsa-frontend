import type { Review } from '@/types';

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'R-001',
    bookingId: 'BK-005',
    unitId: 'U-001',
    userId: 'CURRENT_USER',
    userName: 'نورة السالم',
    userAvatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    rating: 4,
    comment: 'فيلا جميلة جدًا وموقع ممتاز. الوحيدة للملاحظة أن المطبخ يحتاج بعض الأدوات الإضافية.',
    createdAt: '2026-04-20T10:30:00Z',
  },
  {
    id: 'R-002',
    bookingId: 'BK-006',
    unitId: 'U-001',
    userId: 'OTHER_USER',
    userName: 'سارة محمد',
    userAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'إقامة رائعة! الفيلا نظيفة جدًا وواسعة. المسبح الخاص كان مثاليًا للعائلة. المضيف كان متعاونًا جدًا وسريع الاستجابة.',
    createdAt: '2026-05-15T14:20:00Z',
  },
];

export function getReviewsForUnit(unitId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.unitId === unitId);
}

export function getReviewForBooking(bookingId: string): Review | undefined {
  return MOCK_REVIEWS.find((r) => r.bookingId === bookingId);
}

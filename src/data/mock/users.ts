import type { User, SavedCard, Transaction } from '@/types';

export const MOCK_CURRENT_USER: User = {
  id: 'CURRENT_USER',
  role: 'user',
  firstName: 'محمد',
  lastName: 'أحمد',
  email: 'mohammed.ahmed@example.com',
  phone: '+966501234567',
  createdAt: '2025-12-01T08:00:00Z',
};

export const MOCK_SAVED_CARDS: SavedCard[] = [
  { id: 'C-001', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025, isDefault: true },
  { id: 'C-002', brand: 'mastercard', last4: '8888', expMonth: 9, expYear: 2026, isDefault: false },
];

const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'T-001',
    refCode: 'REF-2024-001',
    type: 'refund',
    amount: 1200,
    description: 'استرداد من حجز ملغي',
    date: addDays(-8),
    status: 'completed',
  },
  {
    id: 'T-002',
    refCode: 'REF-2024-002',
    type: 'payment',
    amount: -7200,
    description: 'دفع حجز — فيلا الزيتون الفاخرة',
    date: addDays(-12),
    status: 'completed',
  },
  {
    id: 'T-003',
    refCode: 'REF-2024-003',
    type: 'topup',
    amount: 5000,
    description: 'إضافة رصيد',
    date: addDays(-15),
    status: 'completed',
  },
  {
    id: 'T-004',
    refCode: 'REF-2024-004',
    type: 'payment',
    amount: -4500,
    description: 'دفع حجز — شقة البحر الهادئة',
    date: addDays(-30),
    status: 'completed',
  },
  {
    id: 'T-005',
    refCode: 'REF-2024-005',
    type: 'reward',
    amount: 250,
    description: 'مكافأة إحالة صديق',
    date: addDays(-45),
    status: 'completed',
  },
];

import { Tent, Building2, TreePalm, Hotel, Umbrella, type LucideIcon } from 'lucide-react';

export interface PickCategory {
  key: string;
  label: string;
  Icon: LucideIcon;
}

/** Keys map directly to the backend `?type=` filter ('vacation' = no filter). */
export const PICK_CATEGORIES: readonly PickCategory[] = [
  { key: 'chalet', label: 'شاليهات', Icon: Tent },
  { key: 'apartment', label: 'شقق', Icon: Building2 },
  { key: 'rest', label: 'استراحات', Icon: TreePalm },
  { key: 'resort', label: 'منتجعات سياحية', Icon: Hotel },
  { key: 'vacation', label: 'إجازات', Icon: Umbrella },
];

export const DEFAULT_PICK_CATEGORY = PICK_CATEGORIES[0]!.key;

export function isValidPickCategory(key: string | undefined): boolean {
  return PICK_CATEGORIES.some((c) => c.key === key);
}

import { Home, Building2, Tent, type LucideIcon } from 'lucide-react';

export interface PickCategory {
  /** Maps directly to the backend `?type=` filter AND to the `types.*` message key. */
  key: string;
  Icon: LucideIcon;
}

export const PICK_CATEGORIES: readonly PickCategory[] = [
  { key: 'villa', Icon: Tent },
  { key: 'studio', Icon: Home },
  { key: 'apartment', Icon: Building2 },
];

export const DEFAULT_PICK_CATEGORY = PICK_CATEGORIES[0]!.key;

export function isValidPickCategory(key: string | undefined): boolean {
  return PICK_CATEGORIES.some((c) => c.key === key);
}

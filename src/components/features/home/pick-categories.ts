import { Home, Building2, Tent, type LucideIcon } from 'lucide-react';

export interface PickCategory {
  key: string;
  label: string;
  Icon: LucideIcon;
}

/** Keys map directly to the backend `?type=` filter ('vacation' = no filter). */
export const PICK_CATEGORIES: readonly PickCategory[] = [
  { key: 'villa', label: 'فلل', Icon: Tent },
  { key: 'studio', label: 'استديوهات', Icon: Home },
  { key: 'apartment', label: 'شقق', Icon: Building2 },
];

export const DEFAULT_PICK_CATEGORY = PICK_CATEGORIES[0]!.key;

export function isValidPickCategory(key: string | undefined): boolean {
  return PICK_CATEGORIES.some((c) => c.key === key);
}

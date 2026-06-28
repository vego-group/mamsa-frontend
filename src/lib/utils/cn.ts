import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** يدمج class names بأمان (tailwind-merge للتعامل مع تعارضات Tailwind) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

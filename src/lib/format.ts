/**
 * src/lib/format.ts
 *
 * Display only helpers. Nothing here is allowed to change a value, only to
 * render one, which is why none of these functions are used by the reducer.
 */

import { parseIsoDate } from '@/lib/date';
import type { IsoDate, PantryItem, Unit } from '@/types/pantry';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * '2026-09-14' becomes '14 Sep 2026'. Built by hand rather than with
 * toLocaleDateString so the output is identical on every device, whatever
 * the phone locale happens to be.
 */
export function formatDate(value: IsoDate | null): string {
  if (!value) return 'No expiry date';
  const date = parseIsoDate(value);
  if (!date) return 'No expiry date';
  const month = MONTHS[date.getUTCMonth()] ?? '';
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}

const UNIT_LABEL: Record<Unit, string> = {
  pc: 'pc',
  pack: 'pack',
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'L',
};

export function formatQuantity(quantity: number, unit: Unit): string {
  const rounded = Math.round(quantity * 100) / 100;
  const label = UNIT_LABEL[unit];
  if (unit === 'pc' || unit === 'pack') {
    const plural = rounded === 1 ? label : `${label}s`;
    return `${rounded} ${plural}`;
  }
  return `${rounded} ${label}`;
}

export function itemSubtitle(item: PantryItem, categoryName: string): string {
  return `${categoryName} · ${formatQuantity(item.quantity, item.unit)}`;
}

/** Case and accent insensitive haystack used by search. */
export function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

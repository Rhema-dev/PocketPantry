/**
 * src/state/selectors.ts
 *
 * Derived views of the state. Pure, sorted, and never stored.
 *
 * The rule the whole app follows: expiry status is computed, not saved. A
 * saved status is wrong the moment the clock passes midnight, and no amount
 * of background work makes a cached derived value trustworthy on a device
 * that can be closed for a week.
 */

import { compareByUrgency, getExpiryInfo, type ExpiryInfo } from '@/lib/expiry';
import { normalise } from '@/lib/format';
import { FALLBACK_CATEGORY_ID } from '@/lib/seed';
import type { Category, ExpiryStatus, IsoDate, PantryItem } from '@/types/pantry';

export type ConsumedFilter = 'active' | 'consumed' | 'all';

export interface ItemFilter {
  query: string;
  categoryId: string | null;
  location: PantryItem['location'] | null;
  consumed: ConsumedFilter;
}

export const EMPTY_FILTER: ItemFilter = {
  query: '',
  categoryId: null,
  location: null,
  consumed: 'active',
};

export interface DecoratedItem {
  item: PantryItem;
  category: Category;
  expiry: ExpiryInfo;
}

const UNKNOWN_CATEGORY: Category = {
  id: FALLBACK_CATEGORY_ID,
  name: 'Other',
  emoji: '📦',
  builtIn: true,
};

export function decorate(
  items: PantryItem[],
  categories: Category[],
  today: IsoDate,
  soonWindowDays: number,
): DecoratedItem[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  return items.map((item) => ({
    item,
    category: byId.get(item.categoryId) ?? UNKNOWN_CATEGORY,
    expiry: getExpiryInfo(item, today, soonWindowDays),
  }));
}

function matchesQuery(entry: DecoratedItem, query: string): boolean {
  if (query === '') return true;
  const needle = normalise(query);
  return (
    normalise(entry.item.name).includes(needle) ||
    normalise(entry.item.note).includes(needle) ||
    normalise(entry.category.name).includes(needle)
  );
}

export function selectVisible(
  decorated: DecoratedItem[],
  filter: ItemFilter,
  today: IsoDate,
  soonWindowDays: number,
): DecoratedItem[] {
  const filtered = decorated.filter((entry) => {
    if (filter.consumed === 'active' && entry.item.consumedAt !== null) return false;
    if (filter.consumed === 'consumed' && entry.item.consumedAt === null) return false;
    if (filter.categoryId !== null && entry.item.categoryId !== filter.categoryId) return false;
    if (filter.location !== null && entry.item.location !== filter.location) return false;
    return matchesQuery(entry, filter.query);
  });

  return filtered.sort((a, b) => compareByUrgency(a.item, b.item, today, soonWindowDays));
}

export interface ExpirySection {
  title: string;
  status: ExpiryStatus;
  data: DecoratedItem[];
}

/** Groups for the Expiring soon screen. Empty groups are dropped by the caller. */
export function selectExpiringSections(decorated: DecoratedItem[]): ExpirySection[] {
  const expired = decorated.filter((entry) => entry.expiry.status === 'expired');
  const soon = decorated.filter((entry) => entry.expiry.status === 'soon');
  return [
    { title: 'Past their date', status: 'expired', data: expired },
    { title: 'Use these next', status: 'soon', data: soon },
  ];
}

export interface PantryCounts {
  total: number;
  expired: number;
  soon: number;
  consumed: number;
}

export function selectCounts(decorated: DecoratedItem[]): PantryCounts {
  let expired = 0;
  let soon = 0;
  let consumed = 0;
  for (const entry of decorated) {
    if (entry.expiry.status === 'expired') expired += 1;
    else if (entry.expiry.status === 'soon') soon += 1;
    else if (entry.expiry.status === 'consumed') consumed += 1;
  }
  return {
    total: decorated.filter((entry) => entry.item.consumedAt === null).length,
    expired,
    soon,
    consumed,
  };
}

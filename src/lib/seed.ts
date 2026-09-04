/**
 * src/lib/seed.ts
 *
 * The categories every install starts with, and an optional shelf of demo
 * items used by the Settings screen and by screenshots for the case study.
 *
 * Seeding categories rather than hard coding an enum is a deliberate trade.
 * An enum would be simpler, but the moment a user wants "Baby food" the enum
 * has to become data anyway, and a migration from enum to data is a far worse
 * afternoon than starting with data.
 */

import { addDays, todayIso } from '@/lib/date';
import { createId } from '@/lib/id';
import type { Category, PantryItem } from '@/types/pantry';

export const BUILT_IN_CATEGORIES: Category[] = [
  { id: 'cat_produce', name: 'Produce', emoji: '🥬', builtIn: true },
  { id: 'cat_dairy', name: 'Dairy', emoji: '🥛', builtIn: true },
  { id: 'cat_meat', name: 'Meat and fish', emoji: '🐟', builtIn: true },
  { id: 'cat_bakery', name: 'Bakery', emoji: '🍞', builtIn: true },
  { id: 'cat_grains', name: 'Grains and pasta', emoji: '🍚', builtIn: true },
  { id: 'cat_canned', name: 'Tinned and jarred', emoji: '🥫', builtIn: true },
  { id: 'cat_frozen', name: 'Frozen', emoji: '🧊', builtIn: true },
  { id: 'cat_spices', name: 'Spices', emoji: '🧂', builtIn: true },
  { id: 'cat_drinks', name: 'Drinks', emoji: '🧃', builtIn: true },
  { id: 'cat_other', name: 'Other', emoji: '📦', builtIn: true },
];

/** The category every orphaned item falls back to. Must always exist. */
export const FALLBACK_CATEGORY_ID = 'cat_other';

interface SeedSpec {
  name: string;
  categoryId: string;
  quantity: number;
  unit: PantryItem['unit'];
  location: PantryItem['location'];
  /** Days from today. null means the item has no expiry date. */
  offset: number | null;
  note?: string;
}

const SEED_SPECS: SeedSpec[] = [
  { name: 'Greek yoghurt', categoryId: 'cat_dairy', quantity: 2, unit: 'pc', location: 'fridge', offset: -2 },
  { name: 'Chicken thighs', categoryId: 'cat_meat', quantity: 900, unit: 'g', location: 'fridge', offset: 1, note: 'Marinate before Friday' },
  { name: 'Spinach', categoryId: 'cat_produce', quantity: 1, unit: 'pack', location: 'fridge', offset: 2 },
  { name: 'Sourdough loaf', categoryId: 'cat_bakery', quantity: 1, unit: 'pc', location: 'pantry', offset: 3 },
  { name: 'Whole milk', categoryId: 'cat_dairy', quantity: 2, unit: 'l', location: 'fridge', offset: 5 },
  { name: 'Cherry tomatoes', categoryId: 'cat_produce', quantity: 400, unit: 'g', location: 'fridge', offset: 6 },
  { name: 'Chopped tomatoes', categoryId: 'cat_canned', quantity: 4, unit: 'pc', location: 'pantry', offset: 420 },
  { name: 'Basmati rice', categoryId: 'cat_grains', quantity: 5, unit: 'kg', location: 'pantry', offset: 300 },
  { name: 'Frozen peas', categoryId: 'cat_frozen', quantity: 1, unit: 'kg', location: 'freezer', offset: 210 },
  { name: 'Sea salt', categoryId: 'cat_spices', quantity: 1, unit: 'pack', location: 'pantry', offset: null },
  { name: 'Orange juice', categoryId: 'cat_drinks', quantity: 1, unit: 'l', location: 'fridge', offset: 4 },
  { name: 'Parmesan', categoryId: 'cat_dairy', quantity: 200, unit: 'g', location: 'fridge', offset: 40 },
];

export function buildSeedItems(now: Date = new Date()): PantryItem[] {
  const today = todayIso(now);
  const stamp = now.toISOString();
  return SEED_SPECS.map((spec) => ({
    id: createId(),
    name: spec.name,
    categoryId: spec.categoryId,
    quantity: spec.quantity,
    unit: spec.unit,
    location: spec.location,
    expiresOn: spec.offset === null ? null : addDays(today, spec.offset),
    note: spec.note ?? '',
    consumedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  }));
}

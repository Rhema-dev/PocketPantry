/**
 * src/storage/schema.ts
 *
 * Storage is the one place in a local first app where you are talking to a
 * past version of yourself. Whatever shipped last month is still on the
 * user's phone, and it does not have the field you added yesterday.
 *
 * Three jobs live here:
 *
 *   1. Describe the persisted envelope (a version number wrapping the data).
 *   2. Validate anything read back, because JSON.parse returns `any` and a
 *      truncated write, a downgrade or a manual edit all produce garbage.
 *   3. Migrate old envelopes forward, one small step at a time.
 *
 * The rule the validators follow: repair what can be repaired, drop what
 * cannot, never throw. A single malformed row must cost the user that row,
 * not the whole pantry.
 */

import { isIsoDate } from '@/lib/date';
import {
  DEFAULT_SETTINGS,
  LOCATIONS,
  UNITS,
  type Category,
  type PantryItem,
  type Settings,
  type StorageLocation,
  type Unit,
} from '@/types/pantry';

export const PANTRY_SCHEMA_VERSION = 1;

export interface PantryEnvelope {
  schemaVersion: number;
  items: PantryItem[];
  categories: Category[];
}

export interface SettingsEnvelope {
  schemaVersion: number;
  settings: Settings;
}

export interface ReadResult<T> {
  value: T;
  /** How many stored records were dropped as unreadable. Surfaced in Settings. */
  dropped: number;
  /** True when the envelope was written by an older schema version. */
  migrated: boolean;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asUnit(value: unknown): Unit {
  return UNITS.includes(value as Unit) ? (value as Unit) : 'pc';
}

function asLocation(value: unknown): StorageLocation {
  return LOCATIONS.includes(value as StorageLocation)
    ? (value as StorageLocation)
    : 'pantry';
}

function asQuantity(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 1;
  return Math.round(n * 100) / 100;
}

function asExpiry(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return isIsoDate(value) ? value : null;
}

function asInstant(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  return Number.isNaN(Date.parse(value)) ? fallback : value;
}

/** Returns null when the record is beyond repair, for example it has no id. */
export function parseItem(raw: unknown): PantryItem | null {
  if (!isObject(raw)) return null;
  const id = asString(raw.id);
  const name = asString(raw.name).trim();
  if (id === '' || name === '') return null;

  const created = asInstant(raw.createdAt, new Date(0).toISOString());
  return {
    id,
    name,
    categoryId: asString(raw.categoryId, 'cat_other'),
    quantity: asQuantity(raw.quantity),
    unit: asUnit(raw.unit),
    location: asLocation(raw.location),
    expiresOn: asExpiry(raw.expiresOn),
    note: asString(raw.note),
    consumedAt:
      typeof raw.consumedAt === 'string' ? asInstant(raw.consumedAt, created) : null,
    createdAt: created,
    updatedAt: asInstant(raw.updatedAt, created),
  };
}

export function parseCategory(raw: unknown): Category | null {
  if (!isObject(raw)) return null;
  const id = asString(raw.id);
  const name = asString(raw.name).trim();
  if (id === '' || name === '') return null;
  return {
    id,
    name,
    emoji: asString(raw.emoji, '📦'),
    builtIn: raw.builtIn === true,
  };
}

export function parseSettings(raw: unknown): Settings {
  if (!isObject(raw)) return { ...DEFAULT_SETTINGS };
  const days = Number(raw.soonWindowDays);
  if (!Number.isFinite(days)) return { ...DEFAULT_SETTINGS };
  return { soonWindowDays: Math.min(30, Math.max(1, Math.round(days))) };
}

/**
 * Bring any envelope we have ever written up to the current version.
 *
 * Version 0 is the shape written by the very first build, which stored a bare
 * array of items with no wrapper. It is handled here rather than deleted so
 * that anyone who installed the early build keeps their data.
 */
export function migrate(raw: unknown): { envelope: PantryEnvelope; migrated: boolean } {
  if (Array.isArray(raw)) {
    return {
      envelope: { schemaVersion: PANTRY_SCHEMA_VERSION, items: raw as PantryItem[], categories: [] },
      migrated: true,
    };
  }
  if (!isObject(raw)) {
    return {
      envelope: { schemaVersion: PANTRY_SCHEMA_VERSION, items: [], categories: [] },
      migrated: false,
    };
  }
  const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0;
  const items = Array.isArray(raw.items) ? (raw.items as unknown[]) : [];
  const categories = Array.isArray(raw.categories) ? (raw.categories as unknown[]) : [];
  return {
    envelope: {
      schemaVersion: PANTRY_SCHEMA_VERSION,
      items: items as PantryItem[],
      categories: categories as Category[],
    },
    migrated: version !== PANTRY_SCHEMA_VERSION,
  };
}

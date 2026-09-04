/**
 * src/types/pantry.ts
 *
 * The domain vocabulary. Every other file in the app speaks in these types.
 *
 * Two rules that this file exists to enforce:
 *
 *  1. A calendar date is a string, not a Date. `expiresOn` is 'YYYY-MM-DD'
 *     with no time and no zone, because "this yoghurt expires on the 14th"
 *     is a statement about a calendar, not about an instant. Storing a Date
 *     (or an ISO instant) makes the value shift across time zones and DST.
 *
 *  2. A moment in time is a full ISO 8601 string. `consumedAt`, `createdAt`
 *     and `updatedAt` are instants: they answer "when did this happen",
 *     so a zone is exactly what they need.
 */

/** 'YYYY-MM-DD'. A calendar date with no time and no zone. */
export type IsoDate = string;

/** Full ISO 8601 instant, for example '2026-09-03T18:20:11.412Z'. */
export type IsoInstant = string;

export const UNITS = ['pc', 'pack', 'g', 'kg', 'ml', 'l'] as const;
export type Unit = (typeof UNITS)[number];

export const LOCATIONS = ['pantry', 'fridge', 'freezer'] as const;
export type StorageLocation = (typeof LOCATIONS)[number];

export interface Category {
  id: string;
  name: string;
  /** A single emoji used as the category glyph in lists and chips. */
  emoji: string;
  /** True for the categories seeded on first run. Built ins cannot be deleted. */
  builtIn: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
  unit: Unit;
  location: StorageLocation;
  /** null means the item does not expire, for example salt or rice. */
  expiresOn: IsoDate | null;
  note: string;
  /** null means still in the pantry. A value means it has been used up. */
  consumedAt: IsoInstant | null;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

/** The shape a form produces. No ids and no timestamps: the reducer adds those. */
export interface ItemDraft {
  name: string;
  categoryId: string;
  quantity: number;
  unit: Unit;
  location: StorageLocation;
  expiresOn: IsoDate | null;
  note: string;
}

/** Derived, never stored. Recomputed from expiresOn every time the app reads. */
export type ExpiryStatus =
  | 'consumed'
  | 'expired'
  | 'soon'
  | 'fresh'
  | 'nonPerishable';

export interface Settings {
  /** How many days ahead counts as "expiring soon". */
  soonWindowDays: number;
}

export const DEFAULT_SETTINGS: Settings = {
  soonWindowDays: 5,
};

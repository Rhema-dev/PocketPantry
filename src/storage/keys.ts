/**
 * src/storage/keys.ts
 *
 * Every AsyncStorage key the app will ever touch, in one place.
 *
 * The namespace prefix matters more than it looks. AsyncStorage is one flat
 * key space shared by the whole app and by every library in it. An unprefixed
 * key called 'items' is a collision waiting to happen, and collisions in a
 * key value store do not error, they overwrite.
 *
 * The version segment is what makes migrations possible: v1 data stays on
 * disk untouched while v2 is written beside it, so a failed migration can
 * fall back instead of destroying the pantry.
 */

export const STORAGE_NAMESPACE = 'PocketPantry';

export const StorageKeys = {
  pantry: `${STORAGE_NAMESPACE}/v1/pantry`,
  settings: `${STORAGE_NAMESPACE}/v1/settings`,
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

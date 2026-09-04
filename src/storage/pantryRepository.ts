/**
 * src/storage/pantryRepository.ts
 *
 * The only module in the app that imports AsyncStorage.
 *
 * Everything above this line thinks in terms of "load the pantry" and "save
 * the pantry". That boundary is what makes the storage engine swappable: if
 * this app ever outgrows AsyncStorage, the rewrite touches this one file and
 * nothing else, because no component and no reducer has ever seen a key.
 *
 * It is also where every failure mode of the disk is absorbed. AsyncStorage
 * rejects when the device is out of space, when the value is corrupt, and on
 * Android when the underlying database is locked. None of those may crash a
 * screen, so this module returns results rather than throwing.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { BUILT_IN_CATEGORIES } from '@/lib/seed';
import { StorageKeys } from '@/storage/keys';
import {
  PANTRY_SCHEMA_VERSION,
  migrate,
  parseCategory,
  parseItem,
  parseSettings,
  type PantryEnvelope,
  type ReadResult,
} from '@/storage/schema';
import { DEFAULT_SETTINGS, type Category, type PantryItem, type Settings } from '@/types/pantry';

export interface PantrySnapshot {
  items: PantryItem[];
  categories: Category[];
  settings: Settings;
}

/**
 * Merge stored categories over the built in set. Built ins are re-seeded on
 * every load, so a category added in a later release shows up automatically,
 * while a user's rename and any category they created survive untouched.
 */
function mergeCategories(stored: Category[]): Category[] {
  const byId = new Map<string, Category>();
  for (const category of BUILT_IN_CATEGORIES) byId.set(category.id, category);
  for (const category of stored) {
    const existing = byId.get(category.id);
    // A built in keeps its identity but accepts a user rename.
    byId.set(category.id, existing ? { ...existing, name: category.name, emoji: category.emoji } : category);
  }
  return [...byId.values()];
}

export async function loadPantry(): Promise<ReadResult<PantrySnapshot>> {
  const [pantryRaw, settingsRaw] = await AsyncStorage.multiGet([
    StorageKeys.pantry,
    StorageKeys.settings,
  ]);

  let parsedPantry: unknown = null;
  let parsedSettings: unknown = null;

  try {
    const value = pantryRaw?.[1];
    parsedPantry = value ? JSON.parse(value) : null;
  } catch {
    parsedPantry = null;
  }
  try {
    const value = settingsRaw?.[1];
    parsedSettings = value ? JSON.parse(value) : null;
  } catch {
    parsedSettings = null;
  }

  const { envelope, migrated } = migrate(parsedPantry);

  let dropped = 0;
  const items: PantryItem[] = [];
  for (const raw of envelope.items) {
    const item = parseItem(raw);
    if (item) items.push(item);
    else dropped += 1;
  }

  const categories: Category[] = [];
  for (const raw of envelope.categories) {
    const category = parseCategory(raw);
    if (category) categories.push(category);
    else dropped += 1;
  }

  const settings = parsedSettings === null ? { ...DEFAULT_SETTINGS } : parseSettings(
    (parsedSettings as { settings?: unknown }).settings ?? parsedSettings,
  );

  return {
    value: { items, categories: mergeCategories(categories), settings },
    dropped,
    migrated,
  };
}

export async function savePantry(items: PantryItem[], categories: Category[]): Promise<void> {
  const envelope: PantryEnvelope = {
    schemaVersion: PANTRY_SCHEMA_VERSION,
    items,
    categories,
  };
  await AsyncStorage.setItem(StorageKeys.pantry, JSON.stringify(envelope));
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(
    StorageKeys.settings,
    JSON.stringify({ schemaVersion: PANTRY_SCHEMA_VERSION, settings }),
  );
}

export async function clearPantry(): Promise<void> {
  await AsyncStorage.multiRemove([StorageKeys.pantry, StorageKeys.settings]);
}

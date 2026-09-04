/**
 * src/state/pantryReducer.ts
 *
 * The whole app state, and every legal way to change it, in one pure
 * function. No async, no storage, no navigation. Give it a state and an
 * action and it returns the next state, every time, forever.
 *
 * Why a reducer instead of a pile of useState calls: the pantry has four
 * facts that must move together (items, categories, settings, status). With
 * separate setters, "delete a category and reassign its items" is two writes
 * that can render in between, and the list flashes an item pointing at a
 * category that no longer exists. Here it is one transition.
 *
 * Why a reducer instead of Zustand or Redux: this is the same idea with zero
 * dependencies. useReducer plus context is the built in version of the
 * pattern, and at this size the library buys nothing a reviewer can see.
 */

import { todayIso } from '@/lib/date';
import { createId } from '@/lib/id';
import { BUILT_IN_CATEGORIES, FALLBACK_CATEGORY_ID } from '@/lib/seed';
import {
  DEFAULT_SETTINGS,
  type Category,
  type ItemDraft,
  type PantryItem,
  type Settings,
} from '@/types/pantry';

export type PantryStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PantryState {
  status: PantryStatus;
  error: string | null;
  items: PantryItem[];
  categories: Category[];
  settings: Settings;
  /** Records dropped as unreadable on the last load. Shown in Settings. */
  dropped: number;
  /** Set while an item is pending undo, so the list can hide it optimistically. */
  pendingUndo: { item: PantryItem; kind: 'delete' | 'consume' } | null;
}

export const initialPantryState: PantryState = {
  status: 'idle',
  error: null,
  items: [],
  categories: [],
  settings: { ...DEFAULT_SETTINGS },
  dropped: 0,
  pendingUndo: null,
};

export type PantryAction =
  | { type: 'hydrate/start' }
  | {
      type: 'hydrate/success';
      items: PantryItem[];
      categories: Category[];
      settings: Settings;
      dropped: number;
    }
  | { type: 'hydrate/failure'; message: string }
  | { type: 'item/add'; draft: ItemDraft; now: string }
  | { type: 'item/update'; id: string; draft: ItemDraft; now: string }
  | { type: 'item/delete'; id: string }
  | { type: 'item/consume'; id: string; now: string }
  | { type: 'item/restock'; id: string; now: string }
  | { type: 'undo/clear' }
  | { type: 'undo/apply' }
  | { type: 'category/add'; name: string; emoji: string }
  | { type: 'category/rename'; id: string; name: string; emoji: string }
  | { type: 'category/delete'; id: string; now: string }
  | { type: 'settings/soonWindow'; days: number }
  | { type: 'data/replace'; items: PantryItem[] }
  | { type: 'data/clear' };

function touch(item: PantryItem, now: string): PantryItem {
  return { ...item, updatedAt: now };
}

function roundQuantity(quantity: number): number {
  return Math.round(quantity * 100) / 100;
}

function applyDraft(item: PantryItem, draft: ItemDraft, now: string): PantryItem {
  return touch(
    {
      ...item,
      name: draft.name.trim(),
      categoryId: draft.categoryId,
      quantity: roundQuantity(draft.quantity),
      unit: draft.unit,
      location: draft.location,
      expiresOn: draft.expiresOn,
      note: draft.note.trim(),
    },
    now,
  );
}

export function pantryReducer(state: PantryState, action: PantryAction): PantryState {
  switch (action.type) {
    case 'hydrate/start':
      return { ...state, status: 'loading', error: null };

    case 'hydrate/success':
      return {
        ...state,
        status: 'ready',
        error: null,
        items: action.items,
        categories: action.categories,
        settings: action.settings,
        dropped: action.dropped,
      };

    case 'hydrate/failure':
      return { ...state, status: 'error', error: action.message };

    case 'item/add': {
      const item: PantryItem = {
        id: createId(),
        name: action.draft.name.trim(),
        categoryId: action.draft.categoryId,
        quantity: roundQuantity(action.draft.quantity),
        unit: action.draft.unit,
        location: action.draft.location,
        expiresOn: action.draft.expiresOn,
        note: action.draft.note.trim(),
        consumedAt: null,
        createdAt: action.now,
        updatedAt: action.now,
      };
      return { ...state, items: [item, ...state.items] };
    }

    case 'item/update':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? applyDraft(item, action.draft, action.now) : item,
        ),
      };

    case 'item/delete': {
      const target = state.items.find((item) => item.id === action.id);
      if (!target) return state;
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
        pendingUndo: { item: target, kind: 'delete' },
      };
    }

    case 'item/consume': {
      const target = state.items.find((item) => item.id === action.id);
      if (!target || target.consumedAt !== null) return state;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? touch({ ...item, consumedAt: action.now }, action.now) : item,
        ),
        pendingUndo: { item: target, kind: 'consume' },
      };
    }

    case 'item/restock':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? touch({ ...item, consumedAt: null }, action.now) : item,
        ),
      };

    case 'undo/clear':
      return state.pendingUndo === null ? state : { ...state, pendingUndo: null };

    case 'undo/apply': {
      const pending = state.pendingUndo;
      if (!pending) return state;
      if (pending.kind === 'delete') {
        return { ...state, items: [pending.item, ...state.items], pendingUndo: null };
      }
      return {
        ...state,
        items: state.items.map((item) => (item.id === pending.item.id ? pending.item : item)),
        pendingUndo: null,
      };
    }

    case 'category/add': {
      const name = action.name.trim();
      if (name === '') return state;
      const clash = state.categories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase(),
      );
      if (clash) return state;
      const category: Category = {
        id: createId('cat'),
        name,
        emoji: action.emoji || '📦',
        builtIn: false,
      };
      return { ...state, categories: [...state.categories, category] };
    }

    case 'category/rename': {
      const name = action.name.trim();
      if (name === '') return state;
      const target = state.categories.find((category) => category.id === action.id);
      if (!target) return state;
      const clash = state.categories.some(
        (category) =>
          category.id !== action.id && category.name.toLowerCase() === name.toLowerCase(),
      );
      if (clash) return state;
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.id
            ? { ...category, name, emoji: action.emoji || '📦' }
            : category,
        ),
      };
    }

    case 'category/delete': {
      const target = state.categories.find((category) => category.id === action.id);
      if (!target || target.builtIn) return state;
      // Referential integrity, enforced in the same transition as the delete:
      // no render can ever observe an item pointing at a missing category.
      return {
        ...state,
        categories: state.categories.filter((category) => category.id !== action.id),
        items: state.items.map((item) =>
          item.categoryId === action.id
            ? touch({ ...item, categoryId: FALLBACK_CATEGORY_ID }, action.now)
            : item,
        ),
      };
    }

    case 'settings/soonWindow': {
      const days = Math.min(30, Math.max(1, Math.round(action.days)));
      return { ...state, settings: { ...state.settings, soonWindowDays: days } };
    }

    case 'data/replace':
      return { ...state, items: action.items, pendingUndo: null };

    case 'data/clear':
      return {
        ...state,
        items: [],
        categories: BUILT_IN_CATEGORIES.map((category) => ({ ...category })),
        settings: { ...DEFAULT_SETTINGS },
        dropped: 0,
        pendingUndo: null,
      };

    default:
      return state;
  }
}

/** Convenience for screens that need "now" in both shapes at once. */
export function stamps(now: Date = new Date()): { instant: string; today: string } {
  return { instant: now.toISOString(), today: todayIso(now) };
}

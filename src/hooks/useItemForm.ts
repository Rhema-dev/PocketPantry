/**
 * src/hooks/useItemForm.ts
 *
 * One reusable hook that powers both the Add and the Edit screen.
 *
 * It owns three things a form always needs and that are always written badly
 * when they live inside a screen component:
 *
 *   1. The draft, as controlled state.
 *   2. The validation rules, as pure functions of the draft.
 *   3. Which fields the user has actually visited, so errors appear when the
 *      user leaves a field rather than the instant the screen opens.
 *
 * Validation returns a record keyed by field name rather than a boolean, so
 * the field component can render its own message and the submit button can
 * ask a single question: is this record empty.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { isIsoDate, todayIso } from '@/lib/date';
import { FALLBACK_CATEGORY_ID } from '@/lib/seed';
import type { ItemDraft, PantryItem } from '@/types/pantry';

export type ItemField = 'name' | 'quantity' | 'expiresOn' | 'note';
export type FieldErrors = Partial<Record<ItemField, string>>;

export const EMPTY_DRAFT: ItemDraft = {
  name: '',
  categoryId: FALLBACK_CATEGORY_ID,
  quantity: 1,
  unit: 'pc',
  location: 'pantry',
  expiresOn: null,
  note: '',
};

export function draftFromItem(item: PantryItem): ItemDraft {
  return {
    name: item.name,
    categoryId: item.categoryId,
    quantity: item.quantity,
    unit: item.unit,
    location: item.location,
    expiresOn: item.expiresOn,
    note: item.note,
  };
}

const MAX_NAME = 60;
const MAX_NOTE = 200;
const MAX_QUANTITY = 9999;

export function validateDraft(draft: ItemDraft, today: string): FieldErrors {
  const errors: FieldErrors = {};

  const name = draft.name.trim();
  if (name === '') errors.name = 'Give the item a name.';
  else if (name.length > MAX_NAME) errors.name = `Keep it under ${MAX_NAME} characters.`;

  if (!Number.isFinite(draft.quantity)) errors.quantity = 'Quantity must be a number.';
  else if (draft.quantity <= 0) errors.quantity = 'Quantity must be more than zero.';
  else if (draft.quantity > MAX_QUANTITY) errors.quantity = 'That is more than the app tracks.';

  if (draft.expiresOn !== null) {
    if (!isIsoDate(draft.expiresOn)) {
      errors.expiresOn = 'That is not a real date.';
    } else if (draft.expiresOn < '2000-01-01') {
      errors.expiresOn = 'Dates before 2000 are almost certainly a typo.';
    } else if (draft.expiresOn > addYears(today, 20)) {
      errors.expiresOn = 'Dates more than 20 years out are almost certainly a typo.';
    }
  }

  if (draft.note.length > MAX_NOTE) errors.note = `Keep the note under ${MAX_NOTE} characters.`;

  return errors;
}

function addYears(today: string, years: number): string {
  const year = Number(today.slice(0, 4)) + years;
  return `${year}${today.slice(4)}`;
}

export interface ItemFormApi {
  draft: ItemDraft;
  errors: FieldErrors;
  touched: Partial<Record<ItemField, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  setField: <K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) => void;
  markTouched: (field: ItemField) => void;
  markAllTouched: () => void;
  /** Error to show for a field: only after the user has left it, or submitted. */
  errorFor: (field: ItemField) => string | undefined;
}

export function useItemForm(initial: ItemDraft = EMPTY_DRAFT): ItemFormApi {
  const [draft, setDraft] = useState<ItemDraft>(initial);
  const [touched, setTouched] = useState<Partial<Record<ItemField, boolean>>>({});
  const today = useMemo(() => todayIso(), []);

  // A cold deep link can mount the edit screen before hydration resolves.
  // Re-seed when that item's persisted draft becomes available.
  useEffect(() => {
    setDraft(initial);
    setTouched({});
  }, [initial]);

  const errors = useMemo(() => validateDraft(draft, today), [draft, today]);

  const setField = useCallback(
    <K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) => {
      setDraft((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const markTouched = useCallback((field: ItemField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({ name: true, quantity: true, expiresOn: true, note: true });
  }, []);

  const errorFor = useCallback(
    (field: ItemField) => (touched[field] ? errors[field] : undefined),
    [touched, errors],
  );

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initial),
    [draft, initial],
  );

  return {
    draft,
    errors,
    touched,
    isValid: Object.keys(errors).length === 0,
    isDirty,
    setField,
    markTouched,
    markAllTouched,
    errorFor,
  };
}

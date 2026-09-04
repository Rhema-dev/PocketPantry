/**
 * src/hooks/usePantry.ts
 *
 * The public API of the state layer. Screens import from here and never
 * touch a context object directly.
 *
 * The null check inside each hook is the whole reason these wrappers exist.
 * A context read outside its provider returns the default value, which in a
 * naive setup is an empty object, and the failure shows up two screens later
 * as "cannot read property items of undefined". Throwing at the read site
 * turns a mystery into a one line fix.
 */

import { useContext, useMemo } from 'react';
import type { Dispatch } from 'react';

import { todayIso } from '@/lib/date';
import {
  decorate,
  selectCounts,
  selectExpiringSections,
  selectVisible,
  type DecoratedItem,
  type ItemFilter,
} from '@/state/selectors';
import {
  PantryDispatchContext,
  PantryRetryContext,
  PantryStateContext,
} from '@/state/PantryProvider';
import type { PantryAction, PantryState } from '@/state/pantryReducer';

export function usePantryState(): PantryState {
  const state = useContext(PantryStateContext);
  if (state === null) {
    throw new Error('usePantryState must be used inside <PantryProvider>.');
  }
  return state;
}

export function usePantryDispatch(): Dispatch<PantryAction> {
  const dispatch = useContext(PantryDispatchContext);
  if (dispatch === null) {
    throw new Error('usePantryDispatch must be used inside <PantryProvider>.');
  }
  return dispatch;
}

export function usePantryRetry(): () => void {
  const retry = useContext(PantryRetryContext);
  if (retry === null) {
    throw new Error('usePantryRetry must be used inside <PantryProvider>.');
  }
  return retry;
}

/**
 * Today's date, recomputed only when the component re-renders for another
 * reason. Good enough for an app the user opens and closes: a session that
 * spans midnight refreshes on the next navigation.
 */
export function useToday(): string {
  return useMemo(() => todayIso(), []);
}

export function useDecoratedItems(): DecoratedItem[] {
  const { items, categories, settings } = usePantryState();
  const today = useToday();
  return useMemo(
    () => decorate(items, categories, today, settings.soonWindowDays),
    [items, categories, today, settings.soonWindowDays],
  );
}

export function useVisibleItems(filter: ItemFilter): DecoratedItem[] {
  const { settings } = usePantryState();
  const decorated = useDecoratedItems();
  const today = useToday();
  return useMemo(
    () => selectVisible(decorated, filter, today, settings.soonWindowDays),
    [decorated, filter, today, settings.soonWindowDays],
  );
}

export function useExpiringSections() {
  const decorated = useDecoratedItems();
  return useMemo(() => selectExpiringSections(decorated), [decorated]);
}

export function usePantryCounts() {
  const decorated = useDecoratedItems();
  return useMemo(() => selectCounts(decorated), [decorated]);
}

/** One item by id, already decorated. Returns null when the id is unknown. */
export function useItem(id: string | undefined): DecoratedItem | null {
  const decorated = useDecoratedItems();
  return useMemo(() => {
    if (!id) return null;
    return decorated.find((entry) => entry.item.id === id) ?? null;
  }, [decorated, id]);
}

export function useCategories() {
  const { categories } = usePantryState();
  return useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );
}

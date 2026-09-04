/**
 * src/state/PantryProvider.tsx
 *
 * The bridge between the pure reducer and the messy outside world: the disk,
 * the clock, and React's lifecycle.
 *
 * Three responsibilities, in order:
 *
 *   1. Hydrate once on mount, moving idle to loading to ready or error.
 *   2. Persist on change, debounced, and never before hydration finishes.
 *   3. Hand the state and a dispatcher down through two separate contexts.
 *
 * Two contexts, not one, is the important detail. A component that only
 * dispatches (a delete button, a form) does not care what the state is, and
 * putting both in one value would re-render every one of them on every
 * keystroke elsewhere in the tree. The dispatch context value never changes,
 * so those components never re-render.
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { Dispatch, ReactNode } from 'react';

import {
  clearPantry,
  loadPantry,
  savePantry,
  saveSettings,
} from '@/storage/pantryRepository';
import {
  initialPantryState,
  pantryReducer,
  type PantryAction,
  type PantryState,
} from '@/state/pantryReducer';

export const PantryStateContext = createContext<PantryState | null>(null);
export const PantryDispatchContext = createContext<Dispatch<PantryAction> | null>(null);
export const PantryRetryContext = createContext<(() => void) | null>(null);

/** How long to wait after the last change before touching the disk. */
const WRITE_DEBOUNCE_MS = 400;

export function PantryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pantryReducer, initialPantryState);
  const [hydrationAttempt, setHydrationAttempt] = useState(0);

  // Guards the persistence effect. Without it the empty initial state is
  // written over real data during the first frame, which deletes the pantry
  // of every user who opens the app on a slow disk.
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    hydrated.current = false;
    dispatch({ type: 'hydrate/start' });

    loadPantry()
      .then((result) => {
        if (cancelled) return;
        dispatch({
          type: 'hydrate/success',
          items: result.value.items,
          categories: result.value.categories,
          settings: result.value.settings,
          dropped: result.dropped,
        });
        hydrated.current = true;
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : 'Could not read the saved pantry.';
        dispatch({ type: 'hydrate/failure', message });
      });

    return () => {
      cancelled = true;
    };
  }, [hydrationAttempt]);

  useEffect(() => {
    if (!hydrated.current) return;
    const handle = setTimeout(() => {
      void savePantry(state.items, state.categories);
    }, WRITE_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [state.items, state.categories]);

  useEffect(() => {
    if (!hydrated.current) return;
    void saveSettings(state.settings);
  }, [state.settings]);

  // Dispatch is stable across renders, so this value is created once and the
  // dispatch only consumers below it never re-render because of state.
  const stableDispatch = useMemo(() => dispatch, []);
  const retryHydration = useCallback(() => {
    setHydrationAttempt((attempt) => attempt + 1);
  }, []);

  return (
    <PantryStateContext.Provider value={state}>
      <PantryDispatchContext.Provider value={stableDispatch}>
        <PantryRetryContext.Provider value={retryHydration}>
          {children}
        </PantryRetryContext.Provider>
      </PantryDispatchContext.Provider>
    </PantryStateContext.Provider>
  );
}

/** Exposed for the Settings screen. Wipes the disk, then the memory. */
export function useResetPantry(dispatch: Dispatch<PantryAction>) {
  return useCallback(async () => {
    await clearPantry();
    dispatch({ type: 'data/clear' });
  }, [dispatch]);
}

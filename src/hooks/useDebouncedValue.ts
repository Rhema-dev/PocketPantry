/**
 * src/hooks/useDebouncedValue.ts
 *
 * Holds a value still until the user stops changing it.
 *
 * Used by search. Filtering a few hundred items per keystroke is cheap, but
 * re-rendering a FlatList per keystroke is not: every visible row rebuilds
 * while the keyboard is animating, and on a mid range Android device that is
 * the difference between a snappy field and a laggy one.
 *
 * The input stays fully controlled and instant. Only the derived filter is
 * delayed, which is the part the user cannot see anyway.
 */

import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}

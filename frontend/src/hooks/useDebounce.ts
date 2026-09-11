/**
 * Debounces a fast-changing value (e.g. a search input) so dependent
 * effects/queries only fire once the user pauses typing. This is the
 * main "rendering efficiency" optimization on the search/filter form -
 * without it every keystroke would trigger a new network request and
 * re-render of the results list.
 */
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

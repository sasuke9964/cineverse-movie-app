import { useState, useEffect } from "react";

/**
 * useDebounce
 * Delays updating `debouncedValue` until `delay` ms after the last change.
 * Used for search inputs to throttle API calls.
 *
 * @param {any}    value  - The value to debounce
 * @param {number} delay  - Debounce delay in milliseconds (default 500ms)
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Cleanup: clear the timer if value changes before delay elapses
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

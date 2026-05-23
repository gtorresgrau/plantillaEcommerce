// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Retrasa la actualización de un valor hasta que el usuario deje de escribir.
 * Útil para búsquedas en tiempo real: evita llamadas a la API en cada keystroke.
 *
 * @param {any}    value - El valor a debounce
 * @param {number} delay - Tiempo en ms antes de actualizar (por defecto 300ms)
 * @returns {any}  El valor debounced
 *
 * @example
 * const queryDebounced = useDebounce(searchQuery, 300);
 * useEffect(() => { fetchResults(queryDebounced); }, [queryDebounced]);
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

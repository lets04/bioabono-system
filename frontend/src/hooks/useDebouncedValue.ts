import { useEffect, useState } from "react";

/** Devuelve `value` solo después de `delay` ms sin cambios (para no consultar en cada tecla). */
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

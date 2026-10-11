import { useCallback, useRef, useState } from "react";

/**
 * Carga un detalle bajo demanda (ver/imprimir) con estado de carga y error.
 * Si se piden varios seguidos, solo se aplica la respuesta del último.
 */
export function useDetailLoader<T>(fetcher: (id: number) => Promise<T>) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastRequest = useRef(0);

  const load = useCallback(
    async (id: number, onLoaded: (item: T) => void) => {
      const request = ++lastRequest.current;
      setLoadingId(id);
      setError(null);
      try {
        const item = await fetcher(id);
        if (request === lastRequest.current) onLoaded(item);
      } catch (err) {
        if (request === lastRequest.current) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el detalle");
        }
      } finally {
        if (request === lastRequest.current) setLoadingId(null);
      }
    },
    [fetcher],
  );

  return { load, loadingId, error, clearError: () => setError(null) };
}

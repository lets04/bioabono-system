import { useState } from "react";

/** Líneas editables de un documento (venta, compra, consignación); siempre queda al menos una. */
export function useLineItems<T extends object>(createEmpty: () => T) {
  const [lines, setLines] = useState<T[]>(() => [createEmpty()]);

  const updateLine = <K extends keyof T>(idx: number, field: K, value: T[K]) =>
    setLines((cur) => cur.map((line, i) => (i === idx ? { ...line, [field]: value } : line)));

  const addLine = () => setLines((cur) => [...cur, createEmpty()]);

  const removeLine = (idx: number) => setLines((cur) => (cur.length <= 1 ? cur : cur.filter((_, i) => i !== idx)));

  return { lines, updateLine, addLine, removeLine };
}

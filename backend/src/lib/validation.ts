import { z } from "zod";

/** Número recibido como string o number; se normaliza a string para columnas numeric. */
export const numericString = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .refine((v) => v !== "" && Number.isFinite(Number(v)), "Debe ser un número válido");

export const uniquePresentations = <T extends { presentacionId: number }>(items: T[]) =>
  new Set(items.map((d) => d.presentacionId)).size === items.length;

export const DUPLICATE_PRESENTATION_MSG = "No se puede repetir la misma presentación en varias líneas";

/** Texto recortado; vacío pasa a null. */
export const trimOrNull = (value?: string | null) => value?.trim() || null;

/** Como trimOrNull, pero undefined (campo no enviado) se conserva para que el UPDATE no lo toque. */
export const optionalTrimOrNull = (value?: string | null) => (value === undefined ? undefined : trimOrNull(value));

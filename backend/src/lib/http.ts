import { ZodError } from "zod";

export type SetLike = { status?: number | string };

export function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error("INVALID_ID");
  return id;
}

export function validationError(error: ZodError, set: SetLike) {
  set.status = 400;
  const message = error.issues[0]?.message ?? "Datos inválidos";
  return { error: "VALIDATION_ERROR", message, details: error.flatten() };
}

function pgErrorCode(error: unknown): string | undefined {
  const candidate = error as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = candidate?.code ?? candidate?.cause?.code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Último recurso de los manejadores de error de cada módulo: traduce validaciones y
 * violaciones de restricciones de Postgres, y registra el resto sin exponer detalles al cliente.
 */
export function fallbackError(error: unknown, set: SetLike, message = "No se pudo procesar la solicitud") {
  if (error instanceof ZodError) return validationError(error, set);

  switch (pgErrorCode(error)) {
    case "23505":
      set.status = 409;
      return { error: "DUPLICATE", message: "Ya existe un registro con esos datos" };
    case "23514":
    case "23503":
      set.status = 409;
      return { error: "CONSTRAINT_VIOLATION", message: "La operación viola una regla de integridad de datos" };
  }

  console.error("[api] Error no controlado:", error);
  set.status = 500;
  return { error: "INTERNAL_ERROR", message };
}

type ErrorSpec = { status: number; message: string | ((detail: string) => string) };
export type ErrorMap = Record<string, ErrorSpec>;

export const COMMON_ERRORS: ErrorMap = {
  INVALID_ID: { status: 400, message: "Datos inválidos" },
  INVALID_DATE: { status: 400, message: "Datos inválidos" },
  UNAUTHORIZED: { status: 401, message: "No autenticado" },
};

/** Errores de las líneas de detalle; el servicio los lanza como "CODIGO:presentacionId". */
export const PRESENTATION_ERRORS: ErrorMap = {
  PRESENTATION_NOT_FOUND: { status: 404, message: (id) => `Presentación no encontrada: ${id}` },
  PRESENTATION_INACTIVE: { status: 409, message: (id) => `Presentación inactiva: ${id}` },
  STOCK_INSUFFICIENT: { status: 409, message: (id) => `Stock insuficiente para presentación ${id}` },
};

/** Traduce errores de dominio ("CODIGO" o "CODIGO:detalle") con el mapa; el resto va a fallbackError. */
export function mapDomainError(error: unknown, set: SetLike, errors: ErrorMap) {
  if (error instanceof Error) {
    const [code, detail = ""] = error.message.split(":");
    const spec = Object.hasOwn(errors, code) ? errors[code] : undefined;
    if (spec) {
      set.status = spec.status;
      return { error: code, message: typeof spec.message === "function" ? spec.message(detail) : spec.message };
    }
  }
  return fallbackError(error, set);
}

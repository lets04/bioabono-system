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

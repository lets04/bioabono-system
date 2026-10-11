import { and, eq, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  auditLogs,
  authSessions,
  consignations,
  inventoryMovements,
  purchases,
  sales,
  users,
} from "../../db/schema/index.js";
import type { AuthUser, UserRole, UserStatus } from "./types.js";

const userSelect = {
  id: users.id,
  nombre: users.nombre,
  username: users.username,
  rol: users.rol,
  estado: users.estado,
  activo: users.activo,
};

export type UserRow = AuthUser & {
  passwordHash: string;
  activationTokenHash: string | null;
  activationTokenExpiresAt: Date | null;
  activationUsedAt: Date | null;
  activatedAt: Date | null;
  passwordResetTokenHash: string | null;
  passwordResetTokenExpiresAt: Date | null;
  passwordResetUsedAt: Date | null;
};

export async function findUserByUsername(username: string) {
  const [row] = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
  return row ?? null;
}

export async function findUserById(id: number) {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export async function findUserByActivationTokenHash(tokenHash: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.activationTokenHash, tokenHash))
    .limit(1);
  return row ?? null;
}

export async function findUserByResetTokenHash(tokenHash: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.passwordResetTokenHash, tokenHash))
    .limit(1);
  return row ?? null;
}

export function toAuthUser(row: {
  id: number;
  nombre: string;
  username: string;
  rol: UserRole;
  estado: UserStatus;
  activo: boolean;
}): AuthUser {
  return {
    id: row.id,
    nombre: row.nombre,
    username: row.username,
    rol: row.rol,
    estado: row.estado,
    activo: row.activo,
  };
}

export async function listUsers() {
  return db
    .select({
      ...userSelect,
      activatedAt: users.activatedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.nombre);
}

export async function createInvitedUser(input: {
  nombre: string;
  username: string;
  rol: UserRole;
  passwordHash: string;
  activationTokenHash: string;
  activationTokenExpiresAt: Date;
}) {
  const [row] = await db
    .insert(users)
    .values({
      nombre: input.nombre,
      username: input.username,
      rol: input.rol,
      passwordHash: input.passwordHash,
      estado: "PENDIENTE",
      activo: false,
      activationTokenHash: input.activationTokenHash,
      activationTokenExpiresAt: input.activationTokenExpiresAt,
      activationUsedAt: null,
    })
    .returning();
  return row;
}

// El token se vuelve a comprobar en el WHERE para que dos solicitudes concurrentes no lo usen dos veces.
export async function activateUser(id: number, activationTokenHash: string, passwordHash: string) {
  const now = new Date();
  const [row] = await db
    .update(users)
    .set({
      passwordHash,
      estado: "ACTIVO",
      activo: true,
      activationUsedAt: now,
      activatedAt: now,
      activationTokenHash: null,
      activationTokenExpiresAt: null,
      passwordChangedAt: now,
      updatedAt: now,
    })
    .where(and(eq(users.id, id), eq(users.activationTokenHash, activationTokenHash)))
    .returning();
  return row;
}

export async function setActivationToken(
  id: number,
  activationTokenHash: string,
  activationTokenExpiresAt: Date,
) {
  const [row] = await db
    .update(users)
    .set({
      activationTokenHash,
      activationTokenExpiresAt,
      activationUsedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  return row;
}

export async function setPasswordResetToken(
  id: number,
  passwordResetTokenHash: string,
  passwordResetTokenExpiresAt: Date,
) {
  const [row] = await db
    .update(users)
    .set({
      passwordResetTokenHash,
      passwordResetTokenExpiresAt,
      passwordResetUsedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  return row;
}

export async function consumePasswordReset(id: number, resetTokenHash: string, passwordHash: string) {
  const now = new Date();
  const [row] = await db
    .update(users)
    .set({
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null,
      passwordResetUsedAt: now,
      passwordChangedAt: now,
      updatedAt: now,
    })
    .where(and(eq(users.id, id), eq(users.passwordResetTokenHash, resetTokenHash)))
    .returning();
  return row;
}

export async function setUserStatus(id: number, estado: Exclude<UserStatus, "PENDIENTE">) {
  const [row] = await db
    .update(users)
    .set({
      estado,
      activo: estado === "ACTIVO",
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  return row;
}

export async function userHasOperationalRecords(id: number) {
  const records = await Promise.all([
    db.select({ id: purchases.id }).from(purchases).where(eq(purchases.usuarioId, id)).limit(1),
    db.select({ id: sales.id }).from(sales).where(eq(sales.usuarioId, id)).limit(1),
    db.select({ id: consignations.id }).from(consignations).where(eq(consignations.usuarioId, id)).limit(1),
    db.select({ id: inventoryMovements.id }).from(inventoryMovements).where(eq(inventoryMovements.usuarioId, id)).limit(1),
  ]);
  return records.some((rows) => rows.length > 0);
}

export async function deleteUser(id: number) {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id, nombre: users.nombre, username: users.username });
  return deleted ?? null;
}

export async function insertAuditLog(input: {
  usuarioId: number | null;
  accion: string;
  entidad: string;
  entidadId?: number | null;
  detalle?: unknown;
}) {
  await db.insert(auditLogs).values({
    usuarioId: input.usuarioId,
    accion: input.accion,
    entidad: input.entidad,
    entidadId: input.entidadId ?? null,
    detalle: input.detalle ?? null,
  });
}

export async function createSession(input: { tokenHash: string; usuarioId: number; expiresAt: Date; persistent: boolean }) {
  // De paso se borran las sesiones vencidas o revocadas para que la tabla no crezca.
  await db.delete(authSessions).where(or(lt(authSessions.expiresAt, new Date()), isNotNull(authSessions.revokedAt)));
  await db.insert(authSessions).values({
    id: input.tokenHash,
    usuarioId: input.usuarioId,
    expiresAt: input.expiresAt,
    persistent: input.persistent,
  });
}

/** Sesión vigente (no revocada ni vencida) junto a su usuario, en una sola consulta. */
export async function findActiveSession(tokenHash: string) {
  const [row] = await db
    .select({
      user: users,
      expiresAt: authSessions.expiresAt,
      persistent: authSessions.persistent,
      createdAt: authSessions.createdAt,
    })
    .from(authSessions)
    .innerJoin(users, eq(users.id, authSessions.usuarioId))
    .where(
      and(
        eq(authSessions.id, tokenHash),
        isNull(authSessions.revokedAt),
        sql`${authSessions.expiresAt} > now()`,
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function extendSession(tokenHash: string, expiresAt: Date) {
  await db
    .update(authSessions)
    .set({ expiresAt })
    .where(and(eq(authSessions.id, tokenHash), isNull(authSessions.revokedAt)));
}

export async function revokeSession(tokenHash: string) {
  await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(authSessions.id, tokenHash), isNull(authSessions.revokedAt)));
}

/** Cierra todas las sesiones abiertas del usuario (cambio de contraseña, desactivación). */
export async function revokeUserSessions(usuarioId: number) {
  await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(authSessions.usuarioId, usuarioId), isNull(authSessions.revokedAt)));
}

export async function usernameExists(username: string, excludeId?: number) {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      excludeId
        ? and(eq(users.username, username), sql`${users.id} <> ${excludeId}`)
        : eq(users.username, username),
    )
    .limit(1);
  return Boolean(row);
}

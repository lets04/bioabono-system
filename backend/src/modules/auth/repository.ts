import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { auditLogs, users } from "../../db/schema/index.js";
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

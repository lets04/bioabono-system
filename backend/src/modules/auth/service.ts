import { env } from "../../config/env.js";
import {
  addHours,
  createSecureToken,
  hashPassword,
  hashToken,
  unusablePasswordHash,
  verifyPassword,
} from "../../lib/crypto.js";
import { invitationEmail, passwordResetEmail, sendMail } from "../../lib/mailer.js";
import * as repository from "./repository.js";
import {
  activateSchema,
  forgotPasswordSchema,
  inviteUserSchema,
  loginSchema,
  resetPasswordSchema,
  userStatusSchema,
} from "./schema.js";
import { publicUser, type AuthUser } from "./types.js";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

// Hash usado cuando el usuario no existe, para que la respuesta tarde lo mismo y no revele cuentas.
const dummyPasswordHash = unusablePasswordHash();

// Una sesión persistente se renueva como mucho una vez por minuto para no escribir en la base en cada petición.
const SESSION_RENEW_EVERY_MS = 60_000;
// Una sesión normal solo se puede alargar en sus últimos minutos (cuando el frontend muestra el aviso).
const SESSION_EXTEND_WINDOW_MS = 15 * 60_000;

/**
 * Vencimiento contado desde ahora. Normal: SESSION_MAX_HOURS fijas; al acercarse el final el usuario
 * puede alargarla otras tantas (`extendSession`). Persistente ("Mantener sesión iniciada"):
 * SESSION_REMEMBER_DAYS sin uso, renovándose con cada petición.
 */
function sessionExpiry(persistent: boolean) {
  const duration = persistent ? env.sessionRememberDays * 24 * 60 * 60_000 : env.sessionMaxHours * 60 * 60_000;
  return new Date(Date.now() + duration);
}

export type SessionInfo = { tokenHash: string; persistent: boolean; expiresAt: Date };

/** Lo que el frontend necesita de la sesión: si es persistente y cuánto le queda (en ms, sin depender de su reloj). */
export function sessionSummary(user: AuthUser, session: Pick<SessionInfo, "persistent" | "expiresAt">) {
  return {
    user: publicUser(user),
    persistent: session.persistent,
    expiresInMs: Math.max(0, session.expiresAt.getTime() - Date.now()),
  };
}

export async function login(body: unknown) {
  const input = loginSchema.parse(body);
  const username = normalizeUsername(input.username);
  const user = await repository.findUserByUsername(username);

  // La contraseña se verifica antes de revelar el estado de la cuenta.
  const valid = await verifyPassword(input.password, user?.passwordHash ?? (await dummyPasswordHash));
  if (!user || !valid) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (user.estado === "PENDIENTE") {
    throw new Error("ACCOUNT_PENDING");
  }
  if (user.estado === "INACTIVO" || !user.activo) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  // Token opaco en la cookie; en la base solo su hash, así una copia de la base no sirve para suplantar a nadie.
  const token = createSecureToken();
  const persistent = input.remember;
  const expiresAt = sessionExpiry(persistent);
  await repository.createSession({ tokenHash: hashToken(token), usuarioId: user.id, expiresAt, persistent });

  return { token, expiresAt, ...sessionSummary(repository.toAuthUser(user), { persistent, expiresAt }) };
}

/**
 * Valida el token. Una sesión persistente se alarga con el uso: `renewedUntil` trae su nuevo vencimiento
 * para alargar también la cookie. Una sesión normal no se alarga sola (su cookie no tiene fecha:
 * el navegador la borra al cerrarse).
 */
export async function authenticateToken(
  token?: string | null,
): Promise<{ user: AuthUser; session: SessionInfo; renewedUntil: Date | null }> {
  if (!token) throw new Error("UNAUTHORIZED");

  // Una sesión cerrada (logout), revocada o vencida no devuelve usuario.
  const tokenHash = hashToken(token);
  const session = await repository.findActiveSession(tokenHash);
  if (!session) throw new Error("UNAUTHORIZED");
  const { user } = session;
  if (user.estado !== "ACTIVO" || !user.activo) throw new Error("UNAUTHORIZED");

  let expiresAt = session.expiresAt;
  let renewedUntil: Date | null = null;
  if (session.persistent) {
    const next = sessionExpiry(true);
    if (next.getTime() - expiresAt.getTime() >= SESSION_RENEW_EVERY_MS) {
      await repository.extendSession(tokenHash, next);
      expiresAt = renewedUntil = next;
    }
  }

  return {
    user: repository.toAuthUser(user),
    session: { tokenHash, persistent: session.persistent, expiresAt },
    renewedUntil,
  };
}

/**
 * "Mantener sesión activa" del aviso de vencimiento: otras SESSION_MAX_HOURS desde ahora. Solo en los
 * últimos minutos de la sesión, para que no se pueda alargar indefinidamente sin que el usuario lo pida;
 * antes de eso devuelve el vencimiento actual sin cambios.
 */
export async function extendSession(session: SessionInfo) {
  if (session.persistent || session.expiresAt.getTime() - Date.now() > SESSION_EXTEND_WINDOW_MS) {
    return session.expiresAt;
  }
  const expiresAt = sessionExpiry(false);
  await repository.extendSession(session.tokenHash, expiresAt);
  return expiresAt;
}

/** Revoca la sesión del token; un token inválido o ya revocado no es un error al cerrar sesión. */
export async function logout(token?: string | null) {
  if (!token) return;
  await repository.revokeSession(hashToken(token));
}

export async function inviteUser(body: unknown, actor: AuthUser) {
  const input = inviteUserSchema.parse(body);
  const username = normalizeUsername(input.username);

  if (await repository.usernameExists(username)) {
    throw new Error("USERNAME_EXISTS");
  }

  const token = createSecureToken();
  const user = await repository.createInvitedUser({
    nombre: input.nombre.trim(),
    username,
    rol: input.rol,
    passwordHash: await unusablePasswordHash(),
    activationTokenHash: hashToken(token),
    activationTokenExpiresAt: addHours(new Date(), env.activationTokenTtlHours),
  });

  const activateUrl = `${env.frontendUrl}/activar-cuenta?token=${encodeURIComponent(token)}`;
  const mail = await sendMail(invitationEmail(user.nombre, user.username, activateUrl));

  await repository.insertAuditLog({
    usuarioId: actor.id,
    accion: "INVITAR_USUARIO",
    entidad: "usuario",
    entidadId: user.id,
    detalle: { username: user.username, rol: user.rol, emailEnviado: mail.delivered },
  });

  return {
    user: {
      ...publicUser(repository.toAuthUser(user)),
      activatedAt: user.activatedAt,
      createdAt: user.createdAt,
    },
    emailEnviado: mail.delivered,
  };
}

export async function resendInvitation(id: number, actor: AuthUser) {
  const user = await repository.findUserById(id);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.estado !== "PENDIENTE") throw new Error("USER_NOT_PENDING");

  const token = createSecureToken();
  await repository.setActivationToken(
    user.id,
    hashToken(token),
    addHours(new Date(), env.activationTokenTtlHours),
  );

  const activateUrl = `${env.frontendUrl}/activar-cuenta?token=${encodeURIComponent(token)}`;
  const mail = await sendMail(invitationEmail(user.nombre, user.username, activateUrl));

  await repository.insertAuditLog({
    usuarioId: actor.id,
    accion: "REENVIAR_INVITACION",
    entidad: "usuario",
    entidadId: user.id,
    detalle: { username: user.username, emailEnviado: mail.delivered },
  });

  return { emailEnviado: mail.delivered };
}

export async function getActivationStatus(token: string) {
  const user = await repository.findUserByActivationTokenHash(hashToken(token));
  if (!user) throw new Error("INVALID_ACTIVATION_TOKEN");
  if (user.activationUsedAt) throw new Error("ACTIVATION_TOKEN_USED");
  if (user.estado !== "PENDIENTE") throw new Error("USER_NOT_PENDING");
  if (!user.activationTokenExpiresAt || user.activationTokenExpiresAt.getTime() < Date.now()) {
    throw new Error("ACTIVATION_TOKEN_EXPIRED");
  }
  return { username: user.username, nombre: user.nombre };
}

export async function activateAccount(body: unknown) {
  const input = activateSchema.parse(body);
  const user = await repository.findUserByActivationTokenHash(hashToken(input.token));
  if (!user) throw new Error("INVALID_ACTIVATION_TOKEN");
  if (user.activationUsedAt) throw new Error("ACTIVATION_TOKEN_USED");
  if (user.estado !== "PENDIENTE") throw new Error("USER_NOT_PENDING");
  if (!user.activationTokenExpiresAt || user.activationTokenExpiresAt.getTime() < Date.now()) {
    throw new Error("ACTIVATION_TOKEN_EXPIRED");
  }

  const updated = await repository.activateUser(user.id, user.activationTokenHash!, await hashPassword(input.password));
  if (!updated) throw new Error("ACTIVATION_TOKEN_USED");
  await repository.insertAuditLog({
    usuarioId: updated.id,
    accion: "ACTIVAR_USUARIO",
    entidad: "usuario",
    entidadId: updated.id,
    detalle: { username: updated.username },
  });

  return { user: publicUser(repository.toAuthUser(updated)) };
}

export async function forgotPassword(body: unknown) {
  const input = forgotPasswordSchema.parse(body);
  const username = normalizeUsername(input.username);
  const user = await repository.findUserByUsername(username);

  if (user && user.estado === "ACTIVO") {
    const token = createSecureToken();
    await repository.setPasswordResetToken(
      user.id,
      hashToken(token),
      addHours(new Date(), env.passwordResetTokenTtlHours),
    );
    const resetUrl = `${env.frontendUrl}/recuperar-contrasena?token=${encodeURIComponent(token)}`;
    // Sin await: la respuesta no debe depender (ni en tiempo ni en errores) de que la cuenta exista.
    sendMail(passwordResetEmail(user.nombre, user.username, resetUrl)).catch((error) => {
      console.error("[mail] Error enviando correo de recuperación:", error);
    });
  }

  return { message: "Si la cuenta existe, enviaremos un enlace para restablecer la contraseña" };
}

export async function resetPassword(body: unknown) {
  const input = resetPasswordSchema.parse(body);
  const user = await repository.findUserByResetTokenHash(hashToken(input.token));
  if (!user) throw new Error("INVALID_RESET_TOKEN");
  if (user.passwordResetUsedAt) throw new Error("RESET_TOKEN_USED");
  if (!user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
    throw new Error("RESET_TOKEN_EXPIRED");
  }
  if (user.estado !== "ACTIVO") throw new Error("ACCOUNT_INACTIVE");

  const updated = await repository.consumePasswordReset(
    user.id,
    user.passwordResetTokenHash!,
    await hashPassword(input.password),
  );
  if (!updated) throw new Error("RESET_TOKEN_USED");
  // Quien tuviera una sesión abierta con la contraseña anterior queda fuera.
  await repository.revokeUserSessions(updated.id);
  await repository.insertAuditLog({
    usuarioId: updated.id,
    accion: "RESTABLECER_CONTRASENA",
    entidad: "usuario",
    entidadId: updated.id,
  });

  return { message: "Contraseña actualizada" };
}

export async function listUsers() {
  const rows = await repository.listUsers();
  return rows.map((row) => ({
    ...publicUser(row),
    activatedAt: row.activatedAt,
    createdAt: row.createdAt,
  }));
}

export async function getUser(id: number) {
  const user = await repository.findUserById(id);
  if (!user) throw new Error("USER_NOT_FOUND");
  return {
    ...publicUser(repository.toAuthUser(user)),
    activatedAt: user.activatedAt,
    createdAt: user.createdAt,
  };
}

export async function updateUserStatus(id: number, body: unknown, actor: AuthUser) {
  const input = userStatusSchema.parse(body);
  const user = await repository.findUserById(id);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.id === actor.id) throw new Error("CANNOT_CHANGE_OWN_STATUS");
  if (user.estado === "PENDIENTE") throw new Error("USER_STILL_PENDING");
  if (input.estado === "ACTIVO" && !user.activatedAt) throw new Error("USER_NOT_ACTIVATED");

  const updated = await repository.setUserStatus(id, input.estado);
  if (input.estado === "INACTIVO") await repository.revokeUserSessions(updated.id);
  await repository.insertAuditLog({
    usuarioId: actor.id,
    accion: input.estado === "ACTIVO" ? "ACTIVAR_ESTADO_USUARIO" : "DESACTIVAR_USUARIO",
    entidad: "usuario",
    entidadId: updated.id,
    detalle: { estado: updated.estado },
  });

  return {
    ...publicUser(repository.toAuthUser(updated)),
    activatedAt: updated.activatedAt,
    createdAt: updated.createdAt,
  };
}

export async function deleteUser(id: number, actor: AuthUser) {
  const user = await repository.findUserById(id);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.id === actor.id) throw new Error("CANNOT_DELETE_OWN_USER");
  if (await repository.userHasOperationalRecords(id)) {
    throw new Error("USER_HAS_OPERATIONAL_RECORDS");
  }

  const deleted = await repository.deleteUser(id);
  if (!deleted) throw new Error("USER_NOT_FOUND");

  await repository.insertAuditLog({
    usuarioId: actor.id,
    accion: "ELIMINAR_USUARIO",
    entidad: "usuario",
    entidadId: deleted.id,
    detalle: { username: deleted.username, nombre: deleted.nombre },
  });

  return { message: "Usuario eliminado" };
}

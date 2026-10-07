import { env } from "../../config/env.js";
import {
  addHours,
  createSecureToken,
  hashPassword,
  hashToken,
  unusablePasswordHash,
  verifyPassword,
} from "../../lib/crypto.js";
import { signAuthToken, verifyAuthToken } from "../../lib/jwt.js";
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

export async function login(body: unknown) {
  const input = loginSchema.parse(body);
  const username = normalizeUsername(input.username);
  const user = await repository.findUserByUsername(username);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (user.estado === "PENDIENTE") {
    throw new Error("ACCOUNT_PENDING");
  }
  if (user.estado === "INACTIVO" || !user.activo) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const authUser = repository.toAuthUser(user);
  const token = await signAuthToken({
    userId: authUser.id,
    username: authUser.username,
    rol: authUser.rol,
  });

  return { token, user: publicUser(authUser) };
}

export async function authenticateHeader(authorization?: string | null): Promise<AuthUser> {
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) throw new Error("UNAUTHORIZED");

  let payload;
  try {
    payload = await verifyAuthToken(token);
  } catch {
    throw new Error("UNAUTHORIZED");
  }

  const user = await repository.findUserById(payload.userId);
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.estado !== "ACTIVO" || !user.activo) throw new Error("UNAUTHORIZED");

  return repository.toAuthUser(user);
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

  const updated = await repository.activateUser(user.id, await hashPassword(input.password));
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
    await sendMail(passwordResetEmail(user.nombre, user.username, resetUrl));
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

  const updated = await repository.consumePasswordReset(user.id, await hashPassword(input.password));
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

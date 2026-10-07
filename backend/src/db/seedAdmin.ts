import { eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { hashPassword } from "../lib/crypto.js";
import { db } from "./index.js";
import { users } from "./schema/index.js";

const DEFAULT_ADMIN_USERNAME = "info@entropicaingenieria.com";

export async function seedAdmin() {
  const username = (env.adminUsername || DEFAULT_ADMIN_USERNAME).trim().toLowerCase();
  const password = env.adminPassword;

  if (!password) {
    throw new Error("ADMIN_PASSWORD es obligatorio para crear o actualizar el administrador inicial");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres");
  }

  const passwordHash = await hashPassword(password);
  const now = new Date();
  const nombre = env.adminName.trim() || "Administrador";

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        nombre,
        passwordHash,
        rol: "ADMIN",
        estado: "ACTIVO",
        activo: true,
        activatedAt: now,
        activationTokenHash: null,
        activationTokenExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(users.id, existing.id));
    console.log(`Administrador actualizado con contraseña hasheada: ${username}`);
    return;
  }

  await db.insert(users).values({
    nombre,
    username,
    passwordHash,
    rol: "ADMIN",
    estado: "ACTIVO",
    activo: true,
    activatedAt: now,
  });

  console.log(`Administrador inicial creado con contraseña hasheada: ${username}`);
}

import { eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { hashPassword } from "../lib/crypto.js";
import { db, pool } from "./index.js";
import { users } from "./schema/index.js";

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Debes configurar ADMIN_USERNAME y ADMIN_PASSWORD.",
    );
  }

  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    console.log(`El usuario "${username}" ya existe. No se realizaron cambios.`);
    return;
  }

  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    nombre: "Administrador",
    username,
    passwordHash,
    rol: "ADMIN",
    estado: "ACTIVO",
    activo: true,
    activatedAt: new Date(),
    passwordChangedAt: new Date(),
  });

  console.log(`Administrador "${username}" creado correctamente.`);
}

main()
  .catch((error) => {
    console.error("Error al crear el administrador:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
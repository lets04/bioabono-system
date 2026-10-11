import { config } from "dotenv";

config();

export const env = {
  databaseUrl: required("DATABASE_URL"),
  // Duración de una sesión normal; antes de que venza, el usuario puede alargarla otras tantas horas.
  sessionMaxHours: positiveNumber("SESSION_MAX_HOURS", 8),
  // Días sin uso tras los que vence una sesión con "Mantener sesión iniciada".
  sessionRememberDays: positiveNumber("SESSION_REMEMBER_DAYS", 30),
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  adminUsername: process.env.ADMIN_USERNAME ?? "info@entropicaingenieria.com",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminName: process.env.ADMIN_NAME ?? "Administrador",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? process.env.SMTP_PASSWORD ?? "",
  smtpFrom: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "BIOABONO <noreply@localhost>",
  smtpSecure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  activationTokenTtlHours: Number(process.env.ACTIVATION_TOKEN_TTL_HOURS ?? 72),
  passwordResetTokenTtlHours: Number(process.env.PASSWORD_RESET_TOKEN_TTL_HOURS ?? 1),
  // Desfase horario del negocio para interpretar filtros de fecha (Bolivia = UTC-4)
  businessUtcOffset: process.env.BUSINESS_UTC_OFFSET ?? "-04:00",
  // Solo detrás de un proxy propio (Nginx, etc.): toma la IP del cliente de X-Forwarded-For.
  trustProxy: process.env.TRUST_PROXY === "true",
  // Cookie de sesión solo por HTTPS; por defecto activa en producción.
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
  // Orígenes permitidos para CORS (separados por coma) cuando el frontend se sirve desde otro dominio.
  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

function positiveNumber(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} debe ser un número mayor que 0`);
  return value;
}

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

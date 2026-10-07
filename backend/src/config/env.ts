import { config } from "dotenv";

config();

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
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
};

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

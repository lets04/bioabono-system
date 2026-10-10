import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function isSmtpConfigured() {
  return Boolean(env.smtpHost);
}

export async function sendMail(message: MailMessage) {
  if (!isSmtpConfigured()) {
    console.warn("[mail] SMTP no configurado. El correo no se envió.");
    // El texto incluye enlaces de activación/recuperación válidos: solo se muestra fuera de producción.
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[mail] Para: ${message.to}`);
      console.warn(`[mail] Asunto: ${message.subject}`);
      console.warn(`[mail] ${message.text}`);
    }
    return { delivered: false as const };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  });

  await transporter.sendMail({
    from: env.smtpFrom,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return { delivered: true as const };
}

export function invitationEmail(nombre: string, username: string, activateUrl: string) {
  return {
    to: username,
    subject: "Activa tu cuenta BIOABONO",
    text: `Hola ${nombre},\n\nFuiste invitado a BIOABONO. Activa tu cuenta y crea tu contraseña en:\n${activateUrl}\n\nEl enlace vence y solo puede usarse una vez.`,
    html: `<p>Hola ${nombre},</p><p>Fuiste invitado a BIOABONO. Activa tu cuenta y crea tu contraseña en el siguiente enlace:</p><p><a href="${activateUrl}">${activateUrl}</a></p><p>El enlace vence y solo puede usarse una vez.</p>`,
  };
}

export function passwordResetEmail(nombre: string, username: string, resetUrl: string) {
  return {
    to: username,
    subject: "Restablecer contraseña BIOABONO",
    text: `Hola ${nombre},\n\nRecibimos una solicitud para restablecer tu contraseña. Usa este enlace:\n${resetUrl}\n\nSi no lo solicitaste, ignora este mensaje.`,
    html: `<p>Hola ${nombre},</p><p>Recibimos una solicitud para restablecer tu contraseña. Usa este enlace:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no lo solicitaste, ignora este mensaje.</p>`,
  };
}

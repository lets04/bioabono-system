import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function unusablePasswordHash() {
  return hashPassword(crypto.randomBytes(32).toString("hex"));
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSecureToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

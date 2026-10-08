import { SignJWT, jwtVerify } from "jose";
import { env } from "../config/env.js";

export type JwtPayload = {
  userId: number;
  username: string;
  rol: "ADMIN" | "EMPLEADO";
};

export type VerifiedJwtPayload = JwtPayload & { issuedAt: number };

const secret = new TextEncoder().encode(env.jwtSecret);

export async function signAuthToken(payload: JwtPayload) {
  return new SignJWT({
    userId: payload.userId,
    username: payload.username,
    rol: payload.rol,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(env.jwtExpiresIn)
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<VerifiedJwtPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  const userId = Number(payload.userId ?? payload.sub);
  const username = typeof payload.username === "string" ? payload.username : "";
  const rol = payload.rol === "ADMIN" || payload.rol === "EMPLEADO" ? payload.rol : null;
  if (!Number.isInteger(userId) || userId <= 0 || !username || !rol || typeof payload.iat !== "number") {
    throw new Error("INVALID_TOKEN");
  }
  return { userId, username, rol, issuedAt: payload.iat };
}

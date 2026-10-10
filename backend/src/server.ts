import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { app } from "./app.js";
import { env } from "./config/env.js";

// CORS solo para orígenes declarados en CORS_ORIGINS. En desarrollo el proxy de Vite sirve
// el frontend y la API desde el mismo origen y no hace falta.
function corsHeaders(origin: string | null): Record<string, string> | null {
  if (!origin || !env.corsOrigins.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "Content-Disposition",
    Vary: "Origin",
  };
}

new Elysia({ adapter: node() })
  .onRequest(({ request, set }) => {
    const headers = corsHeaders(request.headers.get("origin"));
    if (!headers) return;
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    Object.assign(set.headers, headers);
  })
  .use(app)
  .listen(env.port);

console.log(`BIOABONO API listening on http://localhost:${env.port}`);

// Limitador de intentos en memoria (ventana fija). Suficiente para una sola instancia del API;
// con varias instancias habría que moverlo a un almacenamiento compartido.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > limit) throw new Error("RATE_LIMITED");
}

export function clientIp(headers: Record<string, string | undefined>) {
  return headers["x-forwarded-for"]?.split(",")[0]?.trim() || headers["x-real-ip"] || "unknown";
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref();

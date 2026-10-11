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

/** Petición del adaptador de Node (srvx), que expone la IP del socket en `ip`. */
type IpSource = { headers: Headers; ip?: string };

/**
 * IP del cliente para el limitador. Las cabeceras X-Forwarded-For / X-Real-IP las puede
 * inventar cualquiera, así que solo se usan si el API está detrás de un proxy propio.
 */
export function clientIp(request: IpSource, trustProxy: boolean) {
  if (trustProxy) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
    if (forwarded) return forwarded;
  }
  return request.ip || "unknown";
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref();

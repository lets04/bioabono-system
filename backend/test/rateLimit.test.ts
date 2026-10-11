import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, clientIp } from "../src/lib/rateLimit.js";

describe("checkRateLimit", () => {
  afterEach(() => vi.useRealTimers());

  it("permite hasta el límite y luego rechaza", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3, 60_000);
    expect(() => checkRateLimit(key, 3, 60_000)).toThrow("RATE_LIMITED");
  });

  it("reinicia el contador al terminar la ventana", () => {
    vi.useFakeTimers();
    const key = `test:${Math.random()}`;
    checkRateLimit(key, 1, 1_000);
    expect(() => checkRateLimit(key, 1, 1_000)).toThrow("RATE_LIMITED");
    vi.advanceTimersByTime(1_001);
    expect(() => checkRateLimit(key, 1, 1_000)).not.toThrow();
  });
});

describe("clientIp", () => {
  const request = (headers: Record<string, string>, ip?: string) => ({ headers: new Headers(headers), ip });

  it("sin proxy de confianza ignora las cabeceras y usa la IP del socket", () => {
    expect(clientIp(request({ "x-forwarded-for": "10.0.0.1" }, "192.168.1.5"), false)).toBe("192.168.1.5");
    expect(clientIp(request({}), false)).toBe("unknown");
  });

  it("con proxy de confianza toma la primera IP de x-forwarded-for", () => {
    expect(clientIp(request({ "x-forwarded-for": "10.0.0.1, 10.0.0.2" }, "127.0.0.1"), true)).toBe("10.0.0.1");
    expect(clientIp(request({ "x-real-ip": "10.0.0.3" }, "127.0.0.1"), true)).toBe("10.0.0.3");
    expect(clientIp(request({}, "127.0.0.1"), true)).toBe("127.0.0.1");
  });
});

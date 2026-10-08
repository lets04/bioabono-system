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
  it("toma la primera IP de x-forwarded-for", () => {
    expect(clientIp({ "x-forwarded-for": "10.0.0.1, 10.0.0.2" })).toBe("10.0.0.1");
    expect(clientIp({ "x-real-ip": "10.0.0.3" })).toBe("10.0.0.3");
    expect(clientIp({})).toBe("unknown");
  });
});

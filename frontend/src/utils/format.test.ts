import { afterEach, describe, expect, it, vi } from "vitest";
import { dateInputToISO, hasDuplicates, todayLocal } from "./format";

describe("fechas locales", () => {
  afterEach(() => vi.useRealTimers());

  it("todayLocal usa la fecha local, no la UTC", () => {
    // 22:30 del 7 de octubre en hora local: en UTC-4 ya sería 8 de octubre.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 7, 22, 30));
    expect(todayLocal()).toBe("2026-10-07");
  });

  it("dateInputToISO conserva el día elegido en hora local", () => {
    const iso = dateInputToISO("2026-03-15");
    const local = new Date(iso);
    expect([local.getFullYear(), local.getMonth() + 1, local.getDate()]).toEqual([2026, 3, 15]);
  });

  it("dateInputToISO usa la hora actual cuando la fecha es hoy", () => {
    vi.useFakeTimers();
    const now = new Date(2026, 9, 7, 21, 45);
    vi.setSystemTime(now);
    expect(dateInputToISO("2026-10-07")).toBe(now.toISOString());
  });
});

describe("hasDuplicates", () => {
  it("detecta ids repetidos", () => {
    expect(hasDuplicates([1, 2, 3])).toBe(false);
    expect(hasDuplicates([1, 2, 1])).toBe(true);
  });
});

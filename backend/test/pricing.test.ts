import { describe, expect, it } from "vitest";
import { derivedPriceCents, derivedPrices, fromCents, toCents } from "../src/lib/pricing.js";

describe("pricing", () => {
  it("convierte importes a centavos sin errores de coma flotante", () => {
    expect(toCents("19.99")).toBe(1999);
    expect(toCents(0.1) * 3).toBe(30);
    expect(fromCents(30)).toBe("0.30");
  });

  it("aplica los factores de precio y redondea a centavos", () => {
    expect(derivedPriceCents("15.50", "PVP")).toBe(1550);
    expect(derivedPriceCents("15.50", "CONTADO")).toBe(1163); // 11.625 -> 11.63
    expect(derivedPriceCents("15.50", "MAYORISTA")).toBe(1085);
    expect(derivedPriceCents("15.50", "CONSIGNACION")).toBe(1240);
  });

  it("usa PVP para un tipo de precio desconocido", () => {
    expect(derivedPriceCents("10", "OTRO")).toBe(1000);
  });

  it("expone los precios derivados como texto con dos decimales", () => {
    expect(derivedPrices("100")).toEqual({ consignacion: "80.00", contado: "75.00", mayorista: "70.00" });
  });
});

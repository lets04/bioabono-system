// Reglas de precio del negocio, en un solo lugar.
export const PRICE_FACTORS = {
  PVP: 1,
  CONTADO: 0.75,
  MAYORISTA: 0.7,
  CONSIGNACION: 0.8,
} as const;

export type PriceType = keyof typeof PRICE_FACTORS;

/** Los importes se calculan en centavos enteros para evitar errores de coma flotante. */
export const toCents = (value: string | number) => Math.round(Number(value) * 100);

export const fromCents = (cents: number) => (cents / 100).toFixed(2);

export function derivedPriceCents(pvp: string | number, tipo: string) {
  const factor = PRICE_FACTORS[tipo as PriceType] ?? PRICE_FACTORS.PVP;
  return Math.round(toCents(pvp) * factor);
}

export function derivedPrices(pvp: string | number) {
  return {
    consignacion: fromCents(derivedPriceCents(pvp, "CONSIGNACION")),
    contado: fromCents(derivedPriceCents(pvp, "CONTADO")),
    mayorista: fromCents(derivedPriceCents(pvp, "MAYORISTA")),
  };
}

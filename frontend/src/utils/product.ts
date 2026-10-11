import type { Product, ProductFormState } from "../types";

export const productUnits = ["kg", "Tn", "L"] as const;

export const productToForm = (product?: Product): ProductFormState => ({
  nombre: product?.nombre ?? "",
  abreviacion: product?.abreviacion ?? "",
  descripcion: product?.descripcion ?? "",
  categoriaId: product?.categoriaId ? String(product.categoriaId) : "",
  activo: product?.activo ?? true,
  presentaciones: product?.presentaciones?.length
    ? product.presentaciones.map((p) => ({
        id: p.id,
        cantidad: p.cantidad,
        unidadMedida: p.unidadMedida,
        pvp: p.pvp,
        stockMinimo: String(p.stockMinimo),
        activo: p.activo,
      }))
    : [{ cantidad: "1", unidadMedida: "kg", pvp: "0", stockMinimo: "0", activo: true }],
});

export const normalizeProductPayload = (payload: ProductFormState) => ({
  nombre: payload.nombre,
  abreviacion: payload.abreviacion.toUpperCase(),
  descripcion: payload.descripcion || null,
  categoriaId: payload.categoriaId ? Number(payload.categoriaId) : null,
  activo: payload.activo,
  presentaciones: payload.presentaciones.map((p) => ({
    ...(p.id ? { id: p.id } : {}),
    cantidad: p.cantidad,
    unidadMedida: p.unidadMedida,
    pvp: p.pvp,
    stockMinimo: Number(p.stockMinimo || 0),
    activo: p.activo,
  })),
});

// Vista previa mientras se edita el PVP; replica la regla del backend (backend/src/lib/pricing.ts).
const priceWithFactor = (pvp: number, factor: number) => Math.round(Math.round(pvp * 100) * factor) / 100;

export const derivedPrices = (pvp: number) => ({
  consignacion: priceWithFactor(pvp, 0.8),
  contado: priceWithFactor(pvp, 0.75),
  mayorista: priceWithFactor(pvp, 0.7),
});

export const previewCodigo = (abreviacion: string, cantidad: string) => {
  const abrev = abreviacion.trim().toUpperCase() || "XXX";
  const num = Math.trunc(Number(cantidad) || 0);
  return `${abrev}-${String(num).padStart(3, "0")}`;
};

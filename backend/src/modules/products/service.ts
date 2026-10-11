import * as repository from "./repository.js";
import { generateCodigo } from "./repository.js";
import { productCreateSchema, productUpdateSchema } from "./schema.js";
import { derivedPrices } from "../../lib/pricing.js";

function enrichProduct<P extends { presentaciones: Array<{ pvp: string }> }>(product: P) {
  return {
    ...product,
    presentaciones: product.presentaciones.map((pres) => ({ ...pres, preciosDerivados: derivedPrices(pres.pvp) })),
  };
}

/**
 * Genera el código de cada presentación (índice → código) y verifica que no exista
 * en otra presentación ni se repita dentro de la misma solicitud.
 */
async function buildCodigoMap(abreviacion: string, presentaciones: Array<{ cantidad: string; id?: number }>) {
  const codigoMap = new Map<number, string>();
  for (const [idx, pres] of presentaciones.entries()) {
    const codigo = generateCodigo(abreviacion, pres.cantidad);
    const duplicate = await repository.getPresentationByCodigo(codigo, pres.id);
    if (duplicate) throw new Error(`PRESENTATION_CODE_EXISTS:${codigo}`);
    if ([...codigoMap.values()].includes(codigo)) throw new Error(`PRESENTATION_CODE_DUPLICATE_IN_REQUEST:${codigo}`);
    codigoMap.set(idx, codigo);
  }
  return codigoMap;
}

export async function listProducts(search?: string, includeInactive?: boolean) {
  const rows = await repository.listProducts(search, includeInactive ?? true);
  return rows.map(enrichProduct);
}

export async function getProduct(id: number) {
  const product = await repository.getProductById(id);
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  return enrichProduct(product);
}

export async function createProduct(body: unknown) {
  const input = productCreateSchema.parse(body);

  const abrevUpper = input.abreviacion.toUpperCase();
  const duplicateAbrev = await repository.getProductByAbreviacion(abrevUpper);
  if (duplicateAbrev) throw new Error("PRODUCT_ABREVIACION_EXISTS");

  const codigoMap = await buildCodigoMap(abrevUpper, input.presentaciones);

  const productId = await repository.createProduct({ ...input, codigoMap });
  const product = await repository.getProductById(productId);
  if (!product) throw new Error("PRODUCT_CREATE_FAILED");
  return enrichProduct(product);
}

export async function updateProduct(id: number, body: unknown) {
  const current = await getProduct(id);
  const input = productUpdateSchema.parse(body);

  const abrevUpper = input.abreviacion?.toUpperCase();
  if (abrevUpper) {
    const duplicate = await repository.getProductByAbreviacion(abrevUpper, id);
    if (duplicate) throw new Error("PRODUCT_ABREVIACION_EXISTS");
  }

  const codigoMap = input.presentaciones?.length
    ? await buildCodigoMap(abrevUpper ?? current.abreviacion, input.presentaciones)
    : undefined;

  await repository.updateProduct(id, { ...input, codigoMap });
  const product = await repository.getProductById(id);
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  return enrichProduct(product);
}

export async function setProductStatus(id: number, activo: boolean) {
  await getProduct(id);
  const product = await repository.setProductStatus(id, activo);
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  return enrichProduct(product);
}

import * as repository from "./repository.js";
import { generateCodigo } from "./repository.js";
import { productCreateSchema, productUpdateSchema } from "./schema.js";

function withDerivedPrices<T extends { pvp: string | number }>(pres: T) {
  const pvp = Number(pres.pvp);
  return {
    ...pres,
    preciosDerivados: {
      consignacion: (pvp * 0.8).toFixed(2),
      contado: (pvp * 0.75).toFixed(2),
      mayorista: (pvp * 0.7).toFixed(2),
    },
  };
}

function enrichProduct(product: any) {
  return {
    ...product,
    presentaciones: (product.presentaciones ?? []).map((pres: any) => withDerivedPrices(pres)),
  };
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

  // Generate codigos and check uniqueness
  const codigoMap = new Map<number, string>();
  for (let i = 0; i < input.presentaciones.length; i++) {
    const pres = input.presentaciones[i];
    const codigo = generateCodigo(abrevUpper, pres.cantidad);
    const duplicateCodigo = await repository.getPresentationByCodigo(codigo);
    if (duplicateCodigo) throw new Error(`PRESENTATION_CODE_EXISTS:${codigo}`);
    // Also check duplicate within same request (same cantidad+unidad duplicate via unique index will catch, but checkCodigo duplicate for same abreviacion+cantidad with different unidades also collides on codigo)
    if ([...codigoMap.values()].includes(codigo)) throw new Error(`PRESENTATION_CODE_DUPLICATE_IN_REQUEST:${codigo}`);
    codigoMap.set(i, codigo);
  }

  const productId = await repository.createProduct({ ...input, codigoMap } as any);
  const product = await repository.getProductById(productId);
  if (!product) throw new Error("PRODUCT_CREATE_FAILED");
  return enrichProduct(product);
}

export async function updateProduct(id: number, body: unknown) {
  await getProduct(id);
  const input = productUpdateSchema.parse(body);

  let abrevUpper: string | undefined;
  if (input.abreviacion) {
    abrevUpper = input.abreviacion.toUpperCase();
    const duplicate = await repository.getProductByAbreviacion(abrevUpper, id);
    if (duplicate) throw new Error("PRODUCT_ABREVIACION_EXISTS");
  }

  // If presentaciones are being updated, generate codigos for them
  let codigoMap: Map<number, string> | undefined;
  if (input.presentaciones && input.presentaciones.length > 0) {
    // Need current product abreviacion if not changing
    let effectiveAbrev = abrevUpper;
    if (!effectiveAbrev) {
      const current = await repository.getProductById(id);
      effectiveAbrev = current!.abreviacion;
    }

    codigoMap = new Map();
    for (let i = 0; i < input.presentaciones.length; i++) {
      const pres: any = input.presentaciones[i];
      const codigo = generateCodigo(effectiveAbrev!, pres.cantidad);
      // Check global duplicate excluding current presentation id if updating
      const duplicate = await repository.getPresentationByCodigo(codigo, pres.id);
      if (duplicate) throw new Error(`PRESENTATION_CODE_EXISTS:${codigo}`);
      if ([...codigoMap.values()].includes(codigo)) throw new Error(`PRESENTATION_CODE_DUPLICATE_IN_REQUEST:${codigo}`);
      codigoMap.set(i, codigo);
    }
  }

  await repository.updateProduct(id, { ...input, codigoMap } as any);
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

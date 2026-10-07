import { and, eq } from "drizzle-orm";

import { db, pool } from "./index.js";
import {
  categories,
  productPresentations,
  products,
} from "./schema/index.js";
import { seedAdmin } from "./seedAdmin.js";

const categoryData = [
  "Bioabonos",
  "Biocompost",
  "Biochar",
  "Biofertilizantes líquidos",
  "Fibras",
  "Fertilizantes",
  "Insecticidas Naturales",
  "Otros",
] as const;

type PresentationSeed = {
  cantidad: number;
  unidadMedida: string;
  pvp: string;
};

type ProductSeed = {
  nombre: string;
  abreviacion: string;
  categoria: (typeof categoryData)[number];
  presentaciones: PresentationSeed[];
};

// Fuente: LISTA DE PRECIOS INTERNA SUPERMERCADO DEL ABONO.xlsx
// Este seed carga únicamente categorías, productos y presentaciones.
// No crea usuarios, clientes, proveedores, compras, ventas,
// consignaciones ni movimientos de inventario.
//
// Los precios P CONS, PVC y PVM no se almacenan aquí porque el modelo
// actual guarda PVP y el backend deriva los precios comerciales.
//
// Las dos variantes de CENICIENTA se mantienen como productos base
// separados porque ambas son de 1 L y el modelo actual no tiene un
// campo de variante que permita distinguirlas dentro del mismo producto.
//
// ACEITE DE NEEM y ACEITE DE NEEM K se crean como productos base,
// pero sin presentación porque el Excel no proporciona contenido ni PVP.

const productData: ProductSeed[] = [
  {
    nombre: "Bioabono Universal",
    abreviacion: "BAU",
    categoria: "Bioabonos",
    presentaciones: [
      { cantidad: 25, unidadMedida: "Kg", pvp: "55.00" },
      { cantidad: 12, unidadMedida: "Kg", pvp: "30.00" },
      { cantidad: 3, unidadMedida: "Kg", pvp: "15.00" },
      { cantidad: 1, unidadMedida: "Tn", pvp: "1650.00" },
    ],
  },
  {
    nombre: "Biocésped",
    abreviacion: "BCE",
    categoria: "Bioabonos",
    presentaciones: [
      { cantidad: 46, unidadMedida: "Kg", pvp: "110.00" },
      { cantidad: 25, unidadMedida: "Kg", pvp: "55.00" },
      { cantidad: 12, unidadMedida: "Kg", pvp: "30.00" },
      { cantidad: 1, unidadMedida: "Tn", pvp: "1793.48" },
    ],
  },
  {
    nombre: "BioSuculentas",
    abreviacion: "BSU",
    categoria: "Bioabonos",
    presentaciones: [
      { cantidad: 25, unidadMedida: "Kg", pvp: "75.00" },
      { cantidad: 12, unidadMedida: "Kg", pvp: "40.00" },
      { cantidad: 3, unidadMedida: "Kg", pvp: "15.00" },
    ],
  },
  {
    nombre: "BioOrquídeas",
    abreviacion: "BOR",
    categoria: "Bioabonos",
    presentaciones: [
      { cantidad: 25, unidadMedida: "Kg", pvp: "75.00" },
      { cantidad: 12, unidadMedida: "Kg", pvp: "40.00" },
      { cantidad: 3, unidadMedida: "Kg", pvp: "15.00" },
    ],
  },
  {
    nombre: "Agroelixir",
    abreviacion: "AGR",
    categoria: "Biofertilizantes líquidos",
    presentaciones: [
      { cantidad: 20, unidadMedida: "L", pvp: "180.00" },
      { cantidad: 3, unidadMedida: "L", pvp: "28.00" },
      { cantidad: 2, unidadMedida: "L", pvp: "20.00" },
      { cantidad: 1, unidadMedida: "L", pvp: "12.00" },
      { cantidad: 1000, unidadMedida: "L", pvp: "4500.00" },
    ],
  },
  {
    nombre: "Biocompost 3",
    abreviacion: "BCTRES",
    categoria: "Biocompost",
    presentaciones: [
      { cantidad: 46, unidadMedida: "Kg", pvp: "110.00" },
      { cantidad: 25, unidadMedida: "Kg", pvp: "55.00" },
      { cantidad: 12, unidadMedida: "Kg", pvp: "30.00" },
      { cantidad: 3, unidadMedida: "Kg", pvp: "15.00" },
      { cantidad: 1, unidadMedida: "Tn", pvp: "1793.48" },
    ],
  },
  {
    nombre: "Biocompost 5",
    abreviacion: "BCCINCO",
    categoria: "Biocompost",
    presentaciones: [
      { cantidad: 46, unidadMedida: "Kg", pvp: "110.00" },
      { cantidad: 25, unidadMedida: "Kg", pvp: "55.00" },
      { cantidad: 12, unidadMedida: "Kg", pvp: "30.00" },
      { cantidad: 3, unidadMedida: "Kg", pvp: "15.00" },
      { cantidad: 1, unidadMedida: "Tn", pvp: "1793.48" },
    ],
  },
  {
    nombre: "Biocompost para Suculentas",
    abreviacion: "BCS",
    categoria: "Biocompost",
    presentaciones: [
      { cantidad: 12, unidadMedida: "Kg", pvp: "30.00" },
    ],
  },
  {
    nombre: "Biochar Fino",
    abreviacion: "BFIN",
    categoria: "Biochar",
    presentaciones: [
      { cantidad: 20, unidadMedida: "Kg", pvp: "170.00" },
      { cantidad: 10, unidadMedida: "Kg", pvp: "90.00" },
      { cantidad: 5, unidadMedida: "Kg", pvp: "50.00" },
      { cantidad: 1, unidadMedida: "Kg", pvp: "13.00" },
      { cantidad: 1, unidadMedida: "Tn", pvp: "6375.00" },
    ],
  },
  {
    nombre: "Biochar Granulado",
    abreviacion: "BGRA",
    categoria: "Biochar",
    presentaciones: [
      { cantidad: 20, unidadMedida: "Kg", pvp: "170.00" },
      { cantidad: 10, unidadMedida: "Kg", pvp: "90.00" },
      { cantidad: 5, unidadMedida: "Kg", pvp: "50.00" },
      { cantidad: 1, unidadMedida: "Kg", pvp: "13.00" },
      { cantidad: 1, unidadMedida: "Tn", pvp: "6375.00" },
    ],
  },
  {
    nombre: "Fibra de Coco Polvo",
    abreviacion: "FCP",
    categoria: "Fibras",
    presentaciones: [
      { cantidad: 2500, unidadMedida: "g", pvp: "140.00" },
      { cantidad: 500, unidadMedida: "g", pvp: "30.00" },
    ],
  },
  {
    nombre: "Fibra Corta de Coco",
    abreviacion: "FCC",
    categoria: "Fibras",
    presentaciones: [
      { cantidad: 3000, unidadMedida: "g", pvp: "150.00" },
      { cantidad: 1500, unidadMedida: "g", pvp: "80.00" },
      { cantidad: 200, unidadMedida: "g", pvp: "15.00" },
    ],
  },
  {
    nombre: "Fibra Larga de Coco",
    abreviacion: "FLC",
    categoria: "Fibras",
    presentaciones: [
      { cantidad: 3000, unidadMedida: "g", pvp: "150.00" },
      { cantidad: 1500, unidadMedida: "g", pvp: "80.00" },
      { cantidad: 200, unidadMedida: "g", pvp: "15.00" },
    ],
  },
  {
    nombre: "Super Agro",
    abreviacion: "SAGR",
    categoria: "Bioabonos",
    presentaciones: [
      { cantidad: 46, unidadMedida: "Kg", pvp: "110.00" },
      { cantidad: 25, unidadMedida: "Kg", pvp: "55.00" },
      { cantidad: 12, unidadMedida: "Kg", pvp: "30.00" },
      { cantidad: 3, unidadMedida: "Kg", pvp: "15.00" },
      { cantidad: 1, unidadMedida: "Tn", pvp: "1793.48" },
    ],
  },
  {
    nombre: "Roca Fosfórica",
    abreviacion: "RFOS",
    categoria: "Fertilizantes",
    presentaciones: [
      { cantidad: 50, unidadMedida: "Kg", pvp: "180.00" },
      { cantidad: 1, unidadMedida: "Kg", pvp: "10.00" },
    ],
  },
  {
    nombre: "Tierra de Diatomeas",
    abreviacion: "TDI",
    categoria: "Fertilizantes",
    presentaciones: [
      { cantidad: 50, unidadMedida: "Kg", pvp: "210.00" },
      { cantidad: 1, unidadMedida: "Kg", pvp: "10.00" },
      { cantidad: 1, unidadMedida: "Tn", pvp: "4100.00" },
    ],
  },
  {
    nombre: "Yeso Agrícola",
    abreviacion: "YAGR",
    categoria: "Fertilizantes",
    presentaciones: [
      { cantidad: 50, unidadMedida: "Kg", pvp: "100.00" },
      { cantidad: 1, unidadMedida: "Kg", pvp: "7.00" },
    ],
  },
  {
    nombre: "Cal Agrícola",
    abreviacion: "CAGR",
    categoria: "Fertilizantes",
    presentaciones: [
      { cantidad: 50, unidadMedida: "Kg", pvp: "120.00" },
      { cantidad: 1, unidadMedida: "Kg", pvp: "7.00" },
    ],
  },
  {
    nombre: "Dolomita",
    abreviacion: "DOL",
    categoria: "Fertilizantes",
    presentaciones: [
      { cantidad: 50, unidadMedida: "Kg", pvp: "100.00" },
      { cantidad: 1, unidadMedida: "Kg", pvp: "7.00" },
    ],
  },
  {
    nombre: "Azufre",
    abreviacion: "AZU",
    categoria: "Fertilizantes",
    presentaciones: [
      { cantidad: 50, unidadMedida: "Kg", pvp: "720.00" },
      { cantidad: 1, unidadMedida: "Kg", pvp: "18.00" },
    ],
  },
  {
    nombre: "Zeolita",
    abreviacion: "ZEO",
    categoria: "Fertilizantes",
    presentaciones: [
      { cantidad: 25, unidadMedida: "Kg", pvp: "450.00" },
      { cantidad: 1, unidadMedida: "Kg", pvp: "20.00" },
    ],
  },
  {
    nombre: "Urea",
    abreviacion: "URE",
    categoria: "Fertilizantes",
    presentaciones: [
      { cantidad: 1, unidadMedida: "Kg", pvp: "20.00" },
      { cantidad: 0.5, unidadMedida: "Kg", pvp: "10.00" },
    ],
  },
  {
    nombre: "Cenicienta (Lejía Potásica Concentrada)",
    abreviacion: "CENC",
    categoria: "Insecticidas Naturales",
    presentaciones: [
      { cantidad: 1, unidadMedida: "L", pvp: "60.00" },
    ],
  },
  {
    nombre: "Cenicienta (Lejía Potásica Preparada)",
    abreviacion: "CENP",
    categoria: "Insecticidas Naturales",
    presentaciones: [
      { cantidad: 1, unidadMedida: "L", pvp: "20.00" },
    ],
  },
  {
    nombre: "Jabón Potásico",
    abreviacion: "JPO",
    categoria: "Insecticidas Naturales",
    presentaciones: [
      { cantidad: 400, unidadMedida: "g", pvp: "60.00" },
      { cantidad: 1, unidadMedida: "L", pvp: "20.00" },
    ],
  },
  {
    nombre: "Aceite de Neem",
    abreviacion: "ANE",
    categoria: "Insecticidas Naturales",
    presentaciones: [],
  },
  {
    nombre: "Aceite de Neem K",
    abreviacion: "ANEK",
    categoria: "Insecticidas Naturales",
    presentaciones: [],
  },
];

function formatCodePart(cantidad: number): string {
  if (Number.isInteger(cantidad)) {
    return String(cantidad).padStart(3, "0");
  }

  const normalized = cantidad.toString().replace(/\.?0+$/, "");
  const [integerPart, decimalPart] = normalized.split(".");
  return `${integerPart.padStart(3, "0")}.${decimalPart}`;
}

function makePresentationCode(
  abreviacion: string,
  cantidad: number,
  unidadMedida: string,
  usedCodes: Set<string>,
): string {
  const base = `${abreviacion}-${formatCodePart(cantidad)}`;

  if (!usedCodes.has(base)) {
    usedCodes.add(base);
    return base;
  }

  // Evita colisiones como 1 Kg y 1 Tn del mismo producto.
  const withUnit = `${base}-${unidadMedida.toUpperCase()}`;

  if (!usedCodes.has(withUnit)) {
    usedCodes.add(withUnit);
    return withUnit;
  }

  let suffix = 2;
  let candidate = `${withUnit}-${suffix}`;

  while (usedCodes.has(candidate)) {
    suffix += 1;
    candidate = `${withUnit}-${suffix}`;
  }

  usedCodes.add(candidate);
  return candidate;
}

async function getOrCreateCategory(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  nombre: string,
): Promise<number> {
  const existing = await tx
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.nombre, nombre))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const [created] = await tx
    .insert(categories)
    .values({
      nombre,
      activo: true,
    })
    .returning({ id: categories.id });

  return created.id;
}

async function getOrCreateProduct(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  product: ProductSeed,
  categoriaId: number,
): Promise<number> {
  const existing = await tx
    .select({ id: products.id })
    .from(products)
    .where(eq(products.abreviacion, product.abreviacion))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const [created] = await tx
    .insert(products)
    .values({
      nombre: product.nombre,
      abreviacion: product.abreviacion,
      categoriaId,
      activo: true,
    })
    .returning({ id: products.id });

  return created.id;
}

async function seed() {
  await seedAdmin();

  let categoriesCreated = 0;
  let productsCreated = 0;
  let presentationsCreated = 0;

  await db.transaction(async (tx) => {
    const categoryIds = new Map<string, number>();

    for (const categoryName of categoryData) {
      const before = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.nombre, categoryName))
        .limit(1);

      const id = await getOrCreateCategory(tx, categoryName);

      if (!before[0]) {
        categoriesCreated += 1;
      }

      categoryIds.set(categoryName, id);
    }

    const usedCodes = new Set<string>(
      (
        await tx
          .select({ codigo: productPresentations.codigo })
          .from(productPresentations)
      ).map((row) => row.codigo),
    );

    for (const product of productData) {
      const categoriaId = categoryIds.get(product.categoria);

      if (!categoriaId) {
        throw new Error(`Categoría no encontrada: ${product.categoria}`);
      }

      const before = await tx
        .select({ id: products.id })
        .from(products)
        .where(eq(products.abreviacion, product.abreviacion))
        .limit(1);

      const productoId = await getOrCreateProduct(tx, product, categoriaId);

      if (!before[0]) {
        productsCreated += 1;
      }

      for (const presentation of product.presentaciones) {
        const existing = await tx
          .select({ id: productPresentations.id })
          .from(productPresentations)
          .where(
            and(
              eq(productPresentations.productoId, productoId),
              eq(productPresentations.cantidad, String(presentation.cantidad)),
              eq(productPresentations.unidadMedida, presentation.unidadMedida),
            ),
          )
          .limit(1);

        if (existing[0]) {
          continue;
        }

        const codigo = makePresentationCode(
          product.abreviacion,
          presentation.cantidad,
          presentation.unidadMedida,
          usedCodes,
        );

        await tx.insert(productPresentations).values({
          productoId,
          codigo,
          cantidad: String(presentation.cantidad),
          unidadMedida: presentation.unidadMedida,
          pvp: presentation.pvp,
          stockActual: 0,
          stockMinimo: 0,
          activo: true,
        });

        presentationsCreated += 1;
      }
    }
  });

  console.log("Seed BIOABONO completado.");
  console.log(`Categorías creadas: ${categoriesCreated}`);
  console.log(`Productos creados: ${productsCreated}`);
  console.log(`Presentaciones creadas: ${presentationsCreated}`);
}

try {
  await seed();
} finally {
  await pool.end();
}

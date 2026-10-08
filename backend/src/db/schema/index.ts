import {
  boolean,
  check,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "EMPLEADO"]);
export const userStatusEnum = pgEnum("user_status", ["PENDIENTE", "ACTIVO", "INACTIVO"]);
export const priceTypeEnum = pgEnum("price_type", ["PVP", "CONSIGNACION", "CONTADO", "MAYORISTA"]);
export const consignmentStatusEnum = pgEnum("consignment_status", ["PENDIENTE", "LIQUIDADA"]);
export const movementTypeEnum = pgEnum("movement_type", [
  "COMPRA",
  "VENTA",
  "SALIDA_A_CONSIGNACION",
  "VENTA_CONSIGNACION",
  "DEVOLUCION_CONSIGNACION",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    nombre: varchar("nombre", { length: 160 }).notNull(),
    username: varchar("username", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    rol: userRoleEnum("rol").notNull(),
    estado: userStatusEnum("estado").notNull().default("PENDIENTE"),
    activo: boolean("activo").notNull().default(true),
    activationTokenHash: text("activation_token_hash"),
    activationTokenExpiresAt: timestamp("activation_token_expires_at", { withTimezone: true }),
    activationUsedAt: timestamp("activation_used_at", { withTimezone: true }),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    passwordResetTokenHash: text("password_reset_token_hash"),
    passwordResetTokenExpiresAt: timestamp("password_reset_token_expires_at", { withTimezone: true }),
    passwordResetUsedAt: timestamp("password_reset_used_at", { withTimezone: true }),
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    usernameIdx: uniqueIndex("users_username_unique").on(table.username),
  }),
);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 140 }).notNull(),
  descripcion: text("descripcion"),
  activo: boolean("activo").notNull().default(true),
  ...timestamps,
});

// PRODUCTO BASE — según nueva especificación: base + presentaciones
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    nombre: varchar("nombre", { length: 180 }).notNull(),
    abreviacion: varchar("abreviacion", { length: 10 }).notNull(),
    descripcion: text("descripcion"),
    categoriaId: integer("categoria_id").references(() => categories.id, { onDelete: "restrict" }),
    activo: boolean("activo").notNull().default(true),
    ...timestamps,
  },
  (table) => ({
    abreviacionIdx: uniqueIndex("products_abreviacion_unique").on(table.abreviacion),
    abreviacionFormat: check("products_abreviacion_format", sql`${table.abreviacion} ~ '^[A-Z]{2,10}$'`),
  }),
);

export const productPresentations = pgTable(
  "product_presentations",
  {
    id: serial("id").primaryKey(),
    productoId: integer("producto_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    codigo: varchar("codigo", { length: 40 }).notNull(),
    cantidad: numeric("cantidad", { precision: 12, scale: 2 }).notNull(),
    unidadMedida: varchar("unidad_medida", { length: 30 }).notNull(),
    pvp: numeric("pvp", { precision: 12, scale: 2 }).notNull(),
    stockActual: integer("stock_actual").notNull().default(0),
    stockMinimo: integer("stock_minimo").notNull().default(0),
    activo: boolean("activo").notNull().default(true),
    ...timestamps,
  },
  (table) => ({
    codigoIdx: uniqueIndex("product_presentations_codigo_unique").on(table.codigo),
    presentacionUnica: uniqueIndex("product_presentations_producto_cantidad_unidad_unique").on(
      table.productoId,
      table.cantidad,
      table.unidadMedida,
    ),
    cantidadPositive: check("product_presentations_cantidad_positive", sql`${table.cantidad} > 0`),
    pvpNonNegative: check("product_presentations_pvp_non_negative", sql`${table.pvp} >= 0`),
    stockActualNonNegative: check(
      "product_presentations_stock_actual_non_negative",
      sql`${table.stockActual} >= 0`,
    ),
    stockMinimoNonNegative: check(
      "product_presentations_stock_minimo_non_negative",
      sql`${table.stockMinimo} >= 0`,
    ),
  }),
);

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 180 }).notNull(),
  nit: varchar("nit", { length: 60 }),
  telefono: varchar("telefono", { length: 60 }),
  email: varchar("email", { length: 160 }),
  direccion: text("direccion"),
  activo: boolean("activo").notNull().default(true),
  ...timestamps,
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 180 }).notNull(),
  nitCi: varchar("nit_ci", { length: 60 }),
  telefono: varchar("telefono", { length: 60 }),
  email: varchar("email", { length: 160 }),
  direccion: text("direccion"),
  activo: boolean("activo").notNull().default(true),
  ...timestamps,
});

export const purchases = pgTable(
  "purchases",
  {
    id: serial("id").primaryKey(),
    numero: varchar("numero", { length: 40 }).notNull(),
    proveedorId: integer("proveedor_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "restrict" }),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    descuento: numeric("descuento", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    estado: varchar("estado", { length: 40 }).notNull(),
    observacion: text("observacion"),
    ...timestamps,
  },
  (table) => ({
    numeroIdx: uniqueIndex("purchases_numero_unique").on(table.numero),
    subtotalNonNegative: check("purchases_subtotal_non_negative", sql`${table.subtotal} >= 0`),
    descuentoNonNegative: check("purchases_descuento_non_negative", sql`${table.descuento} >= 0`),
    totalNonNegative: check("purchases_total_non_negative", sql`${table.total} >= 0`),
  }),
);

export const purchaseDetails = pgTable(
  "purchase_details",
  {
    id: serial("id").primaryKey(),
    compraId: integer("compra_id")
      .notNull()
      .references(() => purchases.id, { onDelete: "cascade" }),
    presentacionId: integer("presentacion_id")
      .notNull()
      .references(() => productPresentations.id, { onDelete: "restrict" }),
    cantidad: integer("cantidad").notNull(),
    precioUnitario: numeric("precio_unitario", { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => ({
    cantidadPositive: check("purchase_details_cantidad_positive", sql`${table.cantidad} > 0`),
    precioUnitarioNonNegative: check(
      "purchase_details_precio_unitario_non_negative",
      sql`${table.precioUnitario} >= 0`,
    ),
    subtotalNonNegative: check("purchase_details_subtotal_non_negative", sql`${table.subtotal} >= 0`),
  }),
);

export const sales = pgTable(
  "sales",
  {
    id: serial("id").primaryKey(),
    numero: varchar("numero", { length: 40 }).notNull(),
    clienteId: integer("cliente_id").references(() => customers.id, { onDelete: "restrict" }),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    descuentoTotal: numeric("descuento_total", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    estado: varchar("estado", { length: 40 }).notNull(),
    observacion: text("observacion"),
    consignacionId: integer("consignacion_id").references(() => consignations.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => ({
    numeroIdx: uniqueIndex("sales_numero_unique").on(table.numero),
    consignacionIdx: uniqueIndex("sales_consignacion_id_unique").on(table.consignacionId),
    subtotalNonNegative: check("sales_subtotal_non_negative", sql`${table.subtotal} >= 0`),
    descuentoTotalNonNegative: check(
      "sales_descuento_total_non_negative",
      sql`${table.descuentoTotal} >= 0`,
    ),
    totalNonNegative: check("sales_total_non_negative", sql`${table.total} >= 0`),
  }),
);

export const saleDetails = pgTable(
  "sale_details",
  {
    id: serial("id").primaryKey(),
    ventaId: integer("venta_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    presentacionId: integer("presentacion_id")
      .notNull()
      .references(() => productPresentations.id, { onDelete: "restrict" }),
    cantidad: integer("cantidad").notNull(),
    tipoPrecio: priceTypeEnum("tipo_precio").notNull(),
    precioUnitario: numeric("precio_unitario", { precision: 12, scale: 2 }).notNull(),
    descuentoPorcentaje: numeric("descuento_porcentaje", { precision: 5, scale: 2 }).notNull().default("0"),
    descuentoMonto: numeric("descuento_monto", { precision: 12, scale: 2 }).notNull().default("0"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => ({
    cantidadPositive: check("sale_details_cantidad_positive", sql`${table.cantidad} > 0`),
    precioUnitarioNonNegative: check(
      "sale_details_precio_unitario_non_negative",
      sql`${table.precioUnitario} >= 0`,
    ),
    descuentoPorcentajeNonNegative: check(
      "sale_details_descuento_porcentaje_non_negative",
      sql`${table.descuentoPorcentaje} >= 0`,
    ),
    descuentoMontoNonNegative: check(
      "sale_details_descuento_monto_non_negative",
      sql`${table.descuentoMonto} >= 0`,
    ),
    subtotalNonNegative: check("sale_details_subtotal_non_negative", sql`${table.subtotal} >= 0`),
  }),
);

export const consignations = pgTable(
  "consignations",
  {
    id: serial("id").primaryKey(),
    numero: varchar("numero", { length: 40 }).notNull(),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    fechaEntrega: timestamp("fecha_entrega", { withTimezone: true }).notNull().defaultNow(),
    estado: consignmentStatusEnum("estado").notNull().default("PENDIENTE"),
    observacion: text("observacion"),
    ...timestamps,
  },
  (table) => ({
    numeroIdx: uniqueIndex("consignations_numero_unique").on(table.numero),
  }),
);

export const consignmentDetails = pgTable(
  "consignment_details",
  {
    id: serial("id").primaryKey(),
    consignacionId: integer("consignacion_id")
      .notNull()
      .references(() => consignations.id, { onDelete: "cascade" }),
    presentacionId: integer("presentacion_id")
      .notNull()
      .references(() => productPresentations.id, { onDelete: "restrict" }),
    cantidadEntregada: integer("cantidad_entregada").notNull(),
    cantidadVendida: integer("cantidad_vendida").notNull().default(0),
    cantidadDevuelta: integer("cantidad_devuelta").notNull().default(0),
    precioConsignacion: numeric("precio_consignacion", { precision: 12, scale: 2 }).notNull(),
    importeVendido: numeric("importe_vendido", { precision: 12, scale: 2 }).notNull().default("0"),
  },
  (table) => ({
    cantidadEntregadaPositive: check(
      "consignment_details_cantidad_entregada_positive",
      sql`${table.cantidadEntregada} > 0`,
    ),
    cantidadVendidaNonNegative: check(
      "consignment_details_cantidad_vendida_non_negative",
      sql`${table.cantidadVendida} >= 0`,
    ),
    cantidadDevueltaNonNegative: check(
      "consignment_details_cantidad_devuelta_non_negative",
      sql`${table.cantidadDevuelta} >= 0`,
    ),
    precioConsignacionNonNegative: check(
      "consignment_details_precio_consignacion_non_negative",
      sql`${table.precioConsignacion} >= 0`,
    ),
    importeVendidoNonNegative: check(
      "consignment_details_importe_vendido_non_negative",
      sql`${table.importeVendido} >= 0`,
    ),
    liquidacionBalance: check(
      "consignment_details_liquidacion_balance",
      sql`${table.cantidadVendida} + ${table.cantidadDevuelta} <= ${table.cantidadEntregada}`,
    ),
  }),
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: serial("id").primaryKey(),
    presentacionId: integer("presentacion_id")
      .notNull()
      .references(() => productPresentations.id, { onDelete: "restrict" }),
    tipoMovimiento: movementTypeEnum("tipo_movimiento").notNull(),
    cantidad: integer("cantidad").notNull(),
    stockAnterior: integer("stock_anterior").notNull(),
    stockPosterior: integer("stock_posterior").notNull(),
    referenciaTipo: varchar("referencia_tipo", { length: 60 }).notNull(),
    referenciaId: integer("referencia_id").notNull(),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
    observacion: text("observacion"),
  },
  (table) => ({
    cantidadPositive: check("inventory_movements_cantidad_positive", sql`${table.cantidad} > 0`),
    stockAnteriorNonNegative: check(
      "inventory_movements_stock_anterior_non_negative",
      sql`${table.stockAnterior} >= 0`,
    ),
    stockPosteriorNonNegative: check(
      "inventory_movements_stock_posterior_non_negative",
      sql`${table.stockPosterior} >= 0`,
    ),
  }),
);

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => users.id, { onDelete: "set null" }),
  accion: varchar("accion", { length: 120 }).notNull(),
  entidad: varchar("entidad", { length: 120 }).notNull(),
  entidadId: integer("entidad_id"),
  fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
  detalle: jsonb("detalle"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  sales: many(sales),
  consignations: many(consignations),
  inventoryMovements: many(inventoryMovements),
  auditLogs: many(auditLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoriaId], references: [categories.id] }),
  presentations: many(productPresentations),
}));

export const productPresentationsRelations = relations(productPresentations, ({ one, many }) => ({
  product: one(products, { fields: [productPresentations.productoId], references: [products.id] }),
  purchaseDetails: many(purchaseDetails),
  saleDetails: many(saleDetails),
  consignmentDetails: many(consignmentDetails),
  inventoryMovements: many(inventoryMovements),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchases: many(purchases),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
  consignations: many(consignations),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [purchases.proveedorId], references: [suppliers.id] }),
  user: one(users, { fields: [purchases.usuarioId], references: [users.id] }),
  details: many(purchaseDetails),
}));

export const purchaseDetailsRelations = relations(purchaseDetails, ({ one }) => ({
  purchase: one(purchases, { fields: [purchaseDetails.compraId], references: [purchases.id] }),
  presentation: one(productPresentations, {
    fields: [purchaseDetails.presentacionId],
    references: [productPresentations.id],
  }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, { fields: [sales.clienteId], references: [customers.id] }),
  user: one(users, { fields: [sales.usuarioId], references: [users.id] }),
  consignation: one(consignations, { fields: [sales.consignacionId], references: [consignations.id] }),
  details: many(saleDetails),
}));

export const saleDetailsRelations = relations(saleDetails, ({ one }) => ({
  sale: one(sales, { fields: [saleDetails.ventaId], references: [sales.id] }),
  presentation: one(productPresentations, {
    fields: [saleDetails.presentacionId],
    references: [productPresentations.id],
  }),
}));

export const consignationsRelations = relations(consignations, ({ one, many }) => ({
  customer: one(customers, { fields: [consignations.clienteId], references: [customers.id] }),
  user: one(users, { fields: [consignations.usuarioId], references: [users.id] }),
  sale: one(sales, { fields: [consignations.id], references: [sales.consignacionId] }),
  details: many(consignmentDetails),
}));

export const consignmentDetailsRelations = relations(consignmentDetails, ({ one }) => ({
  consignment: one(consignations, { fields: [consignmentDetails.consignacionId], references: [consignations.id] }),
  presentation: one(productPresentations, {
    fields: [consignmentDetails.presentacionId],
    references: [productPresentations.id],
  }),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  presentation: one(productPresentations, {
    fields: [inventoryMovements.presentacionId],
    references: [productPresentations.id],
  }),
  user: one(users, { fields: [inventoryMovements.usuarioId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.usuarioId], references: [users.id] }),
}));

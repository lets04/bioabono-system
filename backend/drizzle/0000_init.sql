CREATE TYPE "public"."consignment_status" AS ENUM('PENDIENTE', 'LIQUIDADA');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('COMPRA', 'VENTA', 'SALIDA_A_CONSIGNACION', 'VENTA_CONSIGNACION', 'DEVOLUCION_CONSIGNACION');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('PVP', 'CONSIGNACION', 'CONTADO', 'MAYORISTA');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'EMPLEADO');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"accion" varchar(120) NOT NULL,
	"entidad" varchar(120) NOT NULL,
	"entidad_id" integer,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"detalle" jsonb
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(140) NOT NULL,
	"descripcion" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consignations" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" varchar(40) NOT NULL,
	"cliente_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"fecha_entrega" timestamp with time zone DEFAULT now() NOT NULL,
	"estado" "consignment_status" DEFAULT 'PENDIENTE' NOT NULL,
	"observacion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consignment_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"consignacion_id" integer NOT NULL,
	"presentacion_id" integer NOT NULL,
	"cantidad_entregada" integer NOT NULL,
	"cantidad_vendida" integer DEFAULT 0 NOT NULL,
	"cantidad_devuelta" integer DEFAULT 0 NOT NULL,
	"precio_consignacion" numeric(12, 2) NOT NULL,
	"importe_vendido" numeric(12, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "consignment_details_cantidad_entregada_positive" CHECK ("consignment_details"."cantidad_entregada" > 0),
	CONSTRAINT "consignment_details_cantidad_vendida_non_negative" CHECK ("consignment_details"."cantidad_vendida" >= 0),
	CONSTRAINT "consignment_details_cantidad_devuelta_non_negative" CHECK ("consignment_details"."cantidad_devuelta" >= 0),
	CONSTRAINT "consignment_details_precio_consignacion_non_negative" CHECK ("consignment_details"."precio_consignacion" >= 0),
	CONSTRAINT "consignment_details_importe_vendido_non_negative" CHECK ("consignment_details"."importe_vendido" >= 0),
	CONSTRAINT "consignment_details_liquidacion_balance" CHECK ("consignment_details"."cantidad_vendida" + "consignment_details"."cantidad_devuelta" <= "consignment_details"."cantidad_entregada")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(180) NOT NULL,
	"nit_ci" varchar(60),
	"telefono" varchar(60),
	"email" varchar(160),
	"direccion" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"presentacion_id" integer NOT NULL,
	"tipo_movimiento" "movement_type" NOT NULL,
	"cantidad" integer NOT NULL,
	"stock_anterior" integer NOT NULL,
	"stock_posterior" integer NOT NULL,
	"referencia_tipo" varchar(60) NOT NULL,
	"referencia_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"observacion" text,
	CONSTRAINT "inventory_movements_cantidad_positive" CHECK ("inventory_movements"."cantidad" > 0),
	CONSTRAINT "inventory_movements_stock_anterior_non_negative" CHECK ("inventory_movements"."stock_anterior" >= 0),
	CONSTRAINT "inventory_movements_stock_posterior_non_negative" CHECK ("inventory_movements"."stock_posterior" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_presentations" (
	"id" serial PRIMARY KEY NOT NULL,
	"producto_id" integer NOT NULL,
	"codigo" varchar(40) NOT NULL,
	"cantidad" numeric(12, 2) NOT NULL,
	"unidad_medida" varchar(30) NOT NULL,
	"pvp" numeric(12, 2) NOT NULL,
	"stock_actual" integer DEFAULT 0 NOT NULL,
	"stock_minimo" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_presentations_cantidad_positive" CHECK ("product_presentations"."cantidad" > 0),
	CONSTRAINT "product_presentations_pvp_non_negative" CHECK ("product_presentations"."pvp" >= 0),
	CONSTRAINT "product_presentations_stock_actual_non_negative" CHECK ("product_presentations"."stock_actual" >= 0),
	CONSTRAINT "product_presentations_stock_minimo_non_negative" CHECK ("product_presentations"."stock_minimo" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(180) NOT NULL,
	"abreviacion" varchar(10) NOT NULL,
	"descripcion" text,
	"categoria_id" integer,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_abreviacion_format" CHECK ("products"."abreviacion" ~ '^[A-Z]{2,10}$')
);
--> statement-breakpoint
CREATE TABLE "purchase_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"compra_id" integer NOT NULL,
	"presentacion_id" integer NOT NULL,
	"cantidad" integer NOT NULL,
	"precio_unitario" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	CONSTRAINT "purchase_details_cantidad_positive" CHECK ("purchase_details"."cantidad" > 0),
	CONSTRAINT "purchase_details_precio_unitario_non_negative" CHECK ("purchase_details"."precio_unitario" >= 0),
	CONSTRAINT "purchase_details_subtotal_non_negative" CHECK ("purchase_details"."subtotal" >= 0)
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" varchar(40) NOT NULL,
	"proveedor_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"descuento" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"estado" varchar(40) NOT NULL,
	"observacion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_subtotal_non_negative" CHECK ("purchases"."subtotal" >= 0),
	CONSTRAINT "purchases_descuento_non_negative" CHECK ("purchases"."descuento" >= 0),
	CONSTRAINT "purchases_total_non_negative" CHECK ("purchases"."total" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sale_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"venta_id" integer NOT NULL,
	"presentacion_id" integer NOT NULL,
	"cantidad" integer NOT NULL,
	"tipo_precio" "price_type" NOT NULL,
	"precio_unitario" numeric(12, 2) NOT NULL,
	"descuento_porcentaje" numeric(5, 2) DEFAULT '0' NOT NULL,
	"descuento_monto" numeric(12, 2) DEFAULT '0' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	CONSTRAINT "sale_details_cantidad_positive" CHECK ("sale_details"."cantidad" > 0),
	CONSTRAINT "sale_details_precio_unitario_non_negative" CHECK ("sale_details"."precio_unitario" >= 0),
	CONSTRAINT "sale_details_descuento_porcentaje_non_negative" CHECK ("sale_details"."descuento_porcentaje" >= 0),
	CONSTRAINT "sale_details_descuento_monto_non_negative" CHECK ("sale_details"."descuento_monto" >= 0),
	CONSTRAINT "sale_details_subtotal_non_negative" CHECK ("sale_details"."subtotal" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" varchar(40) NOT NULL,
	"cliente_id" integer,
	"usuario_id" integer NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"descuento_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"estado" varchar(40) NOT NULL,
	"observacion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_subtotal_non_negative" CHECK ("sales"."subtotal" >= 0),
	CONSTRAINT "sales_descuento_total_non_negative" CHECK ("sales"."descuento_total" >= 0),
	CONSTRAINT "sales_total_non_negative" CHECK ("sales"."total" >= 0)
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(180) NOT NULL,
	"nit" varchar(60),
	"telefono" varchar(60),
	"email" varchar(160),
	"direccion" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(160) NOT NULL,
	"username" varchar(80) NOT NULL,
	"password_hash" text NOT NULL,
	"rol" "user_role" NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignations" ADD CONSTRAINT "consignations_cliente_id_customers_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignations" ADD CONSTRAINT "consignations_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_details" ADD CONSTRAINT "consignment_details_consignacion_id_consignations_id_fk" FOREIGN KEY ("consignacion_id") REFERENCES "public"."consignations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_details" ADD CONSTRAINT "consignment_details_presentacion_id_product_presentations_id_fk" FOREIGN KEY ("presentacion_id") REFERENCES "public"."product_presentations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_presentacion_id_product_presentations_id_fk" FOREIGN KEY ("presentacion_id") REFERENCES "public"."product_presentations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_presentations" ADD CONSTRAINT "product_presentations_producto_id_products_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categoria_id_categories_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_details" ADD CONSTRAINT "purchase_details_compra_id_purchases_id_fk" FOREIGN KEY ("compra_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_details" ADD CONSTRAINT "purchase_details_presentacion_id_product_presentations_id_fk" FOREIGN KEY ("presentacion_id") REFERENCES "public"."product_presentations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_proveedor_id_suppliers_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_venta_id_sales_id_fk" FOREIGN KEY ("venta_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_presentacion_id_product_presentations_id_fk" FOREIGN KEY ("presentacion_id") REFERENCES "public"."product_presentations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_cliente_id_customers_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "consignations_numero_unique" ON "consignations" USING btree ("numero");--> statement-breakpoint
CREATE UNIQUE INDEX "product_presentations_codigo_unique" ON "product_presentations" USING btree ("codigo");--> statement-breakpoint
CREATE UNIQUE INDEX "product_presentations_producto_cantidad_unidad_unique" ON "product_presentations" USING btree ("producto_id","cantidad","unidad_medida");--> statement-breakpoint
CREATE UNIQUE INDEX "products_abreviacion_unique" ON "products" USING btree ("abreviacion");--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_numero_unique" ON "purchases" USING btree ("numero");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_numero_unique" ON "sales" USING btree ("numero");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");
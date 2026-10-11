CREATE INDEX "consignations_cliente_id_estado_idx" ON "consignations" USING btree ("cliente_id","estado");--> statement-breakpoint
CREATE INDEX "consignment_details_consignacion_id_idx" ON "consignment_details" USING btree ("consignacion_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_presentacion_id_fecha_idx" ON "inventory_movements" USING btree ("presentacion_id","fecha");--> statement-breakpoint
CREATE INDEX "purchase_details_compra_id_idx" ON "purchase_details" USING btree ("compra_id");--> statement-breakpoint
CREATE INDEX "purchases_fecha_idx" ON "purchases" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "purchases_proveedor_id_idx" ON "purchases" USING btree ("proveedor_id");--> statement-breakpoint
CREATE INDEX "sale_details_venta_id_idx" ON "sale_details" USING btree ("venta_id");--> statement-breakpoint
CREATE INDEX "sales_fecha_idx" ON "sales" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "sales_cliente_id_idx" ON "sales" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "users_activation_token_hash_idx" ON "users" USING btree ("activation_token_hash");--> statement-breakpoint
CREATE INDEX "users_password_reset_token_hash_idx" ON "users" USING btree ("password_reset_token_hash");--> statement-breakpoint
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_descuento_porcentaje_max" CHECK ("sale_details"."descuento_porcentaje" <= 100);
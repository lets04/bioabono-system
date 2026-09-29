ALTER TABLE "sales" ADD COLUMN "consignacion_id" integer;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_consignacion_id_consignations_id_fk" FOREIGN KEY ("consignacion_id") REFERENCES "public"."consignations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sales_consignacion_id_unique" ON "sales" USING btree ("consignacion_id");
import { Elysia } from "elysia";
import { authModule } from "./modules/auth/index.js";
import { auditModule } from "./modules/audit/index.js";
import { categoriesModule } from "./modules/categories/index.js";
import { consignationsModule } from "./modules/consignations/index.js";
import { customersModule } from "./modules/customers/index.js";
import { inventoryModule } from "./modules/inventory/index.js";
import { productsModule } from "./modules/products/index.js";
import { purchasesModule } from "./modules/purchases/index.js";
import { reportsModule } from "./modules/reports/index.js";
import { salesModule } from "./modules/sales/index.js";
import { suppliersModule } from "./modules/suppliers/index.js";
import { usersModule } from "./modules/users/index.js";

export const app = new Elysia({ prefix: "/api" })
  .get("/health", () => ({ status: "ok", service: "bioabono-api" }))
  .use(authModule)
  .use(usersModule)
  .use(categoriesModule)
  .use(productsModule)
  .use(suppliersModule)
  .use(customersModule)
  .use(purchasesModule)
  .use(salesModule)
  .use(consignationsModule)
  .use(inventoryModule)
  .use(reportsModule)
  .use(auditModule);

export type App = typeof app;

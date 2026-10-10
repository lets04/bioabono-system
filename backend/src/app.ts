import { Elysia } from "elysia";
import { authModule, handleAuthError } from "./modules/auth/index.js";
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
import { fallbackError } from "./lib/http.js";

export const app = new Elysia({ prefix: "/api" })
  .onError(({ code, error, set }) => {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      return handleAuthError(error, set);
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "NOT_FOUND", message: "Recurso no encontrado" };
    }
    if (code === "PARSE" || code === "VALIDATION") {
      set.status = 400;
      return { error: "VALIDATION_ERROR", message: "Solicitud inválida" };
    }
    // Errores de rutas sin try/catch propio: nunca devolver el texto crudo de la base de datos.
    return fallbackError(error, set);
  })
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

import { Elysia } from "elysia";
import { ZodError } from "zod";
import * as service from "./service.js";

function handleError(error: unknown, set: { status?: number | string }) {
  if (error instanceof ZodError) {
    set.status = 400;
    return { error: "VALIDATION_ERROR", details: error.flatten() };
  }
  set.status = 500;
  return { error: "INTERNAL_ERROR", message: "No se pudo generar el reporte" };
}

export const reportsModule = new Elysia({ prefix: "/reports" })
  .get("/purchases", async ({ query, set }) => {
    try {
      return await service.getPurchasesReport(query);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/purchases/export", async ({ query, set }) => {
    try {
      const { buffer, filename } = await service.exportPurchasesExcel(query);
      set.headers["Content-Type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      set.headers["Content-Disposition"] = `attachment; filename="${filename}"`;
      return new Response(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/sales", async ({ query, set }) => {
    try {
      return await service.getSalesReport(query);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/sales/export", async ({ query, set }) => {
    try {
      const { buffer, filename } = await service.exportSalesExcel(query);
      return new Response(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/inventory", async ({ query, set }) => {
    try {
      return await service.getInventoryReport(query);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/inventory/export", async ({ query, set }) => {
    try {
      const { buffer, filename } = await service.exportInventoryExcel(query);
      return new Response(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/products", async ({ query, set }) => {
    try {
      return await service.getProductsReport(query);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/products/export", async ({ query, set }) => {
    try {
      const { buffer, filename } = await service.exportProductsExcel(query);
      return new Response(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      return handleError(error, set);
    }
  });

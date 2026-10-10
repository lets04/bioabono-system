import { Elysia } from "elysia";
import type ExcelJS from "exceljs";
import { ZodError } from "zod";
import { fallbackError, validationError } from "../../lib/http.js";
import { requireAdmin, requireAuth } from "../auth/plugin.js";
import * as service from "./service.js";

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function excelResponse({ buffer, filename }: { buffer: ExcelJS.Buffer; filename: string }) {
  return new Response(buffer, {
    headers: { "Content-Type": XLSX_TYPE, "Content-Disposition": `attachment; filename="${filename}"` },
  });
}

function handleError(error: unknown, set: { status?: number | string }) {
  if (error instanceof ZodError) return validationError(error, set);
  return fallbackError(error, set, "No se pudo generar el reporte");
}

export const reportsModule = new Elysia({ prefix: "/reports" })
  .use(requireAuth)
  .use(requireAdmin)
  .get("/purchases", async ({ query, set }) => {
    try {
      return await service.getPurchasesReport(query);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/purchases/export", async ({ query, set }) => {
    try {
      return excelResponse(await service.exportPurchasesExcel(query));
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
      return excelResponse(await service.exportSalesExcel(query));
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
      return excelResponse(await service.exportInventoryExcel(query));
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
      return excelResponse(await service.exportProductsExcel(query));
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/consignations", async ({ query, set }) => {
    try {
      return await service.getConsignationsReport(query);
    } catch (error) {
      return handleError(error, set);
    }
  });

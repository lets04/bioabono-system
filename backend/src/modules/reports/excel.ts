import ExcelJS from "exceljs";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const BIO_DARK = "24421F";
const BIO_GREEN = "4F8A2F";
const HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: BIO_DARK },
} as const;
const HEADER_FONT = { color: { argb: "FFFFFFFF" }, bold: true, size: 10 };
const TITLE_FONT = { color: { argb: BIO_DARK }, bold: true, size: 16 };
const SUBTITLE_FONT = { color: { argb: "6B7280" }, size: 9 };
// Mismo nivel relativo desde src/ (tsx) y dist/ (build): backend/assets
const LOGO_PATH = fileURLToPath(
  new URL("../../../assets/bioabonosinFondo.png", import.meta.url),
);

function addBioabonoLogo(wb: ExcelJS.Workbook): number | null {
  try {
    if (!fs.existsSync(LOGO_PATH)) {
      console.warn(`Logo BIOABONO no encontrado en: ${LOGO_PATH}`);
      return null;
    }

    const imageId = wb.addImage({
      filename: LOGO_PATH,
      extension: "png",
    });

    return imageId;
  } catch (error) {
    console.error("Error cargando logo BIOABONO:", error);
    return null;
  }
}

function styleHeaderCell(cell: ExcelJS.Cell) {
  cell.fill = HEADER_FILL;
  cell.font = HEADER_FONT;
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  cell.border = {
    top: { style: "thin", color: { argb: "E5E7EB" } },
    bottom: { style: "thin", color: { argb: "E5E7EB" } },
    left: { style: "thin", color: { argb: "E5E7EB" } },
    right: { style: "thin", color: { argb: "E5E7EB" } },
  };
}

function styleDataCell(cell: ExcelJS.Cell, isAlternate = false) {
  cell.font = { size: 9, color: { argb: "1F2937" } };
  cell.alignment = { vertical: "middle", wrapText: true };
  cell.border = {
    top: { style: "thin", color: { argb: "E5E7EB" } },
    bottom: { style: "thin", color: { argb: "E5E7EB" } },
    left: { style: "thin", color: { argb: "E5E7EB" } },
    right: { style: "thin", color: { argb: "E5E7EB" } },
  };
  if (isAlternate)
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F9FAFB" },
    };
}

function addReportHeader(
  ws: ExcelJS.Worksheet,
  wb: ExcelJS.Workbook,
  title: string,
  filtersDesc: string,
  periodDesc: string,
  colCount: number,
) {
  const logoId = addBioabonoLogo(wb);

  // Alturas del encabezado
  ws.getRow(1).height = 58;
  ws.getRow(2).height = 20;
  ws.getRow(3).height = 18;
  ws.getRow(4).height = 18;
  ws.getRow(5).height = 18;
  ws.getRow(6).height = 8;

  // =========================
  // LOGO
  // =========================
  if (logoId !== null) {
    ws.addImage(logoId, {
      tl: { col: 0.10, row: 0.05 },
      ext: {
        width: 180,
        height: 75,
      },
    });
  }

  // =========================
  // TÍTULO
  // =========================
  // Empieza en columna C para dejar espacio al logo
  ws.mergeCells(1, 3, 1, colCount);

  const titleCell = ws.getCell(1, 3);

  titleCell.value = `BIOABONO — ${title}`;

  titleCell.font = {
    color: { argb: BIO_DARK },
    bold: true,
    size: 16,
  };

  titleCell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  // =========================
  // SUBTÍTULO
  // =========================
  ws.mergeCells(2, 3, 2, colCount);

  const subCell = ws.getCell(2, 3);

  subCell.value = "Gestión comercial — 100% Orgánico y Ecológico";

  subCell.font = {
    color: { argb: BIO_GREEN },
    size: 9,
    italic: true,
  };

  subCell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  // =========================
  // FECHA
  // =========================
  ws.mergeCells(3, 3, 3, colCount);

  const genCell = ws.getCell(3, 3);

  genCell.value = `Fecha de generación: ${new Date().toLocaleString("es-BO", {
    dateStyle: "long",
    timeStyle: "short",
  })}`;

  genCell.font = SUBTITLE_FONT;

  genCell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  // =========================
  // PERÍODO
  // =========================
  ws.mergeCells(4, 1, 4, colCount);

  const periodCell = ws.getCell(4, 1);

  periodCell.value = periodDesc;

  periodCell.font = SUBTITLE_FONT;

  periodCell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  // =========================
  // FILTROS
  // =========================
  ws.mergeCells(5, 1, 5, colCount);

  const filterCell = ws.getCell(5, 1);

  filterCell.value = filtersDesc;

  filterCell.font = SUBTITLE_FONT;

  filterCell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };
}

export async function buildPurchasesWorkbook(
  data: Awaited<
    ReturnType<typeof import("./repository.js").getPurchasesReport>
  >,
  filters: { from?: string; to?: string; proveedorNombre?: string },
): Promise<ExcelJS.Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "BIOABONO";
  wb.created = new Date();
  const ws = wb.addWorksheet("Compras", {
    properties: { tabColor: { argb: BIO_GREEN } },
  });

  const colCount = 9;
  const periodDesc = `Período: ${filters.from || "—"} al ${filters.to || "—"}`;
  const filterDesc = `Filtros: ${filters.proveedorNombre ? `Proveedor: ${filters.proveedorNombre}` : "Proveedor: Todos"}`;
  addReportHeader(
    ws,
    wb,
    "Reporte de Compras",
    filterDesc,
    periodDesc,
    colCount,
  );

  // Summary
  ws.mergeCells(7, 1, 7, colCount);
  const summaryCell = ws.getCell(7, 1);
  summaryCell.value = `Resumen — Cantidad compras: ${data.summary.cantidadCompras}  |  Total comprado: Bs. ${Number(data.summary.totalCompras).toFixed(2)}`;
  summaryCell.font = { bold: true, size: 10, color: { argb: BIO_DARK } };
  summaryCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F3F4F6" },
  };
  summaryCell.alignment = { horizontal: "left" };

  // Headers row 8
  const headers = [
    "Fecha",
    "N.º Compra",
    "Proveedor",
    "Código",
    "Producto",
    "Presentación",
    "Cantidad",
    "Precio unitario",
    "Subtotal",
  ];
  const headerRow = ws.getRow(8);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    styleHeaderCell(cell);
  });
  headerRow.height = 20;
  headerRow.commit();

  // Data rows starting 9
  let rowIdx = 9;
  for (const r of data.rows) {
    const row = ws.getRow(rowIdx);
    const isAlt = rowIdx % 2 === 0;
    const values = [
      new Date(r.fecha),
      r.numero,
      r.proveedorNombre,
      r.codigo,
      r.productoNombre,
      `${r.cantidadPresentacion} ${r.unidadMedida}`,
      r.cantidad,
      Number(r.precioUnitario),
      Number(r.detalleSubtotal),
    ];
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v;
      styleDataCell(cell, isAlt);
      // formats
      if (i === 0) {
        cell.numFmt = "dd/mm/yyyy";
        cell.alignment = { horizontal: "center" };
      } else if (i === 6) {
        cell.numFmt = "0";
        cell.alignment = { horizontal: "right" };
      } else if (i === 7 || i === 8) {
        cell.numFmt = '#,##0.00 "Bs"';
        cell.alignment = { horizontal: "right" };
      } else if (i === 1 || i === 3) {
        cell.alignment = { horizontal: "left" };
      }
    });
    row.height = 15;
    row.commit();
    rowIdx++;
  }

  if (data.rows.length === 0) {
    ws.mergeCells(rowIdx, 1, rowIdx, colCount);
    const cell = ws.getCell(rowIdx, 1);
    cell.value = "No hay compras para el filtro aplicado.";
    cell.font = { italic: true, size: 10, color: { argb: "6B7280" } };
    cell.alignment = { horizontal: "center" };
    rowIdx++;
  }

  // Total row
  const totalRow = ws.getRow(rowIdx);
  ws.mergeCells(rowIdx, 1, rowIdx, 8);
  const labelCell = totalRow.getCell(1);
  labelCell.value = "TOTAL";
  labelCell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
  labelCell.fill = HEADER_FILL;
  labelCell.alignment = { horizontal: "right", vertical: "middle" };
  const totalCell = totalRow.getCell(9);
  totalCell.value = Number(data.summary.totalCompras);
  totalCell.numFmt = '#,##0.00 "Bs"';
  totalCell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
  totalCell.fill = HEADER_FILL;
  totalCell.alignment = { horizontal: "right" };
  totalRow.height = 18;
  // borders for total row
  for (let i = 1; i <= colCount; i++) {
    const c = totalRow.getCell(i);
    c.border = {
      top: { style: "thin", color: { argb: "E5E7EB" } },
      bottom: { style: "thin", color: { argb: "E5E7EB" } },
      left: { style: "thin", color: { argb: "E5E7EB" } },
      right: { style: "thin", color: { argb: "E5E7EB" } },
    };
    if (i !== 1 && i !== 9) c.fill = HEADER_FILL;
  }

  // Column widths
  ws.columns = [
    { width: 18 },
    { width: 18 },
    { width: 22 },
    { width: 12 },
    { width: 22 },
    { width: 14 },
    { width: 10 },
    { width: 14 },
    { width: 14 },
  ];

  ws.views = [{ state: "frozen", ySplit: 8, xSplit: 0 }];
  ws.autoFilter = {
    from: { row: 8, column: 1 },
    to: { row: 8, column: colCount },
  };

  return wb.xlsx.writeBuffer() as Promise<ExcelJS.Buffer>;
}

export async function buildSalesWorkbook(
  data: Awaited<ReturnType<typeof import("./repository.js").getSalesReport>>,
  filters: {
    from?: string;
    to?: string;
    clienteNombre?: string;
    tipoPrecio?: string;
  },
): Promise<ExcelJS.Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "BIOABONO";
  const ws = wb.addWorksheet("Ventas", {
    properties: { tabColor: { argb: BIO_GREEN } },
  });
  const colCount = 12;
  const periodDesc = `Período: ${filters.from || "—"} al ${filters.to || "—"}`;
  const tipoLabel =
    filters.tipoPrecio === "CONSIGNACION"
      ? "P CONS"
      : filters.tipoPrecio === "CONTADO"
        ? "PVC"
        : filters.tipoPrecio === "MAYORISTA"
          ? "PVM"
          : filters.tipoPrecio || "Todos";
  const filterDesc = `Filtros: ${filters.clienteNombre ? `Cliente: ${filters.clienteNombre}` : "Cliente: Todos"} | Tipo: ${tipoLabel}`;
  addReportHeader(
    ws,
    wb,
    "Reporte de Ventas",
    filterDesc,
    periodDesc,
    colCount,
  );

  ws.mergeCells(7, 1, 7, colCount);
  const summaryCell = ws.getCell(7, 1);
  summaryCell.value = `Resumen — Ventas: ${data.summary.cantidadVentas} | Unidades: ${data.summary.unidadesVendidas} | Descuentos: Bs. ${Number(data.summary.totalDescuentos).toFixed(2)} | Total: Bs. ${Number(data.summary.totalVentas).toFixed(2)}`;
  summaryCell.font = { bold: true, size: 10, color: { argb: BIO_DARK } };
  summaryCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F3F4F6" },
  };

  const headers = [
    "Fecha",
    "N.º Venta",
    "Cliente",
    "Código",
    "Producto",
    "Presentación",
    "Cantidad",
    "Tipo precio",
    "Precio unitario",
    "Desc. %",
    "Desc. Bs",
    "Subtotal",
  ];
  const headerRow = ws.getRow(8);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    styleHeaderCell(cell);
  });
  headerRow.height = 20;

  let rowIdx = 9;
  for (const r of data.rows) {
    const row = ws.getRow(rowIdx);
    const isAlt = rowIdx % 2 === 0;
    const tipoLabel =
      r.tipoPrecio === "CONSIGNACION"
        ? "P CONS"
        : r.tipoPrecio === "CONTADO"
          ? "PVC"
          : r.tipoPrecio === "MAYORISTA"
            ? "PVM"
            : r.tipoPrecio;
    const values = [
      new Date(r.fecha),
      r.numero,
      r.clienteNombre ?? "Cliente mostrador",
      r.codigo,
      r.productoNombre,
      `${r.cantidadPresentacion} ${r.unidadMedida}`,
      r.cantidad,
      tipoLabel,
      Number(r.precioUnitario),
      Number(r.descuentoPorcentaje),
      Number(r.descuentoMonto),
      Number(r.detalleSubtotal),
    ];
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v;
      styleDataCell(cell, isAlt);
      if (i === 0) {
        cell.numFmt = "dd/mm/yyyy";
        cell.alignment = { horizontal: "center" };
      } else if (i === 6 || i === 9) {
        cell.numFmt = "0.00";
        cell.alignment = { horizontal: "right" };
      } else if (i === 8 || i === 10 || i === 11) {
        cell.numFmt = '#,##0.00 "Bs"';
        cell.alignment = { horizontal: "right" };
      }
    });
    row.height = 15;
    rowIdx++;
  }

  if (data.rows.length === 0) {
    ws.mergeCells(rowIdx, 1, rowIdx, colCount);
    const cell = ws.getCell(rowIdx, 1);
    cell.value = "No hay ventas para el filtro aplicado.";
    cell.font = { italic: true, size: 10, color: { argb: "6B7280" } };
    cell.alignment = { horizontal: "center" };
    rowIdx++;
  }

  const totalRow = ws.getRow(rowIdx);
  ws.mergeCells(rowIdx, 1, rowIdx, 11);
  const labelCell = totalRow.getCell(1);
  labelCell.value = "TOTAL";
  labelCell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
  labelCell.fill = HEADER_FILL;
  labelCell.alignment = { horizontal: "right" };
  const totalCell = totalRow.getCell(12);
  totalCell.value = Number(data.summary.totalVentas);
  totalCell.numFmt = '#,##0.00 "Bs"';
  totalCell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
  totalCell.fill = HEADER_FILL;
  totalCell.alignment = { horizontal: "right" };
  for (let i = 1; i <= colCount; i++) {
    const c = totalRow.getCell(i);
    c.border = {
      top: { style: "thin", color: { argb: "E5E7EB" } },
      bottom: { style: "thin", color: { argb: "E5E7EB" } },
      left: { style: "thin", color: { argb: "E5E7EB" } },
      right: { style: "thin", color: { argb: "E5E7EB" } },
    };
    if (i !== 1 && i !== 12) c.fill = HEADER_FILL;
  }

  ws.columns = [
    { width: 12 },
    { width: 18 },
    { width: 20 },
    { width: 12 },
    { width: 22 },
    { width: 14 },
    { width: 10 },
    { width: 13 },
    { width: 13 },
    { width: 10 },
    { width: 12 },
    { width: 14 },
  ];
  ws.views = [{ state: "frozen", ySplit: 8 }];
  ws.autoFilter = {
    from: { row: 8, column: 1 },
    to: { row: 8, column: colCount },
  };
  return wb.xlsx.writeBuffer() as Promise<ExcelJS.Buffer>;
}

export async function buildInventoryWorkbook(
  data: Awaited<
    ReturnType<typeof import("./repository.js").getInventoryReport>
  >,
  filters: { categoriaNombre?: string; estado?: string },
): Promise<ExcelJS.Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Inventario", {
    properties: { tabColor: { argb: BIO_GREEN } },
  });
  const colCount = 9;
  const periodDesc = `Generado: ${new Date().toLocaleDateString("es-BO")}`;
  const filterDesc = `Filtros: ${filters.categoriaNombre ? `Categoría: ${filters.categoriaNombre}` : "Categoría: Todas"} | Estado: ${filters.estado || "Todos"}`;
  addReportHeader(
    ws,
    wb,
    "Reporte de Inventario",
    filterDesc,
    periodDesc,
    colCount,
  );

  ws.mergeCells(7, 1, 7, colCount);
  const summaryCell = ws.getCell(7, 1);
  summaryCell.value = `Resumen — Total: ${data.summary.totalPresentaciones} | Sin stock: ${data.summary.sinStock} | Bajo: ${data.summary.bajoStock} | Normal: ${data.summary.normalStock}`;
  summaryCell.font = { bold: true, size: 10, color: { argb: BIO_DARK } };
  summaryCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F3F4F6" },
  };

  const headers = [
    "Código",
    "Producto",
    "Categoría",
    "Presentación",
    "Cantidad",
    "Unidad",
    "Stock actual",
    "Stock mínimo",
    "Estado",
  ];
  const headerRow = ws.getRow(8);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    styleHeaderCell(cell);
  });
  headerRow.height = 20;

  let rowIdx = 9;
  for (const r of data.rows) {
    const estado =
      r.stockActual === 0
        ? "Sin stock"
        : r.stockActual <= r.stockMinimo
          ? "Stock bajo"
          : "Normal";
    const row = ws.getRow(rowIdx);
    const isAlt = rowIdx % 2 === 0;
    const values = [
      r.codigo,
      r.productoNombre,
      r.categoriaNombre ?? "—",
      `${r.cantidad} ${r.unidadMedida}`,
      r.cantidad,
      r.unidadMedida,
      r.stockActual,
      r.stockMinimo,
      estado,
    ];
    // headers 9: Código, Producto, Categoría, Presentación, Cantidad, Unidad, Stock actual, Stock mínimo, Estado = 9
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v;
      styleDataCell(cell, isAlt);
      if (i === 6 || i === 7) {
        cell.numFmt = "0";
        cell.alignment = { horizontal: "right" };
      }
    });
    row.height = 15;
    rowIdx++;
  }

  if (data.rows.length === 0) {
    ws.mergeCells(rowIdx, 1, rowIdx, colCount);
    const cell = ws.getCell(rowIdx, 1);
    cell.value = "No hay datos de inventario para el filtro aplicado.";
    cell.font = { italic: true, size: 10, color: { argb: "6B7280" } };
    cell.alignment = { horizontal: "center" };
  }

  ws.columns = [
    { width: 14 },
    { width: 22 },
    { width: 18 },
    { width: 16 },
    { width: 10 },
    { width: 8 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
  ];
  ws.views = [{ state: "frozen", ySplit: 8 }];
  ws.autoFilter = {
    from: { row: 8, column: 1 },
    to: { row: 8, column: colCount },
  };
  return wb.xlsx.writeBuffer() as Promise<ExcelJS.Buffer>;
}

export async function buildProductsWorkbook(
  data: Awaited<ReturnType<typeof import("./repository.js").getProductsReport>>,
  filters: { categoriaNombre?: string; estado?: string },
): Promise<ExcelJS.Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Productos", {
    properties: { tabColor: { argb: BIO_GREEN } },
  });
  const colCount = 14;
  const periodDesc = `Generado: ${new Date().toLocaleDateString("es-BO")}`;
  const filterDesc = `Filtros: ${filters.categoriaNombre ? `Categoría: ${filters.categoriaNombre}` : "Categoría: Todas"} | Estado: ${filters.estado || "Todos"}`;
  addReportHeader(
    ws,
    wb,
    "Reporte de Productos",
    filterDesc,
    periodDesc,
    colCount,
  );

  ws.mergeCells(7, 1, 7, colCount);
  const summaryCell = ws.getCell(7, 1);
  summaryCell.value = `Resumen — Productos base: ${data.summary.totalProductos} | Presentaciones: ${data.summary.totalPresentaciones} | Sin stock: ${data.summary.sinStock} | Bajo: ${data.summary.bajoStock}`;
  summaryCell.font = { bold: true, size: 10, color: { argb: BIO_DARK } };
  summaryCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F3F4F6" },
  };

  const headers = [
    "Código",
    "Producto",
    "Categoría",
    "Presentación",
    "Cantidad",
    "Unidad",
    "PVP",
    "P CONS",
    "PVC",
    "PVM",
    "Últ. compra",
    "Stock actual",
    "Stock mínimo",
    "Estado",
  ];
  const headerRow = ws.getRow(8);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    styleHeaderCell(cell);
  });
  headerRow.height = 22;

  let rowIdx = 9;
  for (const r of data.rows) {
    const pvp = Number(r.pvp);
    const consignacion = (pvp * 0.8).toFixed(2);
    const contado = (pvp * 0.75).toFixed(2);
    const mayorista = (pvp * 0.7).toFixed(2);
    const estado =
      !r.activo || !r.productoActivo
        ? "Inactivo"
        : r.stockActual === 0
          ? "Sin stock"
          : r.stockActual <= r.stockMinimo
            ? "Bajo"
            : "Normal";
    const row = ws.getRow(rowIdx);
    const isAlt = rowIdx % 2 === 0;
    const values = [
      r.codigo,
      r.productoNombre,
      r.categoriaNombre ?? "—",
      `${r.cantidad} ${r.unidadMedida}`,
      r.cantidad,
      r.unidadMedida,
      Number(r.pvp),
      Number(consignacion),
      Number(contado),
      Number(mayorista),
      r.ultimoPrecioCompra ? Number(r.ultimoPrecioCompra) : null,
      r.stockActual,
      r.stockMinimo,
      estado,
    ];
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      if (v === null || v === undefined) cell.value = "—";
      else cell.value = v;
      styleDataCell(cell, isAlt);
      if ([6, 7, 8, 9, 10].includes(i)) {
        if (v !== "—" && v !== null) {
          cell.numFmt = '#,##0.00 "Bs"';
          cell.alignment = { horizontal: "right" };
        } else {
          cell.alignment = { horizontal: "center" };
        }
      } else if (i === 11 || i === 12) {
        cell.numFmt = "0";
        cell.alignment = { horizontal: "right" };
      }
    });
    row.height = 15;
    rowIdx++;
  }

  if (data.rows.length === 0) {
    ws.mergeCells(rowIdx, 1, rowIdx, colCount);
    const cell = ws.getCell(rowIdx, 1);
    cell.value = "No hay productos para el filtro aplicado.";
    cell.font = { italic: true, size: 10, color: { argb: "6B7280" } };
    cell.alignment = { horizontal: "center" };
  }

  ws.columns = [
    { width: 13 },
    { width: 20 },
    { width: 16 },
    { width: 14 },
    { width: 10 },
    { width: 8 },
    { width: 11 },
    { width: 12 },
    { width: 11 },
    { width: 11 },
    { width: 13 },
    { width: 11 },
    { width: 11 },
    { width: 12 },
  ];
  ws.views = [{ state: "frozen", ySplit: 8 }];
  ws.autoFilter = {
    from: { row: 8, column: 1 },
    to: { row: 8, column: colCount },
  };
  return wb.xlsx.writeBuffer() as Promise<ExcelJS.Buffer>;
}

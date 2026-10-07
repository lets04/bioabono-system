import { useState } from "react";

import {
  FileSpreadsheet,
  Printer,
  Search,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

import { useInventoryReport } from "../../hooks/useReports";
import { useCategories } from "../../hooks/useCategories";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { reportsApi } from "../../api/reports";

export function InventoryReport() {
  const [categoriaId, setCategoriaId] = useState("");
  const [estado, setEstado] = useState("");
  const [applied, setApplied] = useState<any>({});

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  const categoriesQuery = useCategories();
  const reportQuery = useInventoryReport(applied);

  const apply = () => {
    setApplied({
      categoriaId: categoriaId || undefined,
      estado: estado || undefined,
    });
  };

  const clear = () => {
    setCategoriaId("");
    setEstado("");
    setApplied({});
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);

    try {
      await reportsApi.exportInventory(applied);
    } catch (e: any) {
      setExportError(e.message || "Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  const openPrintPreview = () => {
    setIsPreviewFullscreen(false);
    setShowPrintPreview(true);
  };

  const closePrintPreview = () => {
    setShowPrintPreview(false);
    setIsPreviewFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsPreviewFullscreen((current) => !current);
  };

  const getEstadoLabel = (value: string) => {
    switch (value) {
      case "sin":
        return "Sin stock";
      case "bajo":
        return "Stock bajo";
      case "normal":
        return "Normal";
      default:
        return "Todos los estados";
    }
  };

  return (
    <div className="grid gap-4">
      {/* =========================================================
          FILTROS DEL SISTEMA
      ========================================================== */}

      <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-4">
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">
            Categoría
          </label>

          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="input bg-white"
          >
            <option value="">Todas</option>

            {(categoriesQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">
            Estado stock
          </label>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="input bg-white"
          >
            <option value="">Todos</option>
            <option value="normal">Normal</option>
            <option value="bajo">Bajo</option>
            <option value="sin">Sin stock</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={apply}
            className="inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-bio-green px-3 text-sm font-semibold text-white hover:bg-bio-dark"
          >
            <Search size={14} />
            Filtrar
          </button>

          <button
            type="button"
            onClick={clear}
            className="h-11 rounded-lg border border-stone-300 px-3 text-sm hover:bg-white"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* =========================================================
          ESTADO DE LA CONSULTA
      ========================================================== */}

      <DataState
        isLoading={reportQuery.isLoading}
        isError={reportQuery.isError}
      />

      {!reportQuery.isLoading &&
        !reportQuery.isError &&
        reportQuery.data && (
          <>
            {/* =====================================================
                RESUMEN DEL SISTEMA
            ====================================================== */}

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-xs text-stone-500">
                  Total presentaciones
                </div>

                <div className="text-xl font-bold text-bio-dark">
                  {reportQuery.data.summary.totalPresentaciones}
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-xs text-stone-500">
                  Sin stock
                </div>

                <div className="text-xl font-bold text-stone-700">
                  {reportQuery.data.summary.sinStock}
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-xs text-stone-500">
                  Stock bajo
                </div>

                <div className="text-xl font-bold text-stone-700">
                  {reportQuery.data.summary.bajoStock}
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-xs text-stone-500">
                  Stock normal
                </div>

                <div className="text-xl font-bold text-stone-700">
                  {reportQuery.data.summary.normalStock}
                </div>
              </div>
            </div>

            {/* =====================================================
                BOTONES
            ====================================================== */}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end print:hidden">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white hover:bg-bio-dark disabled:opacity-60"
                >
                  <FileSpreadsheet size={16} />

                  {exporting ? "Exportando..." : "Exportar a Excel"}
                </button>

                <button
                  type="button"
                  onClick={openPrintPreview}
                  className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <Printer size={16} />
                  Vista previa
                </button>
              </div>
            </div>

            {/* ERROR */}

            {exportError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {exportError}
              </div>
            )}

            {/* =====================================================
                TABLA PRINCIPAL DEL SISTEMA
            ====================================================== */}

            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              <div className="bg-stone-50 px-4 py-2 text-xs font-semibold uppercase text-stone-500">
                Detalle del inventario
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-stone-50 text-xs text-stone-500">
                    <tr>
                      <th className="px-4 py-2">Código</th>
                      <th className="px-4 py-2">Producto</th>
                      <th className="px-4 py-2">Cantidad</th>
                      <th className="px-4 py-2 text-right">
                        Stock actual
                      </th>
                      <th className="px-4 py-2 text-right">
                        Mínimo
                      </th>
                      <th className="px-4 py-2">Estado</th>
                      <th className="px-4 py-2">Categoría</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {reportQuery.data.rows.map((r) => {
                      const estadoFila =
                        r.stockActual === 0
                          ? "Sin stock"
                          : r.stockActual <= r.stockMinimo
                            ? "Stock bajo"
                            : "Normal";

                      return (
                        <tr key={r.id}>
                          <td className="px-4 py-2 font-mono text-xs font-semibold text-bio-dark">
                            {r.codigo}
                          </td>

                          <td className="px-4 py-2">
                            {r.productoNombre}
                          </td>

                          <td className="px-4 py-2">
                            {r.cantidad} {r.unidadMedida}
                          </td>

                          <td className="px-4 py-2 text-right font-semibold">
                            {r.stockActual}
                          </td>

                          <td className="px-4 py-2 text-right">
                            {r.stockMinimo}
                          </td>

                          <td className="px-4 py-2">
                            {estadoFila}
                          </td>

                          <td className="px-4 py-2 text-xs text-stone-500">
                            {r.categoriaNombre ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {reportQuery.data.rows.length === 0 && (
                <EmptyState text="No hay presentaciones para el filtro aplicado." />
              )}
            </div>
          </>
        )}

      {/* =========================================================
          MODAL DE VISTA PREVIA
      ========================================================== */}

      {showPrintPreview && reportQuery.data && (
        <>
          {/* =====================================================
              CSS DE IMPRESIÓN
          ====================================================== */}

          <style>
            {`
              @media print {
                body * {
                  visibility: hidden !important;
                }

                #inventory-print-area,
                #inventory-print-area * {
                  visibility: visible !important;
                }

                #inventory-print-area {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: none !important;
                  min-height: auto !important;
                  margin: 0 !important;
                  padding: 10mm !important;
                  background: white !important;
                  box-shadow: none !important;
                }

                @page {
                  size: A4 landscape;
                  margin: 10mm;
                }

                .print-hide {
                  display: none !important;
                }
              }
            `}
          </style>

          {/* =====================================================
              FONDO DEL MODAL
          ====================================================== */}

          <div
            className={
              isPreviewFullscreen
                ? "fixed inset-0 z-[100] bg-stone-200"
                : "fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/70 p-4"
            }
          >
            {/* ===================================================
                CONTENEDOR
            ==================================================== */}

            <div
              className={
                isPreviewFullscreen
                  ? "flex h-full w-full flex-col bg-white"
                  : "flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
              }
            >
              {/* =================================================
                  BARRA SUPERIOR
              ================================================== */}

              <div className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 shadow-sm">
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-bio-dark sm:text-base">
                    Vista previa — Reporte de Inventario
                  </h2>

                  <p className="hidden text-xs text-stone-500 sm:block">
                    Revisa el documento antes de imprimirlo
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* PANTALLA COMPLETA */}

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition hover:bg-stone-100 hover:text-bio-dark"
                    title={
                      isPreviewFullscreen
                        ? "Salir de pantalla completa"
                        : "Pantalla completa"
                    }
                  >
                    {isPreviewFullscreen ? (
                      <Minimize2 size={18} />
                    ) : (
                      <Maximize2 size={18} />
                    )}
                  </button>

                  {/* IMPRIMIR */}

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-bio-dark"
                  >
                    <Printer size={16} />

                    <span className="hidden sm:inline">
                      Imprimir
                    </span>
                  </button>

                  {/* CERRAR */}

                  <button
                    type="button"
                    onClick={closePrintPreview}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition hover:bg-stone-100 hover:text-bio-dark sm:h-auto sm:w-auto sm:px-4 sm:py-2"
                    title="Cerrar"
                  >
                    <X size={18} className="sm:hidden" />

                    <span className="hidden text-sm font-semibold sm:inline">
                      Cerrar
                    </span>
                  </button>
                </div>
              </div>

              {/* =================================================
                  ÁREA DE VISTA PREVIA
              ================================================== */}

              <div className="flex-1 overflow-auto bg-stone-200 p-4 sm:p-8">
                <div
                  id="inventory-print-area"
                  className="mx-auto min-h-[900px] w-full max-w-[1100px] bg-white p-6 shadow-xl sm:p-8"
                >
                  {/* =============================================
                      ENCABEZADO FORMAL
                  ============================================== */}

                  <div className="border-b border-stone-300 pb-5">
                    <div className="flex items-center gap-6">
                      {/* LOGO */}

                      <div className="flex h-20 w-36 shrink-0 items-center justify-center">
                        <img
                          src="../frontend/dist/assets/logo.png"
                          alt="BIOABONO"
                          className="max-h-20 max-w-full object-contain"
                        />
                      </div>

                      {/* INFORMACIÓN PRINCIPAL */}

                      <div>
                        <h1 className="text-2xl font-bold tracking-tight text-stone-800">
                          REPORTE DE INVENTARIO
                        </h1>

                       

                        <p className="mt-3 text-xs text-stone-500">
                          <span className="font-semibold text-stone-700">
                            Fecha de emisión:
                          </span>{" "}
                          {new Date().toLocaleString("es-BO", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* CRITERIOS DE CONSULTA */}

                    <div className="mt-5 border-t border-stone-200 pt-3 text-xs text-stone-600">
                      <span className="font-semibold text-stone-700">
                        Criterios de consulta:
                      </span>{" "}
                      {categoriaId
                        ? "Categoría seleccionada"
                        : "Todas las categorías"}
                      {" - "}
                      {estado
                        ? `Estado: ${getEstadoLabel(estado)}`
                        : "Todos los estados"}
                    </div>
                  </div>

                  {/* =============================================
                      RESUMEN DEL INVENTARIO
                  ============================================== */}

                  <div className="mt-6">
                    <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">
                      Resumen del inventario
                    </h2>

                    <table className="mt-3 w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-stone-300">
                          <th className="px-3 py-2 text-left font-semibold text-stone-700">
                            Concepto
                          </th>

                          <th className="px-3 py-2 text-right font-semibold text-stone-700">
                            Cantidad
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="border-b border-stone-200">
                          <td className="px-3 py-2">
                            Total de presentaciones
                          </td>

                          <td className="px-3 py-2 text-right font-semibold">
                            {
                              reportQuery.data.summary
                                .totalPresentaciones
                            }
                          </td>
                        </tr>

                        <tr className="border-b border-stone-200">
                          <td className="px-3 py-2">
                            Presentaciones sin stock
                          </td>

                          <td className="px-3 py-2 text-right font-semibold">
                            {reportQuery.data.summary.sinStock}
                          </td>
                        </tr>

                        <tr className="border-b border-stone-200">
                          <td className="px-3 py-2">
                            Presentaciones con stock bajo
                          </td>

                          <td className="px-3 py-2 text-right font-semibold">
                            {reportQuery.data.summary.bajoStock}
                          </td>
                        </tr>

                        <tr className="border-b border-stone-300">
                          <td className="px-3 py-2">
                            Presentaciones con stock normal
                          </td>

                          <td className="px-3 py-2 text-right font-semibold">
                            {reportQuery.data.summary.normalStock}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* =============================================
                      DETALLE DEL INVENTARIO
                  ============================================== */}

                  <div className="mt-7">
                    <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">
                      Detalle del inventario
                    </h2>

                    <div className="mt-3 overflow-hidden border border-stone-300">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b-2 border-stone-400 bg-stone-100">
                            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">
                              Código
                            </th>

                            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">
                              Producto
                            </th>

                            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">
                              Presentación
                            </th>

                            <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">
                              Stock actual
                            </th>

                            <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">
                              Stock mínimo
                            </th>

                            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">
                              Estado
                            </th>

                            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">
                              Categoría
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {reportQuery.data.rows.map((r) => {
                            const estadoFila =
                              r.stockActual === 0
                                ? "Sin stock"
                                : r.stockActual <= r.stockMinimo
                                  ? "Stock bajo"
                                  : "Normal";

                            return (
                              <tr
                                key={r.id}
                                className="border-b border-stone-200"
                              >
                                <td className="px-3 py-2 font-mono text-xs font-semibold text-stone-700">
                                  {r.codigo}
                                </td>

                                <td className="px-3 py-2 text-stone-700">
                                  {r.productoNombre}
                                </td>

                                <td className="px-3 py-2 text-stone-700">
                                  {r.cantidad} {r.unidadMedida}
                                </td>

                                <td className="px-3 py-2 text-right font-semibold text-stone-700">
                                  {r.stockActual}
                                </td>

                                <td className="px-3 py-2 text-right text-stone-700">
                                  {r.stockMinimo}
                                </td>

                                <td className="px-3 py-2 text-stone-700">
                                  {estadoFila}
                                </td>

                                <td className="px-3 py-2 text-stone-600">
                                  {r.categoriaNombre ?? "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {reportQuery.data.rows.length === 0 && (
                        <div className="p-10 text-center text-sm text-stone-500">
                          No existen registros para los criterios de
                          consulta seleccionados.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* =============================================
                      PIE DEL DOCUMENTO
                  ============================================== */}

                  <div className="mt-8 border-t border-stone-300 pt-3">
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>
                        BIOABONO — Documento generado por el sistema
                      </span>

                      <span>
                        Reporte de Inventario
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
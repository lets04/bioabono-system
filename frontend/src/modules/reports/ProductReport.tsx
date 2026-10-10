import type { ReportFilters } from "../../types";
import { FormError } from "../../components/ui/FormError";
import { useState } from "react";
import { FileSpreadsheet, Printer, Search } from "lucide-react";
import { useProductsReport } from "../../hooks/useReports";
import { useCategories } from "../../hooks/useCategories";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { money, stockStatusLabel } from "../../utils/format";
import { reportsApi } from "../../api/reports";
import { useExcelExport } from "../../hooks/useExcelExport";
import { ReportPrintPreview, ReportSummary } from "../../components/print/ReportPrintPreview";
import { CategorySelect } from "../../components/ui/CategorySelect";

type ProductStatus = "Inactivo" | "Sin stock" | "Bajo" | "Normal";

const statusBadges: Record<ProductStatus, string> = {
  Inactivo: "bg-stone-200 text-stone-600",
  "Sin stock": "bg-red-100 text-red-800",
  Bajo: "bg-amber-100 text-amber-800",
  Normal: "bg-emerald-100 text-emerald-800",
};

function productStatus(row: { activo: boolean; productoActivo: boolean; stockActual: number; stockMinimo: number }): ProductStatus {
  if (!row.activo || !row.productoActivo) return "Inactivo";
  return stockStatusLabel(row.stockActual, row.stockMinimo, "Bajo");
}

export function ProductReport() {
  const [categoriaId, setCategoriaId] = useState("");
  const [estado, setEstado] = useState("");
  const [applied, setApplied] = useState<ReportFilters>({});

  const categoriesQuery = useCategories();
  const reportQuery = useProductsReport(applied);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const apply = () => setApplied({ categoriaId: categoriaId || undefined, estado: estado || undefined });
  const clear = () => {
    setCategoriaId("");
    setEstado("");
    setApplied({});
  };
  const { exporting, exportError, handleExport } = useExcelExport(() => reportsApi.exportProducts(applied));

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-4">
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Categoría</label>
          <CategorySelect categories={categoriesQuery.data ?? []} value={categoriaId} onChange={setCategoriaId} emptyLabel="Todas" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input bg-white">
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="bajo">Stock bajo</option>
            <option value="sin">Sin stock</option>
            <option value="normal">Stock normal</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={apply} className="inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-bio-green px-3 text-sm font-semibold text-white">
            <Search size={14} /> Filtrar
          </button>
          <button onClick={clear} className="h-11 rounded-lg border border-stone-300 px-3 text-sm">
            Limpiar
          </button>
        </div>
      </div>

      <DataState isLoading={reportQuery.isLoading} isError={reportQuery.isError} />

      {!reportQuery.isLoading && !reportQuery.isError && reportQuery.data && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Productos base</div>
              <div className="text-xl font-bold text-bio-dark">{reportQuery.data.summary.totalProductos}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Presentaciones</div>
              <div className="text-xl font-bold text-bio-dark">{reportQuery.data.summary.totalPresentaciones}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Sin stock</div>
              <div className="text-xl font-bold text-red-600">{reportQuery.data.summary.sinStock}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Stock bajo</div>
              <div className="text-xl font-bold text-amber-600">{reportQuery.data.summary.bajoStock}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end print:hidden">
            <div className="flex gap-2">
              <button onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white hover:bg-bio-dark disabled:opacity-60">
                <FileSpreadsheet size={16} /> {exporting ? "Exportando..." : "Exportar a Excel"}
              </button>
              <button type="button" onClick={() => setShowPrintPreview(true)} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700">
                <Printer size={16} /> Vista previa
              </button>
            </div>
          </div>
          <FormError message={exportError} />

          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="bg-stone-50 px-4 py-2 text-xs font-semibold uppercase text-stone-500">Presentaciones agrupadas por producto base</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="px-4 py-2">Código</th>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Categoría</th>
                    <th className="px-4 py-2">Presentación</th>
                    <th className="px-4 py-2 text-right">PVP</th>
                    <th className="px-4 py-2 text-right">Últ. compra</th>
                    <th className="px-4 py-2 text-right">Stock</th>
                    <th className="px-4 py-2 text-right">Mín.</th>
                    <th className="px-4 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="table-body divide-y divide-stone-100">
                  {reportQuery.data.rows.map((r) => {
                    const estado = productStatus(r);
                    const badge = statusBadges[estado];
                    return (
                      <tr key={r.id}>
                        <td className="px-4 py-2 font-mono text-xs font-semibold text-bio-dark">{r.codigo}</td>
                        <td className="px-4 py-2">
                          <div className="font-medium text-bio-dark">{r.productoNombre}</div>
                          <div className="text-xs text-stone-500">{r.productoAbreviacion}</div>
                        </td>
                        <td className="px-4 py-2 text-xs">{r.categoriaNombre ?? "—"}</td>
                        <td className="px-4 py-2">
                          {r.cantidad} {r.unidadMedida}
                        </td>
                        <td className="px-4 py-2 text-right">{money(r.pvp)}</td>
                        <td className="px-4 py-2 text-right text-xs">{r.ultimoPrecioCompra ? money(r.ultimoPrecioCompra) : "—"}</td>
                        <td className="px-4 py-2 text-right font-semibold">{r.stockActual}</td>
                        <td className="px-4 py-2 text-right">{r.stockMinimo}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge}`}>{estado}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {reportQuery.data.rows.length === 0 && <EmptyState text="No hay productos para el filtro aplicado." />}
          </div>
          {showPrintPreview ? (
            <ReportPrintPreview title="REPORTE DE PRODUCTOS" criteria={<><span className="font-semibold text-stone-700">Criterios de consulta:</span> {categoriaId ? `Categoría: ${categoriesQuery.data?.find((category) => String(category.id) === categoriaId)?.nombre ?? ""}` : "Todas las categorías"}{estado ? ` — Estado: ${estado}` : ""}</>} onClose={() => setShowPrintPreview(false)}>
              <ReportSummary
                rows={[
                  ["Productos base", reportQuery.data.summary.totalProductos],
                  ["Presentaciones", reportQuery.data.summary.totalPresentaciones],
                  ["Sin stock", reportQuery.data.summary.sinStock],
                  ["Stock bajo", reportQuery.data.summary.bajoStock],
                ]}
              />
              <section className="mt-7"><h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Detalle de productos</h2><div className="mt-3 overflow-hidden border border-stone-300"><table className="w-full border-collapse text-[10px]"><thead><tr className="border-b-2 border-stone-400 bg-stone-100"><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Código</th><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Producto</th><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Categoría</th><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Presentación</th><th className="px-2 py-2 text-right font-bold uppercase text-stone-700">PVP</th><th className="px-2 py-2 text-right font-bold uppercase text-stone-700">Últ. compra</th><th className="px-2 py-2 text-right font-bold uppercase text-stone-700">Stock</th><th className="px-2 py-2 text-right font-bold uppercase text-stone-700">Mín.</th><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Estado</th></tr></thead><tbody>{reportQuery.data.rows.map((row) => { const rowStatus = productStatus(row); return <tr key={row.id} className="border-b border-stone-200"><td className="px-2 py-2 font-mono">{row.codigo}</td><td className="px-2 py-2">{row.productoNombre}<span className="block text-stone-500">{row.productoAbreviacion}</span></td><td className="px-2 py-2">{row.categoriaNombre ?? "—"}</td><td className="px-2 py-2">{row.cantidad} {row.unidadMedida}</td><td className="px-2 py-2 text-right">{money(row.pvp)}</td><td className="px-2 py-2 text-right">{row.ultimoPrecioCompra ? money(row.ultimoPrecioCompra) : "—"}</td><td className="px-2 py-2 text-right font-semibold">{row.stockActual}</td><td className="px-2 py-2 text-right">{row.stockMinimo}</td><td className="px-2 py-2">{rowStatus}</td></tr>; })}</tbody></table></div>{reportQuery.data.rows.length === 0 ? <p className="border border-t-0 border-stone-300 p-8 text-center text-sm text-stone-500">No hay productos para el filtro aplicado.</p> : null}</section>
            </ReportPrintPreview>
          ) : null}
        </>
      )}
    </div>
  );
}

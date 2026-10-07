import { useState } from "react";
import { FileSpreadsheet, Printer, Search } from "lucide-react";
import { useInventoryReport } from "../../hooks/useReports";
import { useCategories } from "../../hooks/useCategories";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { reportsApi } from "../../api/reports";
import { ReportPrintPreview } from "../../components/print/ReportPrintPreview";

export function InventoryReport() {
  const [categoriaId, setCategoriaId] = useState("");
  const [estado, setEstado] = useState("");
  const [applied, setApplied] = useState<any>({});
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const categoriesQuery = useCategories();
  const reportQuery = useInventoryReport(applied);

  const apply = () => setApplied({ categoriaId: categoriaId || undefined, estado: estado || undefined });
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
    } catch (error: any) {
      setExportError(error.message || "Error al exportar");
    } finally {
      setExporting(false);
    }
  };
  const getEstadoLabel = (value: string) => ({ sin: "Sin stock", bajo: "Stock bajo", normal: "Normal" }[value] ?? "Todos los estados");
  const selectedCategory = categoriesQuery.data?.find((category) => String(category.id) === categoriaId)?.nombre;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-4">
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Categoría</label>
          <select value={categoriaId} onChange={(event) => setCategoriaId(event.target.value)} className="input bg-white">
            <option value="">Todas</option>
            {(categoriesQuery.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Estado stock</label>
          <select value={estado} onChange={(event) => setEstado(event.target.value)} className="input bg-white">
            <option value="">Todos</option>
            <option value="normal">Normal</option>
            <option value="bajo">Bajo</option>
            <option value="sin">Sin stock</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="button" onClick={apply} className="inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-bio-green px-3 text-sm font-semibold text-white hover:bg-bio-dark"><Search size={14} /> Filtrar</button>
          <button type="button" onClick={clear} className="h-11 rounded-lg border border-stone-300 px-3 text-sm hover:bg-white">Limpiar</button>
        </div>
      </div>

      <DataState isLoading={reportQuery.isLoading} isError={reportQuery.isError} />

      {!reportQuery.isLoading && !reportQuery.isError && reportQuery.data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Total presentaciones", reportQuery.data.summary.totalPresentaciones],
              ["Sin stock", reportQuery.data.summary.sinStock],
              ["Stock bajo", reportQuery.data.summary.bajoStock],
              ["Stock normal", reportQuery.data.summary.normalStock],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-xs text-stone-500">{label}</div>
                <div className="text-xl font-bold text-bio-dark">{value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <div className="flex gap-2">
              <button type="button" onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white hover:bg-bio-dark disabled:opacity-60"><FileSpreadsheet size={16} /> {exporting ? "Exportando..." : "Exportar a Excel"}</button>
              <button type="button" onClick={() => setShowPrintPreview(true)} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"><Printer size={16} /> Vista previa</button>
            </div>
          </div>
          {exportError ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{exportError}</div> : null}

          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="bg-stone-50 px-4 py-2 text-xs font-semibold uppercase text-stone-500">Detalle del inventario</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500"><tr><th className="px-4 py-2">Código</th><th className="px-4 py-2">Producto</th><th className="px-4 py-2">Cantidad</th><th className="px-4 py-2 text-right">Stock actual</th><th className="px-4 py-2 text-right">Mínimo</th><th className="px-4 py-2">Estado</th><th className="px-4 py-2">Categoría</th></tr></thead>
                <tbody className="divide-y divide-stone-100">
                  {reportQuery.data.rows.map((row) => {
                    const rowStatus = row.stockActual === 0 ? "Sin stock" : row.stockActual <= row.stockMinimo ? "Stock bajo" : "Normal";
                    return <tr key={row.id}><td className="px-4 py-2 font-mono text-xs font-semibold text-bio-dark">{row.codigo}</td><td className="px-4 py-2">{row.productoNombre}</td><td className="px-4 py-2">{row.cantidad} {row.unidadMedida}</td><td className="px-4 py-2 text-right font-semibold">{row.stockActual}</td><td className="px-4 py-2 text-right">{row.stockMinimo}</td><td className="px-4 py-2">{rowStatus}</td><td className="px-4 py-2 text-xs text-stone-500">{row.categoriaNombre ?? "—"}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
            {reportQuery.data.rows.length === 0 ? <EmptyState text="No hay presentaciones para el filtro aplicado." /> : null}
          </div>

          {showPrintPreview ? (
            <ReportPrintPreview
              title="REPORTE DE INVENTARIO"
              criteria={<><span className="font-semibold text-stone-700">Criterios de consulta:</span> {selectedCategory ?? "Todas las categorías"} — {getEstadoLabel(estado)}</>}
              onClose={() => setShowPrintPreview(false)}
            >
              <section className="mt-6">
                <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Resumen del inventario</h2>
                <table className="mt-3 w-full border-collapse text-sm"><tbody>
                  {[["Total de presentaciones", reportQuery.data.summary.totalPresentaciones], ["Presentaciones sin stock", reportQuery.data.summary.sinStock], ["Presentaciones con stock bajo", reportQuery.data.summary.bajoStock], ["Presentaciones con stock normal", reportQuery.data.summary.normalStock]].map(([label, value]) => <tr key={label} className="border-b border-stone-200"><td className="px-3 py-2">{label}</td><td className="px-3 py-2 text-right font-semibold">{value}</td></tr>)}
                </tbody></table>
              </section>
              <section className="mt-7">
                <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Detalle del inventario</h2>
                <div className="mt-3 overflow-hidden border border-stone-300"><table className="w-full border-collapse text-sm"><thead><tr className="border-b-2 border-stone-400 bg-stone-100"><th className="px-3 py-2 text-left text-xs font-bold uppercase text-stone-700">Código</th><th className="px-3 py-2 text-left text-xs font-bold uppercase text-stone-700">Producto</th><th className="px-3 py-2 text-left text-xs font-bold uppercase text-stone-700">Presentación</th><th className="px-3 py-2 text-right text-xs font-bold uppercase text-stone-700">Stock actual</th><th className="px-3 py-2 text-right text-xs font-bold uppercase text-stone-700">Stock mínimo</th><th className="px-3 py-2 text-left text-xs font-bold uppercase text-stone-700">Estado</th><th className="px-3 py-2 text-left text-xs font-bold uppercase text-stone-700">Categoría</th></tr></thead><tbody>
                  {reportQuery.data.rows.map((row) => { const rowStatus = row.stockActual === 0 ? "Sin stock" : row.stockActual <= row.stockMinimo ? "Stock bajo" : "Normal"; return <tr key={row.id} className="border-b border-stone-200"><td className="px-3 py-2 font-mono text-xs font-semibold text-stone-700">{row.codigo}</td><td className="px-3 py-2 text-stone-700">{row.productoNombre}</td><td className="px-3 py-2 text-stone-700">{row.cantidad} {row.unidadMedida}</td><td className="px-3 py-2 text-right font-semibold text-stone-700">{row.stockActual}</td><td className="px-3 py-2 text-right text-stone-700">{row.stockMinimo}</td><td className="px-3 py-2 text-stone-700">{rowStatus}</td><td className="px-3 py-2 text-stone-600">{row.categoriaNombre ?? "—"}</td></tr>; })}
                </tbody></table></div>
                {reportQuery.data.rows.length === 0 ? <div className="border border-t-0 border-stone-300 p-8 text-center text-sm text-stone-500">No existen registros para los criterios seleccionados.</div> : null}
              </section>
            </ReportPrintPreview>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

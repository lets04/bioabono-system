import type { ReportFilters } from "../../types";
import { useState } from "react";
import { FileSpreadsheet, Printer, Search } from "lucide-react";
import { useInventoryReport } from "../../hooks/useReports";
import { useCategories } from "../../hooks/useCategories";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { reportsApi } from "../../api/reports";

export function InventoryReport() {
  const [categoriaId, setCategoriaId] = useState("");
  const [estado, setEstado] = useState("");
  const [applied, setApplied] = useState<ReportFilters>({});

  const categoriesQuery = useCategories();
  const reportQuery = useInventoryReport(applied);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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
    } catch (e) {
      setExportError(e instanceof Error && e.message ? e.message : "Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-4">
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Categoría</label>
          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="input bg-white">
            <option value="">Todas</option>
            {(categoriesQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Estado stock</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input bg-white">
            <option value="">Todos</option>
            <option value="normal">Normal</option>
            <option value="bajo">Bajo</option>
            <option value="sin">Sin stock</option>
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
              <div className="text-xs text-stone-500">Total presentaciones</div>
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
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Stock normal</div>
              <div className="text-xl font-bold text-emerald-700">{reportQuery.data.summary.normalStock}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end print:hidden">
            <div className="flex gap-2">
              <button onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white hover:bg-bio-dark disabled:opacity-60">
                <FileSpreadsheet size={16} /> {exporting ? "Exportando..." : "Exportar a Excel"}
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700">
                <Printer size={16} /> Imprimir reporte
              </button>
            </div>
          </div>
          {exportError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{exportError}</div>}

          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="bg-stone-50 px-4 py-2 text-xs font-semibold uppercase text-stone-500">Stock actual real de product_presentations</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="px-4 py-2">Código</th>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Cantidad</th>
                    <th className="px-4 py-2 text-right">Stock actual</th>
                    <th className="px-4 py-2 text-right">Mínimo</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2">Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportQuery.data.rows.map((r) => {
                    const estado = r.stockActual === 0 ? "sin" : r.stockActual <= r.stockMinimo ? "bajo" : "normal";
                    const badge =
                      estado === "sin"
                        ? "bg-red-100 text-red-800"
                        : estado === "bajo"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800";
                    const label = estado === "sin" ? "Sin stock" : estado === "bajo" ? "Stock bajo" : "Normal";
                    return (
                      <tr key={r.id}>
                        <td className="px-4 py-2 font-mono text-xs font-semibold text-bio-dark">{r.codigo}</td>
                        <td className="px-4 py-2">{r.productoNombre}</td>
                        <td className="px-4 py-2">
                          {r.cantidad} {r.unidadMedida}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">{r.stockActual}</td>
                        <td className="px-4 py-2 text-right">{r.stockMinimo}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge}`}>{label}</span>
                        </td>
                        <td className="px-4 py-2 text-xs text-stone-500">{r.categoriaNombre ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {reportQuery.data.rows.length === 0 && <EmptyState text="No hay presentaciones para el filtro aplicado." />}
          </div>
        </>
      )}
    </div>
  );
}

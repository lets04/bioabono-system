import { useState } from "react";
import { FileSpreadsheet, Printer, Search } from "lucide-react";
import { usePurchasesReport } from "../../hooks/useReports";
import { useSuppliers } from "../../hooks/useSuppliers";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { money } from "../../utils/format";
import { reportsApi } from "../../api/reports";
import type { ReportFilters } from "../../types";

export function PurchaseReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [applied, setApplied] = useState<ReportFilters>({});

  const suppliersQuery = useSuppliers();
  const reportQuery = usePurchasesReport(applied);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const apply = () => {
    setApplied({
      from: from || undefined,
      to: to || undefined,
      proveedorId: proveedorId || undefined,
    });
  };

  const clear = () => {
    setFrom("");
    setTo("");
    setProveedorId("");
    setApplied({});
  };

  const handlePrint = () => window.print();
  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await reportsApi.exportPurchases(applied);
    } catch (e: any) {
      setExportError(e.message || "Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-4">
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Desde</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input bg-white" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Hasta</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input bg-white" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Proveedor</label>
          <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="input bg-white">
            <option value="">Todos</option>
            {(suppliersQuery.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
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
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Cantidad compras</div>
              <div className="text-xl font-bold text-bio-dark">{reportQuery.data.summary.cantidadCompras}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Total comprado</div>
              <div className="text-xl font-bold text-bio-dark">{money(reportQuery.data.summary.totalCompras)}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Proveedores en período</div>
              <div className="text-xl font-bold text-bio-dark">{reportQuery.data.summary.porProveedor.length}</div>
            </div>
          </div>

          {reportQuery.data.summary.porProveedor.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              <div className="bg-stone-50 px-4 py-2 text-xs font-semibold uppercase text-stone-500">Total por proveedor</div>
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="px-4 py-2">Proveedor</th>
                    <th className="px-4 py-2 text-right">Compras</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportQuery.data.summary.porProveedor.map((p) => (
                    <tr key={p.proveedorId}>
                      <td className="px-4 py-2 font-medium">{p.proveedorNombre}</td>
                      <td className="px-4 py-2 text-right">{p.count}</td>
                      <td className="px-4 py-2 text-right font-semibold">{money(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end print:hidden">
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white hover:bg-bio-dark disabled:opacity-60"
              >
                <FileSpreadsheet size={16} /> {exporting ? "Exportando..." : "Exportar a Excel"}
              </button>
              <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700">
                <Printer size={16} /> Vista previa
              </button>
            </div>
          </div>
          {exportError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{exportError}</div>}

          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="bg-stone-50 px-4 py-2 text-xs font-semibold uppercase text-stone-500">Detalle — usa precio histórico de purchase_details</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">N.º</th>
                    <th className="px-4 py-2">Proveedor</th>
                    <th className="px-4 py-2">Código</th>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2 text-right">Cant.</th>
                    <th className="px-4 py-2 text-right">P. unit.</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportQuery.data.rows.map((r, idx) => (
                    <tr key={`${r.id}-${r.presentacionId}-${idx}`}>
                      <td className="px-4 py-2 text-xs">{new Date(r.fecha).toLocaleDateString("es-BO")}</td>
                      <td className="px-4 py-2 font-mono text-xs">{r.numero}</td>
                      <td className="px-4 py-2">{r.proveedorNombre}</td>
                      <td className="px-4 py-2 font-mono text-xs">{r.codigo}</td>
                      <td className="px-4 py-2">
                        {r.productoNombre} {r.cantidadPresentacion} {r.unidadMedida}
                      </td>
                      <td className="px-4 py-2 text-right">{r.cantidad}</td>
                      <td className="px-4 py-2 text-right">{money(r.precioUnitario)}</td>
                      <td className="px-4 py-2 text-right font-semibold">{money(r.detalleSubtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reportQuery.data.rows.length === 0 && <EmptyState text="No hay compras para el filtro aplicado." />}
          </div>

          {/* Print header */}
          <div className="hidden print:block">
            <style>{`@media print { body * { visibility: hidden; } #print-purchases, #print-purchases * { visibility: visible; } #print-purchases { position: absolute; left:0; top:0; width:100%; } }`}</style>
          </div>
          <div id="print-purchases" className="hidden print:block p-6">
            <h1 className="text-xl font-bold text-bio-dark">BIOABONO — Reporte de Compras</h1>
            <p className="text-xs text-stone-500">
              Período: {from || "—"} al {to || "—"} {proveedorId ? `• Proveedor: ${suppliersQuery.data?.find((s) => String(s.id) === proveedorId)?.nombre ?? ""}` : ""}
            </p>
            <p className="text-sm font-semibold">Total: {money(reportQuery.data.summary.totalCompras)} — {reportQuery.data.summary.cantidadCompras} compras</p>
          </div>
        </>
      )}
    </div>
  );
}

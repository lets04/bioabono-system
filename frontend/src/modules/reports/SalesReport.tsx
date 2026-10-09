import type { ReportFilters } from "../../types";
import { useState } from "react";
import { FileSpreadsheet, Printer, Search } from "lucide-react";
import { useSalesReport } from "../../hooks/useReports";
import { useCustomers } from "../../hooks/useCustomers";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { money } from "../../utils/format";
import { reportsApi } from "../../api/reports";
import { ReportPrintPreview } from "../../components/print/ReportPrintPreview";

export function SalesReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tipoPrecio, setTipoPrecio] = useState("");
  const [applied, setApplied] = useState<ReportFilters>({});

  const customersQuery = useCustomers();
  const reportQuery = useSalesReport(applied);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const apply = () =>
    setApplied({
      from: from || undefined,
      to: to || undefined,
      clienteId: clienteId || undefined,
      tipoPrecio: tipoPrecio || undefined,
    });
  const clear = () => {
    setFrom("");
    setTo("");
    setClienteId("");
    setTipoPrecio("");
    setApplied({});
  };
  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await reportsApi.exportSales(applied);
    } catch (e) {
      setExportError(e instanceof Error && e.message ? e.message : "Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-5">
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Desde</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input bg-white" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Hasta</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input bg-white" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Cliente</label>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="input bg-white">
            <option value="">Todos</option>
            <option value="null">Cliente mostrador</option>
            {(customersQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-semibold text-stone-600">Tipo precio</label>
          <select value={tipoPrecio} onChange={(e) => setTipoPrecio(e.target.value)} className="input bg-white">
            <option value="">Todos</option>
            <option value="PVP">PVP</option>
            <option value="CONSIGNACION">P CONS</option>
            <option value="CONTADO">PVC</option>
            <option value="MAYORISTA">PVM</option>
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
              <div className="text-xs text-stone-500">Cantidad ventas</div>
              <div className="text-xl font-bold text-bio-dark">{reportQuery.data.summary.cantidadVentas}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Unidades vendidas</div>
              <div className="text-xl font-bold text-bio-dark">{reportQuery.data.summary.unidadesVendidas}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Total descuentos</div>
              <div className="text-xl font-bold text-bio-dark">{money(reportQuery.data.summary.totalDescuentos)}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Total ventas</div>
              <div className="text-xl font-bold text-bio-dark">{money(reportQuery.data.summary.totalVentas)}</div>
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
          {exportError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{exportError}</div>}

          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="bg-stone-50 px-4 py-2 text-xs font-semibold uppercase text-stone-500">Detalle — precio histórico de sale_details</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">N.º</th>
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2">Código</th>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2 text-right">Cant.</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2 text-right">P. unit.</th>
                    <th className="px-3 py-2 text-right">Desc.</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportQuery.data.rows.map((r, idx) => (
                    <tr key={`${r.id}-${r.presentacionId}-${idx}`}>
                      <td className="px-3 py-2 text-xs">{new Date(r.fecha).toLocaleDateString("es-BO")}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.numero}</td>
                      <td className="px-3 py-2">
                        {r.clienteNombre ?? "Mostrador"}
                        {r.consignacionNumero && <span className="mt-0.5 block max-w-fit rounded bg-bio-green/10 px-1.5 py-0.5 text-[10px] font-semibold text-bio-dark">Consig. {r.consignacionNumero}</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{r.codigo}</td>
                      <td className="px-3 py-2">
                        {r.productoNombre} {r.cantidadPresentacion} {r.unidadMedida}
                      </td>
                      <td className="px-3 py-2 text-right">{r.cantidad}</td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">{r.tipoPrecio === "CONSIGNACION" ? "P CONS" : r.tipoPrecio === "CONTADO" ? "PVC" : r.tipoPrecio === "MAYORISTA" ? "PVM" : r.tipoPrecio}</span>
                      </td>
                      <td className="px-3 py-2 text-right">{money(r.precioUnitario)}</td>
                      <td className="px-3 py-2 text-right text-xs">{Number(r.descuentoPorcentaje) > 0 ? `${r.descuentoPorcentaje}%` : "—"}</td>
                      <td className="px-3 py-2 text-right font-semibold">{money(r.detalleSubtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reportQuery.data.rows.length === 0 && <EmptyState text="No hay ventas para el filtro aplicado." />}
          </div>
          {showPrintPreview ? (
            <ReportPrintPreview title="REPORTE DE VENTAS" criteria={<><span className="font-semibold text-stone-700">Criterios de consulta:</span> Período: {from || "Todos"} al {to || "hoy"}{clienteId ? ` — Cliente: ${clienteId === "null" ? "Mostrador" : customersQuery.data?.find((customer) => String(customer.id) === clienteId)?.nombre ?? ""}` : ""}{tipoPrecio ? ` — Tipo: ${tipoPrecio === "CONSIGNACION" ? "P CONS" : tipoPrecio}` : ""}</>} onClose={() => setShowPrintPreview(false)}>
              <section className="mt-6"><h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Resumen</h2><table className="mt-3 w-full border-collapse text-sm"><tbody><tr className="border-b border-stone-200"><td className="px-3 py-2">Cantidad de ventas</td><td className="px-3 py-2 text-right font-semibold">{reportQuery.data.summary.cantidadVentas}</td></tr><tr className="border-b border-stone-200"><td className="px-3 py-2">Unidades vendidas</td><td className="px-3 py-2 text-right font-semibold">{reportQuery.data.summary.unidadesVendidas}</td></tr><tr className="border-b border-stone-200"><td className="px-3 py-2">Total descuentos</td><td className="px-3 py-2 text-right font-semibold">{money(reportQuery.data.summary.totalDescuentos)}</td></tr><tr><td className="px-3 py-2">Total ventas</td><td className="px-3 py-2 text-right font-semibold">{money(reportQuery.data.summary.totalVentas)}</td></tr></tbody></table></section>
              <section className="mt-7"><h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Detalle de ventas</h2><div className="mt-3 overflow-hidden border border-stone-300"><table className="w-full border-collapse text-[10px]"><thead><tr className="border-b-2 border-stone-400 bg-stone-100"><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Fecha</th><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">N.º</th><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Cliente</th><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Código</th><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Producto</th><th className="px-2 py-2 text-right font-bold uppercase text-stone-700">Cant.</th><th className="px-2 py-2 text-left font-bold uppercase text-stone-700">Tipo</th><th className="px-2 py-2 text-right font-bold uppercase text-stone-700">P. unit.</th><th className="px-2 py-2 text-right font-bold uppercase text-stone-700">Desc.</th><th className="px-2 py-2 text-right font-bold uppercase text-stone-700">Subtotal</th></tr></thead><tbody>{reportQuery.data.rows.map((row, index) => <tr key={`${row.id}-${row.presentacionId}-${index}`} className="border-b border-stone-200"><td className="px-2 py-2">{new Date(row.fecha).toLocaleDateString("es-BO")}</td><td className="px-2 py-2 font-mono">{row.numero}</td><td className="px-2 py-2">{row.clienteNombre ?? "Mostrador"}</td><td className="px-2 py-2 font-mono">{row.codigo}</td><td className="px-2 py-2">{row.productoNombre} {row.cantidadPresentacion} {row.unidadMedida}</td><td className="px-2 py-2 text-right">{row.cantidad}</td><td className="px-2 py-2">{row.tipoPrecio === "CONSIGNACION" ? "P CONS" : row.tipoPrecio === "CONTADO" ? "PVC" : row.tipoPrecio === "MAYORISTA" ? "PVM" : row.tipoPrecio}</td><td className="px-2 py-2 text-right">{money(row.precioUnitario)}</td><td className="px-2 py-2 text-right">{Number(row.descuentoPorcentaje) > 0 ? `${row.descuentoPorcentaje}%` : "—"}</td><td className="px-2 py-2 text-right font-semibold">{money(row.detalleSubtotal)}</td></tr>)}</tbody></table></div>{reportQuery.data.rows.length === 0 ? <p className="border border-t-0 border-stone-300 p-8 text-center text-sm text-stone-500">No hay ventas para el filtro aplicado.</p> : null}</section>
            </ReportPrintPreview>
          ) : null}
        </>
      )}
    </div>
  );
}

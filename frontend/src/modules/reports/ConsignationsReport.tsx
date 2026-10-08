import type { ReportFilters } from "../../types";
import { useState } from "react";
import { Handshake, Printer, Search } from "lucide-react";
import { useConsignationsReport } from "../../hooks/useReports";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { money } from "../../utils/format";

export function ConsignationsReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [estado, setEstado] = useState("");
  const [applied, setApplied] = useState<ReportFilters>({});

  const reportQuery = useConsignationsReport(applied);

  const apply = () =>
    setApplied({
      from: from || undefined,
      to: to || undefined,
      estado: estado || undefined,
    });
  const clear = () => {
    setFrom("");
    setTo("");
    setEstado("");
    setApplied({});
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
          <label className="text-xs font-semibold text-stone-600">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input bg-white">
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="LIQUIDADA">Liquidadas</option>
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
              <div className="text-xs text-stone-500">Consignaciones</div>
              <div className="text-xl font-bold text-bio-dark">{reportQuery.data.summary.cantidadConsignaciones}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Pendientes</div>
              <div className="text-xl font-bold text-amber-700">{reportQuery.data.summary.pendientes}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Liquidadas</div>
              <div className="text-xl font-bold text-emerald-700">{reportQuery.data.summary.liquidadas}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs text-stone-500">Total vendido</div>
              <div className="text-xl font-bold text-bio-dark">{money(reportQuery.data.summary.totalVendido)}</div>
            </div>
          </div>

          <div className="flex justify-end print:hidden">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700">
              <Printer size={16} /> Imprimir reporte
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="bg-stone-50 px-4 py-2 text-xs font-semibold uppercase text-stone-500">Detalle — entregas, devoluciones y ventas por consignación</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">N.º</th>
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2">Código</th>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2 text-right">Entregado</th>
                    <th className="px-3 py-2 text-right">Vendido</th>
                    <th className="px-3 py-2 text-right">Devuelto</th>
                    <th className="px-3 py-2 text-right">P. consig.</th>
                    <th className="px-3 py-2 text-right">Importe</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportQuery.data.rows.map((r, idx) => (
                    <tr key={`${r.id}-${r.presentacionId}-${idx}`}>
                      <td className="px-3 py-2 text-xs">{new Date(r.fechaEntrega).toLocaleDateString("es-BO")}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.numero}</td>
                      <td className="px-3 py-2">{r.clienteNombre}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.codigo}</td>
                      <td className="px-3 py-2">
                        {r.productoNombre} {r.cantidadPresentacion} {r.unidadMedida}
                      </td>
                      <td className="px-3 py-2 text-right">{r.cantidadEntregada}</td>
                      <td className="px-3 py-2 text-right">{r.cantidadVendida}</td>
                      <td className="px-3 py-2 text-right">{r.cantidadDevuelta}</td>
                      <td className="px-3 py-2 text-right">{money(r.precioConsignacion)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{money(r.importeVendido)}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${r.estado === "PENDIENTE" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                          {r.estado === "PENDIENTE" ? "Pendiente" : "Liquidada"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reportQuery.data.rows.length === 0 && <EmptyState text="No hay consignaciones para el filtro aplicado." />}
          </div>
        </>
      )}

      <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-500">
        <div className="flex items-center gap-2 font-semibold text-stone-700">
          <Handshake size={14} /> Consignaciones — no son ventas
        </div>
        <p className="mt-1">La entrega reduce stock (SALIDA_A_CONSIGNACION). Al liquidar se crea una sola venta por lo vendido (P CONS) y las devoluciones reponen stock (DEVOLUCION_CONSIGNACION).</p>
      </div>
    </div>
  );
}
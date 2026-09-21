import { useState } from "react";
import { FileSpreadsheet, Printer, Search } from "lucide-react";
import { useSalesReport } from "../../hooks/useReports";
import { useCustomers } from "../../hooks/useCustomers";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { money } from "../../utils/format";
import { reportsApi } from "../../api/reports";

export function SalesReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tipoPrecio, setTipoPrecio] = useState("");
  const [applied, setApplied] = useState<any>({});

  const customersQuery = useCustomers();
  const reportQuery = useSalesReport(applied);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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
    } catch (e: any) {
      setExportError(e.message || "Error al exportar");
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
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700">
                <Printer size={16} /> Imprimir reporte
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
                      <td className="px-3 py-2">{r.clienteNombre ?? "Mostrador"}</td>
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
        </>
      )}
    </div>
  );
}

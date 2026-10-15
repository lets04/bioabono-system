import { useMemo, useState } from "react";
import { Banknote, CalendarDays, ReceiptText, Tags } from "lucide-react";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { MetricCard } from "../../components/ui/MetricCard";
import { SearchSelect } from "../../components/ui/SearchSelect";
import { useSaleMovements } from "../../hooks/useSales";
import { useUsers } from "../../hooks/useUsers";
import { useDetailLoader } from "../../hooks/useDetailLoader";
import { money } from "../../utils/format";
import { salesApi } from "../../api/sales";
import { DetailLoaderError } from "../../components/ui/DetailLoaderError";
import { Modal } from "../../components/ui/Modal";
import { SaleDetailView } from "./SaleDetail";
import { SalePrint } from "./SalePrint";
import type { SaleDetail } from "../../types";

type Period = "today" | "yesterday" | "week";

const periods: Array<{ id: Period; label: string }> = [
  { id: "today", label: "Hoy" },
  { id: "yesterday", label: "Ayer" },
  { id: "week", label: "Últimos 7 días" },
];

function startOfLocalDay(daysFromToday: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysFromToday).toISOString();
}

function rangeFor(period: Period) {
  if (period === "yesterday") return { from: startOfLocalDay(-1), to: startOfLocalDay(0) };
  if (period === "week") return { from: startOfLocalDay(-6), to: startOfLocalDay(1) };
  return { from: startOfLocalDay(0), to: startOfLocalDay(1) };
}

export function MovementsView({ isAdmin }: { isAdmin: boolean }) {
  const [period, setPeriod] = useState<Period>("today");
  const [usuarioId, setUsuarioId] = useState("");
  const usersQuery = useUsers(isAdmin);
  const range = useMemo(() => rangeFor(period), [period]);
  const movementsQuery = useSaleMovements({ ...range, usuarioId: isAdmin ? usuarioId : undefined });
  const detail = useDetailLoader(salesApi.get);
  const [selected, setSelected] = useState<SaleDetail | null>(null);
  const [printSale, setPrintSale] = useState<SaleDetail | null>(null);
  const data = movementsQuery.data;

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-bio-dark">Movimientos de ventas</h2>
          <p className="mt-1 text-sm text-stone-500">
            {isAdmin ? "Consulta las ventas de todo el personal o de un usuario específico." : "Consulta las ventas generales registradas en el período."}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[auto_220px] sm:items-end">
          <div className="flex rounded-lg bg-stone-100 p-1" role="group" aria-label="Período de movimientos">
            {periods.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriod(item.id)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${period === item.id ? "bg-white text-bio-dark shadow-sm" : "text-stone-600 hover:text-bio-dark"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {isAdmin ? (
            <div className="grid gap-1">
              <span className="text-xs font-semibold text-stone-600">Usuario responsable</span>
              <SearchSelect
                ariaLabel="Usuario responsable"
                value={usuarioId}
                onChange={setUsuarioId}
                placeholder="Todo el personal"
                options={[
                  { value: "", label: "Todo el personal" },
                  ...(usersQuery.data ?? []).map((item) => ({
                    value: String(item.id),
                    label: item.activo ? item.nombre : `${item.nombre} (inactivo)`,
                  })),
                ]}
              />
            </div>
          ) : null}
        </div>
      </section>

      <DataState isLoading={movementsQuery.isLoading} isError={movementsQuery.isError} />
      <DetailLoaderError error={detail.error} onDismiss={detail.clearError} />

      {!movementsQuery.isLoading && !movementsQuery.isError && data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Ventas registradas" value={String(data.summary.cantidadVentas)} icon={ReceiptText} />
            <MetricCard label="Total vendido" value={money(data.summary.totalVentas)} icon={Banknote} />
            <MetricCard label="Descuentos otorgados" value={money(data.summary.totalDescuentos)} icon={Tags} />
          </div>

          <div className="table-card">
            <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3 text-sm font-semibold text-bio-dark">
              <CalendarDays size={17} className="text-bio-green" /> Detalle de movimientos
            </div>
            <div className="overflow-x-auto">
              <table className="table-stack w-full min-w-[760px] text-left text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3">N.º venta</th>
                    <th className="px-4 py-3">Fecha y hora</th>
                    <th className="px-4 py-3">Cliente</th>
                    {isAdmin ? <th className="px-4 py-3">Empleado</th> : null}
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="table-body divide-y divide-stone-100">
                  {data.rows.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-4 py-3 font-mono font-semibold text-bio-dark">
                        <button
                          type="button"
                          onClick={() => detail.load(sale.id, setSelected)}
                          className="rounded text-left underline-offset-2 hover:text-bio-green hover:underline focus:outline-none focus:ring-2 focus:ring-bio-green/40"
                          aria-label={`Ver detalle de la venta ${sale.numero}`}
                        >
                          {sale.numero}
                        </button>
                        {sale.consignacionNumero ? <span className="mt-0.5 block text-[10px] font-sans text-stone-500">Consig. {sale.consignacionNumero}</span> : null}
                      </td>
                      <td data-label="Fecha y hora" className="px-4 py-3 text-stone-600">{new Date(sale.fecha).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td data-label="Cliente" className="px-4 py-3 font-medium text-stone-800">{sale.clienteNombre ?? "Cliente mostrador"}</td>
                      {isAdmin ? <td data-label="Empleado" className="px-4 py-3 text-stone-700">{sale.usuarioNombre}</td> : null}
                      <td data-label="Total" className="px-4 py-3 text-right font-semibold text-bio-dark">{money(sale.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.rows.length === 0 ? <EmptyState text="No hay ventas registradas en este período." /> : null}
          </div>
        </>
      ) : null}

      {selected ? (
        <Modal title={`Venta ${selected.numero}`} onClose={() => setSelected(null)}>
          <SaleDetailView sale={selected} onPrint={() => setPrintSale(selected)} />
        </Modal>
      ) : null}

      {printSale ? <SalePrint sale={printSale} onClose={() => setPrintSale(null)} /> : null}
    </div>
  );
}

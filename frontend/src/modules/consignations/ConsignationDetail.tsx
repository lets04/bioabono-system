import { useMemo, useState } from "react";
import { CheckCircle2, Handshake } from "lucide-react";
import { money } from "../../utils/format";
import type { ConsignationDetail } from "../../types";

type Props = {
  consignation: ConsignationDetail;
  isLiquidating: boolean;
  error?: string;
  onLiquidate: (payload: { detalles: Array<{ presentacionId: number; cantidadVendida: number; cantidadDevuelta: number }> }) => void;
};

export function ConsignationDetailView({ consignation, isLiquidating, error, onLiquidate }: Props) {
  const isPending = consignation.estado === "PENDIENTE";
  const [vendidos, setVendidos] = useState<Record<number, string>>(() =>
    Object.fromEntries(consignation.detalles.map((d) => [d.presentacionId, String(d.cantidadVendida)])),
  );
  const [devueltos, setDevueltos] = useState<Record<number, string>>(() =>
    Object.fromEntries(consignation.detalles.map((d) => [d.presentacionId, String(d.cantidadDevuelta)])),
  );

  const setVendido = (presId: number, value: string) => setVendidos((cur) => ({ ...cur, [presId]: value }));
  const setDevuelto = (presId: number, value: string) => setDevueltos((cur) => ({ ...cur, [presId]: value }));

  const balance = useMemo(() => {
    return consignation.detalles.map((d) => {
      const vendido = Number(vendidos[d.presentacionId]) || 0;
      const devuelto = Number(devueltos[d.presentacionId]) || 0;
      return { detail: d, vendido, devuelto, ok: vendido + devuelto === d.cantidadEntregada };
    });
  }, [consignation.detalles, vendidos, devueltos]);

  const allValid = balance.every((b) => b.ok);
  const importeVenta = balance.reduce((sum, b) => sum + b.vendido * Number(b.detail.precioConsignacion), 0);

  const handleLiquidate = () => {
    onLiquidate({
      detalles: balance.map((b) => ({
        presentacionId: b.detail.presentacionId,
        cantidadVendida: b.vendido,
        cantidadDevuelta: b.devuelto,
      })),
    });
  };

  const fechaEntrega = new Date(consignation.fechaEntrega).toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="grid gap-6 text-sm">
      <div className="grid gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-stone-500">N.º de consignación</div>
          <div className="font-mono font-semibold text-bio-dark">{consignation.numero}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500">Fecha de entrega</div>
          <div className="font-medium text-stone-800">{fechaEntrega}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500">Estado</div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isPending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{consignation.estado}</span>
        </div>
        <div>
          <div className="text-xs text-stone-500">Cliente</div>
          <div className="font-medium text-stone-800">{consignation.clienteNombre}</div>
          {consignation.clienteNitCi && <div className="text-xs text-stone-500">NIT/CI: {consignation.clienteNitCi}</div>}
        </div>
        <div>
          <div className="text-xs text-stone-500">Registrada por</div>
          <div className="font-medium text-stone-800">{consignation.usuarioNombre}</div>
        </div>
        {consignation.observacion && (
          <div>
            <div className="text-xs text-stone-500">Observación</div>
            <div className="font-medium text-stone-800">{consignation.observacion}</div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3 text-right">Entregado</th>
                <th className="px-4 py-3 text-right">P. consig.</th>
                {isPending ? (
                  <>
                    <th className="px-4 py-3 text-right">Vendido</th>
                    <th className="px-4 py-3 text-right">Devuelto</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-right">Vendido</th>
                    <th className="px-4 py-3 text-right">Devuelto</th>
                    <th className="px-4 py-3 text-right">Importe</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {consignation.detalles.map((det) => {
                const b = balance.find((x) => x.detail.presentacionId === det.presentacionId)!;
                return (
                  <tr key={det.id} className={isPending && !b.ok ? "bg-red-50" : undefined}>
                    <td className="px-4 py-3 font-mono font-semibold text-bio-dark">{det.codigo}</td>
                    <td className="px-4 py-3">
                      {det.productoNombre}
                      <span className="block text-xs text-stone-500">
                        {det.cantidadPresentacion} {det.unidadMedida}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{det.cantidadEntregada}</td>
                    <td className="px-4 py-3 text-right">{money(det.precioConsignacion)}</td>
                    {isPending ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            min={0}
                            step={1}
                            type="number"
                            value={vendidos[det.presentacionId]}
                            onChange={(e) => setVendido(det.presentacionId, e.target.value)}
                            className="input w-24 bg-white text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            min={0}
                            step={1}
                            type="number"
                            value={devueltos[det.presentacionId]}
                            onChange={(e) => setDevuelto(det.presentacionId, e.target.value)}
                            className="input w-24 bg-white text-right"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-right">{det.cantidadVendida}</td>
                        <td className="px-4 py-3 text-right">{det.cantidadDevuelta}</td>
                        <td className="px-4 py-3 text-right font-semibold">{money(det.importeVendido)}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isPending ? (
          <div className="border-t border-stone-200 bg-stone-50 px-4 py-3">
            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className={allValid ? "inline-flex items-center gap-1 text-emerald-700" : "inline-flex items-center gap-1 text-amber-700"}>
                <CheckCircle2 size={15} />
                {allValid ? "Entregado = Vendido + Devuelto ✓" : "Ajuste la liquidación: entregado debe ser igual a vendido + devuelto"}
              </div>
              <div className="font-semibold text-stone-800">
                Importe a cobrar: <span className="text-base font-bold text-bio-dark">{money(importeVenta)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 text-right text-sm">
            <div className="text-stone-600">
              Total liquidado: <span className="text-base font-bold text-bio-dark">{money(consignation.detalles.reduce((s, d) => s + Number(d.importeVendido), 0))}</span>
            </div>
            {consignation.venta && (
              <div className="mt-1 flex items-center justify-end gap-2 text-stone-600">
                <Handshake size={14} className="text-bio-green" />
                Venta generada:
                <span className="font-mono font-semibold text-bio-dark">{consignation.venta.numero}</span>
                <span className="font-semibold text-bio-dark">{money(consignation.venta.total)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isPending && (
        <>
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex justify-end">
            <button
              onClick={handleLiquidate}
              disabled={!allValid || isLiquidating}
              className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-bio-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLiquidating ? "Liquidando..." : "Liquidar consignación"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
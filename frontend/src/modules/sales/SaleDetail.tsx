import { money } from "../../utils/format";
import type { SaleDetail } from "../../types";

export function SaleDetailView({ sale, onPrint }: { sale: SaleDetail; onPrint: () => void }) {
  const date = new Date(sale.fecha).toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="grid gap-6 text-sm">
      <div className="grid gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-stone-500">N.º de venta</div>
          <div className="font-mono font-semibold text-bio-dark">{sale.numero}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500">Fecha</div>
          <div className="font-medium text-stone-800">{date}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500">Estado</div>
          <div className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{sale.estado}</div>
        </div>
        <div className="sm:col-span-3">
          <div className="text-xs text-stone-500">Cliente</div>
          <div className="font-medium text-stone-800">{sale.clienteNombre ?? "Cliente mostrador"}</div>
          {sale.clienteNitCi && <div className="text-xs text-stone-500">NIT/CI: {sale.clienteNitCi}</div>}
        </div>
        {sale.observacion && (
          <div className="sm:col-span-3">
            <div className="text-xs text-stone-500">Observación</div>
            <div className="font-medium text-stone-800">{sale.observacion}</div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Presentación</th>
                <th className="px-4 py-3 text-right">Cant.</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">P. unit.</th>
                <th className="px-4 py-3 text-right">Desc.</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {sale.detalles.map((det) => (
                <tr key={det.id}>
                  <td className="px-4 py-3 font-mono font-semibold text-bio-dark">{det.codigo}</td>
                  <td className="px-4 py-3">{det.productoNombre}</td>
                  <td className="px-4 py-3">
                    {det.cantidadPresentacion} {det.unidadMedida}
                  </td>
                  <td className="px-4 py-3 text-right">{det.cantidad}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">{det.tipoPrecio === "CONSIGNACION" ? "P CONS" : det.tipoPrecio === "CONTADO" ? "PVC" : det.tipoPrecio === "MAYORISTA" ? "PVM" : det.tipoPrecio}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{money(det.precioUnitario)}</td>
                  <td className="px-4 py-3 text-right">
                    {Number(det.descuentoPorcentaje) > 0 ? `${det.descuentoPorcentaje}% (${money(det.descuentoMonto)})` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-bio-dark">{money(det.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 text-right text-sm">
          <div>Subtotal: {money(sale.subtotal)}</div>
          <div>Descuento: {money(sale.descuentoTotal)}</div>
          <div className="text-base font-bold text-bio-dark">Total: {money(sale.total)}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onPrint} className="rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white hover:bg-bio-dark">
          Imprimir comprobante
        </button>
      </div>
    </div>
  );
}

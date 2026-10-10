import { money } from "../../utils/format";
import type { PurchaseDetail as DetailType } from "../../types";

type Props = {
  purchase: DetailType;
  onPrint: () => void;
};

export function PurchaseDetail({ purchase, onPrint }: Props) {
  const date = new Date(purchase.fecha).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="grid gap-6 text-sm">
      <div className="grid gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-stone-500">N.º de compra</div>
          <div className="font-mono font-semibold text-bio-dark">{purchase.numero}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500">Fecha</div>
          <div className="font-medium text-stone-800">{date}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500">Estado</div>
          <div className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{purchase.estado}</div>
        </div>
        <div className="sm:col-span-3">
          <div className="text-xs text-stone-500">Proveedor</div>
          <div className="font-medium text-stone-800">{purchase.proveedorNombre}</div>
          {purchase.proveedorNit && <div className="text-xs text-stone-500">NIT: {purchase.proveedorNit}</div>}
        </div>
        {purchase.observacion && (
          <div className="sm:col-span-3">
            <div className="text-xs text-stone-500">Observación</div>
            <div className="font-medium text-stone-800">{purchase.observacion}</div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Presentación</th>
                <th className="px-4 py-3 text-right">Cant.</th>
                <th className="px-4 py-3 text-right">P. unit.</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {purchase.detalles.map((det) => (
                <tr key={det.id}>
                  <td className="px-4 py-3 font-mono font-semibold text-bio-dark">{det.codigo}</td>
                  <td className="px-4 py-3">{det.productoNombre}</td>
                  <td className="px-4 py-3">
                    {det.cantidadPresentacion} {det.unidadMedida}
                  </td>
                  <td className="px-4 py-3 text-right">{det.cantidad}</td>
                  <td className="px-4 py-3 text-right">{money(det.precioUnitario)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-bio-dark">{money(det.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 text-right">
          <div className="text-base font-bold text-bio-dark">Total: {money(purchase.total)}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onPrint} className="rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white hover:bg-bio-dark">
          Imprimir boleta
        </button>
      </div>
    </div>
  );
}

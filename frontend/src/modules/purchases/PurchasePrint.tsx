import { money } from "../../utils/format";
import type { PurchaseDetail } from "../../types";
import logoBioabono from "../../../dist/assets/bioabonosinFondo.png";

export function PurchasePrint({
  purchase,
  onClose,
}: {
  purchase: PurchaseDetail;
  onClose: () => void;
}) {
  const date = new Date(purchase.fecha).toLocaleDateString("es-BO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-6 print:p-0">
      <style>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none; } }`}</style>
      <div id="print-area" className="mx-auto max-w-3xl bg-white">
        <div className="no-print mb-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white hover:bg-bio-dark"
          >
            Imprimir
          </button>
        </div>

        <div className="border-b-2 border-bio-dark pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div>
                <img
                  src={logoBioabono}
                  alt="BIOABONO"
                  className="h-20 w-auto object-contain object-left"
                />

                <div className="mt-1 text-sm text-stone-500">
                  Gestión comercial — 100% Orgánico y Ecológico
                </div>
              </div>
              <div className="mt-2 text-base font-semibold text-bio-dark">
                COMPROBANTE DE COMPRA
              </div>
              <div className="text-xs text-stone-500">
                Documento interno — no válido como factura fiscal
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-bold text-bio-dark">
                {purchase.numero}
              </div>
              <div className="text-xs capitalize text-stone-500">{date}</div>
              <div className="mt-1 inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                {purchase.estado}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-stone-500">
              Proveedor
            </div>
            <div className="font-semibold text-stone-800">
              {purchase.proveedorNombre}
            </div>
            <div className="text-xs text-stone-500">
              {[
                purchase.proveedorNit && `NIT: ${purchase.proveedorNit}`,
                purchase.proveedorTelefono &&
                  `Tel: ${purchase.proveedorTelefono}`,
                purchase.proveedorEmail,
              ]
                .filter(Boolean)
                .join(" • ")}
            </div>
            {purchase.proveedorDireccion && (
              <div className="text-xs text-stone-500">
                {purchase.proveedorDireccion}
              </div>
            )}
          </div>
          {purchase.observacion && (
            <div>
              <div className="text-xs uppercase tracking-wide text-stone-500">
                Observación
              </div>
              <div className="text-sm text-stone-700">
                {purchase.observacion}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-stone-300">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase text-stone-600">
              <tr>
                <th className="px-3 py-2">Código</th>
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2">Presentación</th>
                <th className="px-3 py-2 text-right">Cant.</th>
                <th className="px-3 py-2 text-right">P. unit.</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {purchase.detalles.map((det) => (
                <tr key={det.id}>
                  <td className="px-3 py-2 font-mono text-xs font-semibold">
                    {det.codigo}
                  </td>
                  <td className="px-3 py-2">{det.productoNombre}</td>
                  <td className="px-3 py-2">
                    {det.cantidadPresentacion} {det.unidadMedida}
                  </td>
                  <td className="px-3 py-2 text-right">{det.cantidad}</td>
                  <td className="px-3 py-2 text-right">
                    {money(det.precioUnitario)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {money(det.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t-2 border-bio-dark bg-stone-50 px-4 py-3 text-right text-base font-bold text-bio-dark">
            TOTAL: {money(purchase.total)}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-stone-400">
          Comprobante interno de compra — BIOABONO • Cochabamba, Bolivia
          <br />
          Este documento no es una factura fiscal (sin SIAT).
        </div>
      </div>
    </div>
  );
}

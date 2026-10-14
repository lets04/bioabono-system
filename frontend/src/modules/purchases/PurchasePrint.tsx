import { money } from "../../utils/format";
import { PrintPreview } from "../../components/print/PrintPreview";
import { PrintFooter, PrintHeader } from "../../components/print/PrintHeader";
import type { PurchaseDetail } from "../../types";

export function PurchasePrint({ purchase, onClose }: { purchase: PurchaseDetail; onClose: () => void }) {
  return (
    <PrintPreview title="Comprobante de compra" printAreaId="purchase-print-area" onClose={onClose}>
      <PrintHeader
        title="COMPROBANTE DE COMPRA"
        subtitle="Documento interno — no válido como factura fiscal"
        documentNumber={purchase.numero}
      />

      <section className="mt-6">
        <h2 className="mb-3 border-b border-l-2 border-l-[#647d22] border-stone-300 pb-2 pl-2 text-sm font-semibold uppercase tracking-wide text-stone-800">
          Datos del proveedor
        </h2>

        <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
          <div>
            <span className="text-xs text-stone-500">Nombre / Razón social</span>
            <p className="mt-0.5 font-semibold text-stone-900">
              {purchase.proveedorNombre}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">NIT</span>
            <p className="mt-0.5 text-stone-800">
              {purchase.proveedorNit || "No registrado"}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">Teléfono / correo</span>
            <p className="mt-0.5 break-words text-stone-800">
              {[purchase.proveedorTelefono, purchase.proveedorEmail]
                .filter(Boolean)
                .join(" • ") || "No registrado"}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">Dirección</span>
            <p className="mt-0.5 break-words text-stone-800">
              {purchase.proveedorDireccion || "No registrada"}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">Fecha de compra</span>
            <p className="mt-0.5 text-stone-800">
              {new Date(purchase.fecha).toLocaleDateString("es-BO", {
                dateStyle: "long",
              })}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">Estado</span>
            <p className="mt-0.5 font-medium text-stone-800">{purchase.estado}</p>
          </div>

          {purchase.observacion ? (
            <div className="col-span-2 mt-1 border-t border-dashed border-stone-200 pt-2">
              <span className="text-xs text-stone-500">Observaciones</span>
              <p className="mt-0.5 text-stone-800">{purchase.observacion}</p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-stone-400 pb-2">
          <h2 className="border-l-2 border-l-[#647d22] pl-2 text-sm font-semibold uppercase tracking-wide text-stone-800">
            Detalle de la compra
          </h2>
          <span className="text-[10px] text-stone-500">
            {purchase.detalles.length} productos
          </span>
        </div>
        <div className="mt-3 overflow-hidden border border-stone-300">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-stone-400 bg-stone-100">
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Código</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Producto</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Presentación</th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Cant.</th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">P. unit.</th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {purchase.detalles.map((det) => (
                <tr key={det.id} className="border-b border-stone-200">
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-stone-700">{det.codigo}</td>
                  <td className="px-3 py-2 text-stone-700">{det.productoNombre}</td>
                  <td className="px-3 py-2 text-stone-700">
                    {det.cantidadPresentacion} {det.unidadMedida}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-stone-700">{det.cantidad}</td>
                  <td className="px-3 py-2 text-right text-stone-700">{money(det.precioUnitario)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-stone-700">{money(det.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="print-total ml-auto mt-6 max-w-xs border-t-2 border-[#647d22] pt-3 text-sm">
        <div className="flex justify-between gap-6 text-base font-bold text-stone-900">
          <span>TOTAL COMPRA</span>
          <span>{money(purchase.total)}</span>
        </div>
      </div>
      <PrintFooter left="SUPERMERCADO DEL BIOABONO" right="Nota de compra" />
    </PrintPreview>
  );
}

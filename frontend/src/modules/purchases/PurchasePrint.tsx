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
        meta={
          <>
            <span className="font-semibold text-stone-700">N.º:</span> {purchase.numero}
            {" — "}
            <span className="font-semibold text-stone-700">Fecha:</span>{" "}
            {new Date(purchase.fecha).toLocaleDateString("es-BO", { dateStyle: "long" })}
            {" — "}
            <span className="font-semibold text-stone-700">Estado:</span> {purchase.estado}
          </>
        }
      />

      <div className="mt-6">
        <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Proveedor</h2>
        <div className="mt-3 text-sm text-stone-700">
          <div className="font-semibold">{purchase.proveedorNombre}</div>
          <div className="text-xs text-stone-500">
            {[purchase.proveedorNit && `NIT: ${purchase.proveedorNit}`, purchase.proveedorTelefono && `Tel: ${purchase.proveedorTelefono}`, purchase.proveedorEmail]
              .filter(Boolean)
              .join(" • ")}
          </div>
          {purchase.proveedorDireccion ? <div className="text-xs text-stone-500">{purchase.proveedorDireccion}</div> : null}
          {purchase.observacion ? <div className="mt-2 text-xs">Observación: {purchase.observacion}</div> : null}
        </div>
      </div>

      <div className="mt-7">
        <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Detalle de la compra</h2>
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

      <div className="mt-6">
        <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Resumen</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <tbody>
            <tr>
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right font-semibold">{money(purchase.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <PrintFooter left="BIOABONO — Documento generado por el sistema" right="Comprobante de compra" />
    </PrintPreview>
  );
}

import { money } from "../../utils/format";
import { PrintPreview } from "../../components/print/PrintPreview";
import { PrintFooter, PrintHeader } from "../../components/print/PrintHeader";
import type { SaleDetail } from "../../types";

export function SalePrint({ sale, onClose }: { sale: SaleDetail; onClose: () => void }) {
  return (
    <PrintPreview title="Comprobante de venta" printAreaId="sale-print-area" onClose={onClose}>
      <PrintHeader
        title="COMPROBANTE DE VENTA"
        subtitle="Documento interno — no válido como factura fiscal"
        meta={
          <>
            <span className="font-semibold text-stone-700">N.º:</span> {sale.numero}
            {" — "}
            <span className="font-semibold text-stone-700">Fecha:</span>{" "}
            {new Date(sale.fecha).toLocaleDateString("es-BO", { dateStyle: "long" })}
            {" — "}
            <span className="font-semibold text-stone-700">Estado:</span> {sale.estado}
          </>
        }
      />

      <div className="mt-6">
        <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Cliente</h2>
        <div className="mt-3 text-sm text-stone-700">
          <div className="font-semibold">{sale.clienteNombre ?? "Cliente mostrador"}</div>
          <div className="text-xs text-stone-500">
            {[sale.clienteNitCi && `NIT/CI: ${sale.clienteNitCi}`, sale.clienteTelefono && `Tel: ${sale.clienteTelefono}`, sale.clienteEmail]
              .filter(Boolean)
              .join(" • ")}
          </div>
          {sale.clienteDireccion ? <div className="text-xs text-stone-500">{sale.clienteDireccion}</div> : null}
          {sale.observacion ? <div className="mt-2 text-xs">Observación: {sale.observacion}</div> : null}
        </div>
      </div>

      <div className="mt-7">
        <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Detalle de la venta</h2>
        <div className="mt-3 overflow-hidden border border-stone-300">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-stone-400 bg-stone-100">
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Código</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Producto</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Presentación</th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Cant.</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Tipo</th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">P. unit.</th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Desc.</th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.detalles.map((det) => (
                <tr key={det.id} className="border-b border-stone-200">
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-stone-700">{det.codigo}</td>
                  <td className="px-3 py-2 text-stone-700">{det.productoNombre}</td>
                  <td className="px-3 py-2 text-stone-700">
                    {det.cantidadPresentacion} {det.unidadMedida}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-stone-700">{det.cantidad}</td>
                  <td className="px-3 py-2 text-xs text-stone-700">
                    {det.tipoPrecio === "CONSIGNACION"
                      ? "P CONS"
                      : det.tipoPrecio === "CONTADO"
                        ? "PVC"
                        : det.tipoPrecio === "MAYORISTA"
                          ? "PVM"
                          : det.tipoPrecio}
                  </td>
                  <td className="px-3 py-2 text-right text-stone-700">{money(det.precioUnitario)}</td>
                  <td className="px-3 py-2 text-right text-xs text-stone-700">
                    {Number(det.descuentoPorcentaje) > 0 ? `${det.descuentoPorcentaje}%` : "—"}
                  </td>
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
            <tr className="border-b border-stone-200">
              <td className="px-3 py-2">Subtotal</td>
              <td className="px-3 py-2 text-right font-semibold">{money(sale.subtotal)}</td>
            </tr>
            <tr className="border-b border-stone-200">
              <td className="px-3 py-2">Descuento</td>
              <td className="px-3 py-2 text-right font-semibold">{money(sale.descuentoTotal)}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right font-semibold">{money(sale.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <PrintFooter left="BIOABONO — Documento generado por el sistema" right="Comprobante de venta" />
    </PrintPreview>
  );
}

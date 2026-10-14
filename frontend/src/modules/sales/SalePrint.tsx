import { money, priceTypeLabel } from "../../utils/format";
import { PrintPreview } from "../../components/print/PrintPreview";
import { PrintFooter, PrintHeader } from "../../components/print/PrintHeader";
import type { SaleDetail } from "../../types";

export function SalePrint({ sale, onClose }: { sale: SaleDetail; onClose: () => void }) {
  return (
    <PrintPreview title="Comprobante de venta" printAreaId="sale-print-area" onClose={onClose}>
      <PrintHeader
        title="COMPROBANTE DE VENTA"
        subtitle="Documento interno — no válido como factura fiscal"
        documentNumber={sale.numero}
      />

      <section className="mt-6">
        <h2 className="mb-3 border-b border-l-2 border-l-[#647d22] border-stone-300 pb-2 pl-2 text-sm font-semibold uppercase tracking-wide text-stone-800">
          Datos del cliente
        </h2>

        <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
          <div>
            <span className="text-xs text-stone-500">Nombre / Razón social</span>
            <p className="mt-0.5 font-semibold text-stone-900">
              {sale.clienteNombre ?? "Cliente mostrador"}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">NIT / CI</span>
            <p className="mt-0.5 text-stone-800">
              {sale.clienteNitCi || "No registrado"}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">Teléfono / correo</span>
            <p className="mt-0.5 break-words text-stone-800">
              {[sale.clienteTelefono, sale.clienteEmail]
                .filter(Boolean)
                .join(" • ") || "No registrado"}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">Dirección</span>
            <p className="mt-0.5 break-words text-stone-800">
              {sale.clienteDireccion || "No registrada"}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">Fecha de venta</span>
            <p className="mt-0.5 text-stone-800">
              {new Date(sale.fecha).toLocaleDateString("es-BO", {
                dateStyle: "long",
              })}
            </p>
          </div>

          <div>
            <span className="text-xs text-stone-500">Estado</span>
            <p className="mt-0.5 font-medium text-stone-800">{sale.estado}</p>
          </div>

          {sale.consignacionNumero ? (
            <div>
              <span className="text-xs text-stone-500">Consignación asociada</span>
              <p className="mt-0.5 font-mono text-stone-800">
                {sale.consignacionNumero}
              </p>
            </div>
          ) : null}

          {sale.observacion ? (
            <div className="col-span-2 mt-1 border-t border-dashed border-stone-200 pt-2">
              <span className="text-xs text-stone-500">Observaciones</span>
              <p className="mt-0.5 text-stone-800">{sale.observacion}</p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-stone-400 pb-2">
          <h2 className="border-l-2 border-l-[#647d22] pl-2 text-sm font-semibold uppercase tracking-wide text-stone-800">
            Detalle de la venta
          </h2>
          <span className="text-[10px] text-stone-500">
            {sale.detalles.length} productos
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
                    {priceTypeLabel(det.tipoPrecio)}
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


      <div className="print-total ml-auto mt-6 max-w-xs border-t-2 border-[#647d22] pt-3 text-sm">
        <div className="flex justify-between gap-6 py-1"><span>Subtotal</span><span>{money(sale.subtotal)}</span></div>
        <div className="flex justify-between gap-6 py-1"><span>Descuento</span><span>{money(sale.descuentoTotal)}</span></div>
        <div className="flex justify-between gap-6 border-t border-stone-400 pt-2 text-base font-bold"><span>TOTAL</span><span>{money(sale.total)}</span></div>
      </div>
      <PrintFooter left="SUPERMERCADO DEL BIOABONO" right="Nota de venta" />
    </PrintPreview>
  );
}

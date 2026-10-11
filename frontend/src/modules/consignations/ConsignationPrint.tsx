import { money } from "../../utils/format";
import { PrintPreview } from "../../components/print/PrintPreview";
import { PrintFooter, PrintHeader } from "../../components/print/PrintHeader";
import type { ConsignationDetail } from "../../types";

type Variant = "entrega" | "liquidacion";

export function ConsignationPrint({
  consignation,
  variant,
  onClose,
}: {
  consignation: ConsignationDetail;
  variant: Variant;
  onClose: () => void;
}) {
  const isLiquidacion = variant === "liquidacion";
  const title = isLiquidacion ? "LIQUIDACIÓN DE CONSIGNACIÓN" : "ENTREGA EN CONSIGNACIÓN";
  const totalEntregado = consignation.detalles.reduce((sum, d) => sum + d.cantidadEntregada, 0);
  const totalVendido = consignation.detalles.reduce((sum, d) => sum + d.cantidadVendida, 0);
  const totalDevuelto = consignation.detalles.reduce((sum, d) => sum + d.cantidadDevuelta, 0);
  const totalImporte = consignation.detalles.reduce((sum, d) => sum + Number(d.importeVendido || 0), 0);

  return (
    <PrintPreview title={title} printAreaId="consignation-print-area" onClose={onClose}>
      <PrintHeader
        title={title}
        subtitle="Documento interno — no válido como factura fiscal"
        meta={
          <>
            <span className="font-semibold text-stone-700">N.º:</span> {consignation.numero}
            {" — "}
            <span className="font-semibold text-stone-700">Estado:</span> {consignation.estado === "PENDIENTE" ? "Pendiente" : "Liquidada"}
            {" — "}
            <span className="font-semibold text-stone-700">Entrega:</span>{" "}
            {new Date(consignation.fechaEntrega).toLocaleDateString("es-BO", { dateStyle: "long" })}
            {" — "}
            <span className="font-semibold text-stone-700">Usuario:</span> {consignation.usuarioNombre}
          </>
        }
      />

      <div className="mt-6">
        <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">Cliente</h2>
        <div className="mt-3 text-sm text-stone-700">
          <div className="font-semibold">{consignation.clienteNombre}</div>
          <div className="text-xs text-stone-500">
            {[
              consignation.clienteNitCi && `NIT/CI: ${consignation.clienteNitCi}`,
              consignation.clienteTelefono && `Tel: ${consignation.clienteTelefono}`,
              consignation.clienteEmail,
            ]
              .filter(Boolean)
              .join(" • ")}
          </div>
          {consignation.clienteDireccion ? <div className="text-xs text-stone-500">{consignation.clienteDireccion}</div> : null}
          {consignation.observacion ? <div className="mt-2 text-xs">Observación: {consignation.observacion}</div> : null}
        </div>
      </div>

      <div className="mt-7">
        <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">
          {isLiquidacion ? "Detalle de liquidación" : "Detalle de entrega"}
        </h2>
        <div className="mt-3 overflow-hidden border border-stone-300">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-stone-400 bg-stone-100">
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Código</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Producto</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Presentación</th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Entregado</th>
                {isLiquidacion ? (
                  <>
                    <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Vendido</th>
                    <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Devuelto</th>
                  </>
                ) : null}
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">P. cons.</th>
                {isLiquidacion ? (
                  <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Importe</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {consignation.detalles.map((det) => (
                <tr key={det.id} className="border-b border-stone-200">
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-stone-700">{det.codigo}</td>
                  <td className="px-3 py-2 text-stone-700">{det.productoNombre}</td>
                  <td className="px-3 py-2 text-stone-700">
                    {det.cantidadPresentacion} {det.unidadMedida}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-stone-700">{det.cantidadEntregada}</td>
                  {isLiquidacion ? (
                    <>
                      <td className="px-3 py-2 text-right text-stone-700">{det.cantidadVendida}</td>
                      <td className="px-3 py-2 text-right text-stone-700">{det.cantidadDevuelta}</td>
                    </>
                  ) : null}
                  <td className="px-3 py-2 text-right text-stone-700">{money(det.precioConsignacion)}</td>
                  {isLiquidacion ? (
                    <td className="px-3 py-2 text-right font-semibold text-stone-700">{money(det.importeVendido)}</td>
                  ) : null}
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
              <td className="px-3 py-2">Unidades entregadas</td>
              <td className="px-3 py-2 text-right font-semibold">{totalEntregado}</td>
            </tr>
            {isLiquidacion ? (
              <>
                <tr className="border-b border-stone-200">
                  <td className="px-3 py-2">Unidades vendidas</td>
                  <td className="px-3 py-2 text-right font-semibold">{totalVendido}</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="px-3 py-2">Unidades devueltas</td>
                  <td className="px-3 py-2 text-right font-semibold">{totalDevuelto}</td>
                </tr>
                <tr className="border-b border-stone-300">
                  <td className="px-3 py-2">Total liquidado</td>
                  <td className="px-3 py-2 text-right font-semibold">{money(consignation.venta?.total ?? totalImporte)}</td>
                </tr>
                {consignation.venta ? (
                  <tr>
                    <td className="px-3 py-2">Venta generada</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">{consignation.venta.numero}</td>
                  </tr>
                ) : null}
              </>
            ) : (
              <tr>
                <td className="px-3 py-2">Líneas de producto</td>
                <td className="px-3 py-2 text-right font-semibold">{consignation.detalles.length}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PrintFooter left="BIOABONO — Documento generado por el sistema" right={title} />
    </PrintPreview>
  );
}

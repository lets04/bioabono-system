import { money } from "../../utils/format";
import { Detail, DetailSection } from "../../components/ui/DetailSection";
import type { Product } from "../../types";

export function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="grid gap-6 text-sm">
      <DetailSection title="Producto base">
        <Detail label="Nombre" value={product.nombre} />
        <Detail label="Abreviación" value={product.abreviacion} />
        <Detail label="Categoría" value={product.categoriaNombre || "Sin categoría"} />
        <Detail label="Descripción" value={product.descripcion || "Sin descripción"} />
        <Detail label="Estado" value={product.activo ? "Activo" : "Inactivo"} />
        <Detail label="Presentaciones" value={String(product.presentaciones.length)} />
      </DetailSection>

      <div>
        <h3 className="mb-2 font-semibold text-bio-dark">Presentaciones</h3>
        <div className="overflow-hidden rounded-lg border border-stone-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-stone-50 text-[11px] uppercase text-stone-500">
                <tr>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">PVP</th>
                  <th className="px-3 py-2">P CONS</th>
                  <th className="px-3 py-2">PVC</th>
                  <th className="px-3 py-2">PVM</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Mínimo</th>
                  <th className="px-3 py-2">Últ. compra</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {product.presentaciones.map((pres) => (
                  <tr key={pres.id}>
                    <td className="px-3 py-2 font-mono font-semibold text-bio-dark">{pres.codigo}</td>
                    <td className="px-3 py-2">
                      {pres.cantidad} {pres.unidadMedida}
                    </td>
                    <td className="px-3 py-2">{money(pres.pvp)}</td>
                    <td className="px-3 py-2">{money(pres.preciosDerivados.consignacion)}</td>
                    <td className="px-3 py-2">{money(pres.preciosDerivados.contado)}</td>
                    <td className="px-3 py-2">{money(pres.preciosDerivados.mayorista)}</td>
                    <td className="px-3 py-2">{pres.stockActual}</td>
                    <td className="px-3 py-2">{pres.stockMinimo}</td>
                    <td className="px-3 py-2">{pres.ultimoPrecioCompra ? money(pres.ultimoPrecioCompra) : "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${pres.activo ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}>
                        {pres.activo ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {product.presentaciones.length === 0 && <div className="px-4 py-6 text-center text-sm text-stone-500">Sin presentaciones.</div>}
        </div>
        <p className="mt-2 text-xs text-stone-500">Precios derivados y códigos son generados automáticamente. El stock se gestiona vía operaciones.</p>
      </div>
    </div>
  );
}

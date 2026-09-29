import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import type { Product } from "../../types";

type Props = {
  products: Product[];
  isLoading: boolean;
};

export function InventoryView({ products, isLoading }: Props) {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const flat = products.flatMap((p) =>
      p.presentaciones.map((pres) => ({
        id: pres.id,
        codigo: pres.codigo,
        nombre: p.nombre,
        abreviacion: p.abreviacion,
        cantidad: pres.cantidad,
        unidadMedida: pres.unidadMedida,
        stockActual: pres.stockActual,
        stockMinimo: pres.stockMinimo,
        activo: p.activo && pres.activo,
      })),
    );
    return flat
      .filter((r) => `${r.codigo} ${r.nombre} ${r.abreviacion}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.stockActual / Math.max(a.stockMinimo, 1) - b.stockActual / Math.max(b.stockMinimo, 1));
  }, [products, search]);

  return (
    <div>
      <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 sm:max-w-sm">
        <Search size={16} className="text-stone-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por código o producto" className="w-full bg-transparent text-sm outline-none" />
      </div>

      {isLoading ? (
        <EmptyState text="Cargando inventario..." />
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Stock actual</th>
                <th className="px-4 py-3">Stock mínimo</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((row) => {
                const low = row.stockActual <= row.stockMinimo;
                return (
                  <tr key={row.id} className={low ? "bg-amber-50/70" : ""}>
                    <td className="px-4 py-3 font-mono font-semibold text-bio-dark">{row.codigo}</td>
                    <td className="px-4 py-3">{row.nombre}</td>
                    <td className="px-4 py-3">
                      {row.cantidad} {row.unidadMedida}
                    </td>
                    <td className="px-4 py-3">{row.stockActual}</td>
                    <td className="px-4 py-3">{row.stockMinimo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${low ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {low ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                        {low ? "Stock bajo" : "Suficiente"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          {rows.length === 0 && <EmptyState text="No hay presentaciones en inventario." />}
        </div>
      )}
    </div>
  );
}

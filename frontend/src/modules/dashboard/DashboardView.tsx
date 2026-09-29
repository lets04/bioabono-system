import { BarChart3, Receipt, ShoppingCart, Handshake, Users } from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import type { Product, View } from "../../types";

type Props = {
  products: Product[];
  activeProducts: number;
  lowStock: number;
  onNavigate: (view: View) => void;
};

export function DashboardView({ products, activeProducts, lowStock, onNavigate }: Props) {
  const allPresentaciones = products.flatMap((p) => p.presentaciones.map((pres) => ({ ...pres, productoNombre: p.nombre, productoActivo: p.activo })));
  const lowStockPresentaciones = allPresentaciones.filter((pres) => pres.activo && pres.productoActivo && pres.stockActual <= pres.stockMinimo);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Productos base activos" value={String(activeProducts)} />
        <MetricCard label="Presentaciones stock bajo" value={String(lowStock)} />
        <MetricCard label="Categorías visibles" value={String(new Set(products.map((p) => p.categoriaId).filter(Boolean)).size)} />
        <MetricCard label="Inventario total (unid.)" value={String(allPresentaciones.reduce((t, p) => t + p.stockActual, 0))} />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-bio-dark">Accesos directos</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Ventas", icon: Receipt, view: "sales" as View },
          { label: "Compras", icon: ShoppingCart, view: "purchases" as View },
          { label: "Clientes", icon: Users, view: "customers" as View },
          { label: "Consignaciones", icon: Handshake, view: "consignations" as View },
          { label: "Reportes", icon: BarChart3, view: "reports" as View },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.view)}
              className="rounded-lg border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-bio-green"
            >
              <Icon className="mb-4 text-bio-green" size={26} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-stone-200 bg-white">
        <div className="border-b border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-bio-dark">Presentaciones con stock bajo</div>
        {lowStockPresentaciones.length === 0 ? (
          <EmptyState text="No hay presentaciones activas con stock bajo." />
        ) : (
          <div className="divide-y divide-stone-100">
            {lowStockPresentaciones.map((pres) => (
              <div key={pres.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium text-bio-dark">
                  {pres.productoNombre} — {pres.codigo} ({pres.cantidad} {pres.unidadMedida})
                </span>
                <span className="text-stone-500">
                  {pres.stockActual} / minimo {pres.stockMinimo}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { AlertTriangle, ArrowRight, BarChart3, Boxes, FolderTree, Handshake, Package, Receipt, ShoppingCart, Users, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import type { Product, View } from "../../types";

type Props = {
  products: Product[];
  activeProducts: number;
  lowStock: number;
  isLoading: boolean;
  userName: string;
  availableViews: View[];
  onNavigate: (view: View) => void;
};

const shortcuts: Array<{ label: string; desc: string; icon: LucideIcon; view: View }> = [
  { label: "Nueva venta", desc: "Registrar y emitir comprobante", icon: Receipt, view: "sales" },
  { label: "Nueva compra", desc: "Ingresar mercadería", icon: ShoppingCart, view: "purchases" },
  { label: "Consignaciones", desc: "Entregas y liquidaciones", icon: Handshake, view: "consignations" },
  { label: "Clientes", desc: "Directorio y datos", icon: Users, view: "customers" },
  { label: "Reportes", desc: "Totales y exportación", icon: BarChart3, view: "reports" },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function DashboardView({ products, activeProducts, lowStock, isLoading, userName, availableViews, onNavigate }: Props) {
  const allPresentaciones = products.flatMap((p) => p.presentaciones.map((pres) => ({ ...pres, productoNombre: p.nombre, productoActivo: p.activo })));
  const lowStockPresentaciones = allPresentaciones
    .filter((pres) => pres.activo && pres.productoActivo && pres.stockActual <= pres.stockMinimo)
    .sort((a, b) => a.stockActual / Math.max(a.stockMinimo, 1) - b.stockActual / Math.max(b.stockMinimo, 1));
  const totalUnits = allPresentaciones.reduce((t, p) => t + p.stockActual, 0);
  const categories = new Set(products.map((p) => p.categoriaId).filter(Boolean)).size;
  const visibleShortcuts = shortcuts.filter((s) => availableViews.includes(s.view));
  const firstName = userName.trim().split(/\s+/)[0];
  const fmt = (n: number) => (isLoading ? "—" : n.toLocaleString("es-BO"));

  return (
    <div className="grid gap-8">
      <div>
        <h2 className="text-lg font-semibold text-bio-dark">
          {greeting()}, {firstName}
        </h2>
        <p className="text-sm text-stone-500">Este es el estado actual de tu inventario.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Productos activos" value={fmt(activeProducts)} icon={Package} onClick={() => onNavigate("products")} />
        <MetricCard
          label="Stock bajo"
          value={fmt(lowStock)}
          icon={lowStock > 0 ? AlertTriangle : CheckCircle2}
          tone={lowStock > 0 ? "warning" : "default"}
          hint={isLoading ? undefined : lowStock > 0 ? "Requiere reposición" : "Todo en orden"}
          onClick={() => onNavigate("inventory")}
        />
        <MetricCard label="Categorías en uso" value={fmt(categories)} icon={FolderTree} />
        <MetricCard label="Unidades en inventario" value={fmt(totalUnits)} icon={Boxes} onClick={() => onNavigate("inventory")} />
      </div>

      <section aria-labelledby="accesos">
        <h2 id="accesos" className="text-sm font-semibold uppercase tracking-wide text-stone-500">Accesos directos</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visibleShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.view)}
                className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-bio-green hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-bio-green/10 text-bio-green transition group-hover:bg-bio-green group-hover:text-white">
                  <Icon size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-stone-800">{item.label}</span>
                  <span className="block truncate text-xs text-stone-500">{item.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="stock-bajo" className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3">
          <h2 id="stock-bajo" className="flex items-center gap-2 text-sm font-semibold text-bio-dark">
            <AlertTriangle size={16} className="text-amber-600" />
            Presentaciones con stock bajo
            {lowStockPresentaciones.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{lowStockPresentaciones.length}</span>
            )}
          </h2>
          <button type="button" onClick={() => onNavigate("inventory")} className="inline-flex items-center gap-1 text-sm font-medium text-bio-green hover:underline">
            Ver inventario <ArrowRight size={14} />
          </button>
        </div>
        {isLoading ? (
          <div className="grid gap-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-stone-100" />
            ))}
          </div>
        ) : lowStockPresentaciones.length === 0 ? (
          <EmptyState icon={CheckCircle2} text="Todo en orden" hint="No hay presentaciones activas con stock bajo." />
        ) : (
          <ul className="divide-y divide-stone-100">
            {lowStockPresentaciones.slice(0, 8).map((pres) => {
              const pct = Math.min(100, Math.round((pres.stockActual / Math.max(pres.stockMinimo, 1)) * 100));
              const empty = pres.stockActual <= 0;
              return (
                <li key={pres.id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_200px] sm:items-center sm:gap-6">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-bio-dark">{pres.productoNombre}</p>
                    <p className="text-xs text-stone-500">
                      <span className="font-mono">{pres.codigo}</span> · {pres.cantidad} {pres.unidadMedida}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className={`font-semibold ${empty ? "text-red-600" : "text-amber-700"}`}>{empty ? "Sin stock" : `${pres.stockActual} unid.`}</span>
                      <span className="text-stone-500">mín. {pres.stockMinimo}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div className={`h-full rounded-full ${empty ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${Math.max(pct, 3)}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {lowStockPresentaciones.length > 8 && (
          <button type="button" onClick={() => onNavigate("inventory")} className="w-full border-t border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium text-bio-green hover:bg-stone-100">
            Ver las {lowStockPresentaciones.length} presentaciones
          </button>
        )}
      </section>
    </div>
  );
}

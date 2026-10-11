import { useState } from "react";
import { Handshake, Package, ShoppingCart, Receipt, ClipboardList } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PurchaseReport } from "./PurchaseReport";
import { SalesReport } from "./SalesReport";
import { InventoryReport } from "./InventoryReport";
import { ProductReport } from "./ProductReport";
import { ConsignationsReport } from "./ConsignationsReport";

type Tab = "purchases" | "sales" | "inventory" | "products" | "consignations";

const tabs: Array<{ id: Tab; label: string; desc: string; icon: LucideIcon }> = [
  { id: "purchases", label: "Compras", desc: "Historial y totales por proveedor", icon: ShoppingCart },
  { id: "sales", label: "Ventas", desc: "Ventas, descuentos y clientes", icon: Receipt },
  { id: "consignations", label: "Consignaciones", desc: "Entregas, devoluciones y ventas", icon: Handshake },
  { id: "inventory", label: "Inventario", desc: "Stock actual por presentación", icon: ClipboardList },
  { id: "products", label: "Productos", desc: "Catálogo, PVP y último precio", icon: Package },
];

export function ReportsView() {
  const [active, setActive] = useState<Tab>("purchases");

  return (
    <div className="grid gap-6">
      <div role="tablist" aria-label="Tipo de reporte" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={isActive}
              aria-controls="report-panel"
              onClick={() => setActive(t.id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left shadow-sm transition ${isActive ? "border-bio-green bg-white ring-2 ring-bio-green/20" : "border-stone-200 bg-white hover:border-bio-green/60"}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-bio-green text-white" : "bg-bio-green/10 text-bio-green"}`}>
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${isActive ? "text-bio-dark" : "text-stone-800"}`}>{t.label}</span>
                <span className="block text-xs text-stone-500">{t.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div id="report-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        {active === "purchases" && <PurchaseReport />}
        {active === "sales" && <SalesReport />}
        {active === "consignations" && <ConsignationsReport />}
        {active === "inventory" && <InventoryReport />}
        {active === "products" && <ProductReport />}
      </div>
    </div>
  );
}

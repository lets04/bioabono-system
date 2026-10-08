import { useState } from "react";
import { BarChart3, Handshake, Package, ShoppingCart, Receipt, ClipboardList, Printer } from "lucide-react";
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`rounded-lg border p-4 text-left transition ${isActive ? "border-bio-green bg-bio-green text-white shadow" : "border-stone-200 bg-white hover:border-bio-green"}`}
            >
              <Icon size={22} className={isActive ? "text-white" : "text-bio-green"} />
              <div className={`mt-2 text-sm font-semibold ${isActive ? "text-white" : "text-stone-800"}`}>{t.label}</div>
              <div className={`text-xs ${isActive ? "text-white/80" : "text-stone-500"}`}>{t.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6">
        {active === "purchases" && <PurchaseReport />}
        {active === "sales" && <SalesReport />}
        {active === "consignations" && <ConsignationsReport />}
        {active === "inventory" && <InventoryReport />}
        {active === "products" && <ProductReport />}
      </div>
    </div>
  );
}

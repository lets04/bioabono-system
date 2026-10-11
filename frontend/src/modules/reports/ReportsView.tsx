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
      {/* En celular: fila deslizable de pestañas compactas; desde sm: cuadrícula de tarjetas con descripción. */}
      <div
        role="tablist"
        aria-label="Tipo de reporte"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:px-0 sm:py-0 lg:grid-cols-5"
      >
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
              onClick={(event) => {
                setActive(t.id);
                event.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
              }}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left shadow-sm transition sm:items-start sm:gap-3 sm:p-4 ${isActive ? "border-bio-green bg-white ring-2 ring-bio-green/20" : "border-stone-200 bg-white hover:border-bio-green/60"}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${isActive ? "bg-bio-green text-white" : "bg-bio-green/10 text-bio-green"}`}>
                <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className={`block whitespace-nowrap text-sm font-semibold sm:whitespace-normal ${isActive ? "text-bio-dark" : "text-stone-800"}`}>{t.label}</span>
                <span className="hidden text-xs text-stone-500 sm:block">{t.desc}</span>
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

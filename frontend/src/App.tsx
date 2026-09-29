import { useState } from "react";
import { BarChart3, FolderTree, Handshake, LayoutDashboard, Package, Receipt, ShoppingCart, Truck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardView } from "./modules/dashboard/DashboardView";
import { ProductsView } from "./modules/products/ProductsView";
import { CategoriesView } from "./modules/categories/CategoriesView";
import { SuppliersView } from "./modules/suppliers/SuppliersView";
import { PurchasesView } from "./modules/purchases/PurchasesView";
import { ConsignationsView } from "./modules/consignations/ConsignationsView";
import { CustomersView } from "./modules/customers/CustomersView";
import { SalesView } from "./modules/sales/SalesView";
import { InventoryView } from "./modules/inventory/InventoryView";
import { ReportsView } from "./modules/reports/ReportsView";
import { useProducts } from "./hooks/useProducts";
import { useCategories } from "./hooks/useCategories";
import { useSuppliers } from "./hooks/useSuppliers";
import { useCustomers } from "./hooks/useCustomers";
import type { View } from "./types";

const navItems = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { id: "sales", label: "Ventas", icon: Receipt },
  { id: "purchases", label: "Compras", icon: ShoppingCart },
  { id: "consignations", label: "Consignaciones", icon: Handshake },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "suppliers", label: "Proveedores", icon: Truck },
  { id: "products", label: "Productos", icon: Package },
  { id: "categories", label: "Categorías", icon: FolderTree },
  { id: "reports", label: "Reportes", icon: BarChart3 },
] satisfies Array<{ id: View; label: string; icon: LucideIcon }>;

export function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [productSearch, setProductSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const productsQuery = useProducts(productSearch);
  const categoriesQuery = useCategories();
  const suppliersQuery = useSuppliers(supplierSearch);
  const customersQuery = useCustomers(customerSearch);

  const products = productsQuery.data ?? [];
  const activeProducts = products.filter((p) => p.activo);
  const lowStockPresentaciones = products.flatMap((p) => p.presentaciones.filter((pres) => p.activo && pres.activo && pres.stockActual <= pres.stockMinimo));

  return (
    <AppLayout
      navItems={navItems}
      activeView={activeView}
      onNavigate={setActiveView}
      title={navItems.find((item) => item.id === activeView)?.label ?? ""}
    >
      {activeView === "dashboard" && (
        <DashboardView
          products={products}
          activeProducts={activeProducts.length}
          lowStock={lowStockPresentaciones.length}
          onNavigate={setActiveView}
        />
      )}

      {activeView === "products" && (
        <ProductsView
          products={products}
          categories={categoriesQuery.data ?? []}
          isLoading={productsQuery.isLoading || categoriesQuery.isLoading}
          isError={productsQuery.isError || categoriesQuery.isError}
          search={productSearch}
          onSearch={setProductSearch}
        />
      )}

      {activeView === "categories" && (
        <CategoriesView
          categories={categoriesQuery.data ?? []}
          isLoading={categoriesQuery.isLoading}
          isError={categoriesQuery.isError}
        />
      )}

      {activeView === "inventory" && <InventoryView products={products} isLoading={productsQuery.isLoading} />}

      {activeView === "suppliers" && (
        <SuppliersView
          suppliers={suppliersQuery.data ?? []}
          isLoading={suppliersQuery.isLoading}
          isError={suppliersQuery.isError}
          search={supplierSearch}
          onSearch={setSupplierSearch}
        />
      )}

      {activeView === "purchases" && <PurchasesView />}

      {activeView === "consignations" && <ConsignationsView />}

      {activeView === "customers" && (
        <CustomersView
          customers={customersQuery.data ?? []}
          isLoading={customersQuery.isLoading}
          isError={customersQuery.isError}
          search={customerSearch}
          onSearch={setCustomerSearch}
        />
      )}

      {activeView === "sales" && <SalesView />}

      {activeView === "reports" && <ReportsView />}
    </AppLayout>
  );
}

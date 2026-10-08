import { useMemo, useState } from "react";
import { BarChart3, FolderTree, Handshake, LayoutDashboard, Package, Receipt, ShoppingCart, Truck, Users, Warehouse, UserCog } from "lucide-react";
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
import { UsersView } from "./modules/users/UsersView";
import { LoginView } from "./modules/auth/LoginView";
import { ActivateAccountView } from "./modules/auth/ActivateAccountView";
import { ForgotPasswordView } from "./modules/auth/ForgotPasswordView";
import { ResetPasswordView } from "./modules/auth/ResetPasswordView";
import { useAuth } from "./auth/AuthContext";
import { useProducts } from "./hooks/useProducts";
import { useCategories } from "./hooks/useCategories";
import { useSuppliers } from "./hooks/useSuppliers";
import { useCustomers } from "./hooks/useCustomers";
import type { View } from "./types";

const allNavItems = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { id: "sales", label: "Ventas", icon: Receipt },
  { id: "purchases", label: "Compras", icon: ShoppingCart },
  { id: "inventory", label: "Inventario", icon: Warehouse },
  { id: "products", label: "Productos", icon: Package },
  { id: "categories", label: "Categorías", icon: FolderTree },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "suppliers", label: "Proveedores", icon: Truck },
  { id: "consignations", label: "Consignaciones", icon: Handshake },
  { id: "reports", label: "Reportes", icon: BarChart3, adminOnly: true },
  { id: "users", label: "Usuarios", icon: UserCog, adminOnly: true },
] satisfies Array<{ id: View; label: string; icon: LucideIcon; adminOnly?: boolean }>;

function currentAuthPage() {
  const path = window.location.pathname;
  if (path.startsWith("/activar-cuenta")) return "activate";
  if (path.startsWith("/olvide-contrasena")) return "forgot";
  if (path.startsWith("/recuperar-contrasena")) return "reset";
  return "app";
}

export function App() {
  const { user, isReady } = useAuth();
  const page = currentAuthPage();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bio-cream text-sm text-stone-500">
        Cargando...
      </div>
    );
  }

  if (page === "activate") return <ActivateAccountView />;
  if (page === "forgot") return <ForgotPasswordView />;
  if (page === "reset") return <ResetPasswordView />;
  if (!user) return <LoginView />;

  return <AuthenticatedApp isAdmin={user.rol === "ADMIN"} />;
}

function AuthenticatedApp({ isAdmin }: { isAdmin: boolean }) {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [productSearch, setProductSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const navItems = useMemo(
    () => allNavItems.filter((item) => !item.adminOnly || isAdmin).map(({ id, label, icon }) => ({ id, label, icon })),
    [isAdmin],
  );

  const productsQuery = useProducts(productSearch);
  const categoriesQuery = useCategories();
  const suppliersQuery = useSuppliers(supplierSearch);
  const customersQuery = useCustomers(customerSearch);

  const products = productsQuery.data ?? [];
  const activeProducts = products.filter((p) => p.activo);
  const lowStockPresentaciones = products.flatMap((p) => p.presentaciones.filter((pres) => p.activo && pres.activo && pres.stockActual <= pres.stockMinimo));
  const title = navItems.find((item) => item.id === activeView)?.label ?? "";

  return (
    <AppLayout
      navItems={navItems}
      activeView={activeView}
      onNavigate={setActiveView}
      title={title}
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

      {activeView === "reports" && isAdmin && <ReportsView />}

      {activeView === "users" && isAdmin && <UsersView />}
    </AppLayout>
  );
}

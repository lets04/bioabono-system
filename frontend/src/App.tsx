import { useMemo, useState } from "react";
import { useViewRoute } from "./hooks/useViewRoute";
import { BarChart3, FolderTree, Handshake, LayoutDashboard, Package, Receipt, ShoppingCart, Truck, Users, Warehouse, UserCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "./layouts/AppLayout";
import { Spinner } from "./components/ui/Spinner";
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
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard, group: "General", description: "Resumen del negocio y alertas de stock" },
  { id: "sales", label: "Ventas", icon: Receipt, group: "Operaciones", description: "Registra ventas e imprime comprobantes" },
  { id: "consignations", label: "Consignaciones", icon: Handshake, group: "Operaciones", description: "Entregas a consignatarios, devoluciones y liquidaciones" },
  { id: "purchases", label: "Compras", icon: ShoppingCart, group: "Operaciones", description: "Ingreso de mercadería de proveedores" },
  { id: "inventory", label: "Inventario", icon: Warehouse, group: "Operaciones", description: "Stock actual por presentación" },
  { id: "products", label: "Productos", icon: Package, group: "Catálogo", description: "Productos, presentaciones y precios" },
  { id: "categories", label: "Categorías", icon: FolderTree, group: "Catálogo", description: "Agrupa los productos del catálogo" },
  { id: "customers", label: "Clientes", icon: Users, group: "Contactos", description: "Directorio de clientes" },
  { id: "suppliers", label: "Proveedores", icon: Truck, group: "Contactos", description: "Directorio de proveedores" },
  { id: "reports", label: "Reportes", icon: BarChart3, group: "Administración", description: "Reportes de compras, ventas, consignaciones e inventario", adminOnly: true },
  { id: "users", label: "Usuarios", icon: UserCog, group: "Administración", description: "Invita y gestiona el acceso del personal", adminOnly: true },
] satisfies Array<{ id: View; label: string; icon: LucideIcon; group: string; description: string; adminOnly?: boolean }>;

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bio-cream text-sm text-stone-500">
        <Spinner size={28} className="text-bio-green" />
        Cargando...
      </div>
    );
  }

  if (page === "activate") return <ActivateAccountView />;
  if (page === "forgot") return <ForgotPasswordView />;
  if (page === "reset") return <ResetPasswordView />;
  if (!user) return <LoginView />;

  return <AuthenticatedApp isAdmin={user.rol === "ADMIN"} userName={user.nombre} />;
}

function AuthenticatedApp({ isAdmin, userName }: { isAdmin: boolean; userName: string }) {
  const [activeView, navigate] = useViewRoute(
    (view) => !allNavItems.find((item) => item.id === view)?.adminOnly || isAdmin,
  );
  const [productSearch, setProductSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const navItems = useMemo(
    () => allNavItems.filter((item) => !item.adminOnly || isAdmin).map(({ id, label, icon, group }) => ({ id, label, icon, group })),
    [isAdmin],
  );

  // Dashboard e Inventario usan siempre el catálogo completo; la búsqueda solo filtra la vista Productos.
  const allProductsQuery = useProducts("");
  const productsQuery = useProducts(productSearch);
  const categoriesQuery = useCategories();
  const suppliersQuery = useSuppliers(supplierSearch);
  const customersQuery = useCustomers(customerSearch);

  const products = allProductsQuery.data ?? [];
  const activeProducts = products.filter((p) => p.activo);
  const lowStockPresentaciones = products.flatMap((p) => p.presentaciones.filter((pres) => p.activo && pres.activo && pres.stockActual <= pres.stockMinimo));
  const current = allNavItems.find((item) => item.id === activeView);

  return (
    <AppLayout
      navItems={navItems}
      activeView={activeView}
      onNavigate={navigate}
      title={current?.label ?? ""}
      description={current?.description}
    >
      {activeView === "dashboard" && (
        <DashboardView
          products={products}
          activeProducts={activeProducts.length}
          lowStock={lowStockPresentaciones.length}
          isLoading={allProductsQuery.isLoading}
          userName={userName}
          availableViews={navItems.map((item) => item.id)}
          onNavigate={navigate}
        />
      )}

      {activeView === "products" && (
        <ProductsView
          products={productsQuery.data ?? []}
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

      {activeView === "inventory" && <InventoryView products={products} isLoading={allProductsQuery.isLoading} />}

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

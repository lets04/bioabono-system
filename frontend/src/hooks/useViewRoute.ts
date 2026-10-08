import { useCallback, useEffect, useState } from "react";
import type { View } from "../types";

// Cada vista tiene su URL: F5 conserva la vista y el botón "atrás" del navegador funciona.
export const viewPaths: Record<View, string> = {
  dashboard: "/",
  sales: "/ventas",
  purchases: "/compras",
  inventory: "/inventario",
  products: "/productos",
  categories: "/categorias",
  customers: "/clientes",
  suppliers: "/proveedores",
  consignations: "/consignaciones",
  reports: "/reportes",
  users: "/usuarios",
};

function viewFromPath(pathname: string): View {
  const path = pathname.replace(/\/+$/, "") || "/";
  const match = (Object.entries(viewPaths) as Array<[View, string]>).find(([, p]) => p === path);
  return match?.[0] ?? "dashboard";
}

export function useViewRoute(allowed: (view: View) => boolean) {
  const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((next: View) => {
    if (window.location.pathname !== viewPaths[next]) {
      window.history.pushState(null, "", viewPaths[next]);
    }
    setView(next);
  }, []);

  // Una URL a una vista sin permiso (p. ej. /usuarios para un empleado) cae en el inicio.
  return [allowed(view) ? view : "dashboard", navigate] as const;
}

import { useState, type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";
import { MobileSidebar, Sidebar } from "./Sidebar";
import { useAuth } from "../auth/AuthContext";
import type { View } from "../types";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  id: View;
  label: string;
  icon: LucideIcon;
};

type Props = {
  navItems: NavItem[];
  activeView: View;
  onNavigate: (view: View) => void;
  title: string;
  children: ReactNode;
};

export function AppLayout({
  navItems,
  activeView,
  onNavigate,
  title,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="h-screen overflow-hidden bg-bio-cream text-stone-800 print:h-auto print:overflow-visible print:bg-white">

      <Sidebar
        navItems={navItems}
        activeView={activeView}
        onNavigate={onNavigate}
      />

      <MobileSidebar
        navItems={navItems}
        activeView={activeView}
        onNavigate={onNavigate}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="ml-0 h-screen min-w-0 overflow-y-auto md:ml-64 print:ml-0 print:h-auto print:overflow-visible">
        <header className="flex items-center gap-3 px-4 py-4 md:px-8 md:py-5 print:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-stone-500 md:text-sm">
              Panel operativo
            </p>
            <h1 className="truncate text-xl font-semibold text-bio-dark md:text-2xl">
              {title}
            </h1>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium text-bio-dark">{user?.nombre}</p>
              <p className="text-xs text-stone-500">{user?.rol === "ADMIN" ? "Administrador" : "Empleado"}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </header>

        <section className="px-4 pb-10 md:px-8">
          {children}
        </section>
      </main>
    </div>
  );
}

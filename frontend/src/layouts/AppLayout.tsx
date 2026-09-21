import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { MobileSidebar, Sidebar } from "./Sidebar";
import type { View } from "../types";
import type { LucideIcon } from "lucide-react";

type NavItem = { id: View; label: string; icon: LucideIcon };

type Props = {
  navItems: NavItem[];
  activeView: View;
  onNavigate: (view: View) => void;
  title: string;
  children: ReactNode;
};

export function AppLayout({ navItems, activeView, onNavigate, title, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bio-cream text-stone-800">
      <div className="flex min-h-screen">
        <Sidebar navItems={navItems} activeView={activeView} onNavigate={onNavigate} />
        <MobileSidebar navItems={navItems} activeView={activeView} onNavigate={onNavigate} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0 flex-1">
          <header className="flex items-center gap-3 px-4 py-4 md:px-8 md:py-5">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 md:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-stone-500 md:text-sm">Panel operativo</p>
              <h1 className="truncate text-xl font-semibold text-bio-dark md:text-2xl">{title}</h1>
            </div>
          </header>
          <section className="px-4 pb-10 md:px-8">{children}</section>
        </main>
      </div>
    </div>
  );
}

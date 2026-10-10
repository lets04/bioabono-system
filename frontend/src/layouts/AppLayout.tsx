import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { MobileSidebar, Sidebar, type NavItem } from "./Sidebar";
import type { View } from "../types";

type Props = {
  navItems: NavItem[];
  activeView: View;
  onNavigate: (view: View) => void;
  title: string;
  description?: string;
  children: ReactNode;
};

const todayLabel = () =>
  new Date().toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" });

export function AppLayout({
  navItems,
  activeView,
  onNavigate,
  title,
  description,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Al cambiar de vista: volver arriba y reflejar la sección en la pestaña del navegador.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    document.title = title ? `${title} · BIOABONO` : "BIOABONO";
  }, [activeView, title]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="h-screen overflow-hidden bg-bio-cream text-stone-800 print:h-auto print:overflow-visible print:bg-white">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-bio-dark focus:shadow-lg"
      >
        Saltar al contenido
      </a>

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

      <main ref={mainRef} className="ml-0 h-screen min-w-0 overflow-y-auto md:ml-64 print:ml-0 print:h-auto print:overflow-visible">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200/70 bg-bio-cream/90 px-4 py-3 backdrop-blur md:px-8 md:py-5 print:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 md:hidden"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold tracking-tight text-bio-dark md:text-2xl">
              {title}
            </h1>
            {description ? (
              <p className="hidden truncate text-sm text-stone-500 sm:block">{description}</p>
            ) : null}
          </div>

          <p className="hidden shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium capitalize text-stone-600 shadow-sm lg:block">
            {todayLabel()}
          </p>
        </header>

        <section id="contenido" tabIndex={-1} className="px-4 pb-10 pt-5 outline-none md:px-8 md:pt-6">
          <div key={activeView} className="animate-fade-in">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}

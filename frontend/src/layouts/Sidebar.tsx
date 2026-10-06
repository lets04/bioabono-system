import type { LucideIcon } from "lucide-react";
import type { View } from "../types";
import logoBioabono from "../../dist/assets/bioabono.png";

type NavItem = {
  id: View;
  label: string;
  icon: LucideIcon;
};

type Props = {
  navItems: NavItem[];
  activeView: View;
  onNavigate: (view: View) => void;
};

export function Sidebar({
  navItems,
  activeView,
  onNavigate,
}: Props) {
  return (
    <>
      {/* =========================
          SIDEBAR DESKTOP
          ========================= */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-bio-dark text-white md:flex">

        {/* Cabecera blanca con logo */}
        <div className="flex h-25 shrink-0 items-center justify-center bg-bio-dark px-6">
          <img
            src={logoBioabono}
            alt="BIOABONO"
            className="max-h-23 w-auto object-contain"
          />
        </div>

        {/* Menú */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                  activeView === item.id
                    ? "bg-bio-green font-semibold text-white"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export function MobileSidebar({
  navItems,
  activeView,
  onNavigate,
  isOpen,
  onClose,
}: Props & {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-bio-dark text-white shadow-2xl transition-transform duration-300 md:hidden ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Cabecera */}
        <div className="relative flex h-28 shrink-0 items-center justify-center bg-bio-dark px-4">

          {/* Logo */}
          <img
            src={logoBioabono}
            alt="BIOABONO"
            className="max-h-25 max-w-[190px] w-auto object-contain"
          />

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar menú"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menú */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
                  activeView === item.id
                    ? "bg-bio-green font-semibold text-white"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
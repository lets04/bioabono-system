import { Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { View } from "../types";

type NavItem = { id: View; label: string; icon: LucideIcon };

type Props = {
  navItems: NavItem[];
  activeView: View;
  onNavigate: (view: View) => void;
};

export function Sidebar({ navItems, activeView, onNavigate }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-bio-dark px-4 py-6 text-white md:flex">
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-bio-light">
            <Sprout size={24} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide">BIOABONO</div>
            <div className="text-xs text-white/65">Gestión comercial</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                  activeView === item.id ? "bg-bio-green font-semibold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer - hidden on desktop, rendered via AppLayout */}
    </>
  );
}

export function MobileSidebar({
  navItems,
  activeView,
  onNavigate,
  isOpen,
  onClose,
}: Props & { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      <div className={`fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm transition-opacity md:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-bio-dark px-4 py-6 text-white shadow-2xl transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-bio-light">
              <Sprout size={24} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">BIOABONO</div>
              <div className="text-xs text-white/65">Gestión comercial</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Cerrar menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
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
                  activeView === item.id ? "bg-bio-green font-semibold" : "text-white/80 hover:bg-white/10"
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

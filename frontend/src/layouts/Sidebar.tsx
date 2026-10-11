import { useEffect, useState } from "react";
import { ChevronDown, LogOut, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { View } from "../types";
import { brandMark as logoBioabono } from "../brand";
import { useAuth } from "../auth/AuthContext";

export type NavItem = {
  id: View;
  label: string;
  icon: LucideIcon;
  group: string;
};

type Props = {
  navItems: NavItem[];
  activeView: View;
  onNavigate: (view: View) => void;
};

function initials(name: string | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function NavButton({ item, active, onNavigate, compact }: { item: NavItem; active: boolean; onNavigate: (view: View) => void; compact?: boolean }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onNavigate(item.id)}
      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition ${compact ? "py-2" : "py-3"} ${
        active
          ? "bg-white/10 font-semibold text-white"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      {active && <span className="absolute inset-y-1.5 left-0 w-1 rounded-r bg-bio-light" aria-hidden="true" />}
      <Icon size={18} className={active ? "text-bio-light" : "text-white/60 group-hover:text-white"} />
      {item.label}
    </button>
  );
}

/** Menú en acordeón (una sección abierta a la vez); compartido entre escritorio y móvil. */
function NavList({ navItems, activeView, onNavigate, compact }: Props & { compact?: boolean }) {
  const groups = navItems.reduce<Array<{ name: string; items: NavItem[] }>>((acc, item) => {
    const group = acc.find((g) => g.name === item.group);
    if (group) group.items.push(item);
    else acc.push({ name: item.group, items: [item] });
    return acc;
  }, []);

  const activeGroup = navItems.find((item) => item.id === activeView)?.group ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);

  // Al llegar a una vista desde otro lugar (accesos directos, botón atrás) se abre su sección.
  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  return (
    <nav
      aria-label="Navegación principal"
      className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {groups.map((group) => {
        if (group.items.length === 1) {
          const item = group.items[0];
          return <NavButton key={group.name} item={item} active={activeView === item.id} onNavigate={onNavigate} compact={compact} />;
        }

        const isOpen = openGroup === group.name;
        const containsActive = activeGroup === group.name;
        const panelId = `nav-group-${group.name}`;
        return (
          <div key={group.name}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenGroup(isOpen ? null : group.name)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition hover:bg-white/5 ${
                containsActive ? "text-bio-light" : "text-white/50 hover:text-white/80"
              }`}
            >
              {group.name}
              <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            <div
              id={panelId}
              className={`grid transition-[grid-template-rows,visibility] duration-200 ${isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"}`}
            >
              <ul className="grid gap-0.5 overflow-hidden">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <NavButton item={item} active={activeView === item.id} onNavigate={onNavigate} compact={compact} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function UserCard() {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center gap-3 border-t border-white/10 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bio-green text-sm font-semibold text-white" aria-hidden="true">
        {initials(user?.nombre)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{user?.nombre}</p>
        <p className="text-xs text-white/50">{user?.rol === "ADMIN" ? "Administrador" : "Empleado"}</p>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}

export function Sidebar({
  navItems,
  activeView,
  onNavigate,
}: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-bio-dark text-white md:flex print:hidden">
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        className="flex h-24 shrink-0 items-center justify-center border-b border-white/10 px-6"
        aria-label="Ir a Inicio"
      >
        <img
          src={logoBioabono}
          alt="BIOABONO"
          className="max-h-[84px] max-w-full w-auto object-contain"
        />
      </button>

      <NavList navItems={navItems} activeView={activeView} onNavigate={onNavigate} compact />

      <UserCard />
    </aside>
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
      <div
        className={`fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-bio-dark text-white shadow-2xl transition-[transform,visibility] duration-300 md:hidden print:hidden ${
          isOpen
            ? "visible translate-x-0"
            : "invisible -translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="relative flex h-24 shrink-0 items-center justify-center border-b border-white/10 px-4">
          <button
            type="button"
            onClick={() => {
              onNavigate("dashboard");
              onClose();
            }}
            aria-label="Ir a Inicio"
          >
            <img
              src={logoBioabono}
              alt="BIOABONO"
              className="max-h-[84px] max-w-[180px] w-auto object-contain"
            />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        <NavList
          navItems={navItems}
          activeView={activeView}
          onNavigate={(view) => {
            onNavigate(view);
            onClose();
          }}
        />

        <UserCard />
      </aside>
    </>
  );
}

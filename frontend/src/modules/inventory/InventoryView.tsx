import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, PackageX, type LucideIcon } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { SearchInput } from "../../components/ui/SearchInput";
import type { Product } from "../../types";

type Props = {
  products: Product[];
  isLoading: boolean;
};

type Filter = "all" | "low" | "out";

type StockRow = { stockActual: number; stockMinimo: number };

const filterMatches: Record<Filter, (row: StockRow) => boolean> = {
  all: () => true,
  low: (row) => row.stockActual <= row.stockMinimo,
  out: (row) => row.stockActual <= 0,
};

type Level = "out" | "low" | "ok";

const levelStyles: Record<Level, { bar: string; text: string; badge: string; icon: LucideIcon; label: string }> = {
  out: { bar: "bg-red-500", text: "text-red-600", badge: "bg-red-100 text-red-700", icon: PackageX, label: "Sin stock" },
  low: { bar: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-800", icon: AlertTriangle, label: "Stock bajo" },
  ok: { bar: "bg-emerald-500", text: "text-stone-800", badge: "bg-emerald-100 text-emerald-800", icon: CheckCircle2, label: "Suficiente" },
};

function stockLevel(row: StockRow): Level {
  if (filterMatches.out(row)) return "out";
  if (filterMatches.low(row)) return "low";
  return "ok";
}

export function InventoryView({ products, isLoading }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const all = useMemo(
    () =>
      products.flatMap((p) =>
        p.presentaciones.map((pres) => ({
          id: pres.id,
          codigo: pres.codigo,
          nombre: p.nombre,
          abreviacion: p.abreviacion,
          cantidad: pres.cantidad,
          unidadMedida: pres.unidadMedida,
          stockActual: pres.stockActual,
          stockMinimo: pres.stockMinimo,
          activo: p.activo && pres.activo,
        })),
      ),
    [products],
  );

  const counts = useMemo(
    () => ({
      all: all.length,
      low: all.filter(filterMatches.low).length,
      out: all.filter(filterMatches.out).length,
    }),
    [all],
  );

  const rows = useMemo(() => {
    const term = search.toLowerCase();
    return all
      .filter((r) => `${r.codigo} ${r.nombre} ${r.abreviacion}`.toLowerCase().includes(term))
      .filter(filterMatches[filter])
      .sort((a, b) => a.stockActual / Math.max(a.stockMinimo, 1) - b.stockActual / Math.max(b.stockMinimo, 1));
  }, [all, search, filter]);

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: "Todas" },
    { id: "low", label: "Stock bajo" },
    { id: "out", label: "Sin stock" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código o producto" />
        <div role="group" aria-label="Filtrar por estado de stock" className="inline-flex w-full rounded-lg border border-stone-200 bg-white p-1 shadow-sm sm:w-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition sm:flex-none ${
                filter === f.id ? "bg-bio-green text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 text-xs ${filter === f.id ? "bg-white/20" : "bg-stone-100 text-stone-500"}`}>{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <DataState isLoading={isLoading} isError={false} />

      {!isLoading && (
        <div className="table-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Presentación</th>
                  <th className="px-4 py-3">Nivel de stock</th>
                  <th className="px-4 py-3 text-right">Actual</th>
                  <th className="px-4 py-3 text-right">Mínimo</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="table-body divide-y divide-stone-100">
                {rows.map((row) => {
                  const level = stockLevel(row);
                  const style = levelStyles[level];
                  const LevelIcon = style.icon;
                  // La barra llena equivale al doble del mínimo: deja ver holgura sin perder la escala.
                  const pct = Math.min(100, Math.round((row.stockActual / Math.max(row.stockMinimo * 2, 1)) * 100));
                  return (
                    <tr key={row.id} className={!row.activo ? "text-stone-400" : ""}>
                      <td className="px-4 py-3 font-mono font-semibold text-bio-dark">{row.codigo}</td>
                      <td className="px-4 py-3">
                        {row.nombre}
                        {!row.activo && <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-stone-500">Inactivo</span>}
                      </td>
                      <td className="px-4 py-3">
                        {row.cantidad} {row.unidadMedida}
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
                          <div
                            className={`h-full rounded-full ${style.bar}`}
                            style={{ width: `${level === "out" ? 0 : Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${style.text}`}>{row.stockActual}</td>
                      <td className="px-4 py-3 text-right text-stone-500">{row.stockMinimo}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}>
                          <LevelIcon size={14} />
                          {style.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <EmptyState
              text={all.length === 0 ? "No hay presentaciones en inventario." : "Ninguna presentación coincide con el filtro."}
              hint={all.length > 0 ? "Prueba con otro término de búsqueda o cambia el filtro de estado." : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}

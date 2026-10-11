import { useMemo } from "react";
import { Layers } from "lucide-react";
import { SearchSelect, type SearchSelectOption } from "./SearchSelect";
import type { Category } from "../../types";

// Color estable por categoría (según su id) para reconocerlas de un vistazo.
const palette = [
  "bg-bio-green text-white",
  "bg-bio-light text-bio-dark",
  "bg-emerald-600 text-white",
  "bg-amber-500 text-white",
  "bg-lime-600 text-white",
  "bg-teal-600 text-white",
  "bg-orange-500 text-white",
  "bg-bio-dark text-white",
];

type Props = {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
  /** Texto de la opción vacía, p. ej. "Sin categoría" o "Todas". */
  emptyLabel: string;
};

export function CategorySelect({ categories, value, onChange, emptyLabel }: Props) {
  const items = useMemo<SearchSelectOption[]>(
    () => [
      {
        value: "",
        label: emptyLabel,
        content: (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-stone-300 text-stone-400">
              <Layers size={15} aria-hidden="true" />
            </span>
            <span className="font-medium text-stone-600">{emptyLabel}</span>
          </div>
        ),
      },
      ...categories.map((c) => ({
        value: String(c.id),
        label: c.nombre,
        keywords: c.descripcion ?? "",
        content: (
          <div className="flex items-center gap-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${palette[c.id % palette.length]}`} aria-hidden="true">
              {c.nombre.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate font-semibold text-bio-dark">{c.nombre}</div>
              {c.descripcion ? <div className="truncate text-xs text-stone-500">{c.descripcion}</div> : null}
            </div>
          </div>
        ),
        trailing: c.activo ? null : <span className="shrink-0 rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-600">Inactiva</span>,
      })),
    ],
    [categories, emptyLabel],
  );

  return <SearchSelect options={items} value={value} onChange={onChange} placeholder="Buscar categoría..." />;
}

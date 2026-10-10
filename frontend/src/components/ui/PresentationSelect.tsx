import { useMemo } from "react";
import { SearchSelect, type SearchSelectOption } from "./SearchSelect";

export type PresentationOption = {
  id: number;
  nombre: string;
  medida: string;
  codigo: string;
  stock: number;
  stockMinimo: number;
  price?: string;
};

type Props = {
  options: PresentationOption[];
  value: string;
  onChange: (value: string) => void;
  /** Ids ya usados en otras líneas: se muestran deshabilitados. */
  usedIds?: string[];
  required?: boolean;
};

function stockBadge(stock: number, min: number) {
  if (stock <= 0) return { text: "Sin stock", className: "bg-red-100 text-red-700" };
  if (stock <= min) return { text: `Stock ${stock}`, className: "bg-amber-100 text-amber-800" };
  return { text: `Stock ${stock}`, className: "bg-emerald-100 text-emerald-800" };
}

export function PresentationSelect({ options, value, onChange, usedIds = [], required }: Props) {
  const items = useMemo<SearchSelectOption[]>(
    () =>
      options.map((o) => {
        const id = String(o.id);
        const disabled = usedIds.includes(id) && id !== value;
        const badge = stockBadge(o.stock, o.stockMinimo);
        return {
          value: id,
          label: `${o.nombre} — ${o.medida} (${o.codigo})`,
          disabled,
          content: (
            <>
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-bio-dark">{o.nombre}</span>
                <span className="shrink-0 rounded-md bg-bio-light/30 px-1.5 py-0.5 text-xs font-semibold text-bio-dark">{o.medida}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
                <span className="font-mono">{o.codigo}</span>
                {disabled ? <span className="font-medium">· Ya agregado</span> : null}
              </div>
            </>
          ),
          trailing: (
            <>
              {o.price ? <span className="shrink-0 text-sm font-semibold tabular-nums text-bio-green">{o.price}</span> : null}
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>{badge.text}</span>
            </>
          ),
        };
      }),
    [options, usedIds, value],
  );

  return <SearchSelect options={items} value={value} onChange={onChange} required={required} placeholder="Buscar presentación..." minListWidth={320} />;
}

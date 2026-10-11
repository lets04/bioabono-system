import type { ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-stone-700">
      {label}
      {children}
      {hint ? <span className="text-xs font-normal text-stone-500">{hint}</span> : null}
    </label>
  );
}

/** Valor calculado con el mismo encabezado que un Field, para que las columnas queden alineadas. */
export function ReadonlyField({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="grid gap-1.5 text-sm font-medium text-stone-700">
      <span>{label}</span>
      <output className="value-box">{value}</output>
      {hint ? <span className="text-xs font-normal text-stone-500">{hint}</span> : null}
    </div>
  );
}

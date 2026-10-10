import type { ReactNode } from "react";

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-semibold text-bio-dark">{title}</h3>
      <div className="grid gap-2 rounded-lg border border-stone-200 p-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="font-medium text-stone-800">{value}</div>
    </div>
  );
}

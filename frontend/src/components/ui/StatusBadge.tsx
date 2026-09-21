export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

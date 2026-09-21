import type { Customer } from "../../types";

export function CustomerDetail({ customer }: { customer: Customer }) {
  return (
    <div className="grid gap-6 text-sm">
      <section>
        <h3 className="mb-2 font-semibold text-bio-dark">Información</h3>
        <div className="grid gap-2 rounded-lg border border-stone-200 p-3 sm:grid-cols-2">
          <Detail label="Nombre" value={customer.nombre} />
          <Detail label="NIT / CI" value={customer.nitCi || "—"} />
          <Detail label="Teléfono" value={customer.telefono || "—"} />
          <Detail label="Email" value={customer.email || "—"} />
          <Detail label="Dirección" value={customer.direccion || "Sin dirección"} />
          <Detail label="Estado" value={customer.activo ? "Activo" : "Inactivo"} />
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="font-medium text-stone-800">{value}</div>
    </div>
  );
}

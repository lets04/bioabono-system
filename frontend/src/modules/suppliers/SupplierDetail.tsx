import type { Supplier } from "../../types";

export function SupplierDetail({ supplier }: { supplier: Supplier }) {
  return (
    <div className="grid gap-6 text-sm">
      <section>
        <h3 className="mb-2 font-semibold text-bio-dark">Información</h3>
        <div className="grid gap-2 rounded-lg border border-stone-200 p-3 sm:grid-cols-2">
          <Detail label="Nombre" value={supplier.nombre} />
          <Detail label="NIT" value={supplier.nit || "—"} />
          <Detail label="Teléfono" value={supplier.telefono || "—"} />
          <Detail label="Email" value={supplier.email || "—"} />
          <Detail label="Dirección" value={supplier.direccion || "Sin dirección"} />
          <Detail label="Estado" value={supplier.activo ? "Activo" : "Inactivo"} />
        </div>
      </section>
      <p className="text-xs text-stone-500">Este proveedor quedará disponible como selección en el futuro módulo de Compras.</p>
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

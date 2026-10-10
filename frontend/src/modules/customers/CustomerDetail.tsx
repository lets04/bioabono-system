import { Detail, DetailSection } from "../../components/ui/DetailSection";
import type { Customer } from "../../types";

export function CustomerDetail({ customer }: { customer: Customer }) {
  return (
    <div className="grid gap-6 text-sm">
      <DetailSection title="Información">
        <Detail label="Nombre" value={customer.nombre} />
        <Detail label="NIT / CI" value={customer.nitCi || "—"} />
        <Detail label="Teléfono" value={customer.telefono || "—"} />
        <Detail label="Email" value={customer.email || "—"} />
        <Detail label="Dirección" value={customer.direccion || "Sin dirección"} />
        <Detail label="Estado" value={customer.activo ? "Activo" : "Inactivo"} />
      </DetailSection>
    </div>
  );
}

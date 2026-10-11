import { Detail, DetailSection } from "../../components/ui/DetailSection";
import type { Supplier } from "../../types";

export function SupplierDetail({ supplier }: { supplier: Supplier }) {
  return (
    <div className="grid gap-6 text-sm">
      <DetailSection title="Información">
        <Detail label="Nombre" value={supplier.nombre} />
        <Detail label="NIT" value={supplier.nit || "—"} />
        <Detail label="Teléfono" value={supplier.telefono || "—"} />
        <Detail label="Email" value={supplier.email || "—"} />
        <Detail label="Dirección" value={supplier.direccion || "Sin dirección"} />
        <Detail label="Estado" value={supplier.activo ? "Activo" : "Inactivo"} />
      </DetailSection>
    </div>
  );
}

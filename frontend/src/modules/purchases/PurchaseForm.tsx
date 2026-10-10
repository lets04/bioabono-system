import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field, ReadonlyField } from "../../components/ui/Field";
import { useLineItems } from "../../hooks/useLineItems";
import { FormError } from "../../components/ui/FormError";
import { PresentationSelect } from "../../components/ui/PresentationSelect";
import { dateInputToISO, money, todayLocal } from "../../utils/format";
import type { Product, Supplier } from "../../types";

type Line = {
  presentacionId: string;
  cantidad: string;
  precioUnitario: string;
};

type Props = {
  suppliers: Supplier[];
  products: Product[];
  isSaving: boolean;
  error?: string;
  onSubmit: (payload: { proveedorId: number; fecha?: string; observacion?: string | null; detalles: Array<{ presentacionId: number; cantidad: number; precioUnitario: string }> }) => void;
  onCancel: () => void;
};

export function PurchaseForm({ suppliers, products, isSaving, error, onSubmit, onCancel }: Props) {
  const [proveedorId, setProveedorId] = useState<string>("");
  const [fecha, setFecha] = useState<string>(todayLocal);
  const [observacion, setObservacion] = useState<string>("");
  const { lines, updateLine, addLine, removeLine } = useLineItems<Line>(() => ({ presentacionId: "", cantidad: "1", precioUnitario: "0" }));

  const presentaciones = useMemo(() => {
    return products.flatMap((prod) =>
      prod.presentaciones
        .filter((pres) => pres.activo && prod.activo)
        .map((pres) => ({
          id: pres.id,
          codigo: pres.codigo,
          stock: pres.stockActual,
          stockMinimo: pres.stockMinimo,
          nombre: prod.nombre,
          medida: `${pres.cantidad} ${pres.unidadMedida}`,
          price: pres.ultimoPrecioCompra ? money(pres.ultimoPrecioCompra) : undefined,
        })),
    );
  }, [products]);

  const subtotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const qty = Number(l.cantidad) || 0;
      const price = Number(l.precioUnitario) || 0;
      return sum + qty * price;
    }, 0);
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!proveedorId) return;
    const detalles = lines
      .filter((l) => l.presentacionId && Number(l.cantidad) > 0)
      .map((l) => ({
        presentacionId: Number(l.presentacionId),
        cantidad: Number(l.cantidad),
        precioUnitario: String(Number(l.precioUnitario).toFixed(2)),
      }));
    if (detalles.length === 0) return;
    onSubmit({
      proveedorId: Number(proveedorId),
      fecha: fecha ? dateInputToISO(fecha) : undefined,
      observacion: observacion.trim() || null,
      detalles,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Proveedor *">
          <select required value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="input">
            <option value="">Seleccionar proveedor</option>
            {suppliers
              .filter((s) => s.activo)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Fecha">
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Observación">
        <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} className="input resize-y" rows={2} placeholder="Opcional" />
      </Field>

      <div className="form-section">
        <div className="form-section-header">
          <h3 className="text-sm font-semibold text-bio-dark">
            Detalle de compra <span className="ml-1 rounded-full bg-bio-green px-2 py-0.5 text-[11px] font-semibold text-white">{lines.length}</span>
          </h3>
          <button type="button" onClick={addLine} className="btn-add">
            <Plus size={14} /> Agregar producto
          </button>
        </div>

        <div className="grid gap-3 bg-bio-cream/70 p-4">
          {lines.map((line, idx) => {
            const lineSubtotal = (Number(line.cantidad) || 0) * (Number(line.precioUnitario) || 0);
            const selectedPres = presentaciones.find((p) => String(p.id) === line.presentacionId);
            return (
              <div key={idx} className="line-card sm:grid-cols-[1fr_90px_120px_120px_40px]">
                <Field label="Presentación">
                  <PresentationSelect
                    required
                    options={presentaciones}
                    value={line.presentacionId}
                    onChange={(v) => updateLine(idx, "presentacionId", v)}
                    usedIds={lines.map((l) => l.presentacionId)}
                  />
                  {selectedPres && <span className="text-xs text-stone-500">Stock actual: {selectedPres.stock}</span>}
                </Field>
                <Field label="Cantidad">
                  <input
                    required
                    min={1}
                    step={1}
                    type="number"
                    value={line.cantidad}
                    onChange={(e) => updateLine(idx, "cantidad", e.target.value)}
                    className="input bg-white"
                  />
                </Field>
                <Field label="P. compra (Bs)">
                  <input
                    required
                    min={0}
                    step={0.01}
                    type="number"
                    value={line.precioUnitario}
                    onChange={(e) => updateLine(idx, "precioUnitario", e.target.value)}
                    className="input bg-white"
                  />
                </Field>
                <ReadonlyField label="Subtotal" value={money(lineSubtotal)} />
                <div className="flex justify-end sm:mt-8">
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(idx)} aria-label="Quitar línea" title="Quitar línea" className="rounded-lg p-2 text-stone-500 transition hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="form-total">
          <span className="text-xs text-white/70">
            {lines.length} {lines.length === 1 ? "producto" : "productos"}
          </span>
          <div className="flex items-baseline justify-between gap-4 sm:justify-end">
            <span className="text-sm font-medium uppercase tracking-wide text-white/80">Total</span>
            <span className="text-xl font-bold tabular-nums text-bio-light">{money(subtotal)}</span>
          </div>
        </div>
      </div>

      <FormError message={error} />

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary px-5">
          Cancelar
        </button>
        <button disabled={isSaving} className="btn-primary px-6">
          {isSaving ? "Guardando..." : "Confirmar compra"}
        </button>
      </div>
    </form>
  );
}

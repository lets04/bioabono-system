import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "../../components/ui/Field";
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
  const [lines, setLines] = useState<Line[]>([{ presentacionId: "", cantidad: "1", precioUnitario: "0" }]);

  const presentaciones = useMemo(() => {
    return products.flatMap((prod) =>
      prod.presentaciones
        .filter((pres) => pres.activo && prod.activo)
        .map((pres) => ({
          id: pres.id,
          codigo: pres.codigo,
          label: `${prod.nombre} — ${pres.cantidad} ${pres.unidadMedida} (${pres.codigo})`,
          stock: pres.stockActual,
        })),
    );
  }, [products]);

  const updateLine = (idx: number, field: keyof Line, value: string) => {
    setLines((cur) => {
      const next = [...cur];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addLine = () => setLines((cur) => [...cur, { presentacionId: "", cantidad: "1", precioUnitario: "0" }]);
  const removeLine = (idx: number) => setLines((cur) => (cur.length <= 1 ? cur : cur.filter((_, i) => i !== idx)));

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
        <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} className="input min-h-16 resize-y" placeholder="Opcional" />
      </Field>

      <div className="rounded-lg border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-bio-dark">Detalle de compra</h3>
          <button type="button" onClick={addLine} className="inline-flex items-center gap-1 rounded-md border border-bio-green px-2.5 py-1.5 text-xs font-semibold text-bio-green hover:bg-bio-green/10">
            <Plus size={14} /> Agregar producto
          </button>
        </div>

        <div className="grid gap-3 p-4">
          {lines.map((line, idx) => {
            const lineSubtotal = (Number(line.cantidad) || 0) * (Number(line.precioUnitario) || 0);
            const selectedPres = presentaciones.find((p) => String(p.id) === line.presentacionId);
            return (
              <div key={idx} className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-[1fr_90px_110px_110px_auto]">
                <Field label="Presentación">
                  <select
                    required
                    value={line.presentacionId}
                    onChange={(e) => updateLine(idx, "presentacionId", e.target.value)}
                    className="input bg-white"
                  >
                    <option value="">Seleccionar presentación</option>
                    {presentaciones.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} — Stock {p.stock}
                      </option>
                    ))}
                  </select>
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
                <div className="grid gap-1">
                  <span className="text-xs font-medium text-stone-500">Subtotal</span>
                  <div className="flex h-11 items-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-bio-dark">
                    {money(lineSubtotal)}
                  </div>
                </div>
                <div className="flex items-end pb-1">
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(idx)} className="rounded p-2 text-stone-500 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 text-right">
          <div className="text-sm text-stone-600">
            Subtotal: <span className="font-semibold text-bio-dark">{money(subtotal)}</span>
          </div>
          <div className="text-base font-bold text-bio-dark">Total: {money(subtotal)}</div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="h-11 rounded-lg border border-stone-300 px-5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
          Cancelar
        </button>
        <button disabled={isSaving} className="h-11 rounded-lg bg-bio-green px-6 text-sm font-semibold text-white hover:bg-bio-dark disabled:opacity-60">
          {isSaving ? "Guardando..." : "Confirmar compra"}
        </button>
      </div>
    </form>
  );
}

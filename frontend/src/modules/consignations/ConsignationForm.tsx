import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "../../components/ui/Field";
import { dateInputToISO, hasDuplicates, money, todayLocal } from "../../utils/format";
import type { Customer, Product } from "../../types";

type Line = {
  presentacionId: string;
  cantidadEntregada: string;
};

type Props = {
  customers: Customer[];
  products: Product[];
  isSaving: boolean;
  error?: string;
  onSubmit: (payload: {
    clienteId: number;
    fechaEntrega?: string;
    observacion?: string | null;
    detalles: Array<{ presentacionId: number; cantidadEntregada: number }>;
  }) => void;
  onCancel: () => void;
};

export function ConsignationForm({ customers, products, isSaving, error, onSubmit, onCancel }: Props) {
  const [clienteId, setClienteId] = useState<string>("");
  const [fechaEntrega, setFechaEntrega] = useState<string>(todayLocal);
  const [observacion, setObservacion] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([{ presentacionId: "", cantidadEntregada: "1" }]);

  const presentaciones = useMemo(() => {
    return products.flatMap((prod) =>
      prod.presentaciones
        .filter((pres) => pres.activo && prod.activo)
        .map((pres) => ({
          id: pres.id,
          codigo: pres.codigo,
          pvp: Number(pres.pvp),
          stock: pres.stockActual,
          label: `${prod.nombre} — ${pres.cantidad} ${pres.unidadMedida} (${pres.codigo})`,
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

  const addLine = () => setLines((cur) => [...cur, { presentacionId: "", cantidadEntregada: "1" }]);
  const removeLine = (idx: number) => setLines((cur) => (cur.length <= 1 ? cur : cur.filter((_, i) => i !== idx)));

  const totalReferencial = useMemo(() => {
    return lines.reduce((sum, l) => {
      const pres = presentaciones.find((p) => String(p.id) === l.presentacionId);
      const qty = Number(l.cantidadEntregada) || 0;
      return sum + (pres?.pvp ?? 0) * 0.8 * qty;
    }, 0);
  }, [lines, presentaciones]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!clienteId) return;
    const detalles = lines
      .filter((l) => l.presentacionId && Number(l.cantidadEntregada) > 0)
      .map((l) => ({
        presentacionId: Number(l.presentacionId),
        cantidadEntregada: Number(l.cantidadEntregada),
      }));
    if (detalles.length === 0) return;
    if (hasDuplicates(detalles.map((d) => d.presentacionId))) {
      setLocalError("No se puede repetir la misma presentación en varias líneas.");
      return;
    }
    setLocalError(null);
    onSubmit({
      clienteId: Number(clienteId),
      fechaEntrega: fechaEntrega ? dateInputToISO(fechaEntrega) : undefined,
      observacion: observacion.trim() || null,
      detalles,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cliente *">
          <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="input">
            <option value="">Seleccionar cliente</option>
            {customers
              .filter((c) => c.activo)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Fecha de entrega">
          <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Observación">
        <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} className="input min-h-16 resize-y" placeholder="Opcional" />
      </Field>

      <div className="rounded-lg border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-bio-dark">Productos a consignar</h3>
          <button type="button" onClick={addLine} className="inline-flex items-center gap-1 rounded-md border border-bio-green px-2.5 py-1.5 text-xs font-semibold text-bio-green hover:bg-bio-green/10">
            <Plus size={14} /> Agregar producto
          </button>
        </div>

        <div className="grid gap-3 p-4">
          {lines.map((line, idx) => {
            const pres = presentaciones.find((p) => String(p.id) === line.presentacionId);
            const qty = Number(line.cantidadEntregada) || 0;
            const precioConsignacion = (pres?.pvp ?? 0) * 0.8;
            const lineSubtotal = precioConsignacion * qty;
            const isLowStock = pres ? qty > pres.stock : false;
            return (
              <div key={idx} className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-[1fr_110px_120px_110px_auto]">
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
                  {pres && <span className={`text-xs ${isLowStock ? "text-red-600 font-semibold" : "text-stone-500"}`}>Stock: {pres.stock} {isLowStock && "— insuficiente"}</span>}
                </Field>
                <Field label="Cant. entregada">
                  <input
                    required
                    min={1}
                    step={1}
                    type="number"
                    value={line.cantidadEntregada}
                    onChange={(e) => updateLine(idx, "cantidadEntregada", e.target.value)}
                    className="input bg-white"
                  />
                </Field>
                <div className="grid gap-1">
                  <span className="text-xs font-medium text-stone-500">P. consig. (×0.80)</span>
                  <div className="flex h-11 items-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-bio-dark">{money(precioConsignacion)}</div>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs font-medium text-stone-500">Subtotal referencial</span>
                  <div className="flex h-11 items-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-bio-dark">{money(lineSubtotal)}</div>
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

        <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 text-right text-sm">
          <div className="text-stone-600">
            Total referencial (estimado por lo entregado): <span className="font-bold text-bio-dark">{money(totalReferencial)}</span>
          </div>
          <div className="text-xs text-stone-500">El pago se calculará al liquidar con los precios de consignación registrados.</div>
        </div>
      </div>

      {(localError ?? error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{localError ?? error}</div>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="h-11 rounded-lg border border-stone-300 px-5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
          Cancelar
        </button>
        <button disabled={isSaving} className="h-11 rounded-lg bg-bio-green px-6 text-sm font-semibold text-white hover:bg-bio-dark disabled:opacity-60">
          {isSaving ? "Guardando..." : "Registrar consignación"}
        </button>
      </div>
    </form>
  );
}
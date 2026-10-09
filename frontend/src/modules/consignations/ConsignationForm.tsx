import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field, ReadonlyField } from "../../components/ui/Field";
import { PresentationSelect } from "../../components/ui/PresentationSelect";
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
          precioConsignacion: Number(pres.preciosDerivados.consignacion),
          stock: pres.stockActual,
          stockMinimo: pres.stockMinimo,
          nombre: prod.nombre,
          medida: `${pres.cantidad} ${pres.unidadMedida}`,
          price: money(pres.preciosDerivados.consignacion),
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
      return sum + (pres?.precioConsignacion ?? 0) * qty;
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
        <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} className="input resize-y" rows={2} placeholder="Opcional" />
      </Field>

      <div className="form-section">
        <div className="form-section-header">
          <h3 className="text-sm font-semibold text-bio-dark">
            Productos a consignar <span className="ml-1 rounded-full bg-bio-green px-2 py-0.5 text-[11px] font-semibold text-white">{lines.length}</span>
          </h3>
          <button type="button" onClick={addLine} className="btn-add">
            <Plus size={14} /> Agregar producto
          </button>
        </div>

        <div className="grid gap-3 bg-bio-cream/70 p-4">
          {lines.map((line, idx) => {
            const pres = presentaciones.find((p) => String(p.id) === line.presentacionId);
            const qty = Number(line.cantidadEntregada) || 0;
            const precioConsignacion = pres?.precioConsignacion ?? 0;
            const lineSubtotal = precioConsignacion * qty;
            const isLowStock = pres ? qty > pres.stock : false;
            return (
              <div key={idx} className="line-card sm:grid-cols-[1fr_110px_120px_120px_40px]">
                <Field label="Presentación">
                  <PresentationSelect
                    required
                    options={presentaciones}
                    value={line.presentacionId}
                    onChange={(v) => updateLine(idx, "presentacionId", v)}
                    usedIds={lines.map((l) => l.presentacionId)}
                  />
                  {pres && <span className={`text-xs ${isLowStock ? "text-red-600 font-semibold" : "text-stone-500"}`}>Stock: {pres.stock} {isLowStock && "— insuficiente"}</span>}
                </Field>
                <Field label="Cantidad">
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
                <ReadonlyField label="P. consig." value={money(precioConsignacion)} hint="PVP × 0.80" />
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
          <p className="text-xs text-white/70">El pago se calculará al liquidar con los precios de consignación registrados.</p>
          <div className="flex items-baseline justify-between gap-4 sm:justify-end">
            <span className="text-sm font-medium uppercase tracking-wide text-white/80">Total referencial</span>
            <span className="text-xl font-bold tabular-nums text-bio-light">{money(totalReferencial)}</span>
          </div>
        </div>
      </div>

      {(localError ?? error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{localError ?? error}</div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary px-5">
          Cancelar
        </button>
        <button disabled={isSaving} className="btn-primary px-6">
          {isSaving ? "Guardando..." : "Registrar consignación"}
        </button>
      </div>
    </form>
  );
}
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field, ReadonlyField } from "../../components/ui/Field";
import { useLineItems } from "../../hooks/useLineItems";
import { FormError } from "../../components/ui/FormError";
import { PresentationSelect } from "../../components/ui/PresentationSelect";
import { dateInputToISO, hasDuplicates, money, todayLocal } from "../../utils/format";
import type { Customer, Product } from "../../types";

type Line = {
  presentacionId: string;
  cantidad: string;
  descuentoPorcentaje: string;
};

type Props = {
  customers: Customer[];
  products: Product[];
  isSaving: boolean;
  error?: string;
  onSubmit: (payload: {
    clienteId: number | null;
    fecha?: string;
    tipoPrecio: "PVP" | "CONTADO" | "MAYORISTA";
    observacion?: string | null;
    detalles: Array<{ presentacionId: number; cantidad: number; descuentoPorcentaje: string; tipoPrecio: "PVP" | "CONTADO" | "MAYORISTA" }>;
  }) => void;
  onCancel: () => void;
};

type TipoPrecio = "PVP" | "CONTADO" | "MAYORISTA";

const toCents = (value: string | number) => Math.round(Number(value) * 100);

export function SaleForm({ customers, products, isSaving, error, onSubmit, onCancel }: Props) {
  const [clienteId, setClienteId] = useState<string>("");
  const [fecha, setFecha] = useState<string>(todayLocal);
  const [tipoPrecio, setTipoPrecio] = useState<TipoPrecio>("PVP");
  const [observacion, setObservacion] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);
  const { lines, updateLine, addLine, removeLine } = useLineItems<Line>(() => ({ presentacionId: "", cantidad: "1", descuentoPorcentaje: "0" }));

  const presentaciones = useMemo(() => {
    return products.flatMap((prod) =>
      prod.presentaciones
        .filter((pres) => pres.activo && prod.activo)
        .map((pres) => ({
          id: pres.id,
          codigo: pres.codigo,
          // Precios calculados por el backend: misma regla y redondeo que al guardar la venta.
          preciosCents: {
            PVP: toCents(pres.pvp),
            CONTADO: toCents(pres.preciosDerivados.contado),
            MAYORISTA: toCents(pres.preciosDerivados.mayorista),
          } satisfies Record<TipoPrecio, number>,
          stock: pres.stockActual,
          stockMinimo: pres.stockMinimo,
          nombre: prod.nombre,
          medida: `${pres.cantidad} ${pres.unidadMedida}`,
        })),
    );
  }, [products]);

  const presentationOptions = useMemo(
    () => presentaciones.map((p) => ({ ...p, price: money(p.preciosCents[tipoPrecio] / 100) })),
    [presentaciones, tipoPrecio],
  );


  const totals = useMemo(() => {
    // En centavos, igual que el backend, para que la vista previa coincida con lo guardado.
    let subtotalBrutoCents = 0;
    let descuentoTotalCents = 0;
    const rows = lines.map((l) => {
      const pres = presentaciones.find((p) => String(p.id) === l.presentacionId);
      const precioBaseCents = pres?.preciosCents[tipoPrecio] ?? 0;
      const qty = Number(l.cantidad) || 0;
      const descPct = Number(l.descuentoPorcentaje) || 0;
      const descuentoCents = Math.round((precioBaseCents * descPct) / 100);
      const precioFinalCents = precioBaseCents - descuentoCents;
      subtotalBrutoCents += precioBaseCents * qty;
      descuentoTotalCents += descuentoCents * qty;
      return {
        precioBase: precioBaseCents / 100,
        descuentoMonto: descuentoCents / 100,
        precioFinal: precioFinalCents / 100,
        subtotal: (precioFinalCents * qty) / 100,
      };
    });
    return {
      subtotalBruto: subtotalBrutoCents / 100,
      descuentoTotal: descuentoTotalCents / 100,
      total: (subtotalBrutoCents - descuentoTotalCents) / 100,
      rows,
    };
  }, [lines, presentaciones, tipoPrecio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    const detalles = lines
      .filter((l) => l.presentacionId && Number(l.cantidad) > 0)
      .map((l) => ({
        presentacionId: Number(l.presentacionId),
        cantidad: Number(l.cantidad),
        descuentoPorcentaje: String(Number(l.descuentoPorcentaje || 0).toFixed(2)),
        tipoPrecio,
      }));
    if (detalles.length === 0) return;
    if (hasDuplicates(detalles.map((d) => d.presentacionId))) {
      setLocalError("No se puede repetir la misma presentación en varias líneas.");
      return;
    }
    setLocalError(null);
    onSubmit({
      clienteId: clienteId ? Number(clienteId) : null,
      fecha: fecha ? dateInputToISO(fecha) : undefined,
      tipoPrecio,
      observacion: observacion.trim() || null,
      detalles,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Cliente">
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="input">
            <option value="">Cliente mostrador</option>
            {customers
              .filter((c) => c.activo)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Fecha">
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" />
        </Field>
        <Field label="Tipo de precio">
          <select value={tipoPrecio} onChange={(e) => setTipoPrecio(e.target.value as TipoPrecio)} className="input">
            <option value="PVP">PVP</option>
            <option value="CONTADO">PVC (×0.75)</option>
            <option value="MAYORISTA">PVM (×0.70)</option>
          </select>
        </Field>
      </div>

      <Field label="Observación">
        <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} className="input resize-y" rows={2} placeholder="Opcional" />
      </Field>

      <div className="form-section">
        <div className="form-section-header">
          <h3 className="text-sm font-semibold text-bio-dark">
            Detalle de venta <span className="ml-1 rounded-full bg-bio-green px-2 py-0.5 text-[11px] font-semibold text-white">{lines.length}</span>
          </h3>
          <button type="button" onClick={addLine} className="btn-add">
            <Plus size={14} /> Agregar producto
          </button>
        </div>

        <div className="grid gap-3 bg-bio-cream/70 p-4">
          {lines.map((line, idx) => {
            const pres = presentaciones.find((p) => String(p.id) === line.presentacionId);
            const info = totals.rows[idx];
            const isLowStock = pres ? Number(line.cantidad) > pres.stock : false;
            return (
              <div key={idx} className="line-card sm:grid-cols-[1fr_90px_90px_110px_120px_40px]">
                <Field label="Presentación">
                  <PresentationSelect
                    required
                    options={presentationOptions}
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
                    value={line.cantidad}
                    onChange={(e) => updateLine(idx, "cantidad", e.target.value)}
                    className="input bg-white"
                  />
                </Field>
                <Field label="Desc. %">
                  <input min={0} max={100} step={0.1} type="number" value={line.descuentoPorcentaje} onChange={(e) => updateLine(idx, "descuentoPorcentaje", e.target.value)} className="input bg-white" />
                </Field>
                <ReadonlyField label="P. unit." value={money(info?.precioFinal ?? 0)} hint={`Base ${money(info?.precioBase ?? 0)}`} />
                <ReadonlyField label="Subtotal" value={money(info?.subtotal ?? 0)} />
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
          <dl className="grid w-full gap-1 text-sm sm:max-w-xs">
            <div className="flex justify-between text-white/80">
              <dt>Subtotal</dt>
              <dd className="font-semibold tabular-nums text-white">{money(totals.subtotalBruto)}</dd>
            </div>
            <div className="flex justify-between text-white/80">
              <dt>Descuento</dt>
              <dd className="font-semibold tabular-nums text-amber-200">− {money(totals.descuentoTotal)}</dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-white/20 pt-2">
              <dt className="text-sm font-medium uppercase tracking-wide text-white/80">Total</dt>
              <dd className="text-xl font-bold tabular-nums text-bio-light">{money(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <FormError message={localError ?? error} />

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary px-5">
          Cancelar
        </button>
        <button disabled={isSaving} className="btn-primary px-6">
          {isSaving ? "Guardando..." : "Confirmar venta"}
        </button>
      </div>
    </form>
  );
}

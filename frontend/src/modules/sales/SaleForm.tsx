import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "../../components/ui/Field";
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

function precioConTipo(pvp: number, tipo: string): number {
  switch (tipo) {
    case "CONTADO":
      return pvp * 0.75;
    case "MAYORISTA":
      return pvp * 0.7;
    default:
      return pvp;
  }
}

export function SaleForm({ customers, products, isSaving, error, onSubmit, onCancel }: Props) {
  const [clienteId, setClienteId] = useState<string>("");
  const [fecha, setFecha] = useState<string>(todayLocal);
  const [tipoPrecio, setTipoPrecio] = useState<"PVP" | "CONTADO" | "MAYORISTA">("PVP");
  const [observacion, setObservacion] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([{ presentacionId: "", cantidad: "1", descuentoPorcentaje: "0" }]);

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

  const addLine = () => setLines((cur) => [...cur, { presentacionId: "", cantidad: "1", descuentoPorcentaje: "0" }]);
  const removeLine = (idx: number) => setLines((cur) => (cur.length <= 1 ? cur : cur.filter((_, i) => i !== idx)));

  const totals = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let total = 0;
    const rows = lines.map((l) => {
      const pres = presentaciones.find((p) => String(p.id) === l.presentacionId);
      const pvp = pres?.pvp ?? 0;
      const precioBase = precioConTipo(pvp, tipoPrecio);
      const qty = Number(l.cantidad) || 0;
      const descPct = Number(l.descuentoPorcentaje) || 0;
      const descuentoMonto = precioBase * (descPct / 100);
      const precioFinal = precioBase - descuentoMonto;
      const subtotal = precioFinal * qty;
      subtotalBruto += precioBase * qty;
      descuentoTotal += descuentoMonto * qty;
      total += subtotal;
      return { precioBase, descuentoMonto, precioFinal, subtotal };
    });
    return { subtotalBruto, descuentoTotal, total, rows };
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
          <select value={tipoPrecio} onChange={(e) => setTipoPrecio(e.target.value as any)} className="input">
            <option value="PVP">PVP</option>
            <option value="CONTADO">PVC (×0.75)</option>
            <option value="MAYORISTA">PVM (×0.70)</option>
          </select>
        </Field>
      </div>

      <Field label="Observación">
        <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} className="input min-h-16 resize-y" placeholder="Opcional" />
      </Field>

      <div className="rounded-lg border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-bio-dark">Detalle de venta</h3>
          <button type="button" onClick={addLine} className="inline-flex items-center gap-1 rounded-md border border-bio-green px-2.5 py-1.5 text-xs font-semibold text-bio-green hover:bg-bio-green/10">
            <Plus size={14} /> Agregar producto
          </button>
        </div>

        <div className="grid gap-3 p-4">
          {lines.map((line, idx) => {
            const pres = presentaciones.find((p) => String(p.id) === line.presentacionId);
            const info = totals.rows[idx];
            const isLowStock = pres ? Number(line.cantidad) > pres.stock : false;
            return (
              <div key={idx} className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-[1fr_90px_90px_110px_110px_auto]">
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
                <div className="grid gap-1">
                  <span className="text-xs font-medium text-stone-500">P. unit.</span>
                  <div className="flex h-11 items-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-bio-dark">{money(info?.precioFinal ?? 0)}</div>
                  <span className="text-xs text-stone-400">Base {money(info?.precioBase ?? 0)}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs font-medium text-stone-500">Subtotal</span>
                  <div className="flex h-11 items-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-bio-dark">{money(info?.subtotal ?? 0)}</div>
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
            Subtotal: <span className="font-semibold text-stone-800">{money(totals.subtotalBruto)}</span>
          </div>
          <div className="text-stone-600">
            Descuento: <span className="font-semibold text-stone-800">{money(totals.descuentoTotal)}</span>
          </div>
          <div className="text-base font-bold text-bio-dark">Total: {money(totals.total)}</div>
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
          {isSaving ? "Guardando..." : "Confirmar venta"}
        </button>
      </div>
    </form>
  );
}

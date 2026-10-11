import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "../../components/ui/Field";
import { FormError } from "../../components/ui/FormError";
import { CategorySelect } from "../../components/ui/CategorySelect";
import { money } from "../../utils/format";
import { derivedPrices, previewCodigo, productToForm, productUnits } from "../../utils/product";
import type { Category, Product, ProductFormState } from "../../types";

type Props = {
  product?: Product;
  categories: Category[];
  isSaving: boolean;
  error?: string;
  onSubmit: (payload: ProductFormState) => void;
};

export function ProductForm({ product, categories, isSaving, error, onSubmit }: Props) {
  const [form, setForm] = useState<ProductFormState>(() => productToForm(product));

  const setBase = (field: keyof Omit<ProductFormState, "presentaciones">, value: string | boolean) =>
    setForm((cur) => ({ ...cur, [field]: value as never }));

  const updatePres = (idx: number, field: string, value: string | boolean) => {
    setForm((cur) => {
      const next = [...cur.presentaciones];
      next[idx] = { ...next[idx], [field]: value };
      return { ...cur, presentaciones: next };
    });
  };

  const addPres = () => {
    setForm((cur) => ({
      ...cur,
      presentaciones: [...cur.presentaciones, { cantidad: "1", unidadMedida: "kg", pvp: "0", stockMinimo: "0", activo: true }],
    }));
  };

  const removePres = (idx: number) => {
    if (form.presentaciones.length <= 1) return;
    setForm((cur) => ({ ...cur, presentaciones: cur.presentaciones.filter((_, i) => i !== idx) }));
  };

  return (
    <form
      className="grid gap-6"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre">
          <input required value={form.nombre} onChange={(e) => setBase("nombre", e.target.value)} className="input" placeholder="Ej: Agro Biochar" />
        </Field>
        <Field label="Abreviación (ej: AGR)">
          <input
            required
            value={form.abreviacion}
            onChange={(e) => setBase("abreviacion", e.target.value.toUpperCase())}
            className="input uppercase"
            placeholder="AGR"
            maxLength={10}
            pattern="[A-Za-z]{2,10}"
          />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea value={form.descripcion} onChange={(e) => setBase("descripcion", e.target.value)} className="input min-h-20 resize-y" placeholder="Descripción opcional" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoría">
          <CategorySelect
            categories={categories.filter((c) => c.activo || String(c.id) === form.categoriaId)}
            value={form.categoriaId}
            onChange={(v) => setBase("categoriaId", v)}
            emptyLabel="Sin categoría"
          />
        </Field>
        <label className="flex items-center gap-2 self-end rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm font-medium text-stone-700">
          <input checked={form.activo} onChange={(e) => setBase("activo", e.target.checked)} type="checkbox" className="h-4 w-4 accent-bio-green" />
          Producto base activo
        </label>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-bio-dark">Presentaciones</h3>
          <button type="button" onClick={addPres} className="inline-flex items-center gap-1 rounded-md border border-bio-green px-2.5 py-1.5 text-xs font-semibold text-bio-green hover:bg-bio-green/10">
            <Plus size={14} /> Agregar
          </button>
        </div>

        <div className="grid gap-4 p-4">
          {form.presentaciones.map((pres, idx) => {
            const derivado = derivedPrices(Number(pres.pvp || 0));
            const codigoPreview = previewCodigo(form.abreviacion, pres.cantidad);
            const presentacionId = pres.id;
            const stockActual = product?.presentaciones.find((p) => p.id === presentacionId)?.stockActual;

            return (
              <div key={presentacionId ?? idx} className="rounded-lg border border-stone-200 bg-stone-50/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600">Presentación {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white px-2 py-1 text-xs font-mono font-semibold text-bio-dark border border-stone-200">{codigoPreview}</span>
                    {form.presentaciones.length > 1 && (
                      <button type="button" onClick={() => removePres(idx)} aria-label="Quitar línea" title="Quitar línea" className="rounded p-1 text-stone-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {stockActual !== undefined && (
                  <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                    Stock actual: {stockActual} — se modifica mediante Compras/Ventas/Consignaciones.
                  </div>
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  <Field label="Cantidad">
                    <input required min="0.01" step="0.01" type="number" value={pres.cantidad} onChange={(e) => updatePres(idx, "cantidad", e.target.value)} className="input" />
                  </Field>
                  <Field label="Unidad">
                    <select value={pres.unidadMedida} onChange={(e) => updatePres(idx, "unidadMedida", e.target.value)} className="input">
                      {productUnits.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="PVP (Bs)">
                    <input required min="0" step="0.01" type="number" value={pres.pvp} onChange={(e) => updatePres(idx, "pvp", e.target.value)} className="input" />
                  </Field>
                  <Field label="Stock mínimo">
                    <input required min="0" step="1" type="number" value={pres.stockMinimo} onChange={(e) => updatePres(idx, "stockMinimo", e.target.value)} className="input" />
                  </Field>
                </div>

                <div className="mt-3 grid gap-2 rounded-lg border border-stone-200 bg-white p-2.5 text-xs sm:grid-cols-4">
                  <div>
                    <div className="text-stone-500">P CONS</div>
                    <div className="font-semibold text-bio-dark">{money(derivado.consignacion)}</div>
                  </div>
                  <div>
                    <div className="text-stone-500">PVC</div>
                    <div className="font-semibold text-bio-dark">{money(derivado.contado)}</div>
                  </div>
                  <div>
                    <div className="text-stone-500">PVM</div>
                    <div className="font-semibold text-bio-dark">{money(derivado.mayorista)}</div>
                  </div>
                  <label className="flex items-center gap-1.5 self-end text-xs font-medium text-stone-700">
                    <input checked={pres.activo} onChange={(e) => updatePres(idx, "activo", e.target.checked)} type="checkbox" className="h-3.5 w-3.5 accent-bio-green" />
                    Activa
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <p className="border-t border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-500">
          El código se genera automáticamente como <span className="font-mono">ABREVIACIÓN-###</span> (ej: AGR-005). El stock inicia en 0.
        </p>
      </div>

      <FormError message={error} />

      <button disabled={isSaving} className="btn-primary">
        {isSaving ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  );
}

import { useState } from "react";
import { Field } from "../../components/ui/Field";
import type { Category, CategoryFormState } from "../../types";

type Props = {
  category?: Category;
  isSaving: boolean;
  error?: string;
  onSubmit: (payload: CategoryFormState) => void;
};

export function CategoryForm({ category, isSaving, error, onSubmit }: Props) {
  const [form, setForm] = useState<CategoryFormState>({
    nombre: category?.nombre ?? "",
    descripcion: category?.descripcion ?? "",
    activo: category?.activo ?? true,
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <Field label="Nombre">
        <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" />
      </Field>
      <Field label="Descripción">
        <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input min-h-24 resize-y" />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <input
          checked={form.activo}
          onChange={(e) => setForm({ ...form, activo: e.target.checked })}
          type="checkbox"
          className="h-4 w-4 accent-bio-green"
        />
        Categoría activa
      </label>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <button
        disabled={isSaving}
        className="btn-primary"
      >
        {isSaving ? "Guardando..." : "Guardar categoría"}
      </button>
    </form>
  );
}

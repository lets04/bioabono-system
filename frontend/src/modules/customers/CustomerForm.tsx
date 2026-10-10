import { useState } from "react";
import { Field } from "../../components/ui/Field";
import { FormError } from "../../components/ui/FormError";
import type { Customer, CustomerFormState } from "../../types";

type Props = {
  customer?: Customer;
  isSaving: boolean;
  error?: string;
  onSubmit: (payload: CustomerFormState) => void;
};

function customerToForm(customer?: Customer): CustomerFormState {
  return {
    nombre: customer?.nombre ?? "",
    nitCi: customer?.nitCi ?? "",
    telefono: customer?.telefono ?? "",
    email: customer?.email ?? "",
    direccion: customer?.direccion ?? "",
    activo: customer?.activo ?? true,
  };
}

export function CustomerForm({ customer, isSaving, error, onSubmit }: Props) {
  const [form, setForm] = useState<CustomerFormState>(() => customerToForm(customer));

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <Field label="Nombre / Razón social *">
        <input
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="input"
          placeholder="Ej: Juan Pérez"
          maxLength={180}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="NIT / CI">
          <input value={form.nitCi} onChange={(e) => setForm({ ...form, nitCi: e.target.value })} className="input" placeholder="Opcional" maxLength={60} />
        </Field>
        <Field label="Teléfono">
          <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input" placeholder="Ej: 70012345" maxLength={60} />
        </Field>
      </div>

      <Field label="Email">
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="cliente@correo.com" maxLength={160} />
      </Field>

      <Field label="Dirección">
        <textarea value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="input min-h-20 resize-y" placeholder="Dirección opcional" />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <input checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} type="checkbox" className="h-4 w-4 accent-bio-green" />
        Cliente activo
      </label>

      <FormError message={error} />

      <button disabled={isSaving} className="btn-primary">
        {isSaving ? "Guardando..." : "Guardar cliente"}
      </button>
    </form>
  );
}

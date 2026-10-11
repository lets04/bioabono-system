import { useState, type FormEvent } from "react";
import { Field } from "../../components/ui/Field";
import type { UserInvitePayload, UserRole } from "../../types";
import { SearchSelect } from "../../components/ui/SearchSelect";

type Props = {
  onSubmit: (payload: UserInvitePayload) => void;
  isSubmitting?: boolean;
  error?: string;
};

export function UserForm({ onSubmit, isSubmitting, error }: Props) {
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [rol, setRol] = useState<UserRole>("EMPLEADO");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ nombre, username, rol });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Field label="Nombre">
        <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={160} />
      </Field>
      <Field label="Correo">
        <input className="input" type="email" value={username} onChange={(e) => setUsername(e.target.value)} required maxLength={160} />
      </Field>
      <Field label="Rol">
        <SearchSelect
          searchable={false}
          value={rol}
          onChange={(value) => setRol(value as UserRole)}
          options={[
            { value: "EMPLEADO", label: "Empleado" },
            { value: "ADMIN", label: "Administrador" },
          ]}
        />
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? "Enviando invitación..." : "Registrar e invitar"}
      </button>
    </form>
  );
}

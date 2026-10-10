import { useState, type FormEvent } from "react";
import { Field } from "../../components/ui/Field";
import type { UserInvitePayload, UserRole } from "../../types";

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
        <select className="input" value={rol} onChange={(e) => setRol(e.target.value as UserRole)}>
          <option value="EMPLEADO">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? "Enviando invitación..." : "Registrar e invitar"}
      </button>
    </form>
  );
}

import { useState, type FormEvent } from "react";
import { Field } from "../../components/ui/Field";
import { useAuth } from "../../auth/AuthContext";
import { AuthShell } from "./AuthShell";

export function LoginView() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      window.history.replaceState({}, "", "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Iniciar sesión" subtitle="Ingresa con tu correo y contraseña" onSubmit={onSubmit}>
      <Field label="Correo">
        <input className="input" type="email" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
      </Field>
      <Field label="Contraseña">
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className="h-11 rounded-lg bg-bio-green text-sm font-semibold text-white hover:bg-bio-dark disabled:opacity-60">
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>
      <div className="flex flex-col gap-2 text-center text-sm">
        <a className="text-bio-green hover:underline" href="/olvide-contrasena">
          ¿Olvidaste tu contraseña?
        </a>
        <a className="text-stone-500 hover:underline" href="/activar-cuenta">
          ¿Primera vez? Activar cuenta
        </a>
      </div>
    </AuthShell>
  );
}

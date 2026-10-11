import { useState, type FormEvent } from "react";
import { Field } from "../../components/ui/Field";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth/AuthContext";
import { AuthMessage, AuthShell } from "./AuthShell";

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
    <AuthShell title="Iniciar sesión" subtitle="Ingresa con tu correo y contraseña para continuar" onSubmit={onSubmit}>
      <Field label="Correo">
        <input className="input" type="email" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="nombre@empresa.com" autoFocus required />
      </Field>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between text-sm font-medium text-stone-700">
          <label htmlFor="login-password">Contraseña</label>
          <a className="text-xs font-medium text-bio-green hover:underline" href="/olvide-contrasena">
            ¿La olvidaste?
          </a>
        </div>
        <PasswordInput id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <Spinner size={16} /> : null}
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>
      <p className="text-center text-sm text-stone-500">
        ¿Primera vez?{" "}
        <a className="font-medium text-bio-green hover:underline" href="/activar-cuenta">
          Activa tu cuenta
        </a>
      </p>
    </AuthShell>
  );
}

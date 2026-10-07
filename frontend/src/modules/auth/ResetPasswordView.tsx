import { useState, type FormEvent } from "react";
import { Field } from "../../components/ui/Field";
import { authApi } from "../../api/auth";
import { AuthShell } from "./AuthShell";

export function ResetPasswordView() {
  const params = new URLSearchParams(window.location.search);
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password, confirmPassword });
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="El enlace solo puede usarse una vez"
      onSubmit={onSubmit}
      footer={
        <a className="text-bio-green hover:underline" href="/">
          Volver al inicio de sesión
        </a>
      }
    >
      {!params.get("token") ? (
        <Field label="Token de recuperación">
          <input className="input" value={token} onChange={(e) => setToken(e.target.value)} required />
        </Field>
      ) : null}
      <Field label="Nueva contraseña">
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
      </Field>
      <Field label="Confirmar contraseña">
        <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading || !token} className="h-11 rounded-lg bg-bio-green text-sm font-semibold text-white hover:bg-bio-dark disabled:opacity-60">
        {loading ? "Guardando..." : "Actualizar contraseña"}
      </button>
    </AuthShell>
  );
}

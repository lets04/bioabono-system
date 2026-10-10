import { useEffect, useState, type FormEvent } from "react";
import { Field } from "../../components/ui/Field";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { authApi } from "../../api/auth";
import { AuthMessage, AuthShell } from "./AuthShell";

export function ActivateAccountView() {
  const params = new URLSearchParams(window.location.search);
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    authApi
      .activateStatus(token)
      .then((data) => setInfo(`Hola ${data.nombre}. Crea tu contraseña para ${data.username}.`))
      .catch((err) => setError(err instanceof Error ? err.message : "El enlace no es válido"));
  }, [token]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.activate({ token, password, confirmPassword });
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo activar la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Activar mi cuenta"
      subtitle="Crea tu contraseña una sola vez"
      onSubmit={onSubmit}
      footer={
        <a className="text-bio-green hover:underline" href="/">
          Volver al inicio de sesión
        </a>
      }
    >
      {!params.get("token") ? (
        <Field label="Token de activación">
          <input className="input" value={token} onChange={(e) => setToken(e.target.value)} required />
        </Field>
      ) : null}
      {info ? <AuthMessage tone="info">{info}</AuthMessage> : null}
      <Field label="Nueva contraseña" hint="Mínimo 8 caracteres.">
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete="new-password" required />
      </Field>
      <Field label="Confirmar contraseña">
        <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} autoComplete="new-password" required />
      </Field>
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
      <button type="submit" disabled={loading || !token} className="btn-primary">
        {loading ? "Activando..." : "Activar cuenta"}
      </button>
    </AuthShell>
  );
}

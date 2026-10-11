import { useState, type FormEvent } from "react";
import { Field } from "../../components/ui/Field";
import { authApi } from "../../api/auth";
import { AuthMessage, AuthShell } from "./AuthShell";

export function ForgotPasswordView() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(username);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="¿Olvidaste tu contraseña?"
      subtitle="Te enviaremos un enlace si la cuenta existe"
      onSubmit={onSubmit}
      footer={
        <a className="text-bio-green hover:underline" href="/">
          Volver al inicio de sesión
        </a>
      }
    >
      <Field label="Correo">
        <input className="input" type="email" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </Field>
      {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Enviando..." : "Enviar enlace"}
      </button>
    </AuthShell>
  );
}

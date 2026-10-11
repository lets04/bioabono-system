import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import { Field } from "../../components/ui/Field";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth/AuthContext";
import { AuthMessage, AuthShell } from "./AuthShell";

export function LoginView() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Credenciales aceptadas: se muestra el ✓ y la tarjeta se desvanece antes de pasar a la app.
      await login(username, password, remember, async () => {
        setSuccess(true);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        await new Promise((resolve) => setTimeout(resolve, reduceMotion ? 0 : 700));
      });
      window.history.replaceState({}, "", "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Ingresa con tu correo y contraseña para continuar"
      onSubmit={onSubmit}
      leaving={success}
    >
      <Field label="Correo">
        <div className="group relative">
          <Mail
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-bio-green"
            aria-hidden="true"
          />
          <input className="input pl-10" type="email" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="nombre@empresa.com" autoFocus required />
        </div>
      </Field>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between text-sm font-medium text-stone-700">
          <label htmlFor="login-password">Contraseña</label>
          <a className="text-xs font-medium text-bio-green hover:underline" href="/olvide-contrasena">
            ¿La olvidaste?
          </a>
        </div>
        <PasswordInput withIcon id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      <label className="flex items-start gap-2 text-sm text-stone-700">
        <input checked={remember} onChange={(e) => setRemember(e.target.checked)} type="checkbox" className="mt-0.5 h-4 w-4 accent-bio-green" />
        <span>
          Mantener sesión iniciada
          <span className="block text-xs text-stone-500">No lo marques en computadoras compartidas.</span>
        </span>
      </label>
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
      <button
        type="submit"
        disabled={loading || success}
        className={`btn-primary auth-shine group/submit ${success ? "!bg-bio-dark disabled:!opacity-100" : ""}`}
      >
        {success ? (
          <>
            <Check size={18} className="auth-check" />
            ¡Bienvenido!
          </>
        ) : loading ? (
          <>
            <Spinner size={16} />
            Ingresando...
          </>
        ) : (
          <>
            Iniciar sesión
            <ArrowRight size={17} className="transition-transform duration-300 group-hover/submit:translate-x-1" />
          </>
        )}
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

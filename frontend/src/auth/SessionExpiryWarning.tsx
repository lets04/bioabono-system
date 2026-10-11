import { useEffect, useRef, useState } from "react";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "./AuthContext";

// Cuánto antes del vencimiento aparece el aviso. El backend solo permite alargar en los últimos 15 min.
const WARN_BEFORE_MS = 5 * 60_000;
// Si al consultar al servidor queda bastante más que esto, la sesión ya se alargó (p. ej. en otra pestaña).
const EXTENDED_MARGIN_MS = WARN_BEFORE_MS + 60_000;

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/**
 * Aviso antes de que venza una sesión normal (sin "Mantener sesión iniciada"): el usuario puede alargarla
 * (otras SESSION_MAX_HOURS) o cerrarla. Si no responde, al vencer vuelve al login.
 */
export function SessionExpiryWarning() {
  const auth = useAuth();
  const { sessionDeadline } = auth;
  // Las funciones del contexto cambian en cada render; los temporizadores solo dependen del vencimiento.
  const authRef = useRef(auth);
  authRef.current = auth;

  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [extending, setExtending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOpen(false);
    setError("");
    if (sessionDeadline === null) return;
    let cancelled = false;

    // Antes de avisar, y antes de cerrar, se consulta al servidor: otra pestaña pudo haber alargado la sesión
    // (en ese caso cambia `sessionDeadline` y este efecto se reprograma).
    const warnTimer = window.setTimeout(async () => {
      const check = await authRef.current.refreshSession();
      if (cancelled) return;
      if (check.expired) return void authRef.current.logout();
      if (check.deadline === null || check.deadline - Date.now() > EXTENDED_MARGIN_MS) return;
      setNow(Date.now());
      setOpen(true);
    }, Math.max(0, sessionDeadline - WARN_BEFORE_MS - Date.now()));

    const expireTimer = window.setTimeout(async () => {
      const check = await authRef.current.refreshSession();
      if (cancelled) return;
      if (check.expired || (check.deadline !== null && check.deadline <= Date.now())) void authRef.current.logout();
    }, Math.max(0, sessionDeadline - Date.now()));

    return () => {
      cancelled = true;
      window.clearTimeout(warnTimer);
      window.clearTimeout(expireTimer);
    };
  }, [sessionDeadline]);

  // Cuenta regresiva visible mientras el aviso está abierto. Al volver a esta pestaña se consulta al servidor:
  // si la sesión se alargó en otra, el aviso se cierra solo.
  useEffect(() => {
    if (!open) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    const onFocus = () => void authRef.current.refreshSession();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [open]);

  if (!open || sessionDeadline === null) return null;

  const keepSession = async () => {
    setExtending(true);
    setError("");
    try {
      // Al alargarse cambia `sessionDeadline` y el aviso se cierra solo.
      await auth.extendSession();
    } catch {
      setError("No se pudo mantener la sesión. Intenta de nuevo.");
    } finally {
      setExtending(false);
    }
  };

  return (
    <Modal size="sm" title="Tu sesión está por cerrarse" onClose={() => setOpen(false)}>
      <div className="grid gap-4">
        <p className="text-sm text-stone-700">
          Por seguridad, la sesión se cerrará en{" "}
          <strong className="tabular-nums">{formatRemaining(sessionDeadline - now)}</strong>. ¿Quieres mantenerla
          activa?
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={() => void auth.logout()} disabled={extending}>
            Cerrar sesión
          </button>
          <button type="button" className="btn-primary" onClick={() => void keepSession()} disabled={extending}>
            {extending ? <Spinner size={16} /> : null}
            Mantener sesión
          </button>
        </div>
      </div>
    </Modal>
  );
}

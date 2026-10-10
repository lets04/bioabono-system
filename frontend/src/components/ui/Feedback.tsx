import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from "lucide-react";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};

type FeedbackContextValue = {
  notify: (message: string, tone?: ToastTone) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const toastStyles: Record<ToastTone, { icon: LucideIcon; border: string; iconColor: string }> = {
  success: { icon: CheckCircle2, border: "border-emerald-200", iconColor: "text-emerald-600" },
  error: { icon: XCircle, border: "border-red-200", iconColor: "text-red-600" },
  info: { icon: Info, border: "border-stone-200", iconColor: "text-bio-green" },
};

// Reemplaza alert()/confirm() nativos: avisos no bloqueantes y confirmaciones con el estilo de la app.
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((cur) => cur.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = nextId.current++;
      setToasts((cur) => [...cur.slice(-3), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 6000 : 3500);
    },
    [dismiss],
  );

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const close = useCallback((ok: boolean) => {
    setPending((cur) => {
      cur?.resolve(ok);
      return null;
    });
  }, []);

  return (
    <FeedbackContext.Provider value={{ notify, confirm }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end print:hidden">
        {toasts.map((toast) => {
          const { icon: Icon, border, iconColor } = toastStyles[toast.tone];
          return (
            <div
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm text-stone-700 shadow-lg animate-slide-up ${border}`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} />
              <p className="flex-1">{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600" aria-label="Cerrar aviso">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {pending ? <ConfirmDialog options={pending} onClose={close} /> : null}
    </FeedbackContext.Provider>
  );
}

function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: (ok: boolean) => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const danger = options.tone === "danger";

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // En acciones destructivas el foco inicial queda en "Cancelar" para evitar confirmar por accidente.
    (danger ? cancelRef : confirmRef).current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Evita que el Escape cierre también el modal que está debajo.
        event.stopImmediatePropagation();
        onClose(false);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [danger, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/50 p-4 animate-fade-in" onClick={() => onClose(false)}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={options.message ? "confirm-message" : undefined}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${danger ? "bg-red-100 text-red-600" : "bg-bio-green/10 text-bio-green"}`}>
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-base font-semibold text-stone-900">
              {options.title}
            </h2>
            {options.message ? (
              <p id="confirm-message" className="mt-1 text-sm text-stone-600">
                {options.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" onClick={() => onClose(false)} className="btn-secondary">
            {options.cancelLabel ?? "Cancelar"}
          </button>
          <button ref={confirmRef} type="button" onClick={() => onClose(true)} className={danger ? "btn-danger" : "btn-primary"}>
            {options.confirmLabel ?? "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback debe usarse dentro de FeedbackProvider");
  return ctx;
}

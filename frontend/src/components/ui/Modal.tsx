import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  onClose: () => void;
};

const sizes = {
  sm: "sm:max-w-md",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-4xl",
  xl: "sm:max-w-6xl",
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const FIRST_FIELD = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';

export function Modal({
  title,
  description,
  size = "xl",
  children,
  onClose,
}: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Enfoca el primer campo del formulario si existe; si no, el propio diálogo.
    const firstField = dialogRef.current?.querySelector<HTMLElement>(FIRST_FIELD);
    (firstField ?? dialogRef.current)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      // Solo responde el diálogo superior (p. ej. una confirmación abierta sobre un formulario).
      const dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
      if (dialogs[dialogs.length - 1] !== dialog) return;

      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      // Mantiene el foco del teclado dentro del modal.
      if (event.key === "Tab") {
        const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 backdrop-blur-[2px] animate-fade-in sm:items-center sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`max-h-[94vh] w-full ${sizes[size]} overflow-y-auto rounded-t-2xl bg-white shadow-2xl outline-none animate-pop-in sm:max-h-[92vh] sm:rounded-2xl`}
      >

        {/* ENCABEZADO */}

        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-gradient-to-r from-bio-dark to-bio-green px-5 py-4 text-white shadow-sm sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold sm:text-xl">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-0.5 text-sm text-white/75">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="-mr-1.5 shrink-0 rounded-md p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={21} />
          </button>
        </div>

        {/* CONTENIDO */}

        <div className="bg-bio-cream/60 p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

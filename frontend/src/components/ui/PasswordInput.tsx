import { useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { ArrowBigUp, Eye, EyeOff, Lock } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Candado a la izquierda del campo (pantallas de acceso). */
  withIcon?: boolean;
};

export function PasswordInput({ className = "", withIcon = false, onKeyDown, onKeyUp, onBlur, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  // Con Bloq Mayús activo la contraseña casi seguro sale mal: se avisa mientras se escribe.
  const [capsLock, setCapsLock] = useState(false);
  const readCapsLock = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState("CapsLock"));

  return (
    <div className="grid gap-1.5">
      <div className="group relative">
        {withIcon ? (
          <Lock
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-bio-green"
            aria-hidden="true"
          />
        ) : null}
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={`input pr-11 ${withIcon ? "pl-10" : ""} ${className}`}
          onKeyDown={(event) => {
            readCapsLock(event);
            onKeyDown?.(event);
          }}
          onKeyUp={(event) => {
            readCapsLock(event);
            onKeyUp?.(event);
          }}
          onBlur={(event) => {
            setCapsLock(false);
            onBlur?.(event);
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-stone-400 hover:text-stone-600"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <p aria-live="polite" className="text-xs font-medium text-amber-700 empty:hidden">
        {capsLock ? (
          <span className="flex items-center gap-1 animate-fade-in">
            <ArrowBigUp size={14} aria-hidden="true" />
            Bloq Mayús está activado
          </span>
        ) : null}
      </p>
    </div>
  );
}

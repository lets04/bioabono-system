import type { ReactNode } from "react";
import { brandLogo } from "../../brand";

type Props = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  documentNumber?: string;
};

export function PrintHeader({ title, subtitle, meta, documentNumber }: Props) {
  return (
    <div className="print-document-header">
      {/* Encabezado empresarial */}
      <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[125px_minmax(0,1fr)_220px]">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <img
            src={brandLogo}
            alt="BIOABONO"
            className="max-h-24 w-full max-w-[125px] object-contain"
          />
        </div>

        {/* Información de la empresa */}
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold uppercase leading-tight tracking-wide text-[#647d22] sm:text-2xl">
            SUPERMERCADO DEL BIOABONO
          </h2>

          <p className="mt-2 text-xs font-medium text-stone-700 sm:text-sm">
            Calle Reza #477 (Puente Cobija)
          </p>

          <p className="mt-1 text-xs text-stone-700 sm:text-sm">
            Celular: 67465453 - 57734743
          </p>

          <p className="mt-1 text-[10px] text-stone-500">
            Productos orgánicos y ecológicos
          </p>
        </div>

        {/* Referencias del documento */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-xs">
          {documentNumber && (
            <>
              <span className="font-semibold text-stone-700">
                N.º documento
              </span>
              <span className="font-mono font-bold text-stone-900">
                {documentNumber}
              </span>
            </>
          )}

          <span className="font-medium text-stone-700">Fecha</span>
          <span className="text-stone-800">
            {new Date().toLocaleDateString("es-BO")}
          </span>
        </div>
      </div>

      {/* Franja verde */}
      <div className="mt-5 h-2 rounded-full bg-[#647d22]" />

      {/* Título y datos específicos del documento */}
      <div className="mt-4">
        <h1 className="text-lg font-bold uppercase tracking-wide text-stone-900">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-1 text-xs text-stone-600">{subtitle}</p>
        ) : null}

        {meta ? (
          <div className="mt-3 border-t border-stone-300 pt-3 text-xs text-stone-700">
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PrintFooter({ left, right }: { left: string; right: string }) {
  return (
    <div className="mt-6 border-t border-stone-400 pt-2">
      <div className="flex items-center justify-between gap-3 text-[10px] text-stone-500">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

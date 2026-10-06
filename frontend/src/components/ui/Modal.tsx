import type { ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({
  title,
  children,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl">

        {/* ENCABEZADO */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-bio-dark">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Cerrar"
          >
            <X size={21} />
          </button>
        </div>

        {/* CONTENIDO */}

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, Printer, X } from "lucide-react";

type Props = {
  title: string;
  printAreaId?: string;
  pageSize?: "A4 portrait" | "A4 landscape";
  children: ReactNode;
  onClose: () => void;
};

export function PrintPreview({
  title,
  printAreaId = "print-area",
  pageSize = "A4 portrait",
  children,
  onClose,
}: Props) {
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  return createPortal(
    <div className="print-portal">
      <style>
        {`
          @media print {
            html,
            body {
              height: auto !important;
              overflow: visible !important;
              background: white !important;
            }
            body > *:not(.print-portal) {
              display: none !important;
            }
            .print-portal {
              display: block !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
            }
            #${printAreaId} {
              position: static !important;
              display: block !important;
              width: 100% !important;
              max-width: none !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              background: white !important;
              box-shadow: none !important;
            }
            .print-overlay,
            .print-dialog,
            .print-scroll-area {
              position: static !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              max-height: none !important;
              overflow: visible !important;
              background: white !important;
              box-shadow: none !important;
            }
            #${printAreaId} * {
              overflow: visible !important;
            }
            #${printAreaId} table {
              width: 100% !important;
              break-inside: auto;
              page-break-inside: auto;
            }
            #${printAreaId} thead {
              display: table-header-group;
            }
            #${printAreaId} tfoot {
              display: table-footer-group;
            }
            #${printAreaId} tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            @page {
              size: ${pageSize};
              margin: 10mm;
            }
            .print-hide {
              display: none !important;
            }
          }
        `}
      </style>

      <div
        className={`print-overlay ${
          isPreviewFullscreen
            ? "fixed inset-0 z-[100] bg-stone-200"
            : "fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/70 p-4"
        }`}
      >
        <div
          className={`print-dialog ${
            isPreviewFullscreen
              ? "flex h-full w-full flex-col bg-white"
              : "flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          }`}
        >
          <div className="print-hide flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 shadow-sm">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-bio-dark sm:text-base">Vista previa — {title}</h2>
              <p className="hidden text-xs text-stone-500 sm:block">Revisa el documento antes de imprimirlo</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewFullscreen((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition hover:bg-stone-100 hover:text-bio-dark"
                title={isPreviewFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isPreviewFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-bio-dark"
              >
                <Printer size={16} />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition hover:bg-stone-100 hover:text-bio-dark sm:h-auto sm:w-auto sm:px-4 sm:py-2"
                title="Cerrar"
              >
                <X size={18} className="sm:hidden" />
                <span className="hidden text-sm font-semibold sm:inline">Cerrar</span>
              </button>
            </div>
          </div>

          <div className="print-scroll-area flex-1 overflow-auto bg-stone-200 p-4 sm:p-8">
            <div id={printAreaId} className="mx-auto min-h-[900px] w-full max-w-[1100px] bg-white p-6 shadow-xl sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

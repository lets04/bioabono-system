import type { ReactNode } from "react";
import { PrintPreview } from "./PrintPreview";
import { PrintFooter, PrintHeader } from "./PrintHeader";

type Props = {
  title: string;
  criteria: ReactNode;
  children: ReactNode;
  onClose: () => void;
  pageSize?: "A4 portrait" | "A4 landscape";
};

/** Standard presentation for every printable report in the application. */
export function ReportPrintPreview({ title, criteria, children, onClose, pageSize = "A4 landscape" }: Props) {
  return (
    <PrintPreview title={title} printAreaId="report-print-area" pageSize={pageSize} onClose={onClose}>
      <PrintHeader title={title} meta={criteria} />
      {children}
      <PrintFooter left="BIOABONO — Documento generado por el sistema" right={title} />
    </PrintPreview>
  );
}

/** Tabla de resumen (etiqueta → valor) al inicio de cada reporte impreso. */
export function ReportSummary({ title = "Resumen", rows }: { title?: string; rows: Array<[string, ReactNode]> }) {
  return (
    <section className="mt-6">
      <h2 className="border-b border-stone-300 pb-2 text-sm font-bold uppercase tracking-wide text-stone-800">{title}</h2>
      <table className="mt-3 w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value], index) => (
            <tr key={label} className={index < rows.length - 1 ? "border-b border-stone-200" : undefined}>
              <th scope="row" className="px-3 py-2 text-left font-normal">
                {label}
              </th>
              <td className="px-3 py-2 text-right font-semibold">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

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

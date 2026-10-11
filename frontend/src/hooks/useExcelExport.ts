import { useState } from "react";

/** Estado de "Exportar a Excel" de un reporte: en curso y último error. */
export function useExcelExport(exportFn: () => Promise<unknown>) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await exportFn();
    } catch (e) {
      setExportError(e instanceof Error && e.message ? e.message : "Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  return { exporting, exportError, handleExport };
}

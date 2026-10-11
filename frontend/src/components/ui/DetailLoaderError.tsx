import { X } from "lucide-react";

export function DetailLoaderError({ error, onDismiss }: { error: string | null; onDismiss: () => void }) {
  if (!error) return null;
  return (
    <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <span>{error}</span>
      <button type="button" onClick={onDismiss} aria-label="Cerrar aviso" className="rounded p-1 hover:bg-red-100">
        <X size={16} />
      </button>
    </div>
  );
}

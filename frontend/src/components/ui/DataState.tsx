import { WifiOff } from "lucide-react";
import { EmptyState } from "./EmptyState";

function TableSkeleton() {
  return (
    <div className="table-card" aria-busy="true" aria-label="Cargando datos">
      <div className="h-10 border-b border-stone-200 bg-stone-50" />
      <div className="divide-y divide-stone-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="h-3 w-20 animate-pulse rounded bg-stone-200" />
            <div className="h-3 flex-1 animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-16 animate-pulse rounded bg-stone-200" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-stone-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DataState({ isLoading, isError }: { isLoading: boolean; isError: boolean }) {
  if (isLoading) return <TableSkeleton />;
  if (isError) {
    return (
      <div role="alert" className="table-card border-red-200">
        <EmptyState
          icon={WifiOff}
          text="No se pudo cargar la información"
          hint="Verifica tu conexión o que el servidor esté en ejecución y vuelve a intentarlo."
        />
      </div>
    );
  }
  return null;
}

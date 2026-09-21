import { EmptyState } from "./EmptyState";

export function DataState({ isLoading, isError }: { isLoading: boolean; isError: boolean }) {
  if (isLoading) return <EmptyState text="Cargando datos..." />;
  if (isError) return <EmptyState text="No se pudo cargar la información. Verifica que el backend esté ejecutándose." />;
  return null;
}

export function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      style={{ width: size, height: size }}
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}

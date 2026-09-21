export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-2xl font-semibold text-bio-dark">{value}</div>
      <div className="mt-1 text-sm text-stone-500">{label}</div>
    </div>
  );
}

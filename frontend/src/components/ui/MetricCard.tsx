import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  tone?: "default" | "warning";
  onClick?: () => void;
};

export function MetricCard({ label, value, icon: Icon, hint, tone = "default", onClick }: Props) {
  const warning = tone === "warning";
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-stone-500">{label}</div>
          <div className={`mt-1 text-3xl font-semibold tracking-tight ${warning ? "text-amber-700" : "text-bio-dark"}`}>{value}</div>
        </div>
        {Icon ? (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${warning ? "bg-amber-100 text-amber-700" : "bg-bio-green/10 text-bio-green"}`}>
            <Icon size={20} />
          </span>
        ) : null}
      </div>
      {hint ? <div className={`mt-2 text-xs ${warning ? "font-medium text-amber-700" : "text-stone-500"}`}>{hint}</div> : null}
    </>
  );

  const base = `rounded-xl border bg-white p-4 text-left shadow-sm ${warning ? "border-amber-200" : "border-stone-200"}`;
  if (!onClick) return <div className={base}>{content}</div>;
  return (
    <button type="button" onClick={onClick} className={`${base} transition hover:-translate-y-0.5 hover:shadow-md ${warning ? "hover:border-amber-300" : "hover:border-bio-green"}`}>
      {content}
    </button>
  );
}

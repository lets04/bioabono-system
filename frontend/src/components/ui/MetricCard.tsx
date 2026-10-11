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
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <div className="text-xs leading-snug text-stone-500 sm:text-sm">{label}</div>
          <div className={`mt-1 text-2xl font-semibold tracking-tight sm:text-3xl ${warning ? "text-amber-700" : "text-bio-dark"}`}>{value}</div>
        </div>
        {Icon ? (
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${warning ? "bg-amber-100 text-amber-700" : "bg-bio-green/10 text-bio-green"}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        ) : null}
      </div>
      {hint ? <div className={`mt-1.5 text-xs sm:mt-2 ${warning ? "font-medium text-amber-700" : "text-stone-500"}`}>{hint}</div> : null}
    </>
  );

  const base = `vine-corners rounded-xl border bg-white p-3 text-left shadow-sm sm:p-4 ${warning ? "border-amber-200" : "border-stone-200"}`;
  if (!onClick) return <div className={base}>{content}</div>;
  return (
    <button type="button" onClick={onClick} className={`${base} transition hover:-translate-y-0.5 hover:shadow-md ${warning ? "hover:border-amber-300" : "hover:border-bio-green"}`}>
      {content}
    </button>
  );
}

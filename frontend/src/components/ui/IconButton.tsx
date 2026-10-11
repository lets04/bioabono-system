import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
  tone?: "default" | "danger";
  disabled?: boolean;
};

const tones = {
  default: "hover:border-bio-green hover:bg-bio-green/5 hover:text-bio-green",
  danger: "hover:border-red-300 hover:bg-red-50 hover:text-red-600",
};

export function IconButton({ label, onClick, icon: Icon, tone = "default", disabled }: Props) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md border border-stone-200 bg-white p-2 text-stone-600 transition disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      <Icon size={16} />
    </button>
  );
}

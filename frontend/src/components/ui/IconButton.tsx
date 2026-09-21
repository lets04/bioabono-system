import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
};

export function IconButton({ label, onClick, icon: Icon }: Props) {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      className="rounded-md border border-stone-200 p-2 text-stone-600 hover:border-bio-green hover:text-bio-green"
    >
      <Icon size={16} />
    </button>
  );
}

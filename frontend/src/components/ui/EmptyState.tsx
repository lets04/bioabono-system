import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";

type Props = {
  text: string;
  hint?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({ text, hint, icon: Icon = Inbox, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bio-cream text-bio-green">
        <Icon size={22} />
      </span>
      <p className="text-sm font-medium text-stone-700">{text}</p>
      {hint ? <p className="max-w-sm text-xs text-stone-500">{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

import type { ReactNode } from "react";
import { brandLogo } from "../../brand";

type Props = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
};

export function PrintHeader({ title, subtitle, meta }: Props) {
  return (
    <div className="border-b border-stone-300 pb-5">
      <div className="flex items-center gap-6">
        <div className="flex h-20 w-36 shrink-0 items-center justify-center">
          <img src={brandLogo} alt="BIOABONO" className="max-h-20 max-w-full object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-800">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-stone-500">{subtitle}</p> : null}
          <p className="mt-3 text-xs text-stone-500">
            <span className="font-semibold text-stone-700">Fecha de emisión:</span>{" "}
            {new Date().toLocaleString("es-BO", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
      </div>
      {meta ? <div className="mt-5 border-t border-stone-200 pt-3 text-xs text-stone-600">{meta}</div> : null}
    </div>
  );
}

export function PrintFooter({ left, right }: { left: string; right: string }) {
  return (
    <div className="mt-8 border-t border-stone-300 pt-3">
      <div className="flex items-center justify-between text-[10px] text-stone-500">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

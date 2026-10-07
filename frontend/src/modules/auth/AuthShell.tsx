import type { FormEvent, ReactNode } from "react";
import logoBioabono from "../../../dist/assets/bioabonosinFondo.png";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit?: (event: FormEvent) => void;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, onSubmit, footer }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bio-cream px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <img src={logoBioabono} alt="BIOABONO" className="h-20 w-auto object-contain" />
        </div>
        <h1 className="text-center text-2xl font-semibold text-bio-dark">{title}</h1>
        {subtitle ? <p className="mt-2 text-center text-sm text-stone-500">{subtitle}</p> : null}
        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          {children}
        </form>
        {footer ? <div className="mt-6 text-center text-sm text-stone-600">{footer}</div> : null}
      </div>
    </div>
  );
}

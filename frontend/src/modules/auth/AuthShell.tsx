import type { FormEvent, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Leaf, ShieldCheck, Warehouse } from "lucide-react";
import { brandLogo as logoBioabono, brandMark } from "../../brand";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit?: (event: FormEvent) => void;
  footer?: ReactNode;
};

const highlights = [
  { icon: Warehouse, text: "Inventario por presentación con alertas de stock" },
  { icon: Leaf, text: "Ventas, compras y consignaciones en un solo lugar" },
  { icon: ShieldCheck, text: "Acceso por roles para administradores y personal" },
];

export function AuthShell({ title, subtitle, children, onSubmit, footer }: Props) {
  return (
    <div className="flex min-h-screen bg-bio-cream">
      {/* Panel de marca (solo escritorio) */}
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-bio-dark p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-bio-green/30 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-bio-light/10 blur-3xl" aria-hidden="true" />
        <img src={brandMark} alt="BIOABONO" className="relative h-24 w-auto self-start object-contain" />
        <div className="relative">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">Gestión simple para un negocio que cuida la tierra.</h2>
          <ul className="mt-8 grid gap-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-bio-light">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} BIOABONO</p>
      </aside>

      {/* Formulario */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm animate-pop-in sm:p-8">
          <div className="mb-6 flex justify-center lg:hidden">
            <img src={logoBioabono} alt="BIOABONO" className="h-20 w-auto object-contain" />
          </div>
          <h1 className="text-center text-2xl font-semibold tracking-tight text-bio-dark lg:text-left">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-center text-sm text-stone-500 lg:text-left">{subtitle}</p> : null}
          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            {children}
          </form>
          {footer ? <div className="mt-6 border-t border-stone-100 pt-5 text-center text-sm text-stone-600">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}

export function AuthMessage({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-stone-200 bg-stone-50 text-stone-700",
  };
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${styles[tone]}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

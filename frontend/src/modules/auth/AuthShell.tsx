import type { CSSProperties, FormEvent, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Leaf, ShieldCheck, Warehouse } from "lucide-react";
import { brandLogo as logoBioabono, brandMark } from "../../brand";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit?: (event: FormEvent) => void;
  footer?: ReactNode;
  /** La tarjeta se desvanece (login aceptado, entrando a la app). */
  leaving?: boolean;
};

const highlights = [
  { icon: Warehouse, text: "Inventario por presentación con alertas de stock" },
  { icon: Leaf, text: "Ventas, compras y consignaciones en un solo lugar" },
  { icon: ShieldCheck, text: "Acceso por roles para administradores y personal" },
];

// Hojas decorativas del panel de marca: posición, tamaño y ritmo distintos para que no se vea repetitivo.
const leaves = [
  { left: "12%", bottom: "-4%", size: 18, duration: "16s", delay: "0s" },
  { left: "38%", bottom: "-6%", size: 14, duration: "19s", delay: "4s" },
  { left: "64%", bottom: "-3%", size: 22, duration: "15s", delay: "8s" },
  { left: "82%", bottom: "-5%", size: 12, duration: "21s", delay: "2s" },
  { left: "26%", bottom: "-8%", size: 16, duration: "18s", delay: "11s" },
];

// Hojas que caen en el lado del formulario, en tres capas para dar profundidad: las lejanas son pequeñas,
// nítidas y lentas; las cercanas, grandes, desenfocadas y rápidas. Los retrasos negativos hacen que al abrir
// ya haya hojas a mitad de caída.
const fallingLeaves = [
  // Lejos
  { left: "9%", size: 11, duration: "28s", delay: "-4s", opacity: "0.3", className: "text-bio-green" },
  { left: "27%", size: 10, duration: "31s", delay: "-19s", opacity: "0.25", className: "text-bio-green" },
  { left: "53%", size: 12, duration: "27s", delay: "-11s", opacity: "0.3", className: "text-bio-green" },
  { left: "71%", size: 10, duration: "30s", delay: "-24s", opacity: "0.25", className: "text-bio-green" },
  { left: "92%", size: 11, duration: "29s", delay: "-8s", opacity: "0.3", className: "text-bio-green" },
  // Medio
  { left: "16%", size: 18, duration: "20s", delay: "-13s", opacity: "0.45", className: "text-bio-light" },
  { left: "41%", size: 20, duration: "22s", delay: "-3s", opacity: "0.4", className: "text-bio-green" },
  { left: "64%", size: 17, duration: "19s", delay: "-16s", opacity: "0.45", className: "text-bio-light" },
  { left: "84%", size: 21, duration: "21s", delay: "-7s", opacity: "0.4", className: "text-bio-green" },
  // Cerca
  { left: "4%", size: 38, duration: "13s", delay: "-6s", opacity: "0.35", className: "text-bio-light blur-[2px]" },
  { left: "78%", size: 44, duration: "15s", delay: "-11s", opacity: "0.3", className: "text-bio-green blur-[3px]" },
];

/** Variables CSS (retrasos, duraciones) que usan las animaciones de styles.css. */
const vars = (values: Record<string, string>) => values as CSSProperties;

export function AuthShell({ title, subtitle, children, onSubmit, footer, leaving = false }: Props) {
  return (
    <div className="flex min-h-screen bg-bio-cream">
      {/* Panel de marca (solo escritorio) */}
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-gradient-to-br from-bio-dark via-[#1f3a1b] to-[#16290f] p-10 text-white lg:flex">
        <div aria-hidden="true">
          <div className="ambient-blob -right-24 -top-24 h-80 w-80 bg-bio-green/40" style={vars({ "--duration": "17s" })} />
          <div className="ambient-blob -bottom-32 -left-20 h-96 w-96 bg-bio-light/15" style={vars({ "--duration": "22s", "--delay": "-6s" })} />
          <div className="ambient-blob left-1/3 top-1/2 h-56 w-56 bg-emerald-400/10" style={vars({ "--duration": "26s", "--delay": "-12s" })} />
          <div className="ambient-dots" />
          {leaves.map((leaf) => (
            <Leaf
              key={leaf.left}
              size={leaf.size}
              className="auth-leaf"
              style={vars({ left: leaf.left, bottom: leaf.bottom, "--duration": leaf.duration, "--delay": leaf.delay })}
            />
          ))}
        </div>

        <img src={brandMark} alt="BIOABONO" className="auth-rise relative h-24 w-auto self-start object-contain drop-shadow-lg" />
        <div className="relative">
          <h2 className="auth-rise text-3xl font-semibold leading-tight tracking-tight" style={vars({ "--delay": "120ms" })}>
            Gestión simple para un negocio que{" "}
            <span className="bg-gradient-to-r from-bio-light to-emerald-200 bg-clip-text text-transparent">cuida la tierra.</span>
          </h2>
          <ul className="mt-8 grid gap-4">
            {highlights.map(({ icon: Icon, text }, index) => (
              <li
                key={text}
                className="auth-rise group flex items-center gap-3 text-sm text-white/80"
                style={vars({ "--delay": `${260 + index * 110}ms` })}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-bio-light ring-1 ring-white/10 transition duration-300 group-hover:scale-110 group-hover:bg-white/15 group-hover:shadow-[0_0_18px_rgba(169,209,122,0.35)]">
                  <Icon size={18} />
                </span>
                <span className="transition-colors duration-300 group-hover:text-white">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="auth-rise relative text-xs text-white/40" style={vars({ "--delay": "650ms" })}>
          © {new Date().getFullYear()} BIOABONO
        </p>
      </aside>

      {/* Formulario */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
        <div aria-hidden="true">
          <div className="ambient-blob -right-32 -top-32 h-96 w-96 bg-bio-light/25" style={vars({ "--duration": "20s" })} />
          <div className="ambient-blob -bottom-40 -left-24 h-96 w-96 bg-bio-green/10" style={vars({ "--duration": "24s", "--delay": "-8s" })} />
          {fallingLeaves.map((leaf) => (
            <Leaf
              key={leaf.left}
              size={leaf.size}
              className={`ambient-leaf-fall ${leaf.className}`}
              style={vars({ left: leaf.left, "--duration": leaf.duration, "--delay": leaf.delay, "--opacity": leaf.opacity })}
            />
          ))}
        </div>
        <div className={`auth-card ${leaving ? "auth-card-out" : ""} relative w-full max-w-md rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-bio-dark/5 ring-1 ring-stone-900/5 backdrop-blur-sm sm:p-8`}>
          <div className="auth-rise mb-6 flex justify-center lg:hidden" style={vars({ "--delay": "100ms" })}>
            <img src={logoBioabono} alt="BIOABONO" className="h-20 w-auto object-contain" />
          </div>
          <h1 className="auth-rise text-center text-2xl font-semibold tracking-tight text-bio-dark lg:text-left" style={vars({ "--delay": "120ms" })}>
            {title}
          </h1>
          {subtitle ? (
            <p className="auth-rise mt-1.5 text-center text-sm text-stone-500 lg:text-left" style={vars({ "--delay": "180ms" })}>
              {subtitle}
            </p>
          ) : null}
          <form className="auth-stagger mt-6 grid gap-4" onSubmit={onSubmit}>
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

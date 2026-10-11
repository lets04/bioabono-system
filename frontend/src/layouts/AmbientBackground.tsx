import type { CSSProperties } from "react";
import { Leaf } from "lucide-react";

// Fondos animados decorativos de la app (mismo estilo que el login). Van detrás del contenido (-z-10, dentro de
// un contenedor con su propio contexto de apilamiento) y se ocultan con "reducir movimiento" (styles.css).

type AmbientLeaf = { left: string; size: number; duration: string; delay: string; opacity: string; className: string };

const vars = (values: Record<string, string>) => values as CSSProperties;

// Barra lateral: hojas claras que caen en tres capas de profundidad (lejos, medio, cerca).
const sidebarLeaves: AmbientLeaf[] = [
  { left: "12%", size: 10, duration: "30s", delay: "-6s", opacity: "0.25", className: "text-bio-light" },
  { left: "58%", size: 11, duration: "34s", delay: "-21s", opacity: "0.2", className: "text-bio-light" },
  { left: "84%", size: 10, duration: "32s", delay: "-13s", opacity: "0.25", className: "text-bio-light" },
  { left: "30%", size: 16, duration: "24s", delay: "-17s", opacity: "0.3", className: "text-bio-light" },
  { left: "72%", size: 15, duration: "26s", delay: "-3s", opacity: "0.25", className: "text-emerald-200" },
  { left: "6%", size: 30, duration: "18s", delay: "-10s", opacity: "0.18", className: "text-bio-light blur-[2px]" },
];

// Encabezado: hojas que cruzan de lado a lado, lentas y muy tenues para no distraer.
const headerLeaves: AmbientLeaf[] = [
  { left: "-4%", size: 12, duration: "46s", delay: "-8s", opacity: "0.3", className: "top-[30%] text-bio-green" },
  { left: "-4%", size: 16, duration: "58s", delay: "-31s", opacity: "0.22", className: "top-[60%] text-bio-light" },
  { left: "-4%", size: 10, duration: "52s", delay: "-44s", opacity: "0.28", className: "top-[15%] text-bio-green" },
];

function Leaves({ leaves, animation }: { leaves: AmbientLeaf[]; animation: string }) {
  return (
    <>
      {leaves.map((leaf) => (
        <Leaf
          key={`${leaf.left}-${leaf.delay}`}
          size={leaf.size}
          className={`${animation} ${leaf.className}`}
          style={vars({ left: leaf.left, "--duration": leaf.duration, "--delay": leaf.delay, "--opacity": leaf.opacity })}
        />
      ))}
    </>
  );
}

export function SidebarAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="ambient-blob -right-24 top-1/4 h-64 w-64 bg-bio-green/35" style={vars({ "--duration": "20s" })} />
      <div className="ambient-blob -bottom-24 -left-20 h-72 w-72 bg-bio-light/10" style={vars({ "--duration": "26s", "--delay": "-9s" })} />
      <div className="ambient-dots opacity-60" />
      <Leaves leaves={sidebarLeaves} animation="ambient-leaf-fall" />
    </div>
  );
}

export function HeaderAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="ambient-blob -top-20 right-1/4 h-40 w-72 bg-bio-light/25" style={vars({ "--duration": "24s" })} />
      <Leaves leaves={headerLeaves} animation="ambient-leaf-drift" />
      <div className="header-vine" />
    </div>
  );
}

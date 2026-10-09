import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, SearchX } from "lucide-react";

export type SearchSelectOption = {
  value: string;
  /** Texto del campo cuando la opción está elegida; también se usa para buscar. */
  label: string;
  /** Texto adicional que entra en la búsqueda (códigos, descripciones...). */
  keywords?: string;
  disabled?: boolean;
  /** Contenido de la fila en la lista; por defecto, el label. */
  content?: ReactNode;
  trailing?: ReactNode;
};

type Props = {
  options: SearchSelectOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  /** Ancho mínimo de la lista (px), útil cuando el campo es angosto. */
  minListWidth?: number;
};

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function SearchSelect({ options, value, onChange, required, placeholder = "Buscar...", minListWidth = 260 }: Props) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<{ left: number; width: number; top?: number; bottom?: number; maxHeight: number } | null>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return options;
    return options.filter((o) => {
      const haystack = normalize(`${o.label} ${o.keywords ?? ""}`);
      return tokens.every((t) => haystack.includes(t));
    });
  }, [options, query]);

  // La lista vive en un portal con posición fija para que el scroll de modales o tarjetas no la recorte.
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;
      setPosition({
        left: rect.left,
        width: Math.max(rect.width, minListWidth),
        maxHeight: Math.min(340, openUp ? spaceAbove : spaceBelow),
        ...(openUp ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, minListWidth]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (inputRef.current?.parentElement?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const openList = () => {
    if (open) return;
    setQuery("");
    const idx = options.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const choose = (o: SearchSelectOption) => {
    if (o.disabled) return;
    onChange(o.value);
    setOpen(false);
    setQuery("");
  };

  const moveActive = (step: number) => {
    if (filtered.length === 0) return;
    let next = activeIndex;
    for (let i = 0; i < filtered.length; i++) {
      next = (next + step + filtered.length) % filtered.length;
      if (!filtered[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return openList();
      moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (!open) return openList();
      const option = filtered[activeIndex];
      if (option) choose(option);
    } else if (event.key === "Escape" && open) {
      // Cierra solo la lista, no el modal que la contiene.
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const selectedText = selected?.label ?? "";

  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bio-green" aria-hidden="true" />
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        value={open ? query : selectedText}
        placeholder={open && selectedText ? selectedText : placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          if (!open) setOpen(true);
        }}
        onFocus={openList}
        onClick={openList}
        onKeyDown={onKeyDown}
        className={`input truncate pl-9 pr-9 ${selected && selected.value !== "" && !open ? "font-medium text-bio-dark" : ""}`}
        autoComplete="off"
      />
      <ChevronDown
        size={16}
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
      {/* Mantiene la validación nativa "required" del formulario. */}
      {required ? (
        <input tabIndex={-1} aria-hidden="true" required value={value} onChange={() => undefined} className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0" />
      ) : null}

      {open && position
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              style={{ position: "fixed", left: position.left, width: position.width, top: position.top, bottom: position.bottom, maxHeight: position.maxHeight }}
              className="z-[200] overflow-y-auto rounded-xl border border-bio-green/30 bg-white p-1.5 shadow-2xl ring-1 ring-black/5 animate-fade-in"
            >
              {filtered.length === 0 ? (
                <li className="flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-stone-500">
                  <SearchX size={22} className="text-bio-green" aria-hidden="true" />
                  Sin resultados para “{query}”.
                </li>
              ) : (
                filtered.map((o, index) => {
                  const isSelected = o.value === value;
                  const isActive = index === activeIndex;
                  return (
                    <li
                      key={o.value || "__empty"}
                      id={`${listId}-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={o.disabled}
                      onMouseEnter={() => !o.disabled && setActiveIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(o)}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-l-4 px-3 py-2 text-sm transition-colors ${
                        o.disabled
                          ? "cursor-not-allowed border-transparent opacity-45"
                          : isActive
                            ? "border-bio-green bg-bio-green/10"
                            : "border-transparent hover:bg-bio-cream"
                      }`}
                    >
                      <div className="min-w-0 flex-1">{o.content ?? <span className="font-medium text-bio-dark">{o.label}</span>}</div>
                      {o.trailing}
                      <Check size={16} className={`shrink-0 text-bio-green ${isSelected ? "visible" : "invisible"}`} aria-hidden="true" />
                    </li>
                  );
                })
              )}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}

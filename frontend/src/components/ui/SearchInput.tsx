import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export function SearchInput({ value, onChange, placeholder, className = "" }: Props) {
  return (
    <div
      className={`flex h-11 w-full items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 shadow-sm transition focus-within:border-bio-green focus-within:ring-2 focus-within:ring-bio-green/15 sm:max-w-sm ${className}`}
    >
      <Search size={16} className="shrink-0 text-stone-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.stopPropagation();
            onChange("");
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="shrink-0 rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          aria-label="Limpiar búsqueda"
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}

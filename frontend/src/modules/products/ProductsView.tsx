import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Power, Search } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { productsApi } from "../../api/products";
import { ProductDetail } from "./ProductDetail";
import { ProductForm } from "./ProductForm";
import type { Category, Product, ProductFormState } from "../../types";

type Props = {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  search: string;
  onSearch: (value: string) => void;
};

export function ProductsView({ products, categories, isLoading, isError, search, onSearch }: Props) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: ProductFormState & { id?: number }) =>
      payload.id ? productsApi.update(payload.id, payload) : productsApi.create(payload),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
      setIsCreating(false);
      setSelected(product);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => productsApi.patchStatus(id, activo),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelected(product);
    },
  });

  const flattened = useMemo(() => {
    return products.flatMap((prod) =>
      prod.presentaciones.map((pres) => ({
        product: prod,
        pres,
      })),
    );
  }, [products]);

  const filtered = flattened.filter((row) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      row.pres.codigo.toLowerCase().includes(term) ||
      row.product.nombre.toLowerCase().includes(term) ||
      row.product.abreviacion.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 sm:max-w-sm">
          <Search size={16} className="text-stone-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por código, producto o abreviación"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-bio-green px-4 text-sm font-semibold text-white hover:bg-bio-dark"
        >
          <Plus size={17} />
          Registrar producto
        </button>
      </div>

      <DataState isLoading={isLoading} isError={isError} />

      {!isLoading && !isError && (
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Abrev.</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Unidad</th>
                  <th className="px-4 py-3">PVP</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(({ product, pres }) => (
                  <tr key={pres.id} className={pres.stockActual <= pres.stockMinimo ? "bg-amber-50/70" : ""}>
                    <td className="px-4 py-3 font-mono font-semibold text-bio-dark">{pres.codigo}</td>
                    <td className="px-4 py-3">{product.nombre}</td>
                    <td className="px-4 py-3 font-semibold">{product.abreviacion}</td>
                    <td className="px-4 py-3">{pres.cantidad}</td>
                    <td className="px-4 py-3">{pres.unidadMedida}</td>
                    <td className="px-4 py-3">Bs. {Number(pres.pvp).toFixed(2)}</td>
                    <td className="px-4 py-3">{pres.stockActual}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={product.activo && pres.activo} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconButton label="Ver detalle" onClick={() => setSelected(product)} icon={Eye} />
                        <IconButton label="Editar" onClick={() => setEditing(product)} icon={Pencil} />
                        <IconButton
                          label={product.activo ? "Desactivar" : "Activar"}
                          onClick={() => statusMutation.mutate({ id: product.id, activo: !product.activo })}
                          icon={Power}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <EmptyState text={products.length === 0 ? "No hay productos registrados." : "Ninguna presentación coincide con la búsqueda."} />}
        </div>
      )}

      {(isCreating || editing) && (
        <Modal title={editing ? "Editar producto" : "Registrar producto"} onClose={() => (editing ? setEditing(null) : setIsCreating(false))}>
          <ProductForm
            product={editing ?? undefined}
            categories={categories}
            isSaving={saveMutation.isPending}
            error={saveMutation.error?.message}
            onSubmit={(payload) => saveMutation.mutate(editing ? { ...payload, id: editing.id } : payload)}
          />
        </Modal>
      )}

      {selected && (
        <Modal title="Detalle del producto" onClose={() => setSelected(null)}>
          <ProductDetail product={selected} />
        </Modal>
      )}
    </div>
  );
}

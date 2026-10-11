import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Eye, Pencil, Plus, Power } from "lucide-react";
import { useFeedback } from "../../components/ui/Feedback";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { SearchInput } from "../../components/ui/SearchInput";
import { productsApi } from "../../api/products";
import { money } from "../../utils/format";
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
  const { notify, confirm } = useFeedback();
  const [editing, setEditing] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: ProductFormState & { id?: number }) =>
      payload.id ? productsApi.update(payload.id, payload) : productsApi.create(payload),
    onSuccess: (product, payload) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notify(payload.id ? "Producto actualizado" : "Producto registrado");
      setEditing(null);
      setIsCreating(false);
      setSelected(product);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => productsApi.patchStatus(id, activo),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notify(product.activo ? "Producto activado" : "Producto desactivado");
    },
    onError: (error) => notify(error instanceof Error ? error.message : "No se pudo cambiar el estado", "error"),
  });

  const confirmToggle = async (product: Product) => {
    const ok = await confirm({
      title: product.activo ? `¿Desactivar "${product.nombre}"?` : `¿Activar "${product.nombre}"?`,
      message: product.activo
        ? `Sus ${product.presentaciones.length} presentación(es) dejarán de estar disponibles en ventas, compras y consignaciones.`
        : undefined,
      confirmLabel: product.activo ? "Desactivar" : "Activar",
      tone: product.activo ? "danger" : "default",
    });
    if (ok) statusMutation.mutate({ id: product.id, activo: !product.activo });
  };

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
        <SearchInput value={search} onChange={onSearch} placeholder="Buscar por código, producto o abreviación" />
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
        >
          <Plus size={17} />
          Registrar producto
        </button>
      </div>

      <DataState isLoading={isLoading} isError={isError} />

      {!isLoading && !isError && (
        <div className="table-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Abrev.</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Unidad</th>
                  <th className="px-4 py-3 text-right">PVP</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body divide-y divide-stone-100">
                {filtered.map(({ product, pres }) => (
                  <tr key={pres.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-bio-dark">{pres.codigo}</td>
                    <td className="px-4 py-3">{product.nombre}</td>
                    <td className="px-4 py-3 font-semibold">{product.abreviacion}</td>
                    <td className="px-4 py-3">{pres.cantidad}</td>
                    <td className="px-4 py-3">{pres.unidadMedida}</td>
                    <td className="px-4 py-3 text-right font-medium">{money(pres.pvp)}</td>
                    <td className="px-4 py-3 text-right">
                      {pres.stockActual <= pres.stockMinimo ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700" title={`Stock bajo (mínimo ${pres.stockMinimo})`}>
                          <AlertTriangle size={13} aria-hidden="true" />
                          {pres.stockActual}
                          <span className="sr-only">(stock bajo)</span>
                        </span>
                      ) : (
                        pres.stockActual
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={product.activo && pres.activo} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconButton label="Ver detalle" onClick={() => setSelected(product)} icon={Eye} />
                        <IconButton label="Editar" onClick={() => setEditing(product)} icon={Pencil} />
                        <IconButton
                          label={product.activo ? "Desactivar" : "Activar"}
                          onClick={() => void confirmToggle(product)}
                          icon={Power}
                          tone={product.activo ? "danger" : "default"}
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
        <Modal size="lg" title={editing ? "Editar producto" : "Registrar producto"} onClose={() => (editing ? setEditing(null) : setIsCreating(false))}>
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
        <Modal size="lg" title="Detalle del producto" onClose={() => setSelected(null)}>
          <ProductDetail product={selected} />
        </Modal>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Power } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { categoriesApi } from "../../api/categories";
import { CategoryForm } from "./CategoryForm";
import type { Category, CategoryFormState } from "../../types";

type Props = {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
};

export function CategoriesView({ categories, isLoading, isError }: Props) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: CategoryFormState & { id?: number }) =>
      payload.id ? categoriesApi.update(payload.id, payload) : categoriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditing(null);
      setIsCreating(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => categoriesApi.patchStatus(id, activo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-bio-green px-4 text-sm font-semibold text-white hover:bg-bio-dark"
        >
          <Plus size={17} />
          Registrar categoría
        </button>
      </div>

      <DataState isLoading={isLoading} isError={isError} />

      {!isLoading && !isError && (
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 font-semibold text-bio-dark">{category.nombre}</td>
                  <td className="px-4 py-3 text-stone-500">{category.descripcion || "Sin descripción"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={category.activo} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <IconButton label="Editar" onClick={() => setEditing(category)} icon={Pencil} />
                      <IconButton
                        label={category.activo ? "Desactivar" : "Activar"}
                        onClick={() => statusMutation.mutate({ id: category.id, activo: !category.activo })}
                        icon={Power}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <EmptyState text="No hay categorías registradas." />}
        </div>
      )}

      {(isCreating || editing) && (
        <Modal title={editing ? "Editar categoría" : "Registrar categoría"} onClose={() => (editing ? setEditing(null) : setIsCreating(false))}>
          <CategoryForm
            category={editing ?? undefined}
            isSaving={saveMutation.isPending}
            error={saveMutation.error?.message}
            onSubmit={(payload) => saveMutation.mutate(editing ? { ...payload, id: editing.id } : payload)}
          />
        </Modal>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Power } from "lucide-react";
import { useFeedback } from "../../components/ui/Feedback";
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
  const { notify, confirm } = useFeedback();
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: CategoryFormState & { id?: number }) =>
      payload.id ? categoriesApi.update(payload.id, payload) : categoriesApi.create(payload),
    onSuccess: (_category, payload) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notify(payload.id ? "Categoría actualizada" : "Categoría registrada");
      setEditing(null);
      setIsCreating(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => categoriesApi.patchStatus(id, activo),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notify(category.activo ? "Categoría activada" : "Categoría desactivada");
    },
    onError: (error) => notify(error instanceof Error ? error.message : "No se pudo cambiar el estado", "error"),
  });

  const confirmToggle = async (category: Category) => {
    const ok = await confirm({
      title: category.activo ? `¿Desactivar la categoría "${category.nombre}"?` : `¿Activar la categoría "${category.nombre}"?`,
      message: category.activo ? "No podrá asignarse a nuevos productos mientras esté inactiva." : undefined,
      confirmLabel: category.activo ? "Desactivar" : "Activar",
      tone: category.activo ? "danger" : "default",
    });
    if (ok) statusMutation.mutate({ id: category.id, activo: !category.activo });
  };

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
        >
          <Plus size={17} />
          Registrar categoría
        </button>
      </div>

      <DataState isLoading={isLoading} isError={isError} />

      {!isLoading && !isError && (
        <div className="table-card">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body divide-y divide-stone-100">
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
                        onClick={() => void confirmToggle(category)}
                        icon={Power}
                        tone={category.activo ? "danger" : "default"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {categories.length === 0 && <EmptyState text="No hay categorías registradas." hint="Las categorías ayudan a organizar el catálogo de productos." />}
        </div>
      )}

      {(isCreating || editing) && (
        <Modal size="sm" title={editing ? "Editar categoría" : "Registrar categoría"} onClose={() => (editing ? setEditing(null) : setIsCreating(false))}>
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

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Power } from "lucide-react";
import { useFeedback } from "../../components/ui/Feedback";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { SearchInput } from "../../components/ui/SearchInput";
import { suppliersApi } from "../../api/suppliers";
import { SupplierForm } from "./SupplierForm";
import { SupplierDetail } from "./SupplierDetail";
import type { Supplier, SupplierFormState } from "../../types";

type Props = {
  suppliers: Supplier[];
  isLoading: boolean;
  isError: boolean;
  search: string;
  onSearch: (value: string) => void;
};

export function SuppliersView({ suppliers, isLoading, isError, search, onSearch }: Props) {
  const queryClient = useQueryClient();
  const { notify, confirm } = useFeedback();
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: SupplierFormState & { id?: number }) =>
      payload.id ? suppliersApi.update(payload.id, payload) : suppliersApi.create(payload),
    onSuccess: (supplier, payload) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      notify(payload.id ? "Proveedor actualizado" : "Proveedor registrado");
      setEditing(null);
      setIsCreating(false);
      setSelected(supplier);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => suppliersApi.patchStatus(id, activo),
    onSuccess: (supplier) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      notify(supplier.activo ? "Proveedor activado" : "Proveedor desactivado");
      setSelected((cur) => (cur?.id === supplier.id ? supplier : cur));
      setEditing((cur) => (cur?.id === supplier.id ? supplier : cur));
    },
    onError: (error) => notify(error instanceof Error ? error.message : "No se pudo cambiar el estado", "error"),
  });

  const confirmToggle = async (supplier: Supplier) => {
    const action = supplier.activo ? "desactivar" : "activar";
    const ok = await confirm({
      title: `¿${action[0].toUpperCase()}${action.slice(1)} al proveedor "${supplier.nombre}"?`,
      message: supplier.activo ? "Dejará de aparecer en los formularios hasta que lo reactives." : undefined,
      confirmLabel: action[0].toUpperCase() + action.slice(1),
      tone: supplier.activo ? "danger" : "default",
    });
    if (!ok) return;
    statusMutation.mutate({ id: supplier.id, activo: !supplier.activo });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={onSearch} placeholder="Buscar por nombre, NIT o teléfono" />
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
        >
          <Plus size={17} />
          Registrar proveedor
        </button>
      </div>

      <DataState isLoading={isLoading} isError={isError} />

      {!isLoading && !isError && (
        <div className="table-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">NIT</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body divide-y divide-stone-100">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="px-4 py-3 font-semibold text-bio-dark">{supplier.nombre}</td>
                    <td className="px-4 py-3 text-stone-600">{supplier.nit || "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{supplier.telefono || "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{supplier.email || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={supplier.activo} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconButton label="Ver detalle" onClick={() => setSelected(supplier)} icon={Eye} />
                        <IconButton label="Editar" onClick={() => setEditing(supplier)} icon={Pencil} />
                        <IconButton label={supplier.activo ? "Desactivar" : "Activar"} onClick={() => void confirmToggle(supplier)} icon={Power} tone={supplier.activo ? "danger" : "default"} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {suppliers.length === 0 && <EmptyState text={search ? "Ningún proveedor coincide con la búsqueda." : "No hay proveedores registrados."} hint={search ? "Prueba con otro nombre, NIT o teléfono." : "Registra un proveedor para poder cargar compras."} />}
        </div>
      )}

      {(isCreating || editing) && (
        <Modal size="md" title={editing ? "Editar proveedor" : "Registrar proveedor"} onClose={() => (editing ? setEditing(null) : setIsCreating(false))}>
          <SupplierForm
            supplier={editing ?? undefined}
            isSaving={saveMutation.isPending}
            error={saveMutation.error?.message}
            onSubmit={(payload) => saveMutation.mutate(editing ? { ...payload, id: editing.id } : payload)}
          />
        </Modal>
      )}

      {selected && (
        <Modal size="md" title="Detalle del proveedor" onClose={() => setSelected(null)}>
          <SupplierDetail supplier={selected} />
        </Modal>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Power, Search } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
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
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: SupplierFormState & { id?: number }) =>
      payload.id ? suppliersApi.update(payload.id, payload) : suppliersApi.create(payload),
    onSuccess: (supplier) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setEditing(null);
      setIsCreating(false);
      setSelected(supplier);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => suppliersApi.patchStatus(id, activo),
    onSuccess: (supplier) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setSelected((cur) => (cur?.id === supplier.id ? supplier : cur));
      setEditing((cur) => (cur?.id === supplier.id ? supplier : cur));
    },
  });

  const confirmToggle = (supplier: Supplier) => {
    const action = supplier.activo ? "desactivar" : "activar";
    if (!confirm(`¿Confirmas ${action} al proveedor "${supplier.nombre}"?`)) return;
    statusMutation.mutate({ id: supplier.id, activo: !supplier.activo });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 sm:max-w-sm">
          <Search size={16} className="text-stone-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por nombre, NIT o teléfono"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-bio-green px-4 text-sm font-semibold text-white hover:bg-bio-dark"
        >
          <Plus size={17} />
          Registrar proveedor
        </button>
      </div>

      <DataState isLoading={isLoading} isError={isError} />

      {!isLoading && !isError && (
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">NIT</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
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
                        <IconButton label={supplier.activo ? "Desactivar" : "Activar"} onClick={() => confirmToggle(supplier)} icon={Power} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {suppliers.length === 0 && <EmptyState text="No hay proveedores registrados." />}
        </div>
      )}

      {(isCreating || editing) && (
        <Modal title={editing ? "Editar proveedor" : "Registrar proveedor"} onClose={() => (editing ? setEditing(null) : setIsCreating(false))}>
          <SupplierForm
            supplier={editing ?? undefined}
            isSaving={saveMutation.isPending}
            error={saveMutation.error?.message}
            onSubmit={(payload) => saveMutation.mutate(editing ? { ...payload, id: editing.id } : payload)}
          />
        </Modal>
      )}

      {selected && (
        <Modal title="Detalle del proveedor" onClose={() => setSelected(null)}>
          <SupplierDetail supplier={selected} />
        </Modal>
      )}
    </div>
  );
}

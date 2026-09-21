import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Power, Search } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { customersApi } from "../../api/customers";
import { CustomerForm } from "./CustomerForm";
import { CustomerDetail } from "./CustomerDetail";
import type { Customer, CustomerFormState } from "../../types";

type Props = {
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  search: string;
  onSearch: (value: string) => void;
};

export function CustomersView({ customers, isLoading, isError, search, onSearch }: Props) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Customer | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: CustomerFormState & { id?: number }) =>
      payload.id ? customersApi.update(payload.id, payload) : customersApi.create(payload),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditing(null);
      setIsCreating(false);
      setSelected(customer);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => customersApi.patchStatus(id, activo),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelected((cur) => (cur?.id === customer.id ? customer : cur));
    },
  });

  const confirmToggle = (customer: Customer) => {
    const action = customer.activo ? "desactivar" : "activar";
    if (!confirm(`¿Confirmas ${action} al cliente "${customer.nombre}"?`)) return;
    statusMutation.mutate({ id: customer.id, activo: !customer.activo });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 sm:max-w-sm">
          <Search size={16} className="text-stone-400" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Buscar por nombre, NIT/CI o teléfono" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <button onClick={() => setIsCreating(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-bio-green px-4 text-sm font-semibold text-white hover:bg-bio-dark">
          <Plus size={17} />
          Registrar cliente
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
                  <th className="px-4 py-3">NIT/CI</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-4 py-3 font-semibold text-bio-dark">{customer.nombre}</td>
                    <td className="px-4 py-3 text-stone-600">{customer.nitCi || "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{customer.telefono || "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{customer.email || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={customer.activo} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconButton label="Ver detalle" onClick={() => setSelected(customer)} icon={Eye} />
                        <IconButton label="Editar" onClick={() => setEditing(customer)} icon={Pencil} />
                        <IconButton label={customer.activo ? "Desactivar" : "Activar"} onClick={() => confirmToggle(customer)} icon={Power} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {customers.length === 0 && <EmptyState text="No hay clientes registrados." />}
        </div>
      )}

      {(isCreating || editing) && (
        <Modal title={editing ? "Editar cliente" : "Registrar cliente"} onClose={() => (editing ? setEditing(null) : setIsCreating(false))}>
          <CustomerForm
            customer={editing ?? undefined}
            isSaving={saveMutation.isPending}
            error={saveMutation.error?.message}
            onSubmit={(payload) => saveMutation.mutate(editing ? { ...payload, id: editing.id } : payload)}
          />
        </Modal>
      )}

      {selected && (
        <Modal title="Detalle del cliente" onClose={() => setSelected(null)}>
          <CustomerDetail customer={selected} />
        </Modal>
      )}
    </div>
  );
}

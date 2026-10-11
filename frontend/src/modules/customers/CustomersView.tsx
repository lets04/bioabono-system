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
  const { notify, confirm } = useFeedback();
  const [editing, setEditing] = useState<Customer | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: CustomerFormState & { id?: number }) =>
      payload.id ? customersApi.update(payload.id, payload) : customersApi.create(payload),
    onSuccess: (customer, payload) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      notify(payload.id ? "Cliente actualizado" : "Cliente registrado");
      setEditing(null);
      setIsCreating(false);
      setSelected(customer);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => customersApi.patchStatus(id, activo),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      notify(customer.activo ? "Cliente activado" : "Cliente desactivado");
      setSelected((cur) => (cur?.id === customer.id ? customer : cur));
    },
    onError: (error) => notify(error instanceof Error ? error.message : "No se pudo cambiar el estado", "error"),
  });

  const confirmToggle = async (customer: Customer) => {
    const action = customer.activo ? "desactivar" : "activar";
    const ok = await confirm({
      title: `¿${action[0].toUpperCase()}${action.slice(1)} al cliente "${customer.nombre}"?`,
      message: customer.activo ? "Dejará de aparecer en los formularios hasta que lo reactives." : undefined,
      confirmLabel: action[0].toUpperCase() + action.slice(1),
      tone: customer.activo ? "danger" : "default",
    });
    if (!ok) return;
    statusMutation.mutate({ id: customer.id, activo: !customer.activo });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={onSearch} placeholder="Buscar por nombre, NIT/CI o teléfono" />
        <button onClick={() => setIsCreating(true)} className="btn-primary">
          <Plus size={17} />
          Registrar cliente
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
                  <th className="px-4 py-3">NIT/CI</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body divide-y divide-stone-100">
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
                        <IconButton label={customer.activo ? "Desactivar" : "Activar"} onClick={() => void confirmToggle(customer)} icon={Power} tone={customer.activo ? "danger" : "default"} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {customers.length === 0 && <EmptyState text={search ? "Ningún cliente coincide con la búsqueda." : "No hay clientes registrados."} hint={search ? "Prueba con otro nombre, NIT/CI o teléfono." : "Registra tu primer cliente para usarlo en ventas."} />}
        </div>
      )}

      {(isCreating || editing) && (
        <Modal size="md" title={editing ? "Editar cliente" : "Registrar cliente"} onClose={() => (editing ? setEditing(null) : setIsCreating(false))}>
          <CustomerForm
            customer={editing ?? undefined}
            isSaving={saveMutation.isPending}
            error={saveMutation.error?.message}
            onSubmit={(payload) => saveMutation.mutate(editing ? { ...payload, id: editing.id } : payload)}
          />
        </Modal>
      )}

      {selected && (
        <Modal size="md" title="Detalle del cliente" onClose={() => setSelected(null)}>
          <CustomerDetail customer={selected} />
        </Modal>
      )}
    </div>
  );
}

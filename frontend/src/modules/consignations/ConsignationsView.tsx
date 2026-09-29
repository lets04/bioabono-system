import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Search } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { consignationsApi } from "../../api/consignations";
import { useConsignations } from "../../hooks/useConsignations";
import { useCustomers } from "../../hooks/useCustomers";
import { useProducts } from "../../hooks/useProducts";
import { ConsignationForm } from "./ConsignationForm";
import { ConsignationDetailView } from "./ConsignationDetail";
import type { ConsignationDetail } from "../../types";

export function ConsignationsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [selected, setSelected] = useState<ConsignationDetail | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const consignationsQuery = useConsignations(search, estado);
  const customersQuery = useCustomers("");
  const productsQuery = useProducts("");

  const createMutation = useMutation({
    mutationFn: (payload: {
      clienteId: number;
      fechaEntrega?: string;
      observacion?: string | null;
      detalles: Array<{ presentacionId: number; cantidadEntregada: number }>;
    }) => consignationsApi.create(payload),
    onSuccess: (consignation) => {
      queryClient.invalidateQueries({ queryKey: ["consignations"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsCreating(false);
      setSelected(consignation);
    },
  });

  const liquidateMutation = useMutation({
    mutationFn: (payload: { id: number; detalles: Array<{ presentacionId: number; cantidadVendida: number; cantidadDevuelta: number }> }) =>
      consignationsApi.liquidate(payload.id, { detalles: payload.detalles }),
    onSuccess: (consignation) => {
      queryClient.invalidateQueries({ queryKey: ["consignations"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setSelected(consignation);
    },
  });

  const handleSelect = async (id: number) => {
    const consignation = await consignationsApi.get(id);
    setSelected(consignation);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
          <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-stone-200 bg-white px-3">
            <Search size={16} className="text-stone-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por número o cliente" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input h-11 w-full sm:w-40">
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="LIQUIDADA">Liquidadas</option>
          </select>
        </div>
        <button onClick={() => setIsCreating(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-bio-green px-4 text-sm font-semibold text-white hover:bg-bio-dark">
          <Plus size={17} />
          Nueva consignación
        </button>
      </div>

      <DataState isLoading={consignationsQuery.isLoading} isError={consignationsQuery.isError} />

      {!consignationsQuery.isLoading && !consignationsQuery.isError && (
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">N.º consignación</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha entrega</th>
                  <th className="px-4 py-3 text-right">Líneas</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(consignationsQuery.data ?? []).map((consignation) => (
                  <tr key={consignation.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono font-semibold text-bio-dark">{consignation.numero}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{consignation.clienteNombre}</td>
                    <td className="px-4 py-3 text-stone-600">{new Date(consignation.fechaEntrega).toLocaleDateString("es-BO")}</td>
                    <td className="px-4 py-3 text-right">{consignation.lineas}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${consignation.estado === "PENDIENTE" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {consignation.estado === "PENDIENTE" ? "Pendiente" : "Liquidada"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <IconButton label={consignation.estado === "PENDIENTE" ? "Ver y liquidar" : "Ver detalle"} onClick={() => handleSelect(consignation.id)} icon={Eye} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(consignationsQuery.data ?? []).length === 0 && <EmptyState text="No hay consignaciones registradas." />}
        </div>
      )}

      {isCreating && (
        <Modal title="Nueva consignación" onClose={() => setIsCreating(false)}>
          <ConsignationForm
            customers={customersQuery.data ?? []}
            products={productsQuery.data ?? []}
            isSaving={createMutation.isPending}
            error={createMutation.error?.message}
            onSubmit={(payload) => createMutation.mutate(payload)}
            onCancel={() => setIsCreating(false)}
          />
        </Modal>
      )}

      {selected && (
        <Modal title={`Consignación ${selected.numero}`} onClose={() => setSelected(null)}>
          {selected.estado === "PENDIENTE" ? (
            <ConsignationDetailView
              consignation={selected}
              isLiquidating={liquidateMutation.isPending}
              error={liquidateMutation.error?.message}
              onLiquidate={(payload) => liquidateMutation.mutate({ id: selected.id, detalles: payload.detalles })}
            />
          ) : (
            <ConsignationDetailView
              consignation={selected}
              isLiquidating={false}
              onLiquidate={() => undefined}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
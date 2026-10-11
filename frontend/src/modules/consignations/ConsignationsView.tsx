import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Plus,
  Printer,
  ClipboardCheck,
} from "lucide-react";

import { useFeedback } from "../../components/ui/Feedback";
import { Modal } from "../../components/ui/Modal";
import { SearchInput } from "../../components/ui/SearchInput";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { DetailLoaderError } from "../../components/ui/DetailLoaderError";
import { useDetailLoader } from "../../hooks/useDetailLoader";

import { consignationsApi } from "../../api/consignations";
import { useConsignations } from "../../hooks/useConsignations";
import { useCustomers } from "../../hooks/useCustomers";
import { useProducts } from "../../hooks/useProducts";

import { ConsignationForm } from "./ConsignationForm";
import { ConsignationDetailView } from "./ConsignationDetail";
import { ConsignationPrint } from "./ConsignationPrint";

import type { ConsignationDetail } from "../../types";

export function ConsignationsView() {
  const queryClient = useQueryClient();
  const { notify } = useFeedback();

  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");

  const [selected, setSelected] =
    useState<ConsignationDetail | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [printDoc, setPrintDoc] = useState<{
    consignation: ConsignationDetail;
    variant: "entrega" | "liquidacion";
  } | null>(null);

  const consignationsQuery = useConsignations(
    search,
    estado,
  );

  const customersQuery = useCustomers("");
  const productsQuery = useProducts("");

  // ============================================================
  // CREAR CONSIGNACIÓN
  // ============================================================

  const createMutation = useMutation({
    mutationFn: (payload: {
      clienteId: number;
      fechaEntrega?: string;
      observacion?: string | null;
      detalles: Array<{
        presentacionId: number;
        cantidadEntregada: number;
      }>;
    }) => consignationsApi.create(payload),

    onSuccess: (consignation) => {
      queryClient.invalidateQueries({
        queryKey: ["consignations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      notify(`Consignación ${consignation.numero} registrada`);
      setIsCreating(false);
      setSelected(consignation);
      setPrintDoc({ consignation, variant: "entrega" });
    },
  });

  // ============================================================
  // LIQUIDAR CONSIGNACIÓN
  // ============================================================

  const liquidateMutation = useMutation({
    mutationFn: (payload: {
      id: number;
      detalles: Array<{
        presentacionId: number;
        cantidadVendida: number;
        cantidadDevuelta: number;
      }>;
    }) =>
      consignationsApi.liquidate(payload.id, {
        detalles: payload.detalles,
      }),

    onSuccess: (consignation) => {
      queryClient.invalidateQueries({
        queryKey: ["consignations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["sales"],
      });

      notify(`Consignación ${consignation.numero} liquidada`);
      setSelected(consignation);
      setPrintDoc({ consignation, variant: "liquidacion" });
    },
  });

  // ============================================================
  // ABRIR CONSIGNACIÓN
  // ============================================================

  const detail = useDetailLoader(consignationsApi.get);
  const handleSelect = (id: number) => detail.load(id, setSelected);

  return (
    <div>
      {/* ======================================================
          FILTROS + NUEVA CONSIGNACIÓN
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">

          {/* BUSCAR */}

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por número o cliente"
            className="sm:max-w-none"
          />

          {/* ESTADO */}

          <select
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value)
            }
            className="input h-11 w-full sm:w-40"
          >
            <option value="">Todos</option>

            <option value="PENDIENTE">
              Pendientes
            </option>

            <option value="LIQUIDADA">
              Liquidadas
            </option>
          </select>
        </div>

        {/* NUEVA CONSIGNACIÓN */}

        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
        >
          <Plus size={17} />

          Nueva consignación
        </button>
      </div>

      {/* ======================================================
          ESTADO DE CARGA
      ====================================================== */}

      <DataState
        isLoading={consignationsQuery.isLoading}
        isError={consignationsQuery.isError}
      />

      <DetailLoaderError error={detail.error} onDismiss={detail.clearError} />

      {/* ======================================================
          TABLA
      ====================================================== */}

      {!consignationsQuery.isLoading &&
        !consignationsQuery.isError && (
          <div className="table-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">

                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3">
                      N.º consignación
                    </th>

                    <th className="px-4 py-3">
                      Cliente
                    </th>

                    <th className="px-4 py-3">
                      Fecha entrega
                    </th>

                    <th className="px-4 py-3 text-right">
                      Líneas
                    </th>

                    <th className="px-4 py-3">
                      Estado
                    </th>

                    <th className="px-4 py-3 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="table-body divide-y divide-stone-100">
                  {(consignationsQuery.data ?? []).map(
                    (consignation) => (
                      <tr
                        key={consignation.id}
                        className="hover:bg-stone-50"
                      >

                        {/* NÚMERO */}

                        <td className="px-4 py-3 font-mono font-semibold text-bio-dark">
                          {consignation.numero}
                        </td>

                        {/* CLIENTE */}

                        <td className="px-4 py-3 font-medium text-stone-800">
                          {consignation.clienteNombre}
                        </td>

                        {/* FECHA */}

                        <td className="px-4 py-3 text-stone-600">
                          {new Date(
                            consignation.fechaEntrega,
                          ).toLocaleDateString("es-BO")}
                        </td>

                        {/* LÍNEAS */}

                        <td className="px-4 py-3 text-right">
                          {consignation.lineas}
                        </td>

                        {/* ESTADO */}

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              consignation.estado ===
                              "PENDIENTE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {consignation.estado ===
                            "PENDIENTE"
                              ? "Pendiente"
                              : "Liquidada"}
                          </span>
                        </td>

                        {/* ACCIONES */}

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <IconButton
                              label="Imprimir"
                              icon={Printer}
                              onClick={async () => {
                                const detail = await consignationsApi.get(consignation.id);
                                setPrintDoc({
                                  consignation: detail,
                                  variant: consignation.estado === "LIQUIDADA" ? "liquidacion" : "entrega",
                                });
                              }}
                            />
                            {consignation.estado === "PENDIENTE" ? (
                              <button
                                onClick={() => handleSelect(consignation.id)}
                                className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-3 py-2 text-xs font-semibold text-white transition hover:bg-bio-dark"
                              >
                                <ClipboardCheck size={15} />
                                Liquidar
                              </button>
                            ) : (
                              <IconButton
                                label="Ver detalle"
                                onClick={() => handleSelect(consignation.id)}
                                icon={Eye}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* SIN RESULTADOS */}

            {(consignationsQuery.data ?? [])
              .length === 0 && (
              <EmptyState
                text="No hay consignaciones registradas."
              />
            )}
          </div>
        )}

      {/* ======================================================
          NUEVA CONSIGNACIÓN
      ====================================================== */}

      {isCreating && (
        <Modal
          title="Nueva consignación"
          onClose={() => { setIsCreating(false); createMutation.reset(); }}
        >
          <ConsignationForm
            customers={customersQuery.data ?? []}
            products={productsQuery.data ?? []}
            isSaving={createMutation.isPending}
            error={createMutation.error?.message}
            onSubmit={(payload) =>
              createMutation.mutate(payload)
            }
            onCancel={() =>
              setIsCreating(false)
            }
          />
        </Modal>
      )}

      {/* ======================================================
          DETALLE / LIQUIDACIÓN
      ====================================================== */}

      {selected && (
        <Modal
          title={`Consignación ${selected.numero}`}
          onClose={() => { setSelected(null); liquidateMutation.reset(); }}
        >
          <ConsignationDetailView
            consignation={selected}
            isLiquidating={
              liquidateMutation.isPending
            }
            error={
              liquidateMutation.error?.message
            }
            onPrintEntrega={() => setPrintDoc({ consignation: selected, variant: "entrega" })}
            onPrintLiquidacion={
              selected.estado === "LIQUIDADA"
                ? () => setPrintDoc({ consignation: selected, variant: "liquidacion" })
                : undefined
            }
            onLiquidate={(payload) => {
              // Si ya está liquidada no hacemos nada.
              if (
                selected.estado !== "PENDIENTE"
              ) {
                return;
              }

              liquidateMutation.mutate({
                id: selected.id,
                detalles: payload.detalles,
              });
            }}
          />
        </Modal>
      )}

      {printDoc && (
        <ConsignationPrint
          consignation={printDoc.consignation}
          variant={printDoc.variant}
          onClose={() => setPrintDoc(null)}
        />
      )}
    </div>
  );
}
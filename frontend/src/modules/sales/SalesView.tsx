import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Printer } from "lucide-react";
import { useFeedback } from "../../components/ui/Feedback";
import { Modal } from "../../components/ui/Modal";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { SearchInput } from "../../components/ui/SearchInput";
import { DetailLoaderError } from "../../components/ui/DetailLoaderError";
import { useDetailLoader } from "../../hooks/useDetailLoader";
import { money } from "../../utils/format";
import { salesApi } from "../../api/sales";
import { useSales } from "../../hooks/useSales";
import { useCustomers } from "../../hooks/useCustomers";
import { useProducts } from "../../hooks/useProducts";
import { SaleForm } from "./SaleForm";
import { SaleDetailView } from "./SaleDetail";
import { SalePrint } from "./SalePrint";
import type { SaleDetail } from "../../types";

export function SalesView() {
  const queryClient = useQueryClient();
  const { notify } = useFeedback();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SaleDetail | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [printSale, setPrintSale] = useState<SaleDetail | null>(null);

  const salesQuery = useSales(search);
  const customersQuery = useCustomers("");
  const productsQuery = useProducts("");

  const createMutation = useMutation({
    mutationFn: (payload: {
      clienteId: number | null;
      fecha?: string;
      tipoPrecio: "PVP" | "CONTADO" | "MAYORISTA";
      observacion?: string | null;
      detalles: Array<{ presentacionId: number; cantidad: number; descuentoPorcentaje: string; tipoPrecio: "PVP" | "CONTADO" | "MAYORISTA" }>;
    }) => salesApi.create(payload),
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notify(`Venta ${sale.numero} registrada`);
      setIsCreating(false);
      setSelected(sale);
      setPrintSale(sale);
    },
  });

  const detail = useDetailLoader(salesApi.get);
  const handleSelect = (id: number) => detail.load(id, setSelected);
  const handlePrint = (id: number) => detail.load(id, setPrintSale);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por número o cliente" />
        <button onClick={() => setIsCreating(true)} className="btn-primary">
          <Plus size={17} />
          Nueva venta
        </button>
      </div>

      <DataState isLoading={salesQuery.isLoading} isError={salesQuery.isError} />
      <DetailLoaderError error={detail.error} onDismiss={detail.clearError} />

      {!salesQuery.isLoading && !salesQuery.isError && (
        <div className="table-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">N.º venta</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-right">Líneas</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body divide-y divide-stone-100">
                {(salesQuery.data ?? []).map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-bio-dark">
                      {sale.numero}
                      {sale.consignacionNumero && (
                        <span className="mt-0.5 block max-w-fit rounded bg-bio-green/10 px-1.5 py-0.5 text-[10px] font-semibold text-bio-dark">Consig. {sale.consignacionNumero}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{new Date(sale.fecha).toLocaleDateString("es-BO")}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{sale.clienteNombre ?? "Cliente mostrador"}</td>
                    <td className="px-4 py-3 text-right">{sale.lineas}</td>
                    <td className="px-4 py-3 text-right font-semibold text-bio-dark">{money(sale.total)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{sale.estado}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconButton label="Ver detalle" onClick={() => handleSelect(sale.id)} icon={Eye} />
                        <IconButton label="Imprimir" onClick={() => handlePrint(sale.id)} icon={Printer} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(salesQuery.data ?? []).length === 0 && <EmptyState text={search ? "Ninguna venta coincide con la búsqueda." : "No hay ventas registradas."} />}
        </div>
      )}

      {isCreating && (
        <Modal title="Nueva venta" onClose={() => { setIsCreating(false); createMutation.reset(); }}>
          <SaleForm
            customers={customersQuery.data ?? []}
            products={productsQuery.data ?? []}
            isSaving={createMutation.isPending}
            error={createMutation.error?.message}
            onSubmit={(payload) => createMutation.mutate(payload)}
            onCancel={() => { setIsCreating(false); createMutation.reset(); }}
          />
        </Modal>
      )}

      {selected && (
        <Modal title={`Venta ${selected.numero}`} onClose={() => setSelected(null)}>
          <SaleDetailView sale={selected} onPrint={() => setPrintSale(selected)} />
        </Modal>
      )}

      {printSale && <SalePrint sale={printSale} onClose={() => setPrintSale(null)} />}
    </div>
  );
}

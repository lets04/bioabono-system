import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Printer, Search } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { DataState } from "../../components/ui/DataState";
import { DetailLoaderError } from "../../components/ui/DetailLoaderError";
import { useDetailLoader } from "../../hooks/useDetailLoader";
import { money } from "../../utils/format";
import { purchasesApi } from "../../api/purchases";
import { useProducts } from "../../hooks/useProducts";
import { useSuppliers } from "../../hooks/useSuppliers";
import { usePurchases } from "../../hooks/usePurchases";
import { PurchaseForm } from "./PurchaseForm";
import { PurchaseDetail } from "./PurchaseDetail";
import { PurchasePrint } from "./PurchasePrint";
import type { PurchaseDetail as DetailType } from "../../types";

export function PurchasesView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [printPurchase, setPrintPurchase] = useState<DetailType | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<DetailType | null>(null);

  const purchasesQuery = usePurchases(search);
  const suppliersQuery = useSuppliers("");
  const productsQuery = useProducts("");

  const createMutation = useMutation({
    mutationFn: (payload: { proveedorId: number; fecha?: string; observacion?: string | null; detalles: Array<{ presentacionId: number; cantidad: number; precioUnitario: string }> }) =>
      purchasesApi.create(payload),
    onSuccess: (purchase) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsCreating(false);
      setSelectedPurchase(purchase);
      setPrintPurchase(purchase);
    },
  });

  const detail = useDetailLoader(purchasesApi.get);
  const handleSelect = (id: number) =>
    detail.load(id, (purchase) => {
      setSelectedPurchase(purchase);
      setSelectedId(id);
    });
  const handlePrintFromList = (id: number) => detail.load(id, setPrintPurchase);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 sm:max-w-sm">
          <Search size={16} className="text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número o proveedor"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-bio-green px-4 text-sm font-semibold text-white hover:bg-bio-dark"
        >
          <Plus size={17} />
          Nueva compra
        </button>
      </div>

      <DataState isLoading={purchasesQuery.isLoading} isError={purchasesQuery.isError} />
      <DetailLoaderError error={detail.error} onDismiss={detail.clearError} />

      {!purchasesQuery.isLoading && !purchasesQuery.isError && (
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">N.º compra</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Proveedor</th>
                  <th className="px-4 py-3 text-right">Líneas</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(purchasesQuery.data ?? []).map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-bio-dark">{purchase.numero}</td>
                    <td className="px-4 py-3 text-stone-600">{new Date(purchase.fecha).toLocaleDateString("es-BO")}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{purchase.proveedorNombre}</td>
                    <td className="px-4 py-3 text-right">{purchase.lineas}</td>
                    <td className="px-4 py-3 text-right font-semibold text-bio-dark">{money(purchase.total)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{purchase.estado}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconButton label="Ver detalle" onClick={() => handleSelect(purchase.id)} icon={Eye} />
                        <IconButton label="Imprimir" onClick={() => handlePrintFromList(purchase.id)} icon={Printer} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(purchasesQuery.data ?? []).length === 0 && <EmptyState text="No hay compras registradas." />}
        </div>
      )}

      {isCreating && (
        <Modal title="Nueva compra" onClose={() => { setIsCreating(false); createMutation.reset(); }}>
          <PurchaseForm
            suppliers={suppliersQuery.data ?? []}
            products={productsQuery.data ?? []}
            isSaving={createMutation.isPending}
            error={createMutation.error?.message}
            onSubmit={(payload) => createMutation.mutate(payload)}
            onCancel={() => { setIsCreating(false); createMutation.reset(); }}
          />
        </Modal>
      )}

      {selectedPurchase && (
        <Modal title={`Compra ${selectedPurchase.numero}`} onClose={() => { setSelectedPurchase(null); setSelectedId(null); }}>
          <PurchaseDetail purchase={selectedPurchase} onPrint={() => setPrintPurchase(selectedPurchase)} />
        </Modal>
      )}

      {printPurchase && <PurchasePrint purchase={printPurchase} onClose={() => setPrintPurchase(null)} />}
    </div>
  );
}

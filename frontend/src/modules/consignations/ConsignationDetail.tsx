import { useMemo, useState } from "react";
import { CheckCircle2, Handshake } from "lucide-react";

import { money } from "../../utils/format";

import type { ConsignationDetail } from "../../types";

type Props = {
  consignation: ConsignationDetail;
  isLiquidating: boolean;
  error?: string;

  onLiquidate: (payload: {
    detalles: Array<{
      presentacionId: number;
      cantidadVendida: number;
      cantidadDevuelta: number;
    }>;
  }) => void;
};

export function ConsignationDetailView({
  consignation,
  isLiquidating,
  error,
  onLiquidate,
}: Props) {
  const isPending = consignation.estado === "PENDIENTE";

  // ============================================================
  // CANTIDADES VENDIDAS
  // El usuario solamente modifica esta cantidad.
  // ============================================================

  const [vendidos, setVendidos] = useState<Record<number, string>>(
    () =>
      Object.fromEntries(
        consignation.detalles.map((d) => [
          d.presentacionId,
          isPending ? String(d.cantidadVendida ?? 0) : String(d.cantidadVendida ?? 0),
        ]),
      ),
  );

  const setVendido = (presId: number, value: string) => {
    setVendidos((cur) => ({
      ...cur,
      [presId]: value,
    }));
  };

  // ============================================================
  // BALANCE
  //
  // Entregado = cantidad original de la consignación
  // Vendido   = cantidad que introduce el usuario
  // Devuelto  = Entregado - Vendido
  // ============================================================

  const balance = useMemo(() => {
    return consignation.detalles.map((d) => {
      const vendido = Number(vendidos[d.presentacionId]) || 0;

      const devuelto = d.cantidadEntregada - vendido;

      const ok =
        vendido >= 0 &&
        vendido <= d.cantidadEntregada;

      return {
        detail: d,
        vendido,
        devuelto,
        ok,
      };
    });
  }, [consignation.detalles, vendidos]);

  // ============================================================
  // VALIDACIÓN GENERAL
  // ============================================================

  const allValid = balance.every((b) => b.ok);

  // ============================================================
  // IMPORTE A COBRAR
  // ============================================================

  const importeVenta = balance.reduce(
    (sum, b) =>
      sum +
      b.vendido *
        Number(b.detail.precioConsignacion),
    0,
  );

  // ============================================================
  // LIQUIDAR
  // ============================================================

  const handleLiquidate = () => {
    if (!allValid) return;

    onLiquidate({
      detalles: balance.map((b) => ({
        presentacionId: b.detail.presentacionId,
        cantidadVendida: b.vendido,
        cantidadDevuelta: b.devuelto,
      })),
    });
  };

  // ============================================================
  // FECHA
  // ============================================================

  const fechaEntrega = new Date(
    consignation.fechaEntrega,
  ).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="grid gap-6 text-sm">

      {/* ======================================================
          INFORMACIÓN GENERAL
      ====================================================== */}

      <div className="grid gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-3">

        {/* NÚMERO */}

        <div>
          <div className="text-xs text-stone-500">
            N.º de consignación
          </div>

          <div className="font-mono font-semibold text-bio-dark">
            {consignation.numero}
          </div>
        </div>

        {/* FECHA */}

        <div>
          <div className="text-xs text-stone-500">
            Fecha de entrega
          </div>

          <div className="font-medium text-stone-800">
            {fechaEntrega}
          </div>
        </div>

        {/* ESTADO */}

        <div>
          <div className="text-xs text-stone-500">
            Estado
          </div>

          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              isPending
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {isPending ? "PENDIENTE" : "LIQUIDADA"}
          </span>
        </div>

        {/* CLIENTE */}

        <div>
          <div className="text-xs text-stone-500">
            Cliente
          </div>

          <div className="font-medium text-stone-800">
            {consignation.clienteNombre}
          </div>

          {consignation.clienteNitCi && (
            <div className="text-xs text-stone-500">
              NIT/CI: {consignation.clienteNitCi}
            </div>
          )}
        </div>

        {/* USUARIO */}

        <div>
          <div className="text-xs text-stone-500">
            Registrada por
          </div>

          <div className="font-medium text-stone-800">
            {consignation.usuarioNombre}
          </div>
        </div>

        {/* OBSERVACIÓN */}

        {consignation.observacion && (
          <div>
            <div className="text-xs text-stone-500">
              Observación
            </div>

            <div className="font-medium text-stone-800">
              {consignation.observacion}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          PRODUCTOS
      ====================================================== */}

      <div className="overflow-hidden rounded-lg border border-stone-200">

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>

                <th className="px-4 py-3">
                  Código
                </th>

                <th className="px-4 py-3">
                  Producto
                </th>

                <th className="px-4 py-3 text-right">
                  Entregado
                </th>

                <th className="px-4 py-3 text-right">
                  P. consig.
                </th>

                <th className="px-4 py-3 text-right">
                  Vendido
                </th>

                <th className="px-4 py-3 text-right">
                  Devuelto
                </th>

                {!isPending && (
                  <th className="px-4 py-3 text-right">
                    Importe
                  </th>
                )}

              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 bg-white">

              {consignation.detalles.map((det) => {
                const b = balance.find(
                  (x) =>
                    x.detail.presentacionId ===
                    det.presentacionId,
                )!;

                return (
                  <tr
                    key={det.id}
                    className={
                      isPending && !b.ok
                        ? "bg-red-50"
                        : undefined
                    }
                  >

                    {/* ==================================================
                        CÓDIGO
                    ================================================== */}

                    <td className="px-4 py-3 font-mono font-semibold text-bio-dark">
                      {det.codigo}
                    </td>

                    {/* ==================================================
                        PRODUCTO
                    ================================================== */}

                    <td className="px-4 py-3">
                      {det.productoNombre}

                      <span className="block text-xs text-stone-500">
                        {det.cantidadPresentacion}{" "}
                        {det.unidadMedida}
                      </span>
                    </td>

                    {/* ==================================================
                        ENTREGADO
                        
                        IMPORTANTE:
                        NO ES EDITABLE.
                        Es la cantidad registrada originalmente.
                    ================================================== */}

                    <td className="px-4 py-3 text-right font-semibold">
                      {det.cantidadEntregada}
                    </td>

                    {/* ==================================================
                        PRECIO DE CONSIGNACIÓN
                    ================================================== */}

                    <td className="px-4 py-3 text-right">
                      {money(
                        det.precioConsignacion,
                      )}
                    </td>

                    {/* ==================================================
                        VENDIDO
                        
                        SOLO ESTE CAMPO ES EDITABLE.
                    ================================================== */}

                    {isPending ? (
                      <td className="px-4 py-3">

                        <input
                          min={0}
                          max={det.cantidadEntregada}
                          step={1}
                          type="number"
                          value={
                            vendidos[
                              det.presentacionId
                            ] ?? "0"
                          }
                          onChange={(e) =>
                            setVendido(
                              det.presentacionId,
                              e.target.value,
                            )
                          }
                          className={`input w-24 bg-white text-right ${
                            !b.ok
                              ? "border-red-400 text-red-600"
                              : ""
                          }`}
                        />

                        {!b.ok && (
                          <span className="mt-1 block text-xs text-red-600">
                            Máximo:{" "}
                            {det.cantidadEntregada}
                          </span>
                        )}

                      </td>
                    ) : (
                      <td className="px-4 py-3 text-right">
                        {det.cantidadVendida}
                      </td>
                    )}

                    {/* ==================================================
                        DEVUELTO
                        
                        CALCULADO AUTOMÁTICAMENTE:
                        
                        entregado - vendido
                    ================================================== */}

                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        isPending
                          ? "text-stone-700"
                          : ""
                      }`}
                    >
                      {isPending
                        ? b.devuelto
                        : det.cantidadDevuelta}
                    </td>

                    {/* ==================================================
                        IMPORTE
                    ================================================== */}

                    {!isPending && (
                      <td className="px-4 py-3 text-right font-semibold">
                        {money(
                          det.importeVendido,
                        )}
                      </td>
                    )}

                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>

        {/* ======================================================
            RESUMEN PENDIENTE
        ====================================================== */}

        {isPending ? (
          <div className="border-t border-stone-200 bg-stone-50 px-4 py-3">

            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">

              <div
                className={
                  allValid
                    ? "inline-flex items-center gap-2 text-emerald-700"
                    : "inline-flex items-center gap-2 text-red-600"
                }
              >
                <CheckCircle2 size={15} />

                {allValid ? (
                  <span>
                    Las cantidades son válidas
                  </span>
                ) : (
                  <span>
                    La cantidad vendida no puede superar la cantidad entregada
                  </span>
                )}
              </div>

              <div className="font-semibold text-stone-800">
                Importe a cobrar:{" "}

                <span className="text-base font-bold text-bio-dark">
                  {money(importeVenta)}
                </span>
              </div>

            </div>
          </div>
        ) : (

          /* ====================================================
             RESUMEN LIQUIDADA
          ==================================================== */

          <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 text-right text-sm">

            <div className="text-stone-600">
              Total liquidado:{" "}

              <span className="text-base font-bold text-bio-dark">
                {money(
                  consignation.detalles.reduce(
                    (sum, d) =>
                      sum +
                      Number(
                        d.importeVendido,
                      ),
                    0,
                  ),
                )}
              </span>
            </div>

            {consignation.venta && (
              <div className="mt-1 flex items-center justify-end gap-2 text-stone-600">

                <Handshake
                  size={14}
                  className="text-bio-green"
                />

                Venta generada:

                <span className="font-mono font-semibold text-bio-dark">
                  {consignation.venta.numero}
                </span>

                <span className="font-semibold text-bio-dark">
                  {money(
                    consignation.venta.total,
                  )}
                </span>

              </div>
            )}

          </div>
        )}

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {isPending && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          BOTÓN LIQUIDAR
      ====================================================== */}

      {isPending && (
        <div className="flex justify-end">

          <button
            type="button"
            onClick={handleLiquidate}
            disabled={!allValid || isLiquidating}
            className="inline-flex items-center gap-2 rounded-lg bg-bio-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-bio-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLiquidating
              ? "Liquidando..."
              : "Liquidar consignación"}
          </button>

        </div>
      )}

    </div>
  );
}
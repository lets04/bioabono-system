export const money = (value: string | number) =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(Number(value || 0));

const pad = (n: number) => String(n).padStart(2, "0");

/** Fecha local de hoy en formato YYYY-MM-DD (para inputs type="date"). */
export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Convierte el valor de un input date (YYYY-MM-DD) a ISO respetando la zona local.
 * Si es hoy se usa la hora actual; en otro caso, mediodía local para no cambiar de día.
 */
export const dateInputToISO = (value: string) => {
  if (value === todayLocal()) return new Date().toISOString();
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12).toISOString();
};

export const hasDuplicates = (ids: number[]) => new Set(ids).size !== ids.length;

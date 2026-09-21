export type View = "dashboard" | "products" | "categories" | "suppliers" | "purchases" | "customers" | "sales" | "inventory" | "reports";

export type Category = {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
};

export type Presentation = {
  id: number;
  productoId: number;
  codigo: string;
  cantidad: string;
  unidadMedida: string;
  pvp: string;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
  preciosDerivados: {
    consignacion: string;
    contado: string;
    mayorista: string;
  };
  ultimoPrecioCompra: string | null;
};

export type Product = {
  id: number;
  nombre: string;
  abreviacion: string;
  descripcion: string | null;
  categoriaId: number | null;
  categoriaNombre: string | null;
  activo: boolean;
  presentaciones: Presentation[];
};

export type ProductFormState = {
  nombre: string;
  abreviacion: string;
  descripcion: string;
  categoriaId: string;
  activo: boolean;
  presentaciones: Array<{
    id?: number;
    cantidad: string;
    unidadMedida: string;
    pvp: string;
    stockMinimo: string;
    activo: boolean;
  }>;
};

export type CategoryFormState = {
  nombre: string;
  descripcion: string;
  activo: boolean;
};

export type Supplier = {
  id: number;
  nombre: string;
  nit: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
};

export type SupplierFormState = {
  nombre: string;
  nit: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
};

export type Purchase = {
  id: number;
  numero: string;
  proveedorId: number;
  proveedorNombre: string;
  fecha: string;
  subtotal: string;
  total: string;
  estado: string;
  observacion: string | null;
  lineas: number;
  createdAt: string;
};

export type PurchaseDetail = {
  id: number;
  numero: string;
  proveedorId: number;
  proveedorNombre: string;
  proveedorNit: string | null;
  proveedorTelefono: string | null;
  proveedorEmail: string | null;
  proveedorDireccion: string | null;
  fecha: string;
  subtotal: string;
  descuento: string;
  total: string;
  estado: string;
  observacion: string | null;
  detalles: Array<{
    id: number;
    presentacionId: number;
    cantidad: number;
    precioUnitario: string;
    subtotal: string;
    codigo: string;
    cantidadPresentacion: string;
    unidadMedida: string;
    productoNombre: string;
    productoAbreviacion: string;
  }>;
};

export type PurchaseCreatePayload = {
  proveedorId: number;
  fecha?: string;
  observacion?: string | null;
  detalles: Array<{
    presentacionId: number;
    cantidad: number;
    precioUnitario: string;
  }>;
};

export type Customer = {
  id: number;
  nombre: string;
  nitCi: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
};

export type CustomerFormState = {
  nombre: string;
  nitCi: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
};

export type Sale = {
  id: number;
  numero: string;
  clienteId: number | null;
  clienteNombre: string | null;
  fecha: string;
  subtotal: string;
  descuentoTotal: string;
  total: string;
  estado: string;
  observacion: string | null;
  lineas: number;
};

export type SaleDetail = {
  id: number;
  numero: string;
  clienteId: number | null;
  clienteNombre: string | null;
  clienteNitCi: string | null;
  clienteTelefono: string | null;
  clienteEmail: string | null;
  clienteDireccion: string | null;
  fecha: string;
  subtotal: string;
  descuentoTotal: string;
  total: string;
  estado: string;
  observacion: string | null;
  detalles: Array<{
    id: number;
    presentacionId: number;
    cantidad: number;
    tipoPrecio: "PVP" | "CONSIGNACION" | "CONTADO" | "MAYORISTA";
    precioUnitario: string;
    descuentoPorcentaje: string;
    descuentoMonto: string;
    subtotal: string;
    codigo: string;
    cantidadPresentacion: string;
    unidadMedida: string;
    productoNombre: string;
    productoAbreviacion: string;
  }>;
};

export type SaleCreatePayload = {
  clienteId: number | null;
  fecha?: string;
  tipoPrecio: "PVP" | "CONSIGNACION" | "CONTADO" | "MAYORISTA";
  observacion?: string | null;
  detalles: Array<{
    presentacionId: number;
    cantidad: number;
    descuentoPorcentaje?: string;
    tipoPrecio?: "PVP" | "CONSIGNACION" | "CONTADO" | "MAYORISTA";
  }>;
};

export type ReportFilters = {
  from?: string;
  to?: string;
  proveedorId?: string;
  clienteId?: string;
  tipoPrecio?: string;
  categoriaId?: string;
  estado?: string;
};

export type PurchasesReport = {
  rows: Array<{
    id: number;
    numero: string;
    fecha: string;
    proveedorId: number;
    proveedorNombre: string;
    subtotal: string;
    descuento: string;
    total: string;
    estado: string;
    presentacionId: number;
    codigo: string;
    cantidadPresentacion: string;
    unidadMedida: string;
    productoNombre: string;
    productoAbreviacion: string;
    cantidad: number;
    precioUnitario: string;
    detalleSubtotal: string;
  }>;
  summary: {
    cantidadCompras: number;
    totalCompras: string;
    porProveedor: Array<{ proveedorId: number; proveedorNombre: string; total: string; count: number }>;
  };
};

export type SalesReport = {
  rows: Array<{
    id: number;
    numero: string;
    fecha: string;
    clienteId: number | null;
    clienteNombre: string | null;
    tipoPrecio: string;
    presentacionId: number;
    codigo: string;
    cantidadPresentacion: string;
    unidadMedida: string;
    productoNombre: string;
    cantidad: number;
    precioUnitario: string;
    descuentoPorcentaje: string;
    descuentoMonto: string;
    detalleSubtotal: string;
    ventaSubtotal: string;
    ventaDescuentoTotal: string;
    ventaTotal: string;
  }>;
  summary: {
    cantidadVentas: number;
    unidadesVendidas: number;
    totalDescuentos: string;
    totalVentas: string;
  };
};

export type InventoryReport = {
  rows: Array<{
    id: number;
    codigo: string;
    productoNombre: string;
    productoAbreviacion: string;
    categoriaId: number | null;
    categoriaNombre: string | null;
    cantidad: string;
    unidadMedida: string;
    pvp: string;
    stockActual: number;
    stockMinimo: number;
    activo: boolean;
    productoActivo: boolean;
  }>;
  summary: {
    totalPresentaciones: number;
    sinStock: number;
    bajoStock: number;
    normalStock: number;
  };
};

export type ProductsReport = {
  rows: Array<{
    id: number;
    productoId: number;
    codigo: string;
    cantidad: string;
    unidadMedida: string;
    pvp: string;
    stockActual: number;
    stockMinimo: number;
    activo: boolean;
    productoNombre: string;
    productoAbreviacion: string;
    categoriaNombre: string | null;
    categoriaId: number | null;
    productoActivo: boolean;
    ultimoPrecioCompra: string | null;
  }>;
  summary: {
    totalProductos: number;
    totalPresentaciones: number;
    sinStock: number;
    bajoStock: number;
  };
};

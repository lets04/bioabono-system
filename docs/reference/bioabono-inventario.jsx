import React, { useState, useMemo } from "react";
import {
  Leaf, LayoutDashboard, Package, Truck, Users, ArrowDownToLine,
  ArrowUpFromLine, ClipboardList, BarChart3, Plus, Pencil, Trash2, X,
  Search, Printer, AlertTriangle, ChevronDown, Sprout
} from "lucide-react";

/* ---------- Datos iniciales (semilla) ---------- */

const seedProducts = [
  { id: 1, name: "Humus de Lombriz", category: "Abono sólido", unit: "kg", stock: 120, minStock: 30, price: 8.5 },
  { id: 2, name: "Compost Orgánico", category: "Abono sólido", unit: "kg", stock: 85, minStock: 25, price: 6.0 },
  { id: 3, name: "Biol Fermentado", category: "Abono líquido", unit: "L", stock: 40, minStock: 20, price: 12.0 },
  { id: 4, name: "Guano de Isla", category: "Abono sólido", unit: "kg", stock: 15, minStock: 20, price: 15.0 },
  { id: 5, name: "Bokashi", category: "Abono sólido", unit: "kg", stock: 60, minStock: 15, price: 9.0 },
  { id: 6, name: "Extracto de Algas", category: "Abono líquido", unit: "L", stock: 22, minStock: 10, price: 18.5 },
  { id: 7, name: "Melaza Orgánica", category: "Insumo", unit: "L", stock: 30, minStock: 10, price: 7.5 },
  { id: 8, name: "Ceniza Vegetal", category: "Abono sólido", unit: "kg", stock: 50, minStock: 15, price: 4.0 },
];

const seedSuppliers = [
  { id: 1, name: "Agroinsumos del Valle", contact: "Rosa Mamani", phone: "945011223" },
  { id: 2, name: "Lombricultura San Isidro", contact: "Pedro Quispe", phone: "941223344" },
  { id: 3, name: "BioInsumos Cochabamba", contact: "Elena Rojas", phone: "967889900" },
];

const seedClients = [
  { id: 1, name: "Vivero Flora Bella", doc: "5551234", phone: "700111222" },
  { id: 2, name: "Agropecuaria Los Andes", doc: "8889991", phone: "700333444" },
  { id: 3, name: "Cliente Mostrador", doc: "00000000", phone: "-" },
];

const todayStr = () =>
  new Date().toLocaleDateString("es-BO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const money = (n) => `Bs. ${Number(n).toFixed(2)}`;

/* ---------- Bloques pequeños de UI ---------- */

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-card ${wide ? "wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone, icon }) {
  return (
    <div className={`stat-card tone-${tone || "green"}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}

/* ---------- App principal ---------- */

export default function BioabonoInventario() {
  const [view, setView] = useState("home");
  const [products, setProducts] = useState(seedProducts);
  const [suppliers, setSuppliers] = useState(seedSuppliers);
  const [clients, setClients] = useState(seedClients);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [lastBoleta, setLastBoleta] = useState(null);

  const lowStock = products.filter((p) => p.stock <= p.minStock);
  const salesToday = sales.reduce((a, s) => a + s.total, 0);
  const purchasesToday = purchases.reduce((a, p) => a + p.total, 0);

  const nav = [
    { id: "home", label: "Inicio", icon: <LayoutDashboard size={18} /> },
    { id: "productos", label: "Productos", icon: <Package size={18} /> },
    { id: "proveedores", label: "Proveedores", icon: <Truck size={18} /> },
    { id: "clientes", label: "Clientes", icon: <Users size={18} /> },
    { id: "compras", label: "Registrar compra", icon: <ArrowDownToLine size={18} /> },
    { id: "ventas", label: "Registrar venta", icon: <ArrowUpFromLine size={18} /> },
    { id: "inventario", label: "Inventario", icon: <ClipboardList size={18} /> },
    { id: "reportes", label: "Reportes", icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="app-shell">
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sprout size={22} /></div>
          <div>
            <div className="brand-name">BIOABONO</div>
            <div className="brand-tag">100% Orgánico y Ecológico</div>
          </div>
        </div>
        <nav className="nav-list">
          {nav.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${view === n.id ? "active" : ""}`}
              onClick={() => setView(n.id)}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="foot-avatar">A</div>
          <div>
            <div className="foot-name">Admin</div>
            <div className="foot-role">Encargado de almacén</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">
              {nav.find((n) => n.id === view)?.label}
            </div>
            <div className="topbar-date">{todayStr()}</div>
          </div>
          {lowStock.length > 0 && (
            <div className="alert-pill" onClick={() => setView("inventario")}>
              <AlertTriangle size={15} />
              {lowStock.length} producto{lowStock.length > 1 ? "s" : ""} con stock bajo
            </div>
          )}
        </header>

        <div className="content">
          {view === "home" && (
            <Home
              products={products}
              lowStockCount={lowStock.length}
              salesToday={salesToday}
              purchasesToday={purchasesToday}
              salesCount={sales.length}
              goto={setView}
            />
          )}

          {view === "productos" && (
            <ProductsView products={products} setProducts={setProducts} />
          )}

          {view === "proveedores" && (
            <PeopleView
              title="Proveedores"
              records={suppliers}
              setRecords={setSuppliers}
              fields={[
                { key: "name", label: "Nombre / Razón social" },
                { key: "contact", label: "Persona de contacto" },
                { key: "phone", label: "Teléfono" },
              ]}
            />
          )}

          {view === "clientes" && (
            <PeopleView
              title="Clientes"
              records={clients}
              setRecords={setClients}
              fields={[
                { key: "name", label: "Nombre / Razón social" },
                { key: "doc", label: "DNI / NIT" },
                { key: "phone", label: "Teléfono" },
              ]}
            />
          )}

          {view === "compras" && (
            <PurchaseView
              products={products}
              setProducts={setProducts}
              suppliers={suppliers}
              purchases={purchases}
              setPurchases={setPurchases}
            />
          )}

          {view === "ventas" && (
            <SaleView
              products={products}
              setProducts={setProducts}
              clients={clients}
              sales={sales}
              setSales={setSales}
              setLastBoleta={setLastBoleta}
            />
          )}

          {view === "inventario" && <InventoryView products={products} />}

          {view === "reportes" && (
            <ReportsView purchases={purchases} sales={sales} />
          )}
        </div>
      </main>

      {lastBoleta && (
        <BoletaModal boleta={lastBoleta} onClose={() => setLastBoleta(null)} />
      )}
    </div>
  );
}

/* ---------- Vista: Inicio ---------- */

function Home({ products, lowStockCount, salesToday, purchasesToday, salesCount, goto }) {
  const modules = [
    { id: "productos", label: "Productos", icon: <Package size={26} /> },
    { id: "proveedores", label: "Proveedores", icon: <Truck size={26} /> },
    { id: "clientes", label: "Clientes", icon: <Users size={26} /> },
    { id: "compras", label: "Registrar compra", icon: <ArrowDownToLine size={26} /> },
    { id: "ventas", label: "Registrar venta", icon: <ArrowUpFromLine size={26} /> },
    { id: "inventario", label: "Inventario", icon: <ClipboardList size={26} /> },
  ];

  return (
    <div>
      <div className="stats-row">
        <StatCard label="Productos en catálogo" value={products.length} icon={<Package size={20} />} tone="green" />
        <StatCard label="Con stock bajo" value={lowStockCount} icon={<AlertTriangle size={20} />} tone="warn" />
        <StatCard label="Ventas registradas hoy" value={salesCount} icon={<ArrowUpFromLine size={20} />} tone="olive" />
        <StatCard label="Total vendido hoy" value={money(salesToday)} icon={<Leaf size={20} />} tone="green" />
      </div>

      <div className="section-heading">Accesos directos</div>
      <div className="module-grid">
        {modules.map((m) => (
          <button key={m.id} className="module-card" onClick={() => goto(m.id)}>
            <div className="module-icon">{m.icon}</div>
            <div className="module-label">{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Vista: Productos ---------- */

function ProductsView({ products, setProducts }) {
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const save = (data) => {
    if (data.id) {
      setProducts(products.map((p) => (p.id === data.id ? data : p)));
    } else {
      const id = Math.max(0, ...products.map((p) => p.id)) + 1;
      setProducts([...products, { ...data, id, stock: Number(data.stock) || 0 }]);
    }
    setEditing(null);
  };

  const remove = (id) => setProducts(products.filter((p) => p.id !== id));

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Buscar producto..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => setEditing({ name: "", category: "", unit: "kg", stock: 0, minStock: 5, price: 0 })}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Producto</th><th>Categoría</th><th>Unidad</th><th>Stock</th><th>Precio</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className={p.stock <= p.minStock ? "row-warn" : ""}>
                <td className="cell-strong">{p.name}</td>
                <td>{p.category}</td>
                <td>{p.unit}</td>
                <td>{p.stock}</td>
                <td>{money(p.price)}</td>
                <td className="row-actions">
                  <button className="icon-btn" onClick={() => setEditing(p)}><Pencil size={15} /></button>
                  <button className="icon-btn danger" onClick={() => remove(p.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6}><EmptyState text="No se encontraron productos." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? "Editar producto" : "Nuevo producto"} onClose={() => setEditing(null)}>
          <ProductForm data={editing} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

function ProductForm({ data, onSave }) {
  const [form, setForm] = useState(data);
  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <form className="form-grid" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <label>Nombre
        <input required value={form.name} onChange={(e) => set("name", e.target.value)} />
      </label>
      <label>Categoría
        <input value={form.category} onChange={(e) => set("category", e.target.value)} />
      </label>
      <div className="form-row">
        <label>Unidad
          <select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
            <option value="kg">kg</option>
            <option value="L">L</option>
            <option value="saco">saco</option>
            <option value="unidad">unidad</option>
          </select>
        </label>
        <label>Stock mínimo
          <input type="number" min="0" value={form.minStock} onChange={(e) => set("minStock", Number(e.target.value))} />
        </label>
      </div>
      <div className="form-row">
        <label>Stock actual
          <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
        </label>
        <label>Precio de venta (Bs.)
          <input type="number" min="0" step="0.1" value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
        </label>
      </div>
      <button className="btn-primary full" type="submit">Guardar producto</button>
    </form>
  );
}

/* ---------- Vista genérica: Proveedores / Clientes ---------- */

function PeopleView({ title, records, setRecords, fields }) {
  const [editing, setEditing] = useState(null);

  const save = (data) => {
    if (data.id) {
      setRecords(records.map((r) => (r.id === data.id ? data : r)));
    } else {
      const id = Math.max(0, ...records.map((r) => r.id)) + 1;
      setRecords([...records, { ...data, id }]);
    }
    setEditing(null);
  };
  const remove = (id) => setRecords(records.filter((r) => r.id !== id));
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, ""]));

  return (
    <div>
      <div className="toolbar">
        <div className="section-heading no-pad">{title}</div>
        <button className="btn-primary" onClick={() => setEditing(blank())}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              {fields.map((f) => <th key={f.key}>{f.label}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                {fields.map((f, i) => (
                  <td key={f.key} className={i === 0 ? "cell-strong" : ""}>{r[f.key]}</td>
                ))}
                <td className="row-actions">
                  <button className="icon-btn" onClick={() => setEditing(r)}><Pencil size={15} /></button>
                  <button className="icon-btn danger" onClick={() => remove(r.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={fields.length + 1}><EmptyState text="Todavía no hay registros." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? `Editar ${title.toLowerCase()}` : `Nuevo ${title.toLowerCase().slice(0, -1)}`} onClose={() => setEditing(null)}>
          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); save(editing); }}>
            {fields.map((f) => (
              <label key={f.key}>{f.label}
                <input required value={editing[f.key]} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
              </label>
            ))}
            <button className="btn-primary full" type="submit">Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Vista: Registrar compra ---------- */

function PurchaseView({ products, setProducts, suppliers, purchases, setPurchases }) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [lines, setLines] = useState([{ productId: products[0]?.id, qty: 1, cost: products[0]?.price || 0 }]);

  const addLine = () => setLines([...lines, { productId: products[0]?.id, qty: 1, cost: products[0]?.price || 0 }]);
  const updateLine = (i, key, val) => {
    const next = [...lines];
    next[i] = { ...next[i], [key]: val };
    setLines(next);
  };
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));

  const total = lines.reduce((a, l) => a + Number(l.qty) * Number(l.cost), 0);

  const confirm = () => {
    setProducts(products.map((p) => {
      const line = lines.find((l) => Number(l.productId) === p.id);
      return line ? { ...p, stock: p.stock + Number(line.qty) } : p;
    }));
    const supplier = suppliers.find((s) => Number(s.id) === Number(supplierId));
    setPurchases([...purchases, {
      id: purchases.length + 1,
      date: todayStr(),
      supplier: supplier?.name || "—",
      items: lines.map((l) => ({ ...l, name: products.find((p) => p.id === Number(l.productId))?.name })),
      total,
    }]);
    setLines([{ productId: products[0]?.id, qty: 1, cost: products[0]?.price || 0 }]);
  };

  return (
    <div className="panel-card">
      <div className="section-heading no-pad">Registrar compra a proveedor</div>
      <label className="field-block">Proveedor
        <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>

      <div className="line-items">
        {lines.map((l, i) => (
          <div className="line-item" key={i}>
            <select value={l.productId} onChange={(e) => updateLine(i, "productId", e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" value={l.qty} onChange={(e) => updateLine(i, "qty", e.target.value)} placeholder="Cant." />
            <input type="number" min="0" step="0.1" value={l.cost} onChange={(e) => updateLine(i, "cost", e.target.value)} placeholder="Costo unit." />
            <span className="line-total">{money(Number(l.qty) * Number(l.cost))}</span>
            <button className="icon-btn danger" onClick={() => removeLine(i)}><Trash2 size={15} /></button>
          </div>
        ))}
        <button className="btn-ghost" onClick={addLine}><Plus size={15} /> Agregar producto</button>
      </div>

      <div className="panel-foot">
        <div className="total-label">Total a pagar: <strong>{money(total)}</strong></div>
        <button className="btn-primary" onClick={confirm}>Confirmar compra</button>
      </div>
    </div>
  );
}

/* ---------- Vista: Registrar venta / Boleta ---------- */

function SaleView({ products, setProducts, clients, sales, setSales, setLastBoleta }) {
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [lines, setLines] = useState([{ productId: products[0]?.id, qty: 1 }]);
  const [error, setError] = useState("");

  const addLine = () => setLines([...lines, { productId: products[0]?.id, qty: 1 }]);
  const updateLine = (i, key, val) => {
    const next = [...lines];
    next[i] = { ...next[i], [key]: val };
    setLines(next);
  };
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));

  const detailed = lines.map((l) => {
    const prod = products.find((p) => p.id === Number(l.productId));
    return { ...l, name: prod?.name, price: prod?.price || 0, available: prod?.stock || 0 };
  });
  const subtotal = detailed.reduce((a, l) => a + Number(l.qty) * l.price, 0);
  const perc = subtotal * 0.02;
  const total = subtotal + perc;

  const confirm = () => {
    const overSold = detailed.find((l) => Number(l.qty) > l.available);
    if (overSold) {
      setError(`No hay suficiente stock de "${overSold.name}" (disponible: ${overSold.available}).`);
      return;
    }
    setError("");
    setProducts(products.map((p) => {
      const line = detailed.find((l) => Number(l.productId) === p.id);
      return line ? { ...p, stock: p.stock - Number(line.qty) } : p;
    }));
    const client = clients.find((c) => Number(c.id) === Number(clientId));
    const boleta = {
      number: sales.length + 1,
      date: todayStr(),
      client: client?.name || "Cliente mostrador",
      doc: client?.doc || "-",
      items: detailed,
      subtotal, perc, total,
    };
    setSales([...sales, { id: boleta.number, date: boleta.date, client: boleta.client, total }]);
    setLastBoleta(boleta);
    setLines([{ productId: products[0]?.id, qty: 1 }]);
  };

  return (
    <div className="panel-card">
      <div className="section-heading no-pad">Registrar venta</div>
      <label className="field-block">Cliente
        <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <div className="line-items">
        {lines.map((l, i) => {
          const prod = products.find((p) => p.id === Number(l.productId));
          return (
            <div className="line-item" key={i}>
              <select value={l.productId} onChange={(e) => updateLine(i, "productId", e.target.value)}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock} {p.unit} disp.)</option>)}
              </select>
              <input type="number" min="1" value={l.qty} onChange={(e) => updateLine(i, "qty", e.target.value)} placeholder="Cant." />
              <span className="line-total">{money((prod?.price || 0) * Number(l.qty))}</span>
              <button className="icon-btn danger" onClick={() => removeLine(i)}><Trash2 size={15} /></button>
            </div>
          );
        })}
        <button className="btn-ghost" onClick={addLine}><Plus size={15} /> Agregar producto</button>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="totals-box">
        <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div><span>Perc. 2%</span><span>{money(perc)}</span></div>
        <div className="grand"><span>Total</span><span>{money(total)}</span></div>
      </div>

      <div className="panel-foot">
        <div />
        <button className="btn-primary" onClick={confirm}>Generar boleta de venta</button>
      </div>
    </div>
  );
}

function BoletaModal({ boleta, onClose }) {
  return (
    <Modal title="Boleta de venta" onClose={onClose} wide>
      <div className="boleta">
        <div className="boleta-head">
          <div>
            <div className="boleta-brand">BIOABONO</div>
            <div className="boleta-sub">100% Orgánico y Ecológico</div>
          </div>
          <div className="boleta-num">
            <div>N° {String(boleta.number).padStart(4, "0")}</div>
            <div className="boleta-date">{boleta.date}</div>
          </div>
        </div>
        <div className="boleta-client">
          <div><strong>Cliente:</strong> {boleta.client}</div>
          <div><strong>Doc.:</strong> {boleta.doc}</div>
        </div>
        <table className="boleta-table">
          <thead>
            <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr>
          </thead>
          <tbody>
            {boleta.items.map((it, i) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td>{it.qty}</td>
                <td>{money(it.price)}</td>
                <td>{money(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="boleta-totals">
          <div><span>Subtotal</span><span>{money(boleta.subtotal)}</span></div>
          <div><span>Perc. 2%</span><span>{money(boleta.perc)}</span></div>
          <div className="grand"><span>Total</span><span>{money(boleta.total)}</span></div>
        </div>
        <button className="btn-primary full" onClick={() => window.print()}>
          <Printer size={16} /> Imprimir
        </button>
      </div>
    </Modal>
  );
}

/* ---------- Vista: Inventario ---------- */

function InventoryView({ products }) {
  const [query, setQuery] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => a.stock / (a.minStock || 1) - b.stock / (b.minStock || 1));

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Buscar en inventario..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const low = p.stock <= p.minStock;
              return (
                <tr key={p.id} className={low ? "row-warn" : ""}>
                  <td className="cell-strong">{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.stock} {p.unit}</td>
                  <td>{p.minStock} {p.unit}</td>
                  <td>
                    <span className={`badge ${low ? "badge-warn" : "badge-ok"}`}>
                      {low ? "Reponer" : "Suficiente"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Vista: Reportes ---------- */

function ReportsView({ purchases, sales }) {
  const totalSales = sales.reduce((a, s) => a + s.total, 0);
  const totalPurchases = purchases.reduce((a, p) => a + p.total, 0);

  return (
    <div>
      <div className="stats-row">
        <StatCard label="Total en ventas" value={money(totalSales)} icon={<ArrowUpFromLine size={20} />} tone="green" />
        <StatCard label="Total en compras" value={money(totalPurchases)} icon={<ArrowDownToLine size={20} />} tone="olive" />
      </div>

      <div className="section-heading">Ventas registradas</div>
      <div className="table-card">
        <table>
          <thead><tr><th>N°</th><th>Fecha</th><th>Cliente</th><th>Total</th></tr></thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}><td>{String(s.id).padStart(4, "0")}</td><td>{s.date}</td><td>{s.client}</td><td>{money(s.total)}</td></tr>
            ))}
            {sales.length === 0 && <tr><td colSpan={4}><EmptyState text="Aún no se registraron ventas." /></td></tr>}
          </tbody>
        </table>
      </div>

      <div className="section-heading">Compras registradas</div>
      <div className="table-card">
        <table>
          <thead><tr><th>N°</th><th>Fecha</th><th>Proveedor</th><th>Total</th></tr></thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}><td>{String(p.id).padStart(4, "0")}</td><td>{p.date}</td><td>{p.supplier}</td><td>{money(p.total)}</td></tr>
            ))}
            {purchases.length === 0 && <tr><td colSpan={4}><EmptyState text="Aún no se registraron compras." /></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Estilos ---------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --verde-oscuro: #24421f;
  --verde-medio: #4f8a2f;
  --verde-claro: #a9d17a;
  --oliva: #6b5b21;
  --crema: #f8f7f0;
  --carbon: #2b2b24;
  --rojo: #b4482f;
}

* { box-sizing: border-box; }

.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--crema);
  color: var(--carbon);
  font-family: 'Inter', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 232px;
  flex-shrink: 0;
  background: linear-gradient(160deg, var(--verde-oscuro), #16290f 85%);
  color: #eef4e6;
  display: flex;
  flex-direction: column;
  padding: 22px 16px;
}
.brand { display: flex; gap: 10px; align-items: center; padding: 4px 6px 22px; border-bottom: 1px solid rgba(255,255,255,0.12); margin-bottom: 14px; }
.brand-mark { background: rgba(255,255,255,0.12); border-radius: 30% 70% 65% 35% / 55% 40% 60% 45%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; color: var(--verde-claro); }
.brand-name { font-family: 'Fraunces', serif; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; }
.brand-tag { font-size: 10.5px; opacity: 0.75; margin-top: 1px; }

.nav-list { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  border: none; background: transparent; color: #d9e4cd;
  padding: 10px 12px; border-radius: 8px; font-size: 13.5px;
  text-align: left; cursor: pointer; font-family: inherit;
  transition: background 0.15s ease;
}
.nav-item:hover { background: rgba(255,255,255,0.08); }
.nav-item.active { background: var(--verde-medio); color: #fff; font-weight: 600; }

.sidebar-foot { display: flex; gap: 10px; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.12); margin-top: 10px; }
.foot-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--verde-claro); color: var(--verde-oscuro); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.foot-name { font-size: 13px; font-weight: 600; }
.foot-role { font-size: 11px; opacity: 0.7; }

/* Main */
.main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px 10px; }
.topbar-title { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 600; color: var(--verde-oscuro); }
.topbar-date { font-size: 12.5px; color: #6b6a5e; text-transform: capitalize; margin-top: 2px; }
.alert-pill { display: flex; align-items: center; gap: 6px; background: #fbe9dd; color: #8a3d1e; padding: 7px 13px; border-radius: 20px; font-size: 12.5px; font-weight: 600; cursor: pointer; }

.content { padding: 12px 32px 40px; flex: 1; }

.section-heading { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 600; color: var(--verde-oscuro); margin: 26px 0 12px; }
.section-heading.no-pad { margin: 0; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-top: 6px; }
.stat-card { background: #fff; border: 1px solid #e6e2d3; border-radius: 12px; padding: 16px; display: flex; gap: 12px; align-items: center; }
.stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tone-green .stat-icon { background: #e6f0da; color: var(--verde-medio); }
.tone-warn .stat-icon { background: #fbe9dd; color: #b4602f; }
.tone-olive .stat-icon { background: #ece5cf; color: var(--oliva); }
.stat-value { font-size: 20px; font-weight: 700; color: var(--carbon); font-family: 'Fraunces', serif; }
.stat-label { font-size: 12px; color: #7a7965; margin-top: 1px; }

/* Module grid (home shortcuts) */
.module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; }
.module-card {
  background: #fff; border: 1px solid #e6e2d3; padding: 22px 14px;
  border-radius: 26px 12px 26px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  cursor: pointer; font-family: inherit; transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.module-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(36,66,31,0.1); }
.module-icon { color: var(--verde-medio); }
.module-label { font-size: 13.5px; font-weight: 600; color: var(--carbon); text-align: center; }

/* Toolbar / search */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.search-box { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #ddd8c4; border-radius: 8px; padding: 8px 12px; min-width: 220px; color: #8a8873; }
.search-box input { border: none; outline: none; font-size: 13.5px; width: 100%; font-family: inherit; }

/* Buttons */
.btn-primary { display: inline-flex; align-items: center; gap: 6px; background: var(--verde-medio); color: #fff; border: none; padding: 9px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; }
.btn-primary:hover { background: #427826; }
.btn-primary.full { width: 100%; justify-content: center; margin-top: 6px; }
.btn-ghost { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 1.5px dashed #b9c9a3; color: var(--verde-oscuro); padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.icon-btn { border: none; background: #f1efe4; padding: 6px; border-radius: 6px; cursor: pointer; color: #555; display: inline-flex; }
.icon-btn:hover { background: #e6e2d3; }
.icon-btn.danger { color: var(--rojo); }

/* Table */
.table-card { background: #fff; border: 1px solid #e6e2d3; border-radius: 12px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
th { text-align: left; padding: 11px 16px; background: #f1efe0; color: var(--verde-oscuro); font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.3px; }
td { padding: 11px 16px; border-top: 1px solid #eee9d8; color: #3a3a30; }
.cell-strong { font-weight: 600; color: var(--carbon); }
.row-warn td { background: #fdf3ea; }
.row-actions { display: flex; gap: 6px; }
.badge { font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
.badge-ok { background: #e6f0da; color: #3d6b23; }
.badge-warn { background: #fbe1cf; color: #9a4620; }

.empty-state { text-align: center; padding: 26px; color: #9a9884; font-size: 13px; }

/* Panels (compras/ventas) */
.panel-card { background: #fff; border: 1px solid #e6e2d3; border-radius: 14px; padding: 24px; max-width: 640px; }
.field-block { display: flex; flex-direction: column; gap: 5px; font-size: 12.5px; font-weight: 600; color: #57563f; margin-bottom: 16px; }
.field-block select, .field-block input { padding: 9px 10px; border-radius: 7px; border: 1px solid #dcd7c3; font-size: 13.5px; font-family: inherit; }
.line-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.line-item { display: grid; grid-template-columns: 1fr 70px 100px 70px auto; gap: 8px; align-items: center; }
.line-item select, .line-item input { padding: 8px 9px; border-radius: 7px; border: 1px solid #dcd7c3; font-size: 13px; font-family: inherit; }
.line-total { font-weight: 600; font-size: 13px; text-align: right; color: var(--verde-oscuro); }
.panel-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; }
.total-label { font-size: 14px; color: #3a3a30; }
.error-text { color: var(--rojo); font-size: 13px; font-weight: 600; margin: 6px 0; }

.totals-box { margin-top: 10px; border-top: 1px dashed #ddd8c4; padding-top: 10px; }
.totals-box div { display: flex; justify-content: space-between; font-size: 13.5px; padding: 3px 0; color: #57563f; }
.totals-box .grand { font-size: 15px; font-weight: 700; color: var(--verde-oscuro); border-top: 1px solid #ddd8c4; margin-top: 4px; padding-top: 8px; }

/* Form grid (modals) */
.form-grid { display: flex; flex-direction: column; gap: 12px; }
.form-grid label { display: flex; flex-direction: column; gap: 5px; font-size: 12.5px; font-weight: 600; color: #57563f; }
.form-grid input, .form-grid select { padding: 9px 10px; border-radius: 7px; border: 1px solid #dcd7c3; font-size: 13.5px; font-family: inherit; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(20,30,15,0.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
.modal-card { background: #fff; border-radius: 14px; width: 100%; max-width: 420px; max-height: 88vh; overflow-y: auto; }
.modal-card.wide { max-width: 560px; }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #eee9d8; }
.modal-head h3 { font-family: 'Fraunces', serif; font-size: 16px; color: var(--verde-oscuro); margin: 0; }
.modal-body { padding: 20px; }

/* Boleta */
.boleta-head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--verde-oscuro); padding-bottom: 12px; margin-bottom: 12px; }
.boleta-brand { font-family: 'Fraunces', serif; font-weight: 700; font-size: 20px; color: var(--oliva); }
.boleta-sub { font-size: 11px; color: #6b6a5e; }
.boleta-num { text-align: right; font-weight: 700; color: var(--verde-oscuro); }
.boleta-date { font-size: 11px; color: #6b6a5e; font-weight: 400; margin-top: 2px; }
.boleta-client { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px; color: #3a3a30; }
.boleta-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px; }
.boleta-table th { background: #f1efe0; padding: 8px 10px; text-align: left; }
.boleta-table td { padding: 8px 10px; border-top: 1px solid #eee9d8; }
.boleta-totals div { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
.boleta-totals .grand { font-weight: 700; font-size: 15px; color: var(--verde-oscuro); border-top: 1px solid #ddd8c4; padding-top: 6px; margin-top: 4px; }

@media (max-width: 780px) {
  .sidebar { display: none; }
  .content { padding: 12px 16px 32px; }
  .topbar { padding: 16px 16px 6px; }
}
`;

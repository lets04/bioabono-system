# BIOABONO --- SISTEMA DE GESTIÓN COMERCIAL

## Documento Maestro de Requisitos, Arquitectura y Desarrollo

> **Documento principal para el agente de desarrollo.**
>
> Este documento define la funcionalidad, reglas de negocio,
> arquitectura y criterios de implementación del sistema de gestión
> comercial de BIOABONO.
>
> **Regla fundamental:** el agente debe seguir este documento como
> fuente de verdad funcional y técnica. Las referencias visuales
> adjuntas sirven para definir el diseño de la interfaz, pero no deben
> utilizarse para inventar funcionalidades, datos o reglas de negocio.

---

# 1. CONTEXTO DEL PROYECTO

BIOABONO es una empresa/tienda agrícola ubicada en Cochabamba, Bolivia,
dedicada a la comercialización de productos agrícolas, biofertilizantes
y productos relacionados.

Actualmente parte de la información comercial puede encontrarse
distribuida entre diferentes registros y medios. El sistema busca
centralizar las operaciones principales de la empresa y facilitar el
control de productos, inventario, compras, ventas, consignaciones y
consultas administrativas.

El sistema será una aplicación web.

---

# 2. OBJETIVO GENERAL

Desarrollar un sistema web de gestión comercial para BIOABONO que
permita centralizar la información y controlar las operaciones
principales del negocio.

El sistema debe permitir:

* Gestionar productos.
* Gestionar categorías.
* Gestionar proveedores.
* Gestionar clientes.
* Registrar compras.
* Registrar ventas.
* Gestionar consignaciones.
* Controlar inventario.
* Mantener un Kardex de movimientos.
* Consultar información histórica.
* Generar reportes.
* Gestionar usuarios.
* Mantener trazabilidad de operaciones.

El objetivo de V1 es construir un sistema funcional, mantenible y
sencillo, evitando sobreingeniería.

---

# 3. ALCANCE DE V1

## Incluido

* Autenticación.
* Usuarios.
* Roles ADMIN y EMPLEADO.
* Categorías.
* Productos.
* Inventario.
* Kardex.
* Proveedores.
* Clientes.
* Compras.
* Ventas.
* Consignaciones.
* Dashboard.
* Reportes.
* Auditoría básica.

## Fuera del alcance inicial

No implementar en V1 salvo una nueva decisión explícita:

* SIAT.
* Facturación electrónica.
* Microservicios.
* Docker/Kubernetes como requisito.
* Kafka.
* RabbitMQ.
* Redis.
* CQRS complejo.
* Aplicación móvil.
* Aplicación de escritorio.
* IoT.
* Automatización externa.
* Sistema configurable de permisos.
* Multiempresa.
* Contabilidad completa.

La arquitectura debe permitir futuras ampliaciones sin implementar
prematuramente funcionalidades futuras.

---

# 4. ARQUITECTURA GENERAL

Se utilizará una arquitectura web de **Modular Monolith**.

```text
┌──────────────────────────────────────┐
│              FRONTEND                │
│ React + TypeScript + Vite            │
│ Tailwind CSS + Lucide React          │
│ TanStack Query                       │
└──────────────────┬───────────────────┘
                   │
                   │ HTTPS / REST / JSON
                   ▼
┌──────────────────────────────────────┐
│               BACKEND                │
│ Node.js + Elysia + TypeScript        │
│ Modular Monolith                     │
└──────────────────┬───────────────────┘
                   │
                   │ Drizzle ORM
                   ▼
┌──────────────────────────────────────┐
│             PostgreSQL               │
└──────────────────────────────────────┘
```

### Reglas

* El frontend nunca se conecta directamente a PostgreSQL.
* Todas las operaciones pasan por el backend.
* Las reglas de negocio deben estar en el backend.
* El frontend puede realizar validaciones de UX, pero el backend debe
  validar nuevamente.
* Las operaciones críticas deben utilizar transacciones de base de
  datos.

---

# 5. STACK TECNOLÓGICO

## Frontend

* React.
* TypeScript.
* Vite.
* Tailwind CSS.
* Lucide React.
* TanStack Query.

## Backend

* Node.js.
* Elysia.
* TypeScript.
* Drizzle ORM.
* pg.

## Base de datos

* PostgreSQL.

## Desarrollo

* Git.
* GitHub.
* npm.
* pgAdmin 4.

## Producción

La base de datos de producción utilizará PostgreSQL proporcionado por
GCOM Global Hosting.

---

# 6. ESTRUCTURA DEL PROYECTO

El proyecto debe estar claramente dividido entre frontend y backend.

```text
bioabono-sistema/
│
├── frontend/
│   ├── src/
│   └── ...
│
├── backend/
│   ├── src/
│   └── ...
│
├── docs/
│
├── README.md
└── .gitignore
```

No mezclar responsabilidades del frontend y backend.

---

# 7. ROLES DEL SISTEMA

Solo existirán dos roles:

```text
ROLE_ADMIN
ROLE_EMPLEADO
```

No se implementará un sistema de permisos configurable por el
administrador.

---

# 8. ROL ADMINISTRADOR

El ADMIN tendrá principalmente funciones de **supervisión, control y
consulta**.

## 8.1 Usuarios

El ADMIN puede:

* Crear empleados.
* Editar empleados.
* Activar empleados.
* Desactivar empleados.
* Consultar usuarios.

No existe gestión de permisos individuales.

## 8.2 Dashboard

El ADMIN puede consultar:

* Indicadores generales.
* Ventas.
* Compras.
* Inventario.
* Productos con stock bajo.
* Consignaciones pendientes.
* Información general del negocio.

## 8.3 Inventario

El ADMIN puede:

* Consultar productos.
* Consultar stock.
* Consultar stock mínimo.
* Identificar productos con stock bajo.

## 8.4 Kardex

El ADMIN puede:

* Consultar movimientos.
* Filtrar por producto.
* Filtrar por fecha.
* Consultar entradas.
* Consultar salidas.
* Consultar el usuario que realizó cada operación.
* Consultar referencias de las operaciones.

## 8.5 Reportes

El ADMIN puede consultar:

* Ventas.
* Compras.
* Inventario.
* Productos más vendidos.
* Productos con stock bajo.
* Consignaciones.
* Información por día.
* Información por rango de fechas.

## 8.6 Consultas

El ADMIN puede revisar información histórica de las operaciones
realizadas por los empleados.

El ADMIN no está pensado como usuario operativo de las ventas y compras
diarias. Su función principal es supervisar y consultar.

---

# 9. ROL EMPLEADO

El EMPLEADO es responsable de las operaciones diarias.

Puede:

## Productos

* Registrar productos.
* Editar productos.
* Desactivar productos.
* Consultar productos.
* Consultar precios.
* Consultar stock.

## Proveedores

* Registrar proveedores.
* Editar proveedores.
* Desactivar proveedores.
* Consultar proveedores.

## Clientes

* Registrar clientes.
* Editar clientes.
* Desactivar clientes.
* Consultar clientes.

## Compras

* Registrar compras.
* Consultar compras.
* Registrar detalles de compra.
* Registrar cantidades.
* Registrar precio unitario de compra.

## Ventas

* Registrar ventas.
* Seleccionar cliente.
* Seleccionar producto.
* Seleccionar tipo de precio.
* Aplicar descuento adicional.
* Confirmar venta.
* Consultar ventas.

## Consignaciones

* Registrar consignaciones.
* Consultar consignaciones.
* Consultar consignaciones pendientes.
* Registrar cantidades vendidas.
* Registrar cantidades devueltas.
* Liquidar consignaciones.

## Inventario

* Consultar productos.
* Consultar existencias.

Las operaciones confirmadas deben actualizar automáticamente el
inventario y registrar los movimientos correspondientes en Kardex.

---

# 10. FRONTEND

## 10.1 Responsabilidad

El frontend es responsable de:

* Interfaz de usuario.
* Navegación.
* Formularios.
* Tablas.
* Búsqueda.
* Filtros.
* Validaciones de interfaz.
* Estados de carga.
* Estados vacíos.
* Mensajes.
* Confirmaciones.
* Manejo de sesión.
* Consumo de API.
* Diseño responsive.

El frontend no contiene la fuente definitiva de las reglas de negocio.

---

# 11. REFERENCIAS VISUALES

Se proporcionaron referencias visuales de una interfaz de BIOABONO.

El agente debe **seguir el diseño visual y el lenguaje de interfaz de
las referencias**, pero no copiar literalmente su funcionalidad, datos
ficticios o reglas.

## Debe conservarse el estilo visual

* Sidebar vertical.
* Sidebar en tonos verdes oscuros.
* Identidad visual de BIOABONO.
* Fondo principal claro/crema.
* Verde como color principal.
* Elementos activos resaltados en verde.
* Tarjetas con bordes suaves y esquinas redondeadas.
* Iconos Lucide.
* Tipografía con jerarquía clara.
* Espaciado amplio y limpio.
* Tablas modernas.
* Formularios claros.
* Diseño responsive.
* Dashboard con tarjetas de indicadores.
* Accesos directos mediante tarjetas.

## No copiar de las referencias

Las referencias visuales no son fuente de verdad para:

* Datos.
* Cantidades.
* Estadísticas.
* Reglas de negocio.
* Roles.
* Permisos.
* Estructura de base de datos.
* Flujo de ventas.
* Flujo de compras.
* Flujo de consignaciones.

**Regla: imitar el lenguaje visual, no inventar la funcionalidad.**

---

# 12. DASHBOARD Y ACCESOS DIRECTOS

El Dashboard debe conservar el concepto de **Accesos directos** mostrado
en la referencia visual.

Los accesos directos deben ser tarjetas/botones visuales que permitan
navegar rápidamente hacia módulos o acciones frecuentes.

## EMPLEADO

Los accesos directos podrán incluir:

* Productos.
* Proveedores.
* Clientes.
* Registrar compra.
* Registrar venta.
* Consignaciones.
* Inventario.

## ADMIN

Los accesos directos deben adaptarse a sus funciones:

* Usuarios.
* Inventario.
* Kardex.
* Reportes.
* Consultas.

Los accesos disponibles deben depender del rol autenticado.

---

# 13. ESTRUCTURA VISUAL DE PRODUCTOS

La lista principal de productos debe ser sencilla.

No mostrar demasiada información en la tabla.

Debe mostrar:

Código   Producto     Cantidad Unidad     Stock

---

Cada fila debe poder seleccionarse.

Al hacer clic en un producto, mostrar el detalle completo.

---

# 14. PRODUCTOS

## 14.1 Una sola entidad PRODUCTO

NO crear una entidad separada `PresentacionProducto`.

Cada combinación comercial de producto/cantidad/unidad será un registro
independiente de `PRODUCTO`.

Ejemplo:

```text
AGRB-01 → Agro Biochar → 1 kg
AGRB-05 → Agro Biochar → 5 kg
AGRB-10 → Agro Biochar → 10 kg
AGRB-20 → Agro Biochar → 20 kg
```

Cada uno tiene su propio:

* Código.
* Cantidad.
* Unidad.
* Precio.
* Stock.

Esto evita complejidad innecesaria.

---

# 15. CÓDIGO DE PRODUCTO

Cada producto debe tener un código único, legible e identificable.

Se recomienda una nomenclatura corta relacionada con el nombre del
producto y su cantidad.

Ejemplos:

```text
AGRB-01
AGRB-05
AGRB-10
AGRB-20
AGEL-01
AGEL-03
AGEL-20
```

La nomenclatura final de cada producto debe mantenerse consistente.

No utilizar códigos aleatorios como principal identificador comercial
visible para el usuario.

---

# 16. UNIDADES DE MEDIDA

Las unidades de medida deben corresponder a las utilizadas en el
catálogo real de BIOABONO.

La lista de productos proporcionada por el propietario del proyecto es
la referencia para las cantidades y unidades existentes.

No inventar unidades innecesarias.

El producto tendrá:

```text
cantidad
unidad_medida
```

Ejemplos observados en el catálogo:

```text
1 kg
3 kg
5 kg
10 kg
12 kg
20 kg
25 kg
1 Tn
1 L
2 L
3 L
20 L
1000 L
```

El agente debe revisar el catálogo adjunto para utilizar las unidades
reales que correspondan a los productos cargados.

---

# 17. DATOS DEL PRODUCTO

La entidad `PRODUCTO` deberá contemplar como mínimo:

```text
id
codigo
nombre
descripcion
categoria_id
cantidad
unidad_medida
precio_compra
pvp
stock_actual
stock_minimo
activo
created_at
updated_at
```

Los nombres exactos de columnas pueden ajustarse a convenciones del
proyecto, pero no se debe eliminar información esencial sin
justificación.

---

# 18. DETALLE DEL PRODUCTO

Al seleccionar un producto desde la lista, mostrar:

## Información

* Código.
* Nombre.
* Descripción.
* Categoría.
* Cantidad.
* Unidad.

## Precios

* Precio de compra.
* PVP.
* Precio de consignación.
* Precio contado.
* Precio mayorista.

## Inventario

* Stock actual.
* Stock mínimo.

## Estado

* Activo/Inactivo.

Los precios derivados pueden mostrarse calculados a partir del PVP.

---

# 19. PRECIOS

El usuario registra directamente:

* Precio de compra.
* PVP (Precio de Venta al Público).

Los demás precios comerciales se calculan automáticamente.

## Reglas

```text
PVP = precio base

Precio de consignación = PVP × 0.80
Precio contado         = PVP × 0.75
Precio mayorista       = PVP × 0.70
```

Ejemplo:

```text
PVP = Bs. 100

Consignación = Bs. 80
Contado      = Bs. 75
Mayorista    = Bs. 70
```

No pedir al usuario que introduzca manualmente los tres precios
derivados si pueden calcularse mediante estas reglas.

---

# 20. PRECIO DE COMPRA

El producto puede mantener un `precio_compra` de referencia/actual.

Sin embargo, cada detalle de compra debe almacenar el precio unitario
real utilizado en esa operación.

Esto permite que:

```text
Producto.precio_compra
```

sea el valor actual/de referencia, mientras que:

```text
DetalleCompra.precio_unitario
```

conserva el precio histórico real de la compra.

Por ejemplo:

```text
Compra antigua → Bs. 65
Compra nueva   → Bs. 70
```

La compra antigua debe seguir mostrando Bs. 65 aunque el precio actual
del producto sea Bs. 70.

---

# 21. DESCUENTOS EN VENTAS

Los precios comerciales y el descuento adicional son conceptos
diferentes.

Primero se selecciona el tipo de precio:

```text
PVP
CONSIGNACION
CONTADO
MAYORISTA
```

Después el empleado puede aplicar un descuento adicional durante la
venta.

Ejemplo:

```text
Precio contado = Bs. 75
Descuento adicional = 5%

Precio final = Bs. 71,25
```

El sistema debe conservar en el detalle de venta:

* Precio unitario aplicado.
* Porcentaje de descuento.
* Monto de descuento.
* Subtotal resultante.

Esto garantiza que el historial de una venta no cambie si posteriormente
cambia el PVP.

El límite máximo del descuento adicional deberá ser una regla
configurable/finalizada antes de implementarlo si el negocio requiere
uno. No inventar un porcentaje máximo.

---

# 22. INVENTARIO

El inventario será controlado por producto.

Datos mínimos:

```text
stock_actual
stock_minimo
```

Regla:

**No se permite stock negativo.**

El stock debe modificarse únicamente como consecuencia de operaciones
válidas o de un mecanismo de ajuste explícitamente definido.

No permitir que el usuario simplemente cambie `stock_actual` desde una
pantalla sin dejar trazabilidad.

---

# 23. KARDEX

El Kardex representa el historial detallado de movimientos de
inventario.

Debe registrar como mínimo:

```text
id
producto_id
tipo_movimiento
cantidad
stock_anterior
stock_posterior
referencia_tipo
referencia_id
usuario_id
fecha
observacion
```

Tipos de movimiento iniciales:

```text
COMPRA
VENTA
SALIDA_A_CONSIGNACION
VENTA_CONSIGNACION
DEVOLUCION_CONSIGNACION
```

El Kardex debe permitir consultar:

* Fecha/hora.
* Producto.
* Tipo de movimiento.
* Entrada.
* Salida.
* Stock anterior.
* Stock posterior.
* Usuario.
* Referencia de operación.

---

# 24. DIFERENCIA ENTRE INVENTARIO Y KARDEX

## Inventario

Indica el estado actual.

Ejemplo:

```text
Agro Biochar 10 kg
Stock actual: 15
```

## Kardex

Indica cómo se llegó a ese stock.

Ejemplo:

```text
15/09  COMPRA   +20   Stock 50
15/09  VENTA     -5   Stock 45
16/09  VENTA     -3   Stock 42
```

No confundir ambos conceptos.

---

# 25. COMPRAS

Una compra tendrá como mínimo:

```text
id
numero
proveedor_id
usuario_id
fecha
subtotal
descuento
total
estado
observacion
created_at
updated_at
```

Los detalles:

```text
id
compra_id
producto_id
cantidad
precio_unitario
subtotal
```

Al confirmar una compra:

```text
Registrar compra
      ↓
Guardar detalles
      ↓
Aumentar inventario
      ↓
Registrar Kardex COMPRA
```

Todo debe ejecutarse en una única transacción.

Si falla una parte, debe realizarse rollback.

---

# 26. VENTAS

Una venta tendrá como mínimo:

```text
id
numero
cliente_id
usuario_id
fecha
subtotal
descuento_total
total
estado
observacion
created_at
updated_at
```

El cliente puede ser un cliente registrado o:

```text
Cliente mostrador
```

Los detalles:

```text
id
venta_id
producto_id
cantidad
tipo_precio
precio_unitario
descuento_porcentaje
descuento_monto
subtotal
```

Flujo:

```text
Seleccionar cliente
      ↓
Seleccionar producto
      ↓
Seleccionar cantidad
      ↓
Seleccionar tipo de precio
      ↓
Calcular precio
      ↓
Aplicar descuento adicional
      ↓
Validar stock
      ↓
Guardar venta
      ↓
Reducir inventario
      ↓
Registrar Kardex VENTA
```

Todo debe ejecutarse dentro de una transacción.

---

# 27. CONSIGNACIONES

La consignación es una operación diferente de una venta normal.

Concepto:

BIOABONO entrega productos a una persona o negocio para que los venda.

El cliente no paga inicialmente por todos los productos entregados.

Posteriormente:

* Los productos vendidos se cobran.
* Los productos no vendidos se devuelven.

---

# 28. ESTADOS DE CONSIGNACIÓN

Solo existirán dos estados:

```text
PENDIENTE
LIQUIDADA
```

Flujo:

```text
Nueva consignación
       ↓
    PENDIENTE
       ↓
Registrar vendidos y devueltos
       ↓
    LIQUIDADA
```

No crear estados adicionales.

---

# 29. REGISTRO DE CONSIGNACIÓN

La consignación debe contener como mínimo:

```text
id
numero
cliente_id
usuario_id
fecha_entrega
estado
observacion
created_at
updated_at
```

Los detalles:

```text
id
consignacion_id
producto_id
cantidad_entregada
cantidad_vendida
cantidad_devuelta
precio_consignacion
importe_vendido
```

---

# 30. ENTREGA EN CONSIGNACIÓN

Al crear una consignación:

1. Se selecciona el cliente.
2. Se agregan productos.
3. Se indican cantidades entregadas.
4. El sistema utiliza el precio de consignación.
5. Se registra la entrega.
6. El stock disponible se reduce.
7. Se registra `SALIDA_A_CONSIGNACION` en Kardex.
8. La consignación queda `PENDIENTE`.

La entrega en consignación no debe registrarse como una venta normal.

---

# 31. LIQUIDACIÓN DE CONSIGNACIÓN

Para liquidar una consignación se registran:

```text
cantidad_entregada
cantidad_vendida
cantidad_devuelta
```

Debe cumplirse obligatoriamente:

```text
cantidad_entregada =
cantidad_vendida + cantidad_devuelta
```

Ejemplo:

```text
Entregados: 10
Vendidos:    7
Devueltos:   3
```

Al liquidar:

```text
Productos vendidos
       ↓
VENTA_CONSIGNACION

Productos devueltos
       ↓
DEVOLUCION_CONSIGNACION
```

La consignación pasa a:

```text
LIQUIDADA
```

La cantidad vendida genera el importe que corresponde cobrar al precio
de consignación.

La cantidad devuelta vuelve a estar disponible en inventario.

---

# 32. DOCUMENTOS DE CONSIGNACIÓN

Al crear una consignación debe poder generarse un:

**Comprobante de Entrega en Consignación**

Este documento representa una entrega de productos y no una venta.

Al liquidar se debe poder generar una:

**Liquidación de Consignación**

---

# 33. CLIENTES

Datos mínimos:

```text
id
nombre
nit_ci
telefono
email
direccion
activo
created_at
updated_at
```

Un cliente puede tener:

* Ventas.
* Consignaciones.

No eliminar físicamente clientes que tengan historial relevante.
Utilizar estado activo/inactivo.

---

# 34. PROVEEDORES

Datos mínimos:

```text
id
nombre
nit
telefono
email
direccion
activo
created_at
updated_at
```

Los proveedores se relacionan con compras.

No eliminar físicamente proveedores que tengan historial relevante.
Utilizar estado activo/inactivo.

---

# 35. CATEGORÍAS

Datos mínimos:

```text
id
nombre
descripcion
activo
created_at
updated_at
```

Las categorías organizan los productos.

---

# 36. USUARIOS

Datos mínimos:

```text
id
nombre
username
password_hash
rol
activo
created_at
updated_at
```

Roles:

```text
ADMIN
EMPLEADO
```

Los usuarios inactivos no podrán iniciar sesión.

---

# 37. AUTENTICACIÓN

El sistema debe incluir:

* Inicio de sesión.
* Cierre de sesión.
* Protección de rutas.
* Protección de endpoints.
* Validación de rol.
* Contraseñas almacenadas mediante hash seguro.
* Sesión autenticada.

Nunca almacenar contraseñas en texto plano.

La implementación exacta de sesiones/JWT puede definirse técnicamente,
siempre que cumpla los requisitos de seguridad y separación de
responsabilidades.

---

# 38. AUDITORÍA

Debe existir trazabilidad de operaciones importantes.

Registrar como mínimo:

```text
id
usuario_id
accion
entidad
entidad_id
fecha
detalle
```

Acciones importantes:

* Crear/modificar/desactivar producto.
* Crear compra.
* Confirmar compra.
* Crear venta.
* Confirmar venta.
* Crear consignación.
* Liquidar consignación.
* Cambios de usuarios.
* Otras acciones críticas.

---

# 39. REPORTES

Los reportes son diferentes del Kardex.

## Reportes iniciales

* Ventas.
* Compras.
* Inventario.
* Productos más vendidos.
* Productos con stock bajo.
* Consignaciones.

## Filtros

Los reportes deben permitir:

```text
Hoy
Ayer
Esta semana
Este mes
Rango personalizado
```

El ADMIN debe poder consultar información por día y por rango de fechas.

---

# 40. DASHBOARD

## ADMIN

Mostrar indicadores y consultas útiles para supervisión, por ejemplo:

* Productos en catálogo.
* Productos con stock bajo.
* Ventas del periodo.
* Compras del periodo.
* Consignaciones pendientes.
* Información resumida del negocio.

Los valores deben provenir de la base de datos real.

No utilizar estadísticas ficticias.

## EMPLEADO

Mostrar información útil para operaciones diarias:

* Ventas realizadas.
* Productos.
* Stock.
* Consignaciones pendientes.
* Accesos directos.

---

# 41. FRONTEND --- MÓDULOS

El frontend debe contemplar, según el rol:

```text
auth/
dashboard/
products/
categories/
suppliers/
customers/
purchases/
sales/
consignations/
inventory/
kardex/
reports/
users/
```

No todos los módulos deben aparecer en el menú de todos los roles.

---

# 42. MENÚ DEL EMPLEADO

El menú debe priorizar operaciones diarias.

Propuesta:

```text
Inicio
Productos
Proveedores
Clientes
Registrar compra
Registrar venta
Consignaciones
Inventario
```

El menú puede incluir también accesos a consultas necesarias para su
trabajo, pero no debe mostrar funcionalidades administrativas que no le
corresponden.

---

# 43. MENÚ DEL ADMIN

El menú debe priorizar supervisión y control.

Propuesta:

```text
Inicio
Usuarios
Inventario
Kardex
Reportes
Consultas
```

El ADMIN debe poder consultar la información necesaria de las
operaciones del negocio sin tener que duplicar las tareas operativas del
empleado.

---

# 44. COMPONENTES DE INTERFAZ

Utilizar componentes reutilizables para:

* Sidebar.
* Header.
* Cards.
* Tables.
* Modals/Dialog.
* Forms.
* Inputs.
* Selects.
* Date pickers.
* Badges.
* Alerts.
* Confirm dialogs.
* Empty states.
* Loading states.
* Error states.

Utilizar Lucide React para iconografía.

---

# 45. TABLAS

Las tablas deben:

* Ser claras.
* Tener búsqueda cuando corresponda.
* Tener filtros cuando sean necesarios.
* Permitir seleccionar/abrir registros.
* Mostrar estados mediante badges.
* Mantener responsive design.
* Evitar exceso de columnas.

La lista de productos es un ejemplo explícito de esta regla: mostrar
solo información esencial y llevar el resto al detalle.

---

# 46. API BACKEND

El backend debe exponer una API REST/JSON.

Ejemplos de rutas:

```text
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
PATCH  /api/users/:id/status

GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id

GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
PATCH  /api/products/:id/status

GET    /api/suppliers
POST   /api/suppliers
PUT    /api/suppliers/:id

GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id

GET    /api/purchases
POST   /api/purchases
GET    /api/purchases/:id

GET    /api/sales
POST   /api/sales
GET    /api/sales/:id

GET    /api/consignations
POST   /api/consignations
GET    /api/consignations/:id
POST   /api/consignations/:id/liquidate

GET    /api/inventory
GET    /api/kardex

GET    /api/reports/...
```

Las rutas pueden ajustarse a convenciones del proyecto, pero deben
mantener separación modular.

---

# 47. ESTRUCTURA DEL BACKEND

Propuesta:

```text
backend/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── categories/
    │   ├── products/
    │   ├── suppliers/
    │   ├── customers/
    │   ├── purchases/
    │   ├── sales/
    │   ├── inventory/
    │   ├── consignations/
    │   ├── reports/
    │   └── audit/
    │
    ├── db/
    │   ├── schema/
    │   ├── index.ts
    │   └── seed.ts
    │
    ├── middleware/
    ├── utils/
    └── server.ts
```

El agente puede mejorar la estructura interna de cada módulo, pero debe
conservar la separación modular.

---

# 48. BASE DE DATOS

Entidades principales:

```text
users
categories
products
suppliers
customers
purchases
purchase_details
sales
sale_details
consignations
consignment_details
inventory_movements
audit_logs
```

La estructura final debe respetar las relaciones y reglas definidas en
este documento.

---

# 49. RELACIONES PRINCIPALES

```text
CATEGORY
    │
    └── PRODUCTS

SUPPLIER
    │
    └── PURCHASES
            │
            └── PURCHASE_DETAILS
                    │
                    └── PRODUCT

CUSTOMER
    ├── SALES
    │      └── SALE_DETAILS
    │              └── PRODUCT
    │
    └── CONSIGNATIONS
           └── CONSIGNMENT_DETAILS
                   └── PRODUCT

PRODUCT
    │
    └── INVENTORY_MOVEMENTS

USER
    ├── PURCHASES
    ├── SALES
    ├── CONSIGNATIONS
    └── AUDIT_LOGS
```

---

# 50. TRANSACCIONES

Las siguientes operaciones deben ser transaccionales:

## Compra

```text
BEGIN
Crear compra
Crear detalles
Actualizar stock
Crear Kardex
COMMIT
```

## Venta

```text
BEGIN
Validar stock
Crear venta
Crear detalles
Actualizar stock
Crear Kardex
COMMIT
```

## Consignación

```text
BEGIN
Crear consignación
Crear detalles
Reducir stock
Crear Kardex SALIDA_A_CONSIGNACION
COMMIT
```

## Liquidación

```text
BEGIN
Validar cantidades
Registrar vendidos
Registrar devueltos
Actualizar stock según corresponda
Crear movimientos Kardex
Generar/registrar venta consignada
Cambiar estado a LIQUIDADA
COMMIT
```

Si alguna parte falla, hacer rollback.

---

# 51. REGLAS DE NEGOCIO CRÍTICAS

## Producto

* El código debe ser único.
* La cantidad debe ser mayor que cero.
* Los precios no pueden ser negativos.
* El producto puede estar activo/inactivo.
* No eliminar físicamente productos con historial relevante.

## Inventario

* No permitir stock negativo.
* Las operaciones deben generar movimientos.
* No permitir modificaciones silenciosas del stock.

## Compra

* La cantidad debe ser mayor que cero.
* El precio unitario debe ser válido.
* Confirmar compra actualiza stock.

## Venta

* El producto debe estar activo.
* Debe existir stock suficiente.
* Seleccionar tipo de precio.
* Calcular precio según PVP.
* Aplicar descuento adicional si corresponde.
* Confirmar venta actualiza stock.

## Consignación

* Solo se puede liquidar una consignación PENDIENTE.
* `entregada = vendida + devuelta`.
* Solo lo vendido genera importe de venta.
* Lo devuelto vuelve al inventario.
* Al completar la liquidación, el estado pasa a LIQUIDADA.

---

# 52. ELIMINACIÓN Y DESACTIVACIÓN

Cuando un registro tenga historial, evitar eliminación física.

Utilizar `activo` cuando corresponda.

Ejemplos:

* Producto con ventas → no eliminar físicamente.
* Cliente con ventas → no eliminar físicamente.
* Proveedor con compras → no eliminar físicamente.
* Usuario con operaciones → no eliminar físicamente.

Esto conserva la integridad histórica.

---

# 53. CORRECCIÓN DE OPERACIONES

Las operaciones confirmadas no deben editarse arbitrariamente.

Cuando sea necesario corregir una operación, debe existir un mecanismo
de anulación/reversión que:

* Mantenga la trazabilidad.
* Corrija el inventario.
* Registre los movimientos correspondientes.
* Identifique al usuario responsable.

No borrar simplemente el registro histórico.

---

# 54. SEGURIDAD

Implementar:

* Autenticación.
* Autorización por rol.
* Hash seguro de contraseñas.
* Validación de entrada.
* Protección de endpoints.
* CORS configurado correctamente.
* HTTPS en producción.
* Variables de entorno.
* No exponer credenciales de PostgreSQL al frontend.
* No guardar secretos en Git.

---

# 55. VARIABLES DE ENTORNO

Ejemplo:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
FRONTEND_URL=
```

Los nombres pueden ajustarse técnicamente, pero los secretos deben
mantenerse fuera del repositorio.

---

# 56. MANEJO DE ERRORES

El backend debe utilizar respuestas consistentes.

Debe diferenciar:

* Error de validación.
* Error de autenticación.
* Error de autorización.
* Registro inexistente.
* Stock insuficiente.
* Operación inválida.
* Error interno.

El frontend debe mostrar mensajes comprensibles para el usuario.

No mostrar stack traces ni información sensible.

---

# 57. LOADING, EMPTY Y ERROR STATES

Cada pantalla debe contemplar:

## Loading

Mostrar indicador mientras se cargan datos.

## Empty

Mostrar un mensaje útil cuando no existen registros.

Ejemplo:

```text
No hay productos registrados.
[Registrar producto]
```

## Error

Mostrar un mensaje claro y una opción de reintentar cuando corresponda.

---

# 58. RESPONSIVE DESIGN

La aplicación debe funcionar correctamente en:

* Desktop.
* Laptop.
* Tablet.
* Pantallas pequeñas.

La interfaz principal está pensada para escritorio, pero no debe
romperse en resoluciones menores.

---

# 59. C4

La arquitectura debe documentarse utilizando C4.

## C1 --- Context

Mostrar únicamente:

```text
Administrador
Empleado
     ↓
Sistema de Gestión Comercial BIOABONO
```

No mostrar React, Node, Elysia, Drizzle ni PostgreSQL en C1.

## C2 --- Containers

Mostrar:

```text
Usuario
   ↓
Web App
   ↓
API Backend
   ↓
PostgreSQL
```

Tecnologías:

```text
Web App → React + TypeScript
API → Node.js + Elysia + TypeScript
Database → PostgreSQL
```

Drizzle ORM es una librería de acceso a datos y no un container
independiente.

## C3 --- Components

El backend puede dividirse en:

```text
Auth
Users
Categories
Products
Suppliers
Customers
Purchases
Sales
Inventory/Kardex
Consignations
Reports
Audit
```

---

# 60. TESTING

Se deben realizar pruebas para:

* Login.
* Roles.
* Productos.
* Categorías.
* Precios.
* Inventario.
* Kardex.
* Compras.
* Ventas.
* Descuentos.
* Consignaciones.
* Liquidaciones.
* Reportes.
* Auditoría.

Especialmente probar las transacciones de compra, venta y consignación.

---

# 61. SEED INICIAL

El sistema debe poder disponer de un seed de desarrollo.

El seed puede contener:

* Usuario ADMIN.
* Usuario EMPLEADO.
* Categorías.
* Productos iniciales basados en el catálogo real proporcionado.

Los datos de seed deben identificarse claramente como datos iniciales de
desarrollo.

No utilizar estadísticas ficticias como si fueran datos reales de
producción.

---

# 62. CATÁLOGO DE PRODUCTOS

El documento `lista de productos.pdf` proporcionado por BIOABONO es la
referencia para la información de productos, cantidades, unidades y
precios disponibles en el catálogo.

El agente debe utilizar dicho documento como fuente al preparar los
datos iniciales.

No inventar productos ni presentaciones que no estén respaldados por el
catálogo, salvo que el usuario posteriormente solicite agregarlos.

---

# 63. DESPLIEGUE

## Desarrollo

```text
Frontend
React + Vite

Backend
Node.js + Elysia

Database
PostgreSQL local

Administración DB
pgAdmin 4
```

## Producción

```text
Frontend
      ↓ HTTPS
Backend Node.js + Elysia
      ↓
PostgreSQL GCOM
```

El sitio público existente de BIOABONO no debe modificarse.

Se podrá utilizar:

```text
admin.bioabono.com
```

y, si la infraestructura lo permite:

```text
api.bioabono.com
```

Antes del despliegue se debe verificar con GCOM:

* Versión de Node.js.
* Forma de ejecutar aplicaciones Node.js.
* Configuración de procesos persistentes.
* Reverse proxy.
* Variables de entorno.
* PostgreSQL.
* SSL.
* Dominios/subdominios.

---

# 64. GIT Y GITHUB

Utilizar Git y GitHub.

Ramas recomendadas:

```text
main
develop
feature/*
fix/*
```

Commits descriptivos:

```text
feat(products): add product registration
feat(sales): implement sale creation
feat(inventory): add kardex movements
feat(consignations): implement liquidation
fix(inventory): prevent negative stock
```

---

# 65. ORDEN DE IMPLEMENTACIÓN

## Fase 1 --- Proyecto base

* Crear monorepo.
* Configurar frontend.
* Configurar backend.
* Configurar TypeScript.
* Configurar PostgreSQL.
* Configurar Drizzle.
* Configurar variables de entorno.

## Fase 2 --- Base de datos y autenticación

* Schema.
* Migraciones.
* Seed.
* Usuarios.
* Roles.
* Login.
* Protección de rutas.

## Fase 3 --- Catálogos

* Categorías.
* Productos.
* Clientes.
* Proveedores.

## Fase 4 --- Inventario

* Stock.
* Kardex.
* Movimientos.

## Fase 5 --- Compras

* Registro.
* Detalles.
* Actualización de inventario.
* Kardex.

## Fase 6 --- Ventas

* Registro.
* Detalles.
* Tipos de precio.
* Descuento adicional.
* Inventario.
* Kardex.

## Fase 7 --- Consignaciones

* Registro.
* Entrega.
* Estado PENDIENTE.
* Registro de vendidos/devueltos.
* Liquidación.
* Estado LIQUIDADA.
* Inventario.
* Kardex.
* Documentos.

## Fase 8 --- Dashboard y reportes

* Dashboard ADMIN.
* Dashboard EMPLEADO.
* Accesos directos.
* Reportes.
* Filtros.

## Fase 9 --- Auditoría y seguridad

* Auditoría.
* Validaciones.
* Manejo de errores.
* Revisión de permisos.

## Fase 10 --- Testing y producción

* Pruebas.
* Build.
* Configuración GCOM.
* PostgreSQL producción.
* Dominio.
* SSL.
* Pruebas finales.

---

# 66. CRITERIOS DE ACEPTACIÓN

## Autenticación

* ADMIN puede iniciar sesión.
* EMPLEADO puede iniciar sesión.
* Usuarios inactivos no pueden iniciar sesión.
* Las rutas respetan el rol.

## Productos

* Se puede registrar producto.
* El código es único.
* Se registra cantidad y unidad.
* Se registra precio de compra.
* Se registra PVP.
* Los precios comerciales se calculan automáticamente.
* Se puede desactivar un producto.
* La lista principal muestra únicamente información esencial.
* El detalle muestra los precios.

## Inventario

* Las compras aumentan stock.
* Las ventas reducen stock.
* Las consignaciones reducen stock disponible.
* Las devoluciones de consignación aumentan stock.
* Nunca se permite stock negativo.

## Kardex

* Cada operación genera sus movimientos.
* Se conserva usuario.
* Se conserva fecha.
* Se conserva stock anterior y posterior.
* Se puede consultar por producto y fecha.

## Compras

* Se puede registrar proveedor.
* Se pueden registrar múltiples productos.
* Se almacenan precios históricos.
* La confirmación actualiza inventario.

## Ventas

* Se puede seleccionar cliente.
* Se puede utilizar Cliente mostrador.
* Se selecciona tipo de precio.
* El precio se calcula correctamente.
* Se puede aplicar descuento adicional.
* Se valida stock.
* La confirmación actualiza inventario.

## Consignaciones

* Se crea consignación.
* Inicia como PENDIENTE.
* Se registra entrega.
* Se registra vendido.
* Se registra devuelto.
* Se valida `entregado = vendido + devuelto`.
* Solo lo vendido genera importe.
* Lo devuelto regresa al inventario.
* Finaliza como LIQUIDADA.

## ADMIN

* Gestiona usuarios.
* Consulta inventario.
* Consulta Kardex.
* Consulta reportes.
* Consulta operaciones.
* Supervisa información del negocio.

## EMPLEADO

* Gestiona productos.
* Gestiona proveedores.
* Gestiona clientes.
* Registra compras.
* Registra ventas.
* Gestiona consignaciones.
* Consulta inventario.

---

# 67. PRINCIPIOS PARA EL AGENTE

El agente de desarrollo debe seguir estas reglas durante toda la
implementación:

1. Este documento es la fuente principal de requisitos.
2. No inventar reglas de negocio.
3. No agregar funcionalidades innecesarias.
4. Mantener frontend y backend separados.
5. Mantener reglas de negocio en backend.
6. No conectar frontend directamente a PostgreSQL.
7. No crear una entidad `PresentacionProducto`.
8. Mantener un único modelo `PRODUCTO`.
9. Mantener precios comerciales derivados del PVP.
10. Mantener solo dos estados de consignación: PENDIENTE y LIQUIDADA.
11. Mantener trazabilidad mediante Kardex.
12. Evitar stock negativo.
13. Usar transacciones para operaciones críticas.
14. Mantener historial de operaciones.
15. No eliminar físicamente información histórica relevante.
16. Mantener el diseño visual inspirado en las referencias
    proporcionadas.
17. No copiar datos ni funcionalidad ficticia de las referencias.
18. Adaptar el Dashboard y los accesos directos según el rol.
19. No implementar SIAT ni funcionalidades fuera de V1.
20. Si una decisión afecta una regla de negocio o la arquitectura y no
    está definida, solicitar confirmación antes de inventarla.
21. Priorizar simplicidad, claridad y mantenibilidad.
22. No sobreingenierizar la solución.

---

# 68. RESULTADO ESPERADO

El resultado final debe ser una aplicación web funcional de gestión
comercial para BIOABONO con:

```text
                 BIOABONO
                     │
        ┌────────────┴────────────┐
        │                         │
      ADMIN                   EMPLEADO
        │                         │
 Supervisión                 Operaciones
 Consulta                    diarias
        │                         │
        └────────────┬────────────┘
                     │
              SISTEMA BIOABONO
                     │
        ┌────────────┼────────────┐
        │            │            │
    Productos     Compras       Ventas
        │            │            │
    Inventario       │      Consignaciones
        │            │            │
      Kardex─────────┴────────────┘
                     │
                  Reportes
```

La aplicación debe ser coherente visualmente con la identidad de
BIOABONO, sencilla de utilizar y suficientemente estructurada para
permitir futuras ampliaciones sin introducir complejidad innecesaria en
V1.

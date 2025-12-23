# 📦 Base de Datos – Stokea2 (SQLite + Electron)

Este documento describe la estructura de la base de datos, las relaciones entre tablas
y el comportamiento de cada repository utilizado por la aplicación.

La base de datos está diseñada para un sistema de gestión de ventas y stock
orientado a kioscos o comercios pequeños, priorizando simplicidad, trazabilidad
y consistencia de datos.

---

## 🧠 Visión General del Modelo

La base de datos está organizada en los siguientes dominios:

- **Productos**: artículos que se venden
- **Stock**: cantidad disponible de cada producto
- **Caja**: sesiones de caja y movimientos de dinero
- **Ventas**: registro de ventas realizadas
- **Detalle de ventas**: productos vendidos en cada venta

Relaciones principales:

- Un producto tiene un único registro de stock
- Una sesión de caja puede tener muchas ventas
- Una venta puede tener muchos ítems (productos vendidos)
- Cada movimiento de caja pertenece a una sesión de caja

---

## 🧩 Tablas y Estructura

---

## 🟢 Tabla: `products`

Almacena los productos disponibles para la venta.

### Clave primaria
- `id` (PK)

### Columnas

| Columna | Tipo | Descripción |
|------|------|-------------|
| id | INTEGER | Identificador único del producto |
| name | TEXT | Nombre del producto |
| description | TEXT | Descripción opcional |
| brand | TEXT | Marca del producto |
| code | TEXT (UNIQUE) | Código único (barcode o SKU) |
| wholesale_price | REAL | Precio de compra |
| profit_percentage | REAL | Porcentaje de ganancia |
| sale_price | REAL | Precio final de venta |
| created_at | TEXT | Fecha de creación automática |

### Motivo del diseño
- `code` es UNIQUE para evitar duplicados
- `sale_price` se guarda explícitamente para mantener historial
- No se calcula en runtime para evitar errores históricos

---

## 🟡 Tabla: `stock`

Representa el stock actual de cada producto.

### Claves
- `id` (PK)
- `product_id` (FK → products.id)

### Columnas

| Columna | Tipo | Descripción |
|------|------|-------------|
| id | INTEGER | Identificador del stock |
| product_id | INTEGER | Producto asociado |
| quantity | INTEGER | Cantidad disponible |
| min_alert | INTEGER | Umbral mínimo de alerta |

### Motivo del diseño
- Separar stock de productos permite escalar (movimientos, historial)
- `min_alert` permite avisos de bajo stock
- Relación 1 a 1 lógica con products

---

## 🔵 Tabla: `cash_session`

Representa una apertura y cierre de caja.

### Clave primaria
- `id` (PK)

### Columnas

| Columna | Tipo | Descripción |
|------|------|-------------|
| id | INTEGER | Identificador de sesión |
| start_amount | REAL | Dinero inicial |
| current_amount | REAL | Dinero actual |
| opened_at | TEXT | Fecha de apertura |
| closed_at | TEXT | Fecha de cierre |

### Motivo del diseño
- Permite una única caja abierta (`closed_at IS NULL`)
- Facilita arqueos y control diario

---

## 🟣 Tabla: `cash_movements`

Registra ingresos y egresos de dinero.

### Claves
- `id` (PK)
- `cash_session_id` (FK → cash_session.id)

### Columnas

| Columna | Tipo | Descripción |
|------|------|-------------|
| id | INTEGER | Identificador |
| cash_session_id | INTEGER | Sesión asociada |
| type | TEXT | Tipo (IN / OUT) |
| amount | REAL | Monto |
| description | TEXT | Motivo |
| created_at | TEXT | Fecha del movimiento |

### Motivo del diseño
- Mantiene trazabilidad total de la caja
- Separado de ventas para permitir movimientos manuales

---

## 🔴 Tabla: `sales`

Representa una venta realizada.

### Claves
- `id` (PK)
- `cash_session_id` (FK → cash_session.id)

### Columnas

| Columna | Tipo | Descripción |
|------|------|-------------|
| id | INTEGER | Identificador |
| cash_session_id | INTEGER | Caja activa |
| total | REAL | Total de la venta |
| created_at | TEXT | Fecha |

### Motivo del diseño
- Una venta siempre pertenece a una sesión de caja
- El total se guarda explícitamente para auditoría

---

## 🟠 Tabla: `sale_items`

Detalle de productos vendidos en cada venta.

### Claves
- `id` (PK)
- `sale_id` (FK → sales.id)
- `product_id` (FK → products.id)

### Columnas

| Columna | Tipo | Descripción |
|------|------|-------------|
| id | INTEGER | Identificador |
| sale_id | INTEGER | Venta asociada |
| product_id | INTEGER | Producto vendido |
| quantity | INTEGER | Cantidad |
| unit_price | REAL | Precio unitario |
| subtotal | REAL | quantity × unit_price |

### Motivo del diseño
- Permite ventas con múltiples productos
- `unit_price` se congela para historial
- `subtotal` evita recálculos inconsistentes

---

## 🧱 Repositories

Los repositories encapsulan el acceso a datos y evitan que el resto
de la aplicación conozca SQL directamente.

---

## 📦 Product Repository

### Métodos

- `getAll()`
  - Obtiene todos los productos

- `getById(id)`
  - Busca un producto por su ID

- `create(product)`
  - Inserta un nuevo producto

- `update(id, product)`
  - Actualiza los datos del producto

- `delete(id)`
  - Elimina el producto por ID

---

## 📊 Stock Repository

### Métodos

- `getAll()`
  - Obtiene todos los registros de stock

- `getByProduct(productId)`
  - Devuelve el stock de un producto específico

- `create(stock)`
  - Crea el registro de stock inicial

- `update(id, stock)`
  - Actualiza cantidad y alerta mínima

---

## 💰 Cash Session Repository

### Métodos

- `open(startAmount)`
  - Abre una nueva sesión de caja

- `getOpen()`
  - Devuelve la caja actualmente abierta

- `close(id, amount)`
  - Cierra la caja y guarda el monto final

---

## 💸 Cash Movements Repository

### Métodos

- `create(movement)`
  - Registra un ingreso o egreso de dinero

- `getBySession(sessionId)`
  - Lista movimientos de una sesión

---

## 🧾 Sales Repository

### Métodos

- `create(sale)`
  - Registra una venta asociada a una caja

---

## 🧩 Sale Items Repository

### Métodos

- `create(item)`
  - Registra un producto vendido dentro de una venta

---

## ✅ Conclusión

Este modelo:
- Es simple pero escalable
- Mantiene historial completo
- Evita cálculos inconsistentes
- Permite auditoría y control real de negocio

La separación por dominios y repositories
facilita mantenimiento y evolución futura.

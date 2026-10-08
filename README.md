# Sistema de Ferretería (Node.js + Express + SQLite)

## Requisitos
- Node.js 18 o superior

## Ejecutar
```bash
npm install
npm start
```
Abrir http://localhost:3000 (la base de datos `ferreteria.db` se crea sola con datos de ejemplo).

## Endpoints principales
| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/productos?buscar=texto | Listar/buscar productos |
| POST | /api/productos | Crear producto |
| PUT | /api/productos/:id | Actualizar producto |
| DELETE | /api/productos/:id | Eliminar producto |
| GET/POST | /api/clientes | Listar / crear clientes |
| POST | /api/ventas | Registrar venta (descuenta stock) |
| GET | /api/ventas, /api/ventas/:id | Historial y detalle |
| GET | /api/reportes/stock-bajo | Productos por reabastecer |
| GET | /api/reportes/ventas-hoy | Total vendido hoy |
| GET | /api/reportes/mas-vendidos | Top 5 productos |

Ejemplo de venta:
```json
POST /api/ventas
{ "cliente_id": 1, "items": [ { "producto_id": 1, "cantidad": 2 }, { "producto_id": 3, "cantidad": 10 } ] }
```

## Estructura
```
src/server.js        -> arranque de Express y middlewares
src/db.js            -> conexión SQLite, tablas y datos de ejemplo
src/routes/*.js      -> una ruta por módulo (productos, clientes, ventas, reportes)
public/index.html    -> interfaz web (inventario, carrito, resumen)
```

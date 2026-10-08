const router = require('express').Router();
const db = require('../db');

// Productos con stock igual o menor al mínimo (para reabastecer)
router.get('/stock-bajo', (req, res) => {
  res.json(db.prepare('SELECT * FROM productos WHERE stock <= stock_minimo ORDER BY stock').all());
});

// Ventas del día + total
router.get('/ventas-hoy', (req, res) => {
  res.json(db.prepare(`SELECT COUNT(*) AS cantidad_ventas, COALESCE(SUM(total),0) AS total_vendido
                       FROM ventas WHERE date(fecha) = date('now','localtime')`).get());
});

// Top 5 productos más vendidos
router.get('/mas-vendidos', (req, res) => {
  res.json(db.prepare(`SELECT p.nombre, SUM(d.cantidad) AS unidades, SUM(d.subtotal) AS ingresos
                       FROM detalle_venta d JOIN productos p ON p.id = d.producto_id
                       GROUP BY p.id ORDER BY unidades DESC LIMIT 5`).all());
});

module.exports = router;

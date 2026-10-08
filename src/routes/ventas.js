const router = require('express').Router();
const db = require('../db');

// Registrar una venta: valida stock, guarda encabezado + detalle y descuenta inventario.
// Todo dentro de UNA transacción: o se guarda todo, o no se guarda nada.
const registrarVenta = db.transaction((cliente_id, items) => {
  let total = 0;
  const lineas = items.map(({ producto_id, cantidad }) => {
    const p = db.prepare('SELECT * FROM productos WHERE id = ?').get(producto_id);
    if (!p) throw new Error(`Producto ${producto_id} no existe`);
    if (!Number.isInteger(cantidad) || cantidad <= 0) throw new Error(`Cantidad inválida para ${p.nombre}`);
    if (p.stock < cantidad) throw new Error(`Stock insuficiente de "${p.nombre}" (disponible: ${p.stock})`);
    const subtotal = +(p.precio * cantidad).toFixed(2);
    total += subtotal;
    return { p, cantidad, subtotal };
  });

  const venta = db.prepare('INSERT INTO ventas (cliente_id,total) VALUES (?,?)')
    .run(cliente_id ?? 1, +total.toFixed(2));
  const insDet = db.prepare(`INSERT INTO detalle_venta (venta_id,producto_id,cantidad,precio_unitario,subtotal)
                             VALUES (?,?,?,?,?)`);
  const updStock = db.prepare('UPDATE productos SET stock = stock - ? WHERE id = ?');
  lineas.forEach(l => {
    insDet.run(venta.lastInsertRowid, l.p.id, l.cantidad, l.p.precio, l.subtotal);
    updStock.run(l.cantidad, l.p.id);
  });
  return venta.lastInsertRowid;
});

const obtener = id => {
  const v = db.prepare(`SELECT v.*, c.nombre AS cliente FROM ventas v
                        LEFT JOIN clientes c ON c.id = v.cliente_id WHERE v.id = ?`).get(id);
  if (!v) return null;
  v.detalle = db.prepare(`SELECT d.*, p.nombre AS producto FROM detalle_venta d
                          JOIN productos p ON p.id = d.producto_id WHERE d.venta_id = ?`).all(id);
  return v;
};

router.get('/', (req, res) => {
  res.json(db.prepare(`SELECT v.*, c.nombre AS cliente FROM ventas v
                       LEFT JOIN clientes c ON c.id = v.cliente_id ORDER BY v.id DESC`).all());
});

router.get('/:id', (req, res) => {
  const v = obtener(req.params.id);
  v ? res.json(v) : res.status(404).json({ error: 'Venta no encontrada' });
});

// POST /api/ventas  { "cliente_id": 1, "items": [ { "producto_id": 1, "cantidad": 2 } ] }
router.post('/', (req, res) => {
  const { cliente_id, items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La venta debe incluir al menos un producto' });
  }
  try {
    res.status(201).json(obtener(registrarVenta(cliente_id, items)));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;

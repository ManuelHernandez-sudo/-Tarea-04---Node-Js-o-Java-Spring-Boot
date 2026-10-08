const router = require('express').Router();
const db = require('../db');

const BASE = `SELECT p.*, c.nombre AS categoria FROM productos p
              LEFT JOIN categorias c ON c.id = p.categoria_id`;

// GET /api/productos?buscar=martillo
router.get('/', (req, res) => {
  const q = `%${req.query.buscar || ''}%`;
  res.json(db.prepare(`${BASE} WHERE p.nombre LIKE ? OR p.codigo LIKE ? ORDER BY p.nombre`).all(q, q));
});

router.get('/:id', (req, res) => {
  const p = db.prepare(`${BASE} WHERE p.id = ?`).get(req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'Producto no encontrado' });
});

router.post('/', (req, res) => {
  const { codigo, nombre, categoria_id, precio, stock = 0, stock_minimo = 5 } = req.body;
  if (!codigo || !nombre || precio == null) {
    return res.status(400).json({ error: 'codigo, nombre y precio son obligatorios' });
  }
  try {
    const r = db.prepare(`INSERT INTO productos (codigo,nombre,categoria_id,precio,stock,stock_minimo)
                          VALUES (?,?,?,?,?,?)`).run(codigo, nombre, categoria_id ?? null, precio, stock, stock_minimo);
    res.status(201).json(db.prepare(`${BASE} WHERE p.id = ?`).get(r.lastInsertRowid));
  } catch (e) {
    res.status(400).json({ error: e.message.includes('UNIQUE') ? 'El código ya existe' : e.message });
  }
});

router.put('/:id', (req, res) => {
  const actual = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!actual) return res.status(404).json({ error: 'Producto no encontrado' });
  const d = { ...actual, ...req.body };
  try {
    db.prepare(`UPDATE productos SET codigo=?, nombre=?, categoria_id=?, precio=?, stock=?, stock_minimo=? WHERE id=?`)
      .run(d.codigo, d.nombre, d.categoria_id, d.precio, d.stock, d.stock_minimo, req.params.id);
    res.json(db.prepare(`${BASE} WHERE p.id = ?`).get(req.params.id));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    const r = db.prepare('DELETE FROM productos WHERE id = ?').run(req.params.id);
    r.changes ? res.status(204).end() : res.status(404).json({ error: 'Producto no encontrado' });
  } catch (e) {
    res.status(409).json({ error: 'No se puede eliminar: el producto tiene ventas registradas' });
  }
});

module.exports = router;

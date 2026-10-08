const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => res.json(db.prepare('SELECT * FROM clientes ORDER BY nombre').all()));

router.post('/', (req, res) => {
  const { nombre, nit = 'CF', telefono = '' } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  const r = db.prepare('INSERT INTO clientes (nombre,nit,telefono) VALUES (?,?,?)').run(nombre, nit, telefono);
  res.status(201).json(db.prepare('SELECT * FROM clientes WHERE id = ?').get(r.lastInsertRowid));
});

module.exports = router;

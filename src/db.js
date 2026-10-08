// Capa de datos: SQLite con better-sqlite3 (síncrono, simple y rápido)
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'ferreteria.db'));
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  categoria_id INTEGER REFERENCES categorias(id),
  precio REAL NOT NULL CHECK (precio >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_minimo INTEGER NOT NULL DEFAULT 5
);
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  nit TEXT DEFAULT 'CF',
  telefono TEXT
);
CREATE TABLE IF NOT EXISTS ventas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER REFERENCES clientes(id),
  fecha TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  total REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS detalle_venta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venta_id INTEGER NOT NULL REFERENCES ventas(id),
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario REAL NOT NULL,
  subtotal REAL NOT NULL
);
`);

// Datos de ejemplo la primera vez
if (db.prepare('SELECT COUNT(*) c FROM categorias').get().c === 0) {
  const cat = db.prepare('INSERT INTO categorias (nombre) VALUES (?)');
  ['Herramientas', 'Materiales de construcción', 'Electricidad', 'Plomería', 'Pintura'].forEach(n => cat.run(n));
  const prod = db.prepare('INSERT INTO productos (codigo,nombre,categoria_id,precio,stock,stock_minimo) VALUES (?,?,?,?,?,?)');
  prod.run('MAR-001', 'Martillo 16oz', 1, 55, 20, 5);
  prod.run('CEM-001', 'Cemento 42.5kg', 2, 78, 100, 20);
  prod.run('CAB-012', 'Cable THHN #12 (metro)', 3, 6.5, 200, 50);
  prod.run('TUB-050', 'Tubo PVC 1/2" 6m', 4, 32, 3, 10);
  prod.run('PIN-001', 'Pintura blanca galón', 5, 145, 15, 5);
  db.prepare('INSERT INTO clientes (nombre,nit,telefono) VALUES (?,?,?)').run('Consumidor Final', 'CF', '');
}

module.exports = db;

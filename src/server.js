const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());                                    // middleware: lee JSON del body
app.use(express.static(path.join(__dirname, '..', 'public'))); // sirve la interfaz web

app.use('/api/productos', require('./routes/productos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/reportes', require('./routes/reportes'));
app.get('/api/categorias', (req, res) => res.json(require('./db').prepare('SELECT * FROM categorias').all()));

// Middleware final de errores
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Error interno' }); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ferretería en http://localhost:${PORT}`));

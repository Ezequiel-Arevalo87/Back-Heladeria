const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const movementRoutes = require('./routes/movementRoutes');
const alertRoutes = require('./routes/alertRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const app = express();

conectarDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Inventario Heladería funcionando correctamente'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/movimientos', movementRoutes);
app.use('/api/alertas', alertRoutes);
app.use('/api/notificaciones', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
module.exports = app;
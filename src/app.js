const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const movementRoutes = require('./routes/movementRoutes');
const alertRoutes = require('./routes/alertRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const productionRoutes = require('./routes/productionRoutes');
const cashRoutes = require('./routes/cashRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const {origenesPermitidos}=require('./config/env');
const app = express();

conectarDB();

const origenes=origenesPermitidos(process.env);
app.disable('x-powered-by');
app.use(cors({origin:(origin,callback)=>{
  if(!origin||!origenes.length||origenes.includes(origin)) return callback(null,true);
  callback(new Error('Origen no permitido por CORS'));
}}));
app.use(express.json({limit:'1mb'}));

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Inventario Heladería funcionando correctamente'
  });
});
app.get('/health', (req,res)=>res.json({estado:'ok',fecha:new Date().toISOString()}));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/movimientos', movementRoutes);
app.use('/api/alertas', alertRoutes);
app.use('/api/notificaciones', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/produccion', productionRoutes);
app.use('/api/caja', cashRoutes);
app.use('/api/domicilios', deliveryRoutes);
app.use('/api/reportes', reportRoutes);
app.use((req,res)=>res.status(404).json({mensaje:'Ruta no encontrada'}));
app.use((error,req,res,next)=>{
  console.error(error.message);
  res.status(error.message.includes('CORS')?403:500).json({mensaje:error.message.includes('CORS')?'Origen no permitido':'Error interno del servidor'});
});
module.exports = app;

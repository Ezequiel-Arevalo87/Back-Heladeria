const Product = require('../models/Product');
const Movement = require('../models/Movement');
const User = require('../models/User');
const Notification = require('../models/Notification');
const admin = require('../config/firebase');

const enviarPushAdmins = async (titulo, mensaje) => {
  const admins = await User.find({
    rol: 'ADMIN',
    fcmToken: {$exists: true, $ne: ''}
  });

  for (const adminUser of admins) {
    try {
      await admin.messaging().send({
        token: adminUser.fcmToken,
        notification: {
          title: titulo,
          body: mensaje
        }
      });
    } catch (error) {
      console.log('Error enviando push:', error.message);
    }
  }
};

const obtenerDashboard = async (req, res) => {
  try {
    const hoy = new Date();

    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + 7);

    const totalProductos = await Product.countDocuments({
      estado: true
    });

    const productosStockBajo = await Product.countDocuments({
      estado: true,
      $expr: {
        $lte: ['$cantidadActual', '$stockMinimo']
      }
    });

    const productosProximosVencerLista = await Product.find({
      estado: true,
      fechaVencimiento: {
        $gte: hoy,
        $lte: fechaLimite
      }
    });

    const productosVencidosLista = await Product.find({
      estado: true,
      fechaVencimiento: {
        $lt: hoy
      }
    });

    const productosProximosVencer = productosProximosVencerLista.length;
    const productosVencidos = productosVencidosLista.length;

    const totalMovimientos = await Movement.countDocuments();

    for (const producto of productosProximosVencerLista) {
      const titulo = '⚠️ Producto próximo a vencer';
      const mensaje = `${producto.nombre} vence el ${new Date(
        producto.fechaVencimiento,
      ).toLocaleDateString('es-CO')}`;

      await Notification.create({
        producto: producto._id,
        tipo: 'PROXIMO_VENCER',
        titulo,
        mensaje
      });

      await enviarPushAdmins(titulo, mensaje);
    }

    for (const producto of productosVencidosLista) {
      const titulo = '🚨 Producto vencido';
      const mensaje = `${producto.nombre} ya se encuentra vencido`;

      await Notification.create({
        producto: producto._id,
        tipo: 'VENCIDO',
        titulo,
        mensaje
      });

      await enviarPushAdmins(titulo, mensaje);
    }

    res.json({
      mensaje: 'Dashboard consultado correctamente',
      dashboard: {
        totalProductos,
        productosStockBajo,
        productosProximosVencer,
        productosVencidos,
        totalMovimientos
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar dashboard',
      error: error.message
    });
  }
};

module.exports = {
  obtenerDashboard
};
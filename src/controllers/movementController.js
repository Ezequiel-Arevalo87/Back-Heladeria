const Product = require('../models/Product');
const Movement = require('../models/Movement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const admin = require('../config/firebase');


const registrarSalida = async (req, res) => {
  try {
    const { productoId, cantidad, motivo, observacion } = req.body;

    const producto = await Product.findById(productoId);

    if (!producto) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    if (cantidad <= 0) {
      return res.status(400).json({
        mensaje: 'La cantidad debe ser mayor a cero'
      });
    }

    if (producto.cantidadActual < cantidad) {
      return res.status(400).json({
        mensaje: 'No hay suficiente cantidad disponible'
      });
    }

    producto.cantidadActual = producto.cantidadActual - cantidad;
    await producto.save();

    const movimiento = await Movement.create({
      producto: producto._id,
      tipoMovimiento: 'SALIDA',
      cantidad,
      motivo,
      observacion
    });

    const stockBajo = producto.cantidadActual <= producto.stockMinimo;

    let notificacion = null;

   if (stockBajo) {
  const titulo = '⚠️ Stock bajo';
  const mensaje = `El producto ${producto.nombre} está en stock bajo. Cantidad actual: ${producto.cantidadActual}`;

  notificacion = await Notification.create({
    producto: producto._id,
    tipo: 'STOCK_BAJO',
    titulo,
    mensaje
  });

  await enviarPushAdmins(titulo, mensaje);
}

    res.status(201).json({
      mensaje: stockBajo
        ? 'Salida registrada. Atención: producto con stock bajo'
        : 'Salida registrada correctamente',
      stockBajo,
      producto,
      movimiento,
      notificacion
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar salida',
      error: error.message
    });
  }
};

const enviarPushAdmins = async (titulo, mensaje) => {
  const admins = await User.find({
    rol: 'ADMIN',
    fcmToken: { $exists: true, $ne: '' }
  });

  for (const adminUser of admins) {
    await admin.messaging().send({
      token: adminUser.fcmToken,
      notification: {
        title: titulo,
        body: mensaje
      }
    });
  }
};

const registrarEntrada = async (req, res) => {
  try {
    const { productoId, cantidad, motivo, observacion } = req.body;

    const producto = await Product.findById(productoId);

    if (!producto) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    if (cantidad <= 0) {
      return res.status(400).json({
        mensaje: 'La cantidad debe ser mayor a cero'
      });
    }

    producto.cantidadActual = producto.cantidadActual + cantidad;
    await producto.save();

    const movimiento = await Movement.create({
      producto: producto._id,
      tipoMovimiento: 'ENTRADA',
      cantidad,
      motivo,
      observacion
    });

    res.status(201).json({
      mensaje: 'Entrada registrada correctamente',
      producto,
      movimiento
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar entrada',
      error: error.message
    });
  }
};

const listarMovimientos = async (req, res) => {
  try {
    const movimientos = await Movement.find()
      .populate('producto', 'nombre categoria unidadMedida cantidadActual stockMinimo')
      .sort({ createdAt: -1 });

    res.json({
      mensaje: 'Movimientos consultados correctamente',
      movimientos
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar movimientos',
      error: error.message
    });
  }
};

module.exports = {
  registrarSalida,
  registrarEntrada,
  listarMovimientos
};
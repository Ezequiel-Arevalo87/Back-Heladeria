const mongoose = require('mongoose');
const Product = require('../models/Product');
const Movement = require('../models/Movement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const admin = require('../config/firebase');

const validarMovimiento = body => {
  const cantidad = Number(body.cantidad);
  if (!mongoose.isValidObjectId(body.productoId)) {
    return { error: 'El producto no es válido' };
  }
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return { error: 'La cantidad debe ser un número mayor a cero' };
  }
  return {
    cantidad,
    motivo: body.motivo?.trim() || '',
    observacion: body.observacion?.trim() || ''
  };
};

const enviarPushAdmins = async (titulo, mensaje) => {
  const admins = await User.find({
    rol: 'ADMIN',
    estado: true,
    fcmToken: { $exists: true, $ne: '' }
  }).select('fcmToken');

  await Promise.allSettled(
    admins.map(usuario =>
      admin.messaging().send({
        token: usuario.fcmToken,
        notification: { title: titulo, body: mensaje }
      })
    )
  );
};

const registrarSalida = async (req, res) => {
  const datos = validarMovimiento(req.body);
  if (datos.error) {
    return res.status(400).json({ mensaje: datos.error });
  }

  let productoAnterior;
  try {
    productoAnterior = await Product.findOneAndUpdate(
      {
        _id: req.body.productoId,
        estado: true,
        cantidadActual: { $gte: datos.cantidad }
      },
      { $inc: { cantidadActual: -datos.cantidad } },
      { new: false, runValidators: true }
    );

    if (!productoAnterior) {
      const existe = await Product.exists({ _id: req.body.productoId, estado: true });
      return res.status(existe ? 400 : 404).json({
        mensaje: existe ? 'No hay suficiente cantidad disponible' : 'Producto no encontrado'
      });
    }

    const movimiento = await Movement.create({
      producto: productoAnterior._id,
      tipoMovimiento: 'SALIDA',
      cantidad: datos.cantidad,
      motivo: datos.motivo,
      observacion: datos.observacion
    });

    const producto = await Product.findById(productoAnterior._id);
    const stockBajo = producto.cantidadActual <= producto.stockMinimo;
    const acabaDeBajar = productoAnterior.cantidadActual > productoAnterior.stockMinimo && stockBajo;
    let notificacion = null;

    if (acabaDeBajar) {
      const titulo = 'Stock bajo';
      const mensaje = `El producto ${producto.nombre} está en stock bajo. Cantidad actual: ${producto.cantidadActual}`;
      try {
        notificacion = await Notification.create({
          producto: producto._id,
          tipo: 'STOCK_BAJO',
          titulo,
          mensaje
        });
        await enviarPushAdmins(titulo, mensaje);
      } catch (errorNotificacion) {
        console.error('No fue posible generar la notificación:', errorNotificacion.message);
      }
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
    if (productoAnterior) {
      await Product.updateOne(
        { _id: productoAnterior._id },
        { $inc: { cantidadActual: datos.cantidad } }
      ).catch(() => {});
    }
    res.status(500).json({ mensaje: 'Error al registrar salida', error: error.message });
  }
};

const registrarEntrada = async (req, res) => {
  const datos = validarMovimiento(req.body);
  if (datos.error) {
    return res.status(400).json({ mensaje: datos.error });
  }

  let producto;
  try {
    producto = await Product.findOneAndUpdate(
      { _id: req.body.productoId, estado: true },
      { $inc: { cantidadActual: datos.cantidad } },
      { new: true, runValidators: true }
    );
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const movimiento = await Movement.create({
      producto: producto._id,
      tipoMovimiento: 'ENTRADA',
      cantidad: datos.cantidad,
      motivo: datos.motivo,
      observacion: datos.observacion
    });
    res.status(201).json({ mensaje: 'Entrada registrada correctamente', producto, movimiento });
  } catch (error) {
    if (producto) {
      await Product.updateOne(
        { _id: producto._id, cantidadActual: { $gte: datos.cantidad } },
        { $inc: { cantidadActual: -datos.cantidad } }
      ).catch(() => {});
    }
    res.status(500).json({ mensaje: 'Error al registrar entrada', error: error.message });
  }
};

const listarMovimientos = async (req, res) => {
  try {
    const movimientos = await Movement.find()
      .populate('producto', 'nombre categoria unidadMedida cantidadActual stockMinimo')
      .sort({ createdAt: -1 });
    res.json({ mensaje: 'Movimientos consultados correctamente', movimientos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar movimientos', error: error.message });
  }
};

module.exports = { registrarSalida, registrarEntrada, listarMovimientos };

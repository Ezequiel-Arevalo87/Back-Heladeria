const Notification = require('../models/Notification');
const admin = require('../config/firebase');

const listarNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notification.find()
      .populate('producto', 'nombre categoria cantidadActual stockMinimo fechaVencimiento')
      .sort({ createdAt: -1 });

    res.json({
      mensaje: 'Notificaciones consultadas correctamente',
      notificaciones
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar notificaciones',
      error: error.message
    });
  }
};

const marcarComoLeida = async (req, res) => {
  try {
    const notificacion = await Notification.findByIdAndUpdate(
      req.params.id,
      { leida: true },
      { new: true }
    );

    if (!notificacion) {
      return res.status(404).json({
        mensaje: 'Notificación no encontrada'
      });
    }

    res.json({
      mensaje: 'Notificación marcada como leída',
      notificacion
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar notificación',
      error: error.message
    });
  }
};

const enviarNotificacionTest = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        mensaje: 'El token FCM es obligatorio'
      });
    }

    const message = {
      notification: {
        title: 'Prueba Firebase',
        body: 'Tu backend está enviando notificaciones correctamente 🚀'
      },
      token
    };

    const response = await admin.messaging().send(message);

    res.json({
      mensaje: 'Notificación enviada correctamente',
      response
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error enviando notificación',
      error: error.message
    });
  }
};

module.exports = {
  listarNotificaciones,
  marcarComoLeida,
  enviarNotificacionTest
};
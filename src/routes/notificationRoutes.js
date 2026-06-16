const express = require('express');
const router = express.Router();

const {
  listarNotificaciones,
  marcarComoLeida,
  enviarNotificacionTest
} = require('../controllers/notificationController');

router.get('/', listarNotificaciones);
router.put('/:id/leida', marcarComoLeida);
router.post('/test', enviarNotificacionTest);

module.exports = router;
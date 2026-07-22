const express = require('express');
const router = express.Router();

const {
  listarNotificaciones,
  marcarComoLeida,
  enviarNotificacionTest
} = require('../controllers/notificationController');
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');

router.get('/', protegerRuta, listarNotificaciones);
router.put('/:id/leida', protegerRuta, marcarComoLeida);
router.post('/test', protegerRuta, autorizarRoles('ADMIN'), enviarNotificacionTest);

module.exports = router;

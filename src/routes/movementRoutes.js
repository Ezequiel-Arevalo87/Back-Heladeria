const express = require('express');
const router = express.Router();

const {
  registrarSalida,
  registrarEntrada,
  listarMovimientos
} = require('../controllers/movementController');

const {
  protegerRuta,
  autorizarRoles
} = require('../middlewares/authMiddleware');

router.get('/', protegerRuta, listarMovimientos);

router.post(
  '/salida',
  protegerRuta,
  autorizarRoles('ADMIN', 'LOGISTICA'),
  registrarSalida
);

router.post(
  '/entrada',
  protegerRuta,
  autorizarRoles('ADMIN', 'LOGISTICA'),
  registrarEntrada
);

module.exports = router;
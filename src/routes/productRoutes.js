const express = require('express');
const router = express.Router();

const {
  crearProducto,
  listarProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productController');

const {
  protegerRuta,
  autorizarRoles
} = require('../middlewares/authMiddleware');

router.get('/', protegerRuta, listarProductos);
router.get('/:id', protegerRuta, obtenerProductoPorId);

router.post('/', protegerRuta, autorizarRoles('ADMIN'), crearProducto);
router.put('/:id', protegerRuta, autorizarRoles('ADMIN'), actualizarProducto);
router.delete('/:id', protegerRuta, autorizarRoles('ADMIN'), eliminarProducto);

module.exports = router;
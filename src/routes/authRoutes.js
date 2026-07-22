const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  login,
  guardarFcmToken,
  listarUsuarios,
  cambiarEstadoUsuario,
  eliminarFcmToken
} = require('../controllers/authController');

const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const {loginRateLimit}=require('../middlewares/loginRateLimit');

router.post('/register', protegerRuta, autorizarRoles('ADMIN'), registrarUsuario);
router.post('/login', loginRateLimit, login);
router.get('/me', protegerRuta, (req, res) => {
  res.json({ usuario: req.usuario });
});
router.post('/fcm-token', protegerRuta, guardarFcmToken);
router.delete('/fcm-token', protegerRuta, eliminarFcmToken);
router.get('/usuarios', protegerRuta, autorizarRoles('ADMIN'), listarUsuarios);
router.put('/usuarios/:id/estado', protegerRuta, autorizarRoles('ADMIN'), cambiarEstadoUsuario);

module.exports = router;

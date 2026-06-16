const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  login,
  guardarFcmToken
} = require('../controllers/authController');

const { protegerRuta } = require('../middlewares/authMiddleware');

router.post('/register', registrarUsuario);
router.post('/login', login);
router.post('/fcm-token', protegerRuta, guardarFcmToken);

module.exports = router;
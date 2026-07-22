const express = require('express');
const router = express.Router();

const { obtenerAlertas } = require('../controllers/alertController');
const { protegerRuta } = require('../middlewares/authMiddleware');

router.get('/', protegerRuta, obtenerAlertas);

module.exports = router;

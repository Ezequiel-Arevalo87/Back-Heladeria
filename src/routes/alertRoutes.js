const express = require('express');
const router = express.Router();

const { obtenerAlertas } = require('../controllers/alertController');

router.get('/', obtenerAlertas);

module.exports = router;
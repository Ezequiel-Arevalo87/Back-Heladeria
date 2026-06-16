const express = require('express');
const router = express.Router();

const {
  obtenerDashboard
} = require('../controllers/dashboardController');

const {
  protegerRuta
} = require('../middlewares/authMiddleware');

router.get('/', protegerRuta, obtenerDashboard);

module.exports = router;
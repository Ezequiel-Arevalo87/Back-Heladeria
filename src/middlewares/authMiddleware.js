const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protegerRuta = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        mensaje: 'No autorizado, token no enviado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findById(decoded.id).select('-password');

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Usuario no válido'
      });
    }

    req.usuario = usuario;

    next();
  } catch (error) {
    res.status(401).json({
      mensaje: 'Token inválido o expirado'
    });
  }
};

const autorizarRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

module.exports = {
  protegerRuta,
  autorizarRoles
};
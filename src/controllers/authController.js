const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    const existeUsuario = await User.findOne({ correo });

    if (existeUsuario) {
      return res.status(400).json({
        mensaje: 'El correo ya está registrado'
      });
    }

    const passwordEncriptado = await bcrypt.hash(password, 10);

    const usuario = await User.create({
      nombre,
      correo,
      password: passwordEncriptado,
      rol
    });

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar usuario',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await User.findOne({ correo });

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    const passwordCorrecto = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecto) {
      return res.status(401).json({
        mensaje: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    res.json({
      mensaje: 'Login correcto',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

const guardarFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        mensaje: 'El token FCM es obligatorio'
      });
    }

    const usuario = await User.findByIdAndUpdate(
      req.usuario._id,
      { fcmToken },
      { new: true }
    ).select('-password');

    res.json({
      mensaje: 'Token FCM guardado correctamente',
      usuario
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al guardar token FCM',
      error: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  login,
  guardarFcmToken
};
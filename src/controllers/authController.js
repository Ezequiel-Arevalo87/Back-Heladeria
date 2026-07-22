const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registrarUsuario = async (req, res) => {
  try {
    const nombre = req.body.nombre?.trim();
    const correo = req.body.correo?.trim().toLowerCase();
    const { password, rol } = req.body;

    if (!nombre || !correo || !password || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    if (!EMAIL_REGEX.test(correo)) {
      return res.status(400).json({ mensaje: 'El correo no es válido' });
    }

    if (password.length < 8) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres' });
    }

    if (!['ADMIN', 'LOGISTICA', 'CAJERO', 'REPARTIDOR'].includes(rol)) {
      return res.status(400).json({ mensaje: 'El rol no es válido' });
    }

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
    const correo = req.body.correo?.trim().toLowerCase();
    const { password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await User.findOne({ correo });

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    if (!usuario.estado) {
      return res.status(403).json({ mensaje: 'El usuario se encuentra desactivado' });
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

const listarUsuarios = async (req, res) => {
  const usuarios = await User.find().select('-password -fcmToken').sort({nombre: 1});
  res.json({usuarios});
};

const cambiarEstadoUsuario = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({mensaje: 'Usuario no válido'});
  if (String(req.usuario._id) === String(req.params.id)) return res.status(400).json({mensaje: 'No puedes desactivar tu propio usuario'});
  if (typeof req.body.estado !== 'boolean') return res.status(400).json({mensaje: 'El estado debe ser verdadero o falso'});
  const cambios = {estado: req.body.estado};
  if (!req.body.estado) cambios.fcmToken = '';
  const usuario = await User.findByIdAndUpdate(req.params.id, cambios, {new: true, runValidators: true}).select('-password -fcmToken');
  if (!usuario) return res.status(404).json({mensaje: 'Usuario no encontrado'});
  res.json({mensaje: req.body.estado ? 'Usuario activado' : 'Usuario desactivado', usuario});
};

const eliminarFcmToken = async (req,res) => {
  await User.updateOne({_id:req.usuario._id},{$set:{fcmToken:''}});
  res.json({mensaje:'Dispositivo desvinculado'});
};

module.exports = {registrarUsuario, login, guardarFcmToken, listarUsuarios, cambiarEstadoUsuario, eliminarFcmToken};

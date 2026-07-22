const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    rol: {
      type: String,
      enum: ['ADMIN', 'LOGISTICA', 'CAJERO', 'REPARTIDOR'],
      required: true
    },
    estado: {
      type: Boolean,
      default: true
    },
    fcmToken: {
  type: String,
  default: ''
}
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);

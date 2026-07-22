const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    tipoMovimiento: {
      type: String,
      enum: ['ENTRADA', 'SALIDA'],
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 0.000001
    },
    motivo: {
      type: String,
      default: ''
    },
    observacion: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Movement', movementSchema);

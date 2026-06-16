const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    tipo: {
      type: String,
      enum: ['STOCK_BAJO', 'PROXIMO_VENCER', 'VENCIDO'],
      required: true
    },
    titulo: {
      type: String,
      required: true
    },
    mensaje: {
      type: String,
      required: true
    },
    leida: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
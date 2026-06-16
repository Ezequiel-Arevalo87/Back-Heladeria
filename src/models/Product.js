const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    categoria: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      default: ''
    },
    cantidadActual: {
      type: Number,
      required: true,
      default: 0
    },
    stockMinimo: {
      type: Number,
      required: true,
      default: 5
    },
    unidadMedida: {
      type: String,
      required: true,
      enum: ['UNIDAD', 'KG', 'GRAMOS', 'LITROS', 'ML']
    },
    fechaVencimiento: {
      type: Date,
      required: true
    },
    estado: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
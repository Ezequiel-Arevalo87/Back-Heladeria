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
    tipoProducto: {
      type: String,
      enum: ['MATERIA_PRIMA', 'INSUMO', 'PRODUCTO_TERMINADO', 'REVENTA'],
      default: 'MATERIA_PRIMA',
      required: true
    },
    precioVenta: {
      type: Number,
      default: 0,
      min: 0
    },
    cantidadActual: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    stockMinimo: {
      type: Number,
      required: true,
      default: 5,
      min: 0
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

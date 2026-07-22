const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  requisicion: {type: mongoose.Schema.Types.ObjectId, ref: 'ProductionRequest', required: true, unique: true},
  productoTerminado: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
  cantidadEsperada: {type: Number, required: true, min: 0},
  cantidadProducida: {type: Number, required: true, min: 0},
  merma: {type: Number, default: 0, min: 0},
  observacion: {type: String, default: ''},
  registradaPor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
}, {timestamps: true});

module.exports = mongoose.model('ProductionBatch', schema);

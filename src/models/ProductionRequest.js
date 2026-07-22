const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  producto: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
  cantidadSolicitada: {type: Number, required: true, min: 0.000001},
  cantidadEntregada: {type: Number, default: 0, min: 0},
}, {_id: false});

const schema = new mongoose.Schema({
  fechaProduccion: {type: Date, required: true},
  estado: {type: String, enum: ['BORRADOR','SOLICITADA','APROBADA','EN_PROCESO','TERMINADA','CANCELADA'], default: 'SOLICITADA'},
  items: {type: [itemSchema], validate: v => v.length > 0},
  solicitadaPor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  aprobadaPor: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  observacion: {type: String, default: ''},
}, {timestamps: true});

module.exports = mongoose.model('ProductionRequest', schema);

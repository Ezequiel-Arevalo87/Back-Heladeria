const mongoose = require('mongoose');
const Product = require('../models/Product');
const ProductionRequest = require('../models/ProductionRequest');
const ProductionBatch = require('../models/ProductionBatch');

const listar = async (req, res) => {
  const requisiciones = await ProductionRequest.find().populate('items.producto', 'nombre unidadMedida cantidadActual').populate('solicitadaPor aprobadaPor', 'nombre rol').sort({createdAt: -1});
  res.json({requisiciones});
};

const crear = async (req, res) => {
  try {
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length || items.some(i => !mongoose.isValidObjectId(i.producto) || !Number.isFinite(Number(i.cantidadSolicitada)) || Number(i.cantidadSolicitada) <= 0)) {
      return res.status(400).json({mensaje: 'La requisición debe contener productos y cantidades válidas'});
    }
    const ids = items.map(i => String(i.producto));
    if (new Set(ids).size !== ids.length) return res.status(400).json({mensaje: 'No repita productos en la requisición'});
    const productosValidos = await Product.countDocuments({_id: {$in: ids}, estado: true, tipoProducto: {$in: ['MATERIA_PRIMA','INSUMO']}});
    if (productosValidos !== ids.length) return res.status(400).json({mensaje: 'Solo puede solicitar materias primas o insumos activos'});
    const fechaProduccion = req.body.fechaProduccion ? new Date(req.body.fechaProduccion) : new Date();
    if (Number.isNaN(fechaProduccion.getTime())) return res.status(400).json({mensaje: 'Fecha de producción inválida'});
    const requisicion = await ProductionRequest.create({fechaProduccion, items: items.map(i => ({producto: i.producto, cantidadSolicitada: Number(i.cantidadSolicitada)})), solicitadaPor: req.usuario._id, observacion: req.body.observacion?.trim() || ''});
    res.status(201).json({mensaje: 'Requisición creada', requisicion});
  } catch (error) { res.status(500).json({mensaje: 'Error al crear requisición', error: error.message}); }
};

const aprobar = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let resultado;
    await session.withTransaction(async () => {
      const requisicion = await ProductionRequest.findOne({_id: req.params.id, estado: 'SOLICITADA'}).session(session);
      if (!requisicion) throw new Error('REQUISICION_NO_DISPONIBLE');
      for (const item of requisicion.items) {
        const actualizado = await Product.findOneAndUpdate({_id: item.producto, estado: true, cantidadActual: {$gte: item.cantidadSolicitada}}, {$inc: {cantidadActual: -item.cantidadSolicitada}}, {new: true, session});
        if (!actualizado) throw new Error('STOCK_INSUFICIENTE');
        item.cantidadEntregada = item.cantidadSolicitada;
      }
      requisicion.estado = 'APROBADA'; requisicion.aprobadaPor = req.usuario._id;
      resultado = await requisicion.save({session});
    });
    res.json({mensaje: 'Requisición aprobada y materiales descontados', requisicion: resultado});
  } catch (error) {
    const mensajes = {REQUISICION_NO_DISPONIBLE: 'Requisición no disponible', STOCK_INSUFICIENTE: 'Stock insuficiente para aprobar'};
    res.status(mensajes[error.message] ? 400 : 500).json({mensaje: mensajes[error.message] || 'Error al aprobar requisición'});
  } finally { await session.endSession(); }
};

const terminar = async (req, res) => {
  const cantidad = Number(req.body.cantidadProducida);
  const esperada = Number(req.body.cantidadEsperada ?? cantidad);
  const merma = Number(req.body.merma || 0);
  if (!mongoose.isValidObjectId(req.body.productoTerminado) || !Number.isFinite(cantidad) || cantidad < 0 || !Number.isFinite(esperada) || esperada < 0 || !Number.isFinite(merma) || merma < 0) return res.status(400).json({mensaje: 'Datos de producción inválidos'});
  if (Math.abs(esperada - cantidad - merma) > 0.000001) return res.status(400).json({mensaje: 'La cantidad producida más la merma debe coincidir con la cantidad esperada'});
  const session = await mongoose.startSession();
  try {
    let lote; let producto;
    await session.withTransaction(async () => {
      const requisicion = await ProductionRequest.findOne({_id: req.params.id, estado: {$in: ['APROBADA','EN_PROCESO']}}).session(session);
      if (!requisicion) throw new Error('REQUISICION');
      producto = await Product.findOneAndUpdate({_id: req.body.productoTerminado, tipoProducto: 'PRODUCTO_TERMINADO', estado: true}, {$inc: {cantidadActual: cantidad}}, {new: true, session});
      if (!producto) throw new Error('PRODUCTO');
      [lote] = await ProductionBatch.create([{requisicion: requisicion._id, productoTerminado: producto._id, cantidadEsperada: esperada, cantidadProducida: cantidad, merma, observacion: req.body.observacion || '', registradaPor: req.usuario._id}], {session});
      requisicion.estado = 'TERMINADA'; await requisicion.save({session});
    });
    res.status(201).json({mensaje: 'Producción terminada', lote, producto});
  } catch (error) {
    const mensaje = error.message === 'REQUISICION' ? 'La requisición no puede terminarse' : error.message === 'PRODUCTO' ? 'Seleccione un producto terminado válido' : 'Error al terminar producción';
    res.status(['REQUISICION','PRODUCTO'].includes(error.message) ? 400 : 500).json({mensaje});
  } finally { await session.endSession(); }
};

const cancelar = async (req,res) => {
  const session=await mongoose.startSession();
  try {
    let resultado;
    await session.withTransaction(async()=>{
      const requisicion=await ProductionRequest.findOne({_id:req.params.id,estado:{$in:['SOLICITADA','APROBADA']}}).session(session);
      if(!requisicion)throw new Error('ESTADO');
      if(requisicion.estado==='APROBADA'){
        for(const item of requisicion.items){
          if(item.cantidadEntregada>0)await Product.updateOne({_id:item.producto},{$inc:{cantidadActual:item.cantidadEntregada}},{session});
        }
      }
      requisicion.estado='CANCELADA';
      requisicion.observacion=[requisicion.observacion,`Cancelada: ${req.body.motivo?.trim()||'Sin motivo'}`].filter(Boolean).join(' | ');
      resultado=await requisicion.save({session});
    });
    res.json({mensaje:'Requisición cancelada y materiales restaurados',requisicion:resultado});
  }catch(error){res.status(error.message==='ESTADO'?400:500).json({mensaje:error.message==='ESTADO'?'La requisición no puede cancelarse':'Error al cancelar requisición'});}
  finally{await session.endSession();}
};

module.exports = {listar, crear, aprobar, terminar, cancelar};

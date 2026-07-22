const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Delivery = require('../src/models/Delivery');
const Movement = require('../src/models/Movement');
const {validarEntorno,variablesFaltantes,origenesPermitidos}=require('../src/config/env');
const Sale=require('../src/models/Sale');
const CashRegister=require('../src/models/CashRegister');
const {TRANSICIONES}=require('../src/controllers/deliveryController');

test('roles operativos disponibles', () => {
  assert.deepEqual(User.schema.path('rol').enumValues, ['ADMIN','LOGISTICA','CAJERO','REPARTIDOR']);
});

test('tipos de inventario disponibles', () => {
  assert.deepEqual(Product.schema.path('tipoProducto').enumValues, ['MATERIA_PRIMA','INSUMO','PRODUCTO_TERMINADO','REVENTA']);
  assert.equal(Product.schema.path('cantidadActual').options.min, 0);
  assert.equal(Product.schema.path('precioVenta').options.min, 0);
});

test('domicilios tienen el flujo completo', () => {
  const estados = Delivery.schema.path('estado').enumValues;
  for (const estado of ['RECIBIDO','EN_PREPARACION','LISTO_PARA_DESPACHAR','ASIGNADO','EN_CAMINO','ENTREGADO','NO_ENTREGADO','CANCELADO']) assert.ok(estados.includes(estado));
});

test('movimientos no aceptan cantidades negativas', () => {
  assert.ok(Movement.schema.path('cantidad').options.min > 0);
});

test('configuración rechaza secretos débiles o variables faltantes',()=>{
  assert.deepEqual(variablesFaltantes({}),['MONGO_URI','JWT_SECRET']);
  assert.throws(()=>validarEntorno({NODE_ENV:'production',MONGO_URI:'mongodb://db',JWT_SECRET:'corta'}));
  assert.doesNotThrow(()=>validarEntorno({NODE_ENV:'development',MONGO_URI:'mongodb://db',JWT_SECRET:'corta'}));
  assert.doesNotThrow(()=>validarEntorno({MONGO_URI:'mongodb://db',JWT_SECRET:'x'.repeat(32)}));
});

test('CORS admite una lista separada por comas',()=>{
  assert.deepEqual(origenesPermitidos({CORS_ORIGINS:'https://uno.test, https://dos.test'}),['https://uno.test','https://dos.test']);
});

test('caja separa medios de pago y no admite mixto sin desglose',()=>{
  assert.deepEqual(Sale.schema.path('metodoPago').enumValues,['EFECTIVO','TRANSFERENCIA','TARJETA']);
  assert.ok(CashRegister.schema.path('totalesPago.EFECTIVO'));
});

test('domicilios respetan el orden operativo',()=>{
  assert.deepEqual(TRANSICIONES.RECIBIDO,['EN_PREPARACION','CANCELADO']);
  assert.deepEqual(TRANSICIONES.ASIGNADO,['EN_CAMINO']);
  assert.deepEqual(TRANSICIONES.EN_CAMINO,['ENTREGADO','NO_ENTREGADO']);
  assert.equal(TRANSICIONES.LISTO_PARA_DESPACHAR,undefined);
});

test('ventas conservan auditoría de anulación',()=>{
  assert.ok(Sale.schema.path('anulacion.motivo'));
  assert.ok(Sale.schema.path('anulacion.usuario'));
  assert.ok(Sale.schema.path('anulacion.fecha'));
});

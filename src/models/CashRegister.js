const mongoose=require('mongoose');
const schema=new mongoose.Schema({cajero:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},estado:{type:String,enum:['ABIERTA','CERRADA'],default:'ABIERTA'},montoInicial:{type:Number,required:true,min:0},montoFinal:{type:Number,min:0},totalVentas:{type:Number,default:0,min:0},totalesPago:{EFECTIVO:{type:Number,default:0},TRANSFERENCIA:{type:Number,default:0},TARJETA:{type:Number,default:0}},fechaCierre:Date,observacion:{type:String,default:''}},{timestamps:true});
schema.index({cajero:1,estado:1});
module.exports=mongoose.model('CashRegister',schema);

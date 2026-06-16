const Product = require('../models/Product');

const obtenerAlertas = async (req, res) => {
  try {
    const hoy = new Date();

    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + 7);

    const productosStockBajo = await Product.find({
      estado: true,
      $expr: {
        $lte: ['$cantidadActual', '$stockMinimo']
      }
    });

    const productosProximosVencer = await Product.find({
      estado: true,
      fechaVencimiento: {
        $gte: hoy,
        $lte: fechaLimite
      }
    });

    const productosVencidos = await Product.find({
      estado: true,
      fechaVencimiento: {
        $lt: hoy
      }
    });

    res.json({
      mensaje: 'Alertas consultadas correctamente',
      alertas: {
        stockBajo: productosStockBajo,
        proximosAVencer: productosProximosVencer,
        vencidos: productosVencidos
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar alertas',
      error: error.message
    });
  }
};

module.exports = {
  obtenerAlertas
};
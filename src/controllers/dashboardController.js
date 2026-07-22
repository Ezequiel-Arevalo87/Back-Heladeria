const Product = require('../models/Product');
const Movement = require('../models/Movement');

const obtenerDashboard = async (req, res) => {
  try {
    const hoy = new Date();
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(fechaLimite.getDate() + 7);

    const [
      totalProductos,
      productosStockBajo,
      productosProximosVencer,
      productosVencidos,
      totalMovimientos
    ] = await Promise.all([
      Product.countDocuments({ estado: true }),
      Product.countDocuments({
        estado: true,
        $expr: { $lte: ['$cantidadActual', '$stockMinimo'] }
      }),
      Product.countDocuments({
        estado: true,
        fechaVencimiento: { $gte: hoy, $lte: fechaLimite }
      }),
      Product.countDocuments({
        estado: true,
        fechaVencimiento: { $lt: hoy }
      }),
      Movement.countDocuments()
    ]);

    res.json({
      mensaje: 'Dashboard consultado correctamente',
      dashboard: {
        totalProductos,
        productosStockBajo,
        productosProximosVencer,
        productosVencidos,
        totalMovimientos
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar dashboard',
      error: error.message
    });
  }
};

module.exports = { obtenerDashboard };

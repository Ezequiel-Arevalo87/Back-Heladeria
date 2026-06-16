const Product = require('../models/Product');

const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      descripcion,
      cantidadActual,
      stockMinimo,
      unidadMedida,
      fechaVencimiento
    } = req.body;

    const productoExiste = await Product.findOne({
      nombre: { $regex: `^${nombre}$`, $options: 'i' },
      estado: true
    });

    if (productoExiste) {
      return res.status(400).json({
        mensaje: 'El producto ya existe. Utilice una entrada de inventario para aumentar el stock.',
        producto: productoExiste
      });
    }

    const producto = await Product.create({
      nombre,
      categoria,
      descripcion,
      cantidadActual,
      stockMinimo,
      unidadMedida,
      fechaVencimiento
    });

    res.status(201).json({
      mensaje: 'Producto creado correctamente',
      producto
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al crear producto',
      error: error.message
    });
  }
};

const listarProductos = async (req, res) => {
  try {
    const productos = await Product.find({ estado: true }).sort({ createdAt: -1 });

    res.json({
      mensaje: 'Productos consultados correctamente',
      productos
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar productos',
      error: error.message
    });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);

    if (!producto || producto.estado === false) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json({
      mensaje: 'Producto encontrado',
      producto
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener producto',
      error: error.message
    });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { nombre } = req.body;

    const productoActual = await Product.findById(req.params.id);

    if (!productoActual || productoActual.estado === false) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    if (nombre) {
      const productoDuplicado = await Product.findOne({
        _id: { $ne: req.params.id },
        nombre: { $regex: `^${nombre}$`, $options: 'i' },
        estado: true
      });

      if (productoDuplicado) {
        return res.status(400).json({
          mensaje: 'Ya existe otro producto con ese nombre'
        });
      }
    }

    const producto = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      mensaje: 'Producto actualizado correctamente',
      producto
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar producto',
      error: error.message
    });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(
      req.params.id,
      { estado: false },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json({
      mensaje: 'Producto eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar producto',
      error: error.message
    });
  }
};

module.exports = {
  crearProducto,
  listarProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
};
const mongoose = require('mongoose');
const Product = require('../models/Product');

const UNIDADES = ['UNIDAD', 'KG', 'GRAMOS', 'LITROS', 'ML'];
const TIPOS = ['MATERIA_PRIMA', 'INSUMO', 'PRODUCTO_TERMINADO', 'REVENTA'];
const escaparRegex = valor => valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validarProducto = body => {
  const nombre = body.nombre?.trim();
  const categoria = body.categoria?.trim();
  const cantidadActual = Number(body.cantidadActual);
  const stockMinimo = Number(body.stockMinimo);
  const unidadMedida = body.unidadMedida?.trim().toUpperCase();
  const fechaVencimiento = new Date(body.fechaVencimiento);
  const tipoProducto = body.tipoProducto || 'MATERIA_PRIMA';
  const precioVenta = Number(body.precioVenta || 0);

  if (!nombre || !categoria || !unidadMedida || !body.fechaVencimiento) {
    return { error: 'Nombre, categoría, unidad y fecha de vencimiento son obligatorios' };
  }
  if (!Number.isFinite(cantidadActual) || cantidadActual < 0) {
    return { error: 'La cantidad actual debe ser un número mayor o igual a cero' };
  }
  if (!Number.isFinite(stockMinimo) || stockMinimo < 0) {
    return { error: 'El stock mínimo debe ser un número mayor o igual a cero' };
  }
  if (!UNIDADES.includes(unidadMedida)) {
    return { error: 'La unidad de medida no es válida' };
  }
  if (!TIPOS.includes(tipoProducto)) return {error: 'El tipo de producto no es válido'};
  if (!Number.isFinite(precioVenta) || precioVenta < 0) return {error: 'El precio no es válido'};
  if (Number.isNaN(fechaVencimiento.getTime())) {
    return { error: 'La fecha de vencimiento no es válida' };
  }

  return {
    producto: {
      nombre,
      categoria,
      descripcion: body.descripcion?.trim() || '',
      cantidadActual,
      stockMinimo,
      unidadMedida,
      fechaVencimiento
      ,tipoProducto,
      precioVenta
    }
  };
};

const crearProducto = async (req, res) => {
  try {
    const validacion = validarProducto(req.body);
    if (validacion.error) {
      return res.status(400).json({ mensaje: validacion.error });
    }
    if (validacion.producto.cantidadActual !== 0) {
      return res.status(400).json({mensaje: 'Cree el producto con cantidad cero y registre la existencia mediante un movimiento de entrada'});
    }

    const productoExiste = await Product.findOne({
      nombre: { $regex: `^${escaparRegex(validacion.producto.nombre)}$`, $options: 'i' },
      estado: true
    });
    if (productoExiste) {
      return res.status(400).json({
        mensaje: 'El producto ya existe. Utilice una entrada de inventario para aumentar el stock.',
        producto: productoExiste
      });
    }

    const producto = await Product.create(validacion.producto);
    res.status(201).json({ mensaje: 'Producto creado correctamente', producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear producto', error: error.message });
  }
};

const listarProductos = async (req, res) => {
  try {
    const productos = await Product.find({ estado: true }).sort({ createdAt: -1 });
    res.json({ mensaje: 'Productos consultados correctamente', productos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar productos', error: error.message });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'Identificador de producto no válido' });
    }
    const producto = await Product.findById(req.params.id);
    if (!producto || !producto.estado) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto encontrado', producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener producto', error: error.message });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'Identificador de producto no válido' });
    }
    const validacion = validarProducto(req.body);
    if (validacion.error) {
      return res.status(400).json({ mensaje: validacion.error });
    }

    const productoActual = await Product.findOne({ _id: req.params.id, estado: true });
    if (!productoActual) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    // El stock solo cambia mediante movimientos, producción, ventas o anulaciones.
    validacion.producto.cantidadActual = productoActual.cantidadActual;

    const productoDuplicado = await Product.findOne({
      _id: { $ne: req.params.id },
      nombre: { $regex: `^${escaparRegex(validacion.producto.nombre)}$`, $options: 'i' },
      estado: true
    });
    if (productoDuplicado) {
      return res.status(400).json({ mensaje: 'Ya existe otro producto con ese nombre' });
    }

    const producto = await Product.findByIdAndUpdate(
      req.params.id,
      validacion.producto,
      { new: true, runValidators: true }
    );
    res.json({ mensaje: 'Producto actualizado correctamente', producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'Identificador de producto no válido' });
    }
    const producto = await Product.findOneAndUpdate(
      { _id: req.params.id, estado: true },
      { estado: false },
      { new: true }
    );
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
};

module.exports = {
  crearProducto,
  listarProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
};

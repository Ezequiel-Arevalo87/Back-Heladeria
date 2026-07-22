const intentos = new Map();
const VENTANA = 15 * 60 * 1000;
const MAXIMO = 10;

const claveIntento = req => `${req.ip}:${String(req.body?.correo || '').trim().toLowerCase()}`;

const loginRateLimit = (req, res, next) => {
  const clave = claveIntento(req);
  const ahora = Date.now();
  let registro = intentos.get(clave);

  if (registro && ahora - registro.inicio >= VENTANA) {
    intentos.delete(clave);
    registro = null;
  }

  if (registro?.cantidad >= MAXIMO) {
    const segundos = Math.max(1, Math.ceil((VENTANA - (ahora - registro.inicio)) / 1000));
    res.set('Retry-After', String(segundos));
    return res.status(429).json({
      mensaje: `Demasiados intentos fallidos. Intente nuevamente en ${Math.ceil(segundos / 60)} minuto(s)`,
      reintentarEnSegundos: segundos,
    });
  }

  res.on('finish', () => {
    if (res.statusCode === 401) {
      const anterior = intentos.get(clave);
      if (!anterior || Date.now() - anterior.inicio >= VENTANA) {
        intentos.set(clave, {inicio: Date.now(), cantidad: 1});
      } else {
        anterior.cantidad += 1;
      }
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      intentos.delete(clave);
    }
  });

  next();
};

const limpiar = () => {
  const limite = Date.now() - VENTANA;
  for (const [clave, registro] of intentos) {
    if (registro.inicio < limite) intentos.delete(clave);
  }
};

const temporizador = setInterval(limpiar, VENTANA);
temporizador.unref();

module.exports = {loginRateLimit, limpiar, intentos};

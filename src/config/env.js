const variablesFaltantes = env => ['MONGO_URI','JWT_SECRET'].filter(nombre => !env[nombre]?.trim());
const validarEntorno = env => {
  const faltantes = variablesFaltantes(env);
  if (faltantes.length) throw new Error(`Variables obligatorias faltantes: ${faltantes.join(', ')}`);
  if (env.NODE_ENV === 'production' && env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción');
};
const origenesPermitidos = env => (env.CORS_ORIGINS || '').split(',').map(x=>x.trim()).filter(Boolean);
module.exports={validarEntorno,variablesFaltantes,origenesPermitidos};

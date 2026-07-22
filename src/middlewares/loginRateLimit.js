const intentos=new Map();const VENTANA=15*60*1000;const MAXIMO=10;
const loginRateLimit=(req,res,next)=>{const clave=req.ip;const ahora=Date.now();const registro=intentos.get(clave);if(!registro||ahora-registro.inicio>VENTANA){intentos.set(clave,{inicio:ahora,cantidad:1});return next();}registro.cantidad+=1;if(registro.cantidad>MAXIMO)return res.status(429).json({mensaje:'Demasiados intentos. Intente nuevamente en 15 minutos'});next();};
const limpiar=()=>{const limite=Date.now()-VENTANA;for(const[k,v]of intentos)if(v.inicio<limite)intentos.delete(k);};
const temporizador=setInterval(limpiar,VENTANA);temporizador.unref();
module.exports={loginRateLimit,limpiar,intentos};

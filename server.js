require('dotenv').config();
const {validarEntorno}=require('./src/config/env');
validarEntorno(process.env);
const app = require('./src/app.js');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

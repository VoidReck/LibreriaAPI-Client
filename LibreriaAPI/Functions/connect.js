// Importa el módulo mongoose
const mongoose = require('mongoose');

// Obtiene la cadena de conexión a MongoDB desde las variables de entorno
const mongoDBConnection = process.env.MONGODB;

// Configura mongoose para desactivar la opción 'strictQuery'
mongoose.set('strictQuery', false);

// Conecta a la base de datos MongoDB
console.log('Conectando a la base de datos...');
mongoose.connect(mongoDBConnection)
    .then(() => console.log('Base de datos conectada'))
    .catch(e => console.log('error db:', e))

// Configura mongoose para usar las promesas globales de Node.js
mongoose.Promise = global.Promise;

// Exporta el módulo mongoose para su uso en otros archivos
module.exports = mongoose;
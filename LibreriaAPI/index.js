// Importar módulos necesarios
require("dotenv").config({ path: './Core/.env' });
require('./Functions/connect')
const express = require('express');
const cors = require('cors');
const http = require('http');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Variables de entorno
const apiHost = process.env.APIHOST;
const apiPort = process.env.APIPORT || 4000;

const app = express();

// Configuración de CORS
const corsOptions = {
    origin: '*', // Reemplazar con el dominio en producción
    optionsSuccessStatus: 200
};

// Configuración de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Biblioteca API',
            version: '1.0.0',
            description: 'Documentación de la API de la Biblioteca'
        },
        servers: [
            {
                url: `http://${apiHost}:${apiPort}/endpoint`,
                description: 'Servidor de Desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                authToken: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./routes/*.js'], // Archivos que contienen anotaciones de rutas
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middlewares
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware para agregar encabezado
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Library API');
    next();
});

// Importar y usar rutas
const authRoutes = require('./Routes/auth');
const libreria = require('./Routes/libreria')
const verifyToken = require('./Routes/validate-token'); // se usa para verificar el token en toda la ruta

// Ruta principal
app.get('/endpoint', (req, res) => {
    res.json({
        status: `Operational (${res.statusCode})`
    });
});

// Rutas protegidas
app.use('/endpoint/users', authRoutes);
app.use('/endpoint/libros', libreria);

// Crear servidor API HTTP
const apiServer = http.createServer(app);

// Iniciar servidor HTTP para API
apiServer.listen(apiPort, () => {
    console.info(`API server running on: http://${apiHost}:${apiPort}/endpoint`);
});

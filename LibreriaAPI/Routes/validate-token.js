// Importa los módulos necesarios
const jwt = require('jsonwebtoken')
const Tokens = require('../Schemas/tokens');

// middleware para validar el token (rutas protegidas)
const verifyToken = async (req, res, next) => {
    try {

        // Obtiene el token del encabezado 'auth-token' o 'authorization'
        const token = req.header('auth-token') || (req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null)

        const tokenType = req.header('auth-token') ? 'auth-token' : 'Bearer token'

        if (!token) return res.status(401).json({
            code: res.statusCode,
            error: `${tokenType} no definido o no es válido` 
        });

        // Verifica si el token existe en la base de datos
        const tokenCheck = await Tokens.findOne({ token: token });

        if (!tokenCheck) return res.status(400).json({ 
            code: res.statusCode,
            error: `${tokenType} no es válido` 
        })

        if (!tokenCheck.active) return res.status(400).json({ 
            code: res.statusCode,
            error: `${tokenType} revocado` 
        })

        if (tokenType === 'auth-token') {
            try {
                // Verifica la validez del token
                const verified = jwt.verify(token, process.env.TOKEN_SECRET)
                req.user = verified // Adjunta los datos del usuario al objeto req
                next() // Continúa con la siguiente función middleware
            } catch (error) {
                return res.status(400).json({ 
                    code: res.statusCode,
                    error: error.message,
                    message: `${tokenType} vencido` 
                });
            }
        } else {
            // Verifica la validez del token
            jwt.verify(token, process.env.TOKEN_SECRET, (error, authData) => {
                if (error) return res.status(400).json({ 
                    code: res.statusCode,
                    error: error,
                    message: `${tokenType} vencido` 
                })

                req.user = authData; // Adjunta los datos del usuario al objeto req
                next(); // Continúa con la siguiente función middleware
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            code: res.statusCode,
            error: error.message, 
            message: 'Error interno del servidor'
        })
    }
}

// Exporta el middleware para su uso en otros archivos
module.exports = verifyToken;
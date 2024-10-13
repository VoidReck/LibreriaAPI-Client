// Importaciones de módulos necesarios
const router = require('express').Router();
const User = require('../Schemas/users');
const Tokens = require('../Schemas/tokens');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Para el hashing de contraseñas
const Joi = require('@hapi/joi'); // Para la validación de datos

// Esquema de validación para el registro de usuarios
const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

// Esquema de validación para el inicio de sesión
const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Operaciones para gestionar los usuarios y sus autenticaciones
 */

// Ruta para el registro de usuarios
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra un nuevo usuario en la base de datos.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@ejemplo.com"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "contraseña123"
 *     responses:
 *       200:
 *         description: Retorna el estado de la operación y los datos del usuario creado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID del usuario
 *                       example: 603e3371d6d52e0020a65d1c
 *                     name:
 *                       type: string
 *                       description: Nombre del usuario
 *                       example: "Juan Pérez"
 *                     email:
 *                       type: string
 *                       description: Correo electrónico del usuario
 *                       example: "usuario@ejemplo.com"
 *       400:
 *         description: Datos no válidos o Correo electrónico ya registrado
 *       500:
 *         description: Error al momento de registrar el nuevo usuario
 */
router.post('/register', async (req, res) => {

    // Validar los datos del usuario
    const { error } = schemaRegister.validate(req.body)
    if (error) {
        return res.status(400).json({ error: error.details[0].message })
    }

    // Verificar si el correo electrónico ya está registrado
    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
        return res.status(400).json({ error: 'Email ya registrado' })
    }

    // hash contraseña
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    // Crear un nuevo usuario
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: password
    });

    // Guardar el usuario en la base de datos
    try {
        const savedUser = await user.save();
        res.json({
            data: savedUser
        })
    } catch (error) {
        res.status(500).json({ error })
    }
})

// Ruta para el inicio de sesión de usuarios
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Autentica al usuario y devuelve un token.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@ejemplo.com"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "contraseña123"
 *     responses:
 *       200:
 *         description: Usuario autenticado exitosamente.
 *         headers:
 *           user-token:
 *             schema:
 *               type: string
 *               description: Token de autenticación
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: Mensaje de confirmación
 *                       example: "Bienvenido Juan Pérez - usuario@ejemplo.com"
 *                     name:
 *                       type: string
 *                       description: Nombre del usuario
 *                       example: "Juan Pérez"
 *                     email:
 *                       type: string
 *                       description: Correo electrónico del usuario
 *                       example: "usuario@ejemplo.com"
 *       400:
 *         description: Datos no válidos, usuario no encontrado, contraseña no válida.
 *       500:
 *         description: Error al guardar el token.
 */
router.post('/login', async (req, res) => {
    // Validar los datos del usuario
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message })

    // Verificar si el usuario existe
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'contraseña no válida' })

    // Verificar si el token activo existe y no ha expirado
    let token;
    const activeToken = await Tokens.findOne({ email: user.email, active: true })

    if (!activeToken){
        // Crear un nuevo token si no hay token activo
        token = jwt.sign({
            id: user._id,
            email: user.email,
            
        }, process.env.TOKEN_SECRET, { expiresIn: '24h' })
    } else {
        if (isTokenExpired(activeToken.token)) {
            // Eliminar el token expirado y crear uno nuevo
            await Tokens.collection.findOneAndDelete({ token: activeToken.token })
            token = jwt.sign({
                id: user._id,
                email: user.email,

            }, process.env.TOKEN_SECRET, { expiresIn: '24h' })

        } else {
            // Usar el token activo existente
            token = activeToken.token;
        } 
    }

    // Guardar el nuevo token en la base de datos
    const tokens = new Tokens({
        email: user.email,
        token: token,
        active: true
    });

    // verificar si existe algún token en la base de datos
    const tokenCheck = await Tokens.findOne({ token: token });
    
    // Si no existe, guardar el nuevo token en la base de datos
    if (!tokenCheck) {
        try {
            await tokens.save();
        } catch (error) {
            // Manejo de errores al guardar el token
            console.log(error)
            res.status(500).json({ error: 'Error al guardar el token' })
        }
    }
    
    // Enviar la respuesta con el token
    res.header('user-token', token).json({
        data: {
            message: `Bienvenido ${user.name} - ${user.email}`,
            name: user.name,
            email: user.email
        }
    })

    // Función para verificar si un token ha expirado
    function isTokenExpired(token) {
        try {
            jwt.verify(token, process.env.TOKEN_SECRET);
            return false;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return true;
            } else {
                throw error;
            }
        }
    }
})

// Exporta el router para su uso en otros archivos
module.exports = router;
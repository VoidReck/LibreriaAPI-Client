// Importa el módulo de enrutador de Express
const router = require('express').Router();
const Joi = require('@hapi/joi'); // Para la validación de datos
const verifyToken = require('./validate-token')
const Books = require('../Schemas/books');


// Esquema de validación para el registro de usuarios
const schemaBooks = Joi.object({
    title: Joi.string().min(6).max(255).required(),
    author: Joi.string().min(6).max(255).required(),
    publishedYear: Joi.string().regex(/^[0-9]{4}$/).messages({
        'string.pattern.base': 'El año de publicación debe tener 4 dígitos numéricos.'
    }).required(),
    status: Joi.string().valid('disponible', 'reservado').required()
})

/**
 * @swagger
 * tags:
 *   - name: Libros
 *     description: Operaciones para gestionar los libros en la biblioteca
 */

// Obtener todos los libros
/**
 * @swagger
 * /libros:
 *   get:
 *     summary: Obtiene la lista de libros.
 *     tags:
 *       - Libros
 *     responses:
 *       200:
 *         description: Lista de libros obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID del libro
 *                     example: 603e3371d6d52e0020a65d1c
 *                   title:
 *                     type: string
 *                     description: Título del libro
 *                     example: "El Quijote"
 *                   author:
 *                     type: string
 *                     description: Autor del libro
 *                     example: "Miguel de Cervantes"
 *                   publishedYear:
 *                     type: string
 *                     description: Año de publicación del libro
 *                     example: 1605
 *                   status:
 *                     type: string
 *                     description: Estado del libro
 *                     example: "disponible"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Error al obtener libros"
 */
router.get('/', async (req, res) => {
    try {
        const booksList = await Books.find();
        res.json(booksList);
    } catch (error) {
        res.status(500).json({
            code: res.statusCode,
            error: error.message,
            message: 'Error al obtener libros'
        });
    }
});

// buscar libro por nombre, autor o ambos
/**
 * @swagger
 * /libros/buscar:
 *   get:
 *     summary: Obtiene el libro o libros por autor, nombre o ambos.
 *     tags:
 *       - Libros
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *           example: "El Quijote"
 *         description: Título del libro
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *           example: "Miguel de Cervantes"
 *         description: Autor del libro
 *     responses:
 *       200:
 *         description: Lista de libros que fueron encontrados correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID del libro
 *                     example: 603e3371d6d52e0020a65d1c
 *                   title:
 *                     type: string
 *                     description: Título del libro
 *                     example: "El Quijote"
 *                   author:
 *                     type: string
 *                     description: Autor del libro
 *                     example: "Miguel de Cervantes"
 *                   publishedYear:
 *                     type: string
 *                     description: Año de publicación del libro
 *                     example: 1605
 *                   status:
 *                     type: string
 *                     description: Estado del libro
 *                     example: "disponible"
 *       400:
 *         description: Error en los datos proporcionados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: string
 *                   example: "Debe proporcionar un título o un autor para buscar."
 *       404:
 *         description: No se encontro el recurso solicitado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "No se encontraron libros con los criterios de búsqueda proporcionados."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Error al obtener libros"
 */
router.get('/buscar', async (req, res) => {

    // Parámetros de búsqueda
    const { title, author } = req.query;

    // Validación de los parámetros de búsqueda
    if (!title && !author) {
        return res.status(400).json({
            code: res.statusCode,
            error: 'Debe proporcionar un título o un autor para buscar.'
        });
    }

    try {
        // Construir la query según los parámetros de búsqueda
        let query = {};
        if (title) query.title = new RegExp(title, 'i'); // Búsqueda por título
        if (author) query.author = new RegExp(author, 'i'); // Búsqueda por autor

        // Buscar libros que cumplen con los criterios de búsqueda
        const booksList = await Books.find(query);

        // Si no se encontraron libros con los criterios de búsqueda proporcionados, retornar un mensaje de error
        if (booksList.length === 0) return res.status(404).json({
            code: res.statusCode,
            error: 'No se encontraron libros con los criterios de búsqueda proporcionados'
        });
        res.json(booksList);
    } catch (error) {
        res.status(500).json({
            code: res.statusCode,
            error: error.message,
            message: 'Error al buscar libros'
        });
    }
});

// Obtener un libro específico por ID
/**
 * @swagger
 * /libros/{id}:
 *   get:
 *     summary: Obtiene un libro específico mediante su ID.
 *     tags:
 *       - Libros
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del libro
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Retorna el libro buscado por la ID proporcionada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID del libro
 *                   example: 603e3371d6d52e0020a65d1c
 *                 title:
 *                   type: string
 *                   description: Título del libro
 *                   example: "El Quijote"
 *                 author:
 *                   type: string
 *                   description: Autor del libro
 *                   example: "Miguel de Cervantes"
 *                 publishedYear:
 *                   type: string
 *                   description: Año de publicación del libro
 *                   example: 1605
 *                 status:
 *                   type: string
 *                   description: Estado del libro
 *                   example: "disponible"
 *       404:
 *         description: No se encontro el recurso solicitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Libro no encontrado."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Error al obtener libro"
 */
router.get('/:id', async (req, res) => {
    try {
        // Validar el ID del libro
        const book = await Books.findById(req.params.id);
        
        // Si el libro no existe, retornar un mensaje de error
        if (!book) return res.status(404).json({
            code: res.statusCode,
            error: 'Libro no encontrado'
        });
        res.json(book);
    } catch (error) {
        res.status(500).json({
            code: res.statusCode,
            error: error.message,
            message: 'Error al obtener libro'
        });
    }
});

// Agregar un nuevo libro
/**
 * @swagger
 * /libros:
 *   post:
 *     summary: Se agrega un nuevo libro a la base de datos.
 *     tags:
 *       - Libros
 *     security:
 *       - bearerAuth: []
 *       - authToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del libro
 *                 example: "El Quijote"
 *               author:
 *                 type: string
 *                 description: Autor del libro
 *                 example: "Miguel de Cervantes"
 *               publishedYear:
 *                 type: string
 *                 description: Año de publicación del libro
 *                 example: 1605
 *               status:
 *                 type: string
 *                 description: Estado del libro
 *                 example: "disponible"
 *     responses:
 *       200:
 *         description: Retorna el nuevo libro agregado a la base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID del libro
 *                   example: 603e3371d6d52e0020a65d1c
 *                 title:
 *                   type: string
 *                   description: Título del libro
 *                   example: "El Quijote"
 *                 author:
 *                   type: string
 *                   description: Autor del libro
 *                   example: "Miguel de Cervantes"
 *                 publishedYear:
 *                   type: string
 *                   description: Año de publicación del libro
 *                   example: 1605
 *                 status:
 *                   type: string
 *                   description: Estado del libro
 *                   example: "disponible"
 *       400:
 *         description: Error en los datos proporcionados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: string
 *                   example: "Datos de entrada no válidos"
 *       401:
 *         description: No se tiene permitido el acceso con las credenciales suministradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 error:
 *                   type: string
 *                   example: "Bearer token no definido o no es válido"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Error al agregar el libro"
 */
router.post('/', verifyToken, async (req, res) => {

    // Validar los datos del usuario
    const { error } = schemaBooks.validate(req.body)
    if (error) return res.status(400).json({
        code: res.statusCode,
        error: error.details[0].message,
        message: 'Datos de entrada no válidos'
    })

    // Crear un nuevo libro
    const book = new Books({
        title: req.body.title,
        author: req.body.author,
        publishedYear: req.body.publishedYear,
        status: req.body.status
    });

    // Guardar el libro en la base de datos en caso de error retornar un mensaje
    try {
        const savedBook = await book.save();
        res.json({
            data: savedBook
        })
    } catch (error) {
        res.status(500).json({
            code: res.statusCode,
            error: error.message,
            message: 'Error al agregar el libro'
        })
    }
});

// Actualizar un libro específico por ID
/**
 * @swagger
 * /libros/{id}:
 *   put:
 *     summary: Actualiza un libro en la base de datos.
 *     tags:
 *       - Libros
 *     security:
 *       - bearerAuth: []
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del libro
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del libro
 *                 example: "El Quijote"
 *               author:
 *                 type: string
 *                 description: Autor del libro
 *                 example: "Miguel de Cervantes"
 *               publishedYear:
 *                 type: string
 *                 description: Año de publicación del libro
 *                 example: 1615
 *               status:
 *                 type: string
 *                 description: Estado del libro
 *                 example: "disponible"
 *     responses:
 *       200:
 *         description: Retorna el libro editado con sus nuevos valores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID del libro
 *                   example: 603e3371d6d52e0020a65d1c
 *                 title:
 *                   type: string
 *                   description: Título del libro
 *                   example: "El Quijote"
 *                 author:
 *                   type: string
 *                   description: Autor del libro
 *                   example: "Miguel de Cervantes"
 *                 publishedYear:
 *                   type: string
 *                   description: Año de publicación del libro
 *                   example: 1605
 *                 status:
 *                   type: string
 *                   description: Estado del libro
 *                   example: "disponible"
 *       401:
 *         description: No se tiene permitido el acceso con las credenciales suministradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 error:
 *                   type: string
 *                   example: "Bearer token no definido o no es válido"
 *       404:
 *         description: No se encontro el recurso solicitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Libro no encontrado."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar libro"
 */
router.put('/:id', verifyToken, async (req, res) => {
    try {
        // Validar los datos del libro
        const book = await Books.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Si el libro no existe, retornar un mensaje de error
        if (!book) return res.status(404).json({
            code: res.statusCode,
            error: 'Libro no encontrado'
        });
        res.json(book);
    } catch (error) {
        res.status(500).json({
            code: res.statusCode,
            error: error.message,
            message: 'Error al actualizar libro'
        });
    }
});

// Actualizar un libro específico por ID
/**
 * @swagger
 * /libros/{id}:
 *   patch:
 *     summary: Actualiza un libro en la base de datos (con uno o varios valores).
 *     tags:
 *       - Libros
 *     security:
 *       - bearerAuth: []
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del libro
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del libro
 *                 example: "El Quijote"
 *               author:
 *                 type: string
 *                 description: Autor del libro
 *                 example: "Miguel de Cervantes"
 *               publishedYear:
 *                 type: string
 *                 description: Año de publicación del libro
 *                 example: 1615
 *               status:
 *                 type: string
 *                 description: Estado del libro
 *                 example: "disponible"
 *     responses:
 *       200:
 *         description: Retorna el libro editado con sus nuevos valores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID del libro
 *                   example: 603e3371d6d52e0020a65d1c
 *                 title:
 *                   type: string
 *                   description: Título del libro
 *                   example: "El Quijote"
 *                 author:
 *                   type: string
 *                   description: Autor del libro
 *                   example: "Miguel de Cervantes"
 *                 publishedYear:
 *                   type: string
 *                   description: Año de publicación del libro
 *                   example: 1605
 *                 status:
 *                   type: string
 *                   description: Estado del libro
 *                   example: "disponible"
 *       401:
 *         description: No se tiene permitido el acceso con las credenciales suministradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 error:
 *                   type: string
 *                   example: "Bearer token no definido o no es válido"
 *       404:
 *         description: No se encontro el recurso solicitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Libro no encontrado."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar libro"
 */
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        // Validar los datos del libro
        const book = await Books.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Si el libro no existe, retornar un mensaje de error
        if (!book) return res.status(404).json({
            code: res.statusCode,
            error: 'Libro no encontrado'
        });
        res.json(book);
    } catch (error) {
        res.status(500).json({
            code: res.statusCode,
            error: error.message,
            message: 'Error al actualizar libro'
        });
    }
});

// Eliminar un libro específico por ID
/**
 * @swagger
 * /libros/{id}:
 *   delete:
 *     summary: Elimina el libro especificado de la base de datos.
 *     tags:
 *       - Libros
 *     security:
 *       - bearerAuth: []
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del libro
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Retorna la respuesta del proceso de eliminación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de confirmación
 *                   example: Libro eliminado
 *       401:
 *         description: No se tiene permitido el acceso con las credenciales suministradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 error:
 *                   type: string
 *                   example: "Bearer token no definido o no es válido"
 *       404:
 *         description: No se encontro el recurso solicitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Libro no encontrado."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar libro"
 */
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        // Validar el ID del libro
        const book = await Books.findByIdAndDelete(req.params.id);
        
        // verifica si no existe el libro en caso contrario retorna un error
        if (!book) return res.status(404).json({
            code: res.statusCode,
            error: 'Libro no encontrado'
        });
        res.json({ message: 'Libro eliminado' });
    } catch (error) {
        res.status(500).json({
            code: res.statusCode,
            error: error.message,
            message: 'Error al eliminar libro',
        });
    }
});

// Exporta el enrutador para su uso en otros archivos
module.exports = router
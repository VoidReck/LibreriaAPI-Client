const express = require('express');
const axios = require('axios');
const router = express.Router();
const apiUrl = process.env.APIURL;

// Ruta para listar libros
router.get('/list', function (req, res, next) {
    // Se obtiene la cookie de datos de usuario
    const userData = req.cookies['user-data'];

    // se hace consulta de la lista de libros
    axios.get(`${apiUrl}/libros`)
        .then(response => {
            if (response.status === 200) {
                req.session.swIcon = 'success';
                req.session.swTitle = 'Lista de libros';
                req.session.swText = 'Lista de libros obtenida correctamente';
                res.render('books/list', { title: 'Libreria API Client', booksList: response.data, user: userData  });
            } else {
                req.session.swIcon = 'error';
                req.session.swTitle = 'Error al obtener lista';
                req.session.swText = 'Error desconocido, por favor intente de nuevo';
                res.redirect('/');
            }
        })
        .catch(error => {
            console.log(error.message);
            req.session.swIcon = 'error';
            req.session.swTitle = 'Error al obtener lista';
            req.session.swText = `Error en el registro ${error.response?.data?.error || error.message}`;
            res.redirect('/');
        });
});

// Ruta para buscar libros
router.get('/search', async (req, res) => {
    res.render('books/search', {title: 'Buscar Libros' });
});

// Ruta para mostrar detalle de la busqueda
router.get('/result', async (req, res) => {
    // Se obtiene la cookie de datos de usuario
    const userData = req.cookies['user-data'];

    const { title, author } = req.query;
    try {
        const response = await axios.get(`${apiUrl}/libros/buscar`, { params: { title, author } });
        res.render('books/result', { title: 'Libreria API Client', booksList: response.data, user: userData });
    } catch (error) {
        console.error('Error al buscar libros:', error.message);
        req.session.swIcon = 'error';
        req.session.swTitle = 'Error al buscar libros';
        req.session.swText = 'Ocurrió un error inesperado al realizar la búsqueda. Intente nuevamente.';
        res.render('books/result', { title: 'Libreria API Client' });
    }

});

// Ruta para mostrar el formulario de agregar libro
router.get('/add', (req, res) => {
    const user = req.cookies['user-data'];
    const token = req.cookies['user-token'];

    if (user && token) {
        res.render('books/add', { title: 'Libreria API Client', user: user });
    } else {
        res.redirect('/');
    }
});

// Ruta para manejar la solicitud de agregar libro
router.post('/add/new', async (req, res) => {
    const { title, author, publishedYear, status } = req.body;
    const token = req.cookies['user-token'];

    if (token) {
        try {
            await axios.post(`${apiUrl}/libros`, { title, author, publishedYear, status }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            req.session.swIcon = 'success';
            req.session.swTitle = 'Libro Agregado';
            req.session.swText = 'El libro ha sido agregado correctamente.';
            res.redirect('/books/list');
        } catch (error) {
            console.error('Error al agregar libro:', error.message);
            req.session.swIcon = 'error';
            req.session.swTitle = 'Error al agregar libro';
            req.session.swText = 'Ocurrió un error al agregar el libro. Intente nuevamente.';
            res.redirect('/books/agregar');
        }
    } else {
        res.redirect('/');
    }
});

// Ruta para mostrar el formulario de editar libro
router.get('/edit/:id', (req, res) => {
    const user = req.cookies['user-data'];
    const token = req.cookies['user-token'];

    if (user && token) {
        axios.get(`${apiUrl}/libros/${req.params.id}`)
            .then(response => {
                res.render('books/edit', {
                    title: 'Libreria API Client',
                    libro: response.data,
                    user: user
                });
            })
            .catch(error => {
                console.error('Error al obtener libro:', error.message);
                req.session.swIcon = 'error';
                req.session.swTitle = 'Error al obtener libro';
                req.session.swText = 'Ocurrió un error al obtener el libro. Intente nuevamente.';
                res.redirect('/books/list');
            });
    } else {
        res.redirect('/');
    }
});

// Ruta para manejar la solicitud de editar libro
router.post('/edit/result/:id', async (req, res) => {
    const { title, author, publishedYear, status } = req.body;
    const token = req.cookies['user-token'];

    if (token) {
        try {
            await axios.put(`${apiUrl}/libros/${req.params.id}`, { title, author, publishedYear, status }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            req.session.swIcon = 'success';
            req.session.swTitle = 'Libro Editado';
            req.session.swText = 'El libro ha sido editado correctamente.';
            res.redirect('/books/list');
        } catch (error) {
            console.error('Error al editar libro:', error.message);
            req.session.swIcon = 'error';
            req.session.swTitle = 'Error al editar libro';
            req.session.swText = 'Ocurrió un error al editar el libro. Intente nuevamente.';
            res.redirect(`/books/editar/${req.params.id}`);
        }
    } else {
        res.redirect('/login');
    }
});

// Ruta para mostrar el formulario de eliminar libro
router.get('/delete/:id', (req, res) => {
    const user = req.cookies['user-data'];
    const token = req.cookies['user-token'];

    if (user && token) {
        axios.get(`${apiUrl}/libros/${req.params.id}`)
            .then(response => {
                res.render('books/remove', {
                    title: 'Libreria API Client',
                    libro: response.data,
                    user: user
                });
            })
            .catch(error => {
                console.error('Error al obtener libro:', error.message);
                req.session.swIcon = 'error';
                req.session.swTitle = 'Error al obtener libro';
                req.session.swText = 'Ocurrió un error al obtener el libro. Intente nuevamente.';
                res.redirect('/books/list');
            });
    } else {
        res.redirect('/');
    }
});

// Ruta para manejar la solicitud de eliminar libro
router.post('/delete/result/:id', async (req, res) => {
    const token = req.cookies['user-token'];

    if (token) {
        try {
            await axios.delete(`${apiUrl}/libros/${req.params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            req.session.swIcon = 'success';
            req.session.swTitle = 'Libro Eliminado';
            req.session.swText = 'El libro ha sido eliminado correctamente.';
            res.redirect('/books/list');
        } catch (error) {
            console.error('Error al eliminar libro:', error.message);
            req.session.swIcon = 'error';
            req.session.swTitle = 'Error al eliminar libro';
            req.session.swText = 'Ocurrió un error al eliminar el libro. Intente nuevamente.';
            res.redirect('/books/list');
        }
    } else {
        res.redirect('/');
    }
});

module.exports = router;

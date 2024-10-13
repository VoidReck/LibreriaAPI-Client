const express = require('express');
const axios = require('axios');
const router = express.Router();

const apiUrl = process.env.APIURL

// ruta para inciar sesión
router.post('/auth', function(req, res, next) {
  // Se obtiene el correo y contraseña utilizado para iniciar sesión
  const email = req.body.email;
  const password = req.body.password;

  // Se envía la petición al endpoint de login de la API
  axios.post(`${apiUrl}/users/login`, { email, password })
    .then(response => {;
      if (response.headers['user-token']) {
        // Almacena el token y la información del usuario en una cookie
        const userData = {
          name: response.data.data.name,
          email: response.data.data.email,
          auth: true
        }

        res.cookie('user-token', response.headers['user-token'], { httpOnly: true });
        res.cookie('user-data', userData, { httpOnly: true });
        req.user = response.data;
        res.redirect('/user');
      } else {
        req.session.swIcon = 'error';
        req.session.swTitle = 'Error en login';
        req.session.swText = 'Correo o contraseña incorrectos.';
        res.redirect('/');
      }
    })
    .catch(error => {
      console.error('Error en login:', error.message);
      if (error.response && error.response.status === 400) {
        req.session.swIcon = 'error';
        req.session.swTitle = 'Error en login';
        req.session.swText = 'Datos de login incorrectos. Por favor, verifique su correo y contraseña.';
        res.redirect('/');
      } else {
        req.session.swIcon = 'error';
        req.session.swTitle = 'Error del Servidor';
        req.session.swText = 'Error interno del servidor. Intente nuevamente más tarde.';
        res.redirect('/');
      }
    });
});

// ruta para registrar un nuevo usuario
router.post('/register', function (req, res, next) {
  // Se obtiene el correo y contraseña utilizado para iniciar sesión
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  
  axios.post(`${apiUrl}/users/register`, { name, email, password })
    .then(response => {
      if (response.statusCode === 201) {
        req.session.swIcon = 'success';
        req.session.swTitle = 'Registro Completado';
        req.session.swText = 'Se ha registrado completamente';
        res.redirect('/');
      } else {
        req.session.swIcon = 'error';
        req.session.swTitle = 'Error de registro';
        req.session.swText = 'Error desconocido, por favor intente de nuevo';
        res.redirect('/');
      }
    })
    .catch(error => {
      console.log(error.response.data.error);
      req.session.swIcon = 'error';
      req.session.swTitle = 'Error de registro';
      req.session.swText = `Error en el registro: ${error.response.data.error}`;
      res.redirect('/');
    });
});

module.exports = router;

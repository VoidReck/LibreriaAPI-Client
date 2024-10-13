const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
 
  // Obtener el mensaje de la sesion para informar al usuario
  const swIcon = req.session.swIcon;
  const swTitle = req.session.swTitle;
  const swText = req.session.swText;

  // Limpiar el mensaje después de usarlo
  req.session.swIcon = null;
  req.session.swTitle = null;
  req.session.swText = null;

  const token = req.cookies['user-token'];
  const userData = req.cookies['user-data'];

  // Verificar si el usuario está autenticado
  if (token && userData.auth) {
    res.redirect('/user')
  } else {
    res.render('index', { title: 'Libreria API Client', swIcon, swTitle, swText });
  }

});

router.get('/user', function(req, res) { 

  const token = req.cookies['user-token'];
  const userData = req.cookies['user-data'];
  
  // Verificar si el usuario está autenticado
  if (token && userData.auth) {
    res.render('user', { title: 'Libreria API Client', user: userData });
  } else {
    res.redirect('/')
  }
});

module.exports = router;

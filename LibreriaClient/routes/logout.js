const express = require('express');
const router = express.Router();

// Ruta para cerrar sesión
router.get('/', function (req, res) {
    res.clearCookie('user-token');
    res.clearCookie('user-data');
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

module.exports = router;
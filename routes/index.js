var express = require('express');
var con = require('../database/controller');
var router = express.Router();

//HOME - Devuelve lista de usuarios
router.get('/', con.getAllUsers);

//Crea usuarios pruebas
router.get('/newUser', con.newUser);

//Post login
router.post('/signin', con.signin);

module.exports = router;
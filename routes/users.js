var express = require('express');
var router = express.Router();
var con = require('../database/controller');

router.use(con.isAuthenticated);

router.get('/empresas', con.getAllEmpresas);

router.get('/empresa', con.getOneEmpresa);

router.get('/salir', con.logout)

//TASKS
router.get('/servicios', con.getAllServicios);

router.get('/empezar', con.startServicio);

router.post('/empezar', con.postStartServicio);

router.post('/terminar', con.postEndServicio);

module.exports = router;
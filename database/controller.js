const cxn = require('./connection');
const queries = require('./queries');
const jwt = require('jsonwebtoken');
const registro = require('../databaseCrono/model.registros');
const festivos = require('../databaseCrono/model.festivos');

module.exports = {
    async getAllUsers(req, res) {
        let status = req.query['status'];
        status ? status = true : status = false;
        try {
            const pool = await cxn.getUserConn();
            const result = await pool.request().query(queries.getAllUsers);
            let users = result.recordset;
            if (users.length == 0) {
                res.render('users/index', {
                    nada: true
                });
            } else {
                res.render('users/index', {
                    data: users,
                    status: status
                });
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    },

    async signin(req, res) {
        let {user,pass} = req.body;
        try {
            const pool = await cxn.getUserConn();
            let result = await pool.request()
                .input('name', user)
                .query(queries.getUserPass);
            if (result.recordset[0].Contrasena === pass) {
                const accessToken = jwt.sign({user: user}, cxn.accessToken, {expiresIn: '8h'});
                //res.cookie('Authorization', 'Bearer ' + accessToken);
                res.cookie('token', accessToken);
                res.redirect('/users/empresas');
            } else {
                //FIXME: modal de error si no coincide el pass
                res.status(403);
                res.redirect('/?status=403');
            }
        } catch (error) {
            res.status(500)
            res.send(error.message)
        }
    },

    async newUser(req, res) {
        let name = "Alice";
        let email = ""
        let pass = "1234"

        try {
            const pool = await cxn.getConnection();
            let result = await pool.request()
                .input('name', name)
                .input('email', email)
                .input('pass', pass)
                .query(queries.newUser);
            res.json(result)
        } catch (error) {
            res.status(500)
            res.send(error.message)
        }
    },

    isAuthenticated(req, res, next) {
        jwt.verify(req.cookies.token, cxn.accessToken, function(err, decoded) {
            if (err) res.redirect('/');
            if (decoded !== undefined) {
                //console.log(decoded) //{user, ita, exp}
                req.user = decoded.user;
                if (decoded.empresa) req.empresa = decoded.empresa;
                next();
            }
        });
    },

    //GetAllEmpresas o EndServicio si está abierto
    async getAllEmpresas(req, res) {
        try {
            let lastRecord = await registro.findOne({where: {codigoUsuario:req.user, duracion: null}});
            if(lastRecord != null){
                //Existe un registro abierto que hay que finalizar
                console.log(lastRecord);
                lastRecord.horaInicio = lastRecord.horaInicio.toLocaleTimeString();
                lastRecord.dia = (new Date(lastRecord.dia)).toLocaleDateString();
                lastRecord.diaFin = (new Date()).toLocaleDateString();
                lastRecord.horaFin = (new Date()).toLocaleTimeString();
                res.render('users/terminar', { data: lastRecord});
            } else {
                //No hay ningun registro con duracion null así que sigue la seleccion de empresa.
                try {
                    const pool = await cxn.getUserConn();
                    let result = await pool.request().query(queries.getAllEmpresas);
                    let empresas = result.recordset;
                    if (empresas.length == 0) {
                        res.render('users/empresas', {
                            nada: true
                        });
                    } else {
                        res.render('users/empresas', {
                            data: empresas
                        });
                    }
                } catch (error) {
                    res.status(500)
                    res.send(error.message)
                }
            }
        } catch (error) {
            res.status(500)
            res.send("Error buscando ultimo registro")
        }
    },

    async getOneEmpresa(req, res) {
        let empresa = req.query['name'];
        const accessToken = jwt.sign({
            user: req.user,
            empresa: empresa
        }, cxn.accessToken, {
            expiresIn: '1h'
        });
        res.cookie('token', accessToken);
        res.redirect('/users/servicios');
    },

    async logout(req, res) {
        res.cookie('token', '');
        res.redirect('/');
    },

    //Protected routes - tasks
    async getAllServicios(req, res){
        let user = req.user;
        let empresa = req.empresa;
        let data = {
            user,
            empresa
        };
        try {
            const pool = await cxn.getConnection();
            let result = await pool.request()
                .input('Empresa', empresa)
                .query(queries.getAllServicios);
            let servicios = result.recordset;
            data.servicios = servicios;
        } catch (error) {
            res.status(500)
            res.send("getAllServicios" + error.message)
        }
        res.render('users/servicios', {
            data: data
        })
    },

    async startServicio(req, res){
        let data = {};
        data.servicio = req.query['servicio'];
        try {
            const pool = await cxn.getConnection();
            let result = await pool.request()
                .input('Empresa', req.empresa)
                .input('Codigo', data.servicio)
                .query(queries.getServicioDescByPk);
            let desc = result.recordset;
            data.descripcion = desc[0].Descripcion1;
        } catch (error) {
            res.status(500)
            res.send("getAllServicios" + error.message);
        }
        data.user = req.user;
        data.empresa = req.empresa;
        data.hora = (new Date()).toLocaleTimeString();
        data.fecha = (new Date()).toLocaleDateString();
        res.render('users/empezar', { data: data});
    },

    async postStartServicio(req, res){
        let record = {};
        //Nombre Usuario
        try {
            const pool = await cxn.getUserConn();
            let result = await pool.request()
                .input('usuario', req.user)
                .query(queries.getUsername);
                record.nombreUsuario = result.recordset[0].Nombre;
        } catch (error) {
            res.status(500)
            res.send("Error getting username");
        }
        record.codigoUsuario = req.user;
        record.empresa = 'Moldstock';
        record.centro = 'Lliçà';
        record.cliente = req.empresa;
        record.codigoServicio = req.body.servicio;
        record.descripcionServicio = req.body.descripcion;
        
        //Precio servicio
        try { 
            const pool = await cxn.getConnection();
            let result = await pool.request()
                .input('Empresa', req.empresa)
                .input('Codigo', req.body.servicio)
                .query(queries.getServicioPrecioByPk);
            record.precioServicio = result.recordset[0].Precio;
        } catch (error) {
            res.status(500)
            res.send("Fallo recuperando precio del servicio");
        }

        //Dia
        record.dia = new Date();
        record.tipoDia = 'Laborable'; //TODO: buscar en DB
        record.horaInicio = new Date();
        //record.horaFin;
        //record.duracion;
        //record.importe;
        record.observaciones = req.body.observaciones;
        await registro.create(record);
        res.redirect('/')
    },

    async postEndServicio(req, res){
        //Update por ID "id"
        let row = await registro.findByPk(req.body.id);
        let observaciones = req.body.observaciones;
        let horaFin = new Date();
        let duracion = (horaFin - row.horaInicio)/3600000; //da integer en milisegundos y dividismo para tener horas
        let importe = row.precioServicio * duracion; //si es precio por hora
        await registro.update({observaciones,horaFin,importe,duracion},{where:{id:req.body.id}});
        res.redirect('/users/empresas');
    }

}
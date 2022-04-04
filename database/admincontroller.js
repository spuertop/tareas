const cxn = require('./connection');
const queries = require('./queries');
const jwt = require('jsonwebtoken');
const registros = require('../databaseCrono/model.registros');
const festivos = require('../databaseCrono/model.festivos');
const usuarios = require('../databaseCrono/model.usuarios');
const {Op} = require('sequelize');
let hbsData = {layout:'adminlayoutnav'};
//TODO: HBSDATA va con layout, person, auths, esAdmin después de verificar su identidad

module.exports = {
    async getAllUsers(req, res) {
        let status = req.query['status'];
        status ? status = true : status = false;
        let users = await usuarios.findAll({ attributes: ['usuario'] });
        let arrUsers = [];
        users.forEach(item => {arrUsers.push("'" + item.usuario + "'");})
        let userList = arrUsers.join(',');
        try {
            if(arrUsers.length != 0) {
                const pool = await cxn.getUserConn();
                const result = await pool.request()
                    .query(`select Nombre, Usuario from APPIA_INFO.dbo.Usuarios where Usuario in (${userList}) order by Nombre`);
                let users = result.recordset;
                hbsData.layout = 'adminlayout';
                if (users.length == 0) {
                    let hbsOut = {...hbsData};
                    hbsOut.nada = true;
                    res.render('admin/index', hbsOut);
                } else {
                    let hbsOut = {...hbsData};
                    hbsOut.data = users;
                    hbsOut.status = status;
                    res.render('admin/index', hbsOut);
                }
            } else {
                let hbsOut = {...hbsData};
                hbsOut.data = users;
                hbsOut.status = status;
                res.render('admin/index', hbsOut);
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    async signinAdmin(req, res) {
        let {user,pass} = req.body;
        try {
            const pool = await cxn.getUserConn();
            let result = await pool.request()
                .input('name', user)
                .query(queries.getUserPass);
            if (result.recordset[0].Contrasena === pass) {
                const panelUser = await usuarios.findOne({where:{usuario: user}});
                console.log(panelUser);
                const accessToken = jwt.sign({user: user, id: panelUser.id}, cxn.accessToken, {expiresIn: '8h'});
                res.cookie('token', accessToken);
                res.redirect('/admin/panel');
            } else {
                res.status(403);
                res.redirect('/admin?status=403');
            }
        } catch (error) {
            res.status(500)
            res.send(error.message)
        }
    },
    async logout(req, res){
        res.cookie('token', '');
        res.redirect('/admin');
    },
    isAuthenticated(req, res, next) {
        jwt.verify(req.cookies.token, cxn.accessToken, function(err, decoded) {
            if (err) res.redirect('/admin');
            if (decoded !== undefined) {
                //console.log(decoded) //{user, ita, exp}
                hbsData.layout = 'adminlayoutnav';
                hbsData.person = decoded.user;
                req.user = decoded.user;
                req.id = decoded.id;
                if (decoded.empresa) req.empresa = decoded.empresa;
                usuarios.findByPk(req.id)
                    .then(author=>{
                        hbsData.auths = author.permisos ? JSON.parse(author.permisos) : '';
                        hbsData.esAdmin = author.esAdmin;
                        hbsData.person = author.nombre + ' (' + hbsData.person + ')';
                        //console.log('Data postVerify', hbsData);
                        next();
                    })
            } else {
                hbsData.layout = 'adminlayout';
                hbsData.auths = '';
                hbsData.esAdmin = false;
            }
        });
    },
    checkP(permiso){
        return function(req, res, next){
            if(hbsData.auths[permiso]){
                next();
            } else {
                res.status(403).render('admin/403', hbsData)
            }
        }
    },
    async getPanelPage(req, res){
        res.render('admin/panel', hbsData);
    },

    //MODULO USER
    async getUsersPage(req, res){
        let users = await usuarios.findAll({order:['nombre']});
        users.forEach(item =>{
            if(item.permisos){
                item.permisos = JSON.parse(item.permisos)
            }
        });
        let hbsOut = {...hbsData};
        hbsOut.users = users;
        res.render('admin/users', hbsOut);    
    },
    
    async appiaUsers(req, res){
        let users = await usuarios.findAll({ attributes: ['usuario'] });
        let arrUsers = [];
        users.forEach(item => {arrUsers.push("'" + item.usuario + "'");})
        let userList = arrUsers.join(','); //Usuarios en panel
        try {
            const pool = await cxn.getUserConn();
            const result = await pool.request()
                .query(`select Nombre, Usuario from APPIA_INFO.dbo.Usuarios where Usuario not in (${userList}) order by Nombre`);
                res.json(result.recordset);
        } catch (error) {
            console.log('AdminController ', error)
            res.sendStatus(500)
        }
    },

    async addnewuser(req, res){
        await usuarios.create(req.body);
        res.sendStatus(200);
    },

    async deleteuserbyId(req, res){
        const result = await usuarios.destroy({where: {id:req.query.id}});
        result >= 1 ? res.sendStatus(200) : res.sendStatus(400);    
    },

    async updateuser(req, res){
        if(req.body.adminSwitch && hbsData.esAdmin == true){
            await usuarios.update({permisos: JSON.stringify(todosLosPermisos()), esAdmin: true}, {where:{id:req.params.id}});
        } else {
            await usuarios.update({permisos: JSON.stringify(req.body)},{where:{id:req.params.id}});
        }
        res.redirect('/admin/users');    
    },

    //MODULO FESTIVOS
    async getHolidaysPage(req, res){
        res.render('admin/holidays', hbsData);
    },

    async getCalendar(req, res){
        let dias = await festivos.findAll({where: { dia :{[Op.gt]: new Date()}}, order: ['dia']})
        res.json(dias);            
    },

    async updateCalendar(req, res){
        let reqDays = req.body.range.split(', ');
        let dias = await festivos.findAll({where: { dia :{[Op.gt]: new Date()}}});
        let diasDB = [];
        dias.forEach(item=>{diasDB.push(item.dia)});
        let addDays = reqDays.filter(a =>{ return !diasDB.includes(a);});
        let delDays = diasDB.filter(a=>{return !reqDays.includes(a)});
        let addDaysOb = [];
        addDays.forEach(item => {addDaysOb.push({dia: item, tipo: 'Festivo'});});
        await festivos.bulkCreate(addDaysOb);
        await festivos.destroy({where: { dia: delDays}});
        res.redirect('/admin/holidays');    
    },

    //MODULO REGISTROS
    async getRecordsPage(req, res){
        let hbsOut = {...hbsData};
        //En este momento
        let usuariosAppia;
        try {
            const pool = await cxn.getUserConn();
            usuariosAppia = (await pool.request().query(queries.getAllUsers)).recordset;
        } catch (error) {
            res.sendStatus(500)
        }
        let ahoramismo = await registros.findAll({where: {horaFin: null}});
        ahoramismo.forEach(item=>{item.horaInicio = item.horaInicio.toLocaleString()})
        //Usuario -- codigoUsuario
        for(let i = 0; i < usuariosAppia.length; i++){
            let userEnahora = ahoramismo.filter(obj => {
                return obj.codigoUsuario == usuariosAppia[i].Usuario;
            });
            userEnahora[0] ? usuariosAppia[i].last = userEnahora[0] : null;
        }
        hbsOut.now = usuariosAppia;

        //Ultimas finalizadas
        let last = await registros.findAll({ limit: 20, order: [['updatedAt', 'DESC']], where: { horaFin:{[Op.ne]: null}}});
        last.forEach(item=>{
            item.dia = item.horaInicio.toLocaleDateString([], {year: 'numeric', month: '2-digit', day:'2-digit'});
            item.horaInicio = item.horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            item.horaFin = item.horaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            item.duracion = item.duracion.toFixed(2) + ' h';
        });
        hbsOut.last = last;

        //Empresas dentro de last para el select de editar
        const pool = await cxn.getUserConn();
        let result = await pool.request().query(queries.getAllEmpresas);
        let empresas = result.recordset; //[{Empresa: 'xx'},{}]
        hbsOut.empresas = empresas;
        
        res.render('admin/records', hbsOut);
    },

    async deleteRecordbyId(req, res){
        const result = await registros.destroy({where: {id:req.query.id}});
        result >= 1 ? res.sendStatus(200) : res.sendStatus(400);  
    },

    async getEmpresasJson(req, res){
        try {
            const pool = await cxn.getUserConn();
            let result = await pool.request().query(queries.getAllEmpresas);
            let empresas = result.recordset;
            res.json(empresas);
        } catch (error) {
            res.status(500)
            res.send(error.message)
        }
    },

    async getServiciosDeUnaEmpresaJson(req, res){
        let empresa = req.params.empresa;
        let tipoempresa = 0;
        try {
            const pool = await cxn.getConnection();
            tipoempresa = (await pool.request()
                .input('empresa', empresa)
                .query(queries.getEmpresaTipo)).recordset[0].tipodeempresa;
        } catch (error) {
            res.status(500)
        }
        try {
            //let queryS = ;
            const pool = await cxn.getConnection();
            let result = await pool.request()
                .input('Empresa', empresa)
                .query(tipoempresa == 2 ? queries.getAllServiciosOperator : queries.getAllServicios);
            let servicios = result.recordset;
            res.json(servicios);
        } catch (error) {
            res.status(500)
        }
    },

    async updateRecordById(req, res){
        /* {cliente: 'MOLDS',
        descripcionServicio: 'MDK06',
        dia: '2022-04-09',
        horaInicio: '16:27',
        horaFin: '18:27'
        } */
        console.log('Body', req.body)

        let record = {};
        //[cliente]
        record.cliente = req.body.cliente;

        //,[codigoServicio]
        //,[descripcionServicio]
        //,[precioServicio]
        let codigoS = req.body.descripcionServicio;
        try { 
            const pool = await cxn.getConnection();
            let result = await pool.request()
                .input('Codigo', codigoS)
                .query(queries.getServicioByPk);
            record.codigoServicio = codigoS;
            record.descripcionServicio = result.recordset[0].Descripcion1;
            record.precioServicio = result.recordset[0].Precio;
            console.log('RecordSet servicio',result.recordset[0])
        } catch (error) {
            res.status(500)
            res.send("Fallo recuperando precio del servicio");
        }

        //,[dia]
        record.dia = new Date(req.body.dia);
        
        //,[tipoDia]
        //Revisar si el día es festivo y setearlo
        let tipoEnHolidays = await festivos.findOne({where: {dia: req.body.dia}});
        if(tipoEnHolidays){
            console.log('tipoEnHolidays',tipoEnHolidays);
            record.tipoDia = tipoEnHolidays.tipo;
        } else {
            record.tipoDia = 'Laborable';            
        }

        //,[horaInicio]
        record.horaInicio = new Date(req.body.dia + ' ' + req.body.horaInicio);
        //,[horaFin]
        record.horaFin = new Date(req.body.dia + ' ' + req.body.horaFin);
        //,[duracion]
        record.duracion = (record.horaFin - record.horaInicio)/3600000; //da integer en milisegundos y dividismo para tener horas
        //,[importe]
        record.importe = record.duracion * record.precioServicio;
        //,[observaciones]
        record.observaciones = req.body.observaciones;

        if(record.duracion <= 0){
            res.status(500)
            res.send("Hora de fin no puede ser anterior a hora de inicio");
        } else {
            let registroAactualizar = await registros.findByPk(req.params.id, {raw: false});
            registroAactualizar.update(record);
            await registroAactualizar.save();
            res.redirect('/admin/records');
        }
    }
}

//Funciones auxiliares
function todosLosPermisos(){
    return {
        ur : "on", uc : "on", uu : "on", ud: "on",
        cr : "on", cc : "on", cu : "on", cd: "on", 
        rr : "on", rc : "on", ru : "on", rd: "on", 
    }
}

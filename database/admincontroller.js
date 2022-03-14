const cxn = require('./connection');
const queries = require('./queries');
const jwt = require('jsonwebtoken');
const registro = require('../databaseCrono/model.registros');
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
    async getPanelPage(req, res){
        res.render('admin/panel', hbsData);
    },

    //MODULO USER
    async getUsersPage(req, res){
        isgranted('ur', res);
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
        isgranted('ur', res);
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
        isgranted('uc', res);
        await usuarios.create(req.body);
        res.sendStatus(200);
    },

    async deleteuserbyId(req, res){
        isgranted('ud', res);
        const result = await usuarios.destroy({where: {id:req.query.id}});
        result >= 1 ? res.sendStatus(200) : res.sendStatus(400);
    },

    async updateuser(req, res){
        isgranted('uu', res);
        if(req.body.adminSwitch && hbsData.esAdmin == true){
            await usuarios.update({permisos: JSON.stringify(todosLosPermisos()), esAdmin: true}, {where:{id:req.params.id}});
        } else {
            await usuarios.update({permisos: JSON.stringify(req.body)},{where:{id:req.params.id}});
        }
        res.redirect('/admin/users');
    },

    //MODULO FESTIVOS
    async getHolidaysPage(req, res){
        isgranted('cr', res);
        res.render('admin/holidays', hbsData);
    },

    async getCalendar(req, res){
        isgranted('cr', res);
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
        //console.log('add', addDays);
        //console.log('del', delDays);

        //Formateo de objetos para el insert
        let addDaysOb = [];
        addDays.forEach(item => {addDaysOb.push({dia: item, tipo: 'Festivo'});});

        await festivos.bulkCreate(addDaysOb);
        await festivos.destroy({where: { dia: delDays}});
        res.redirect('/admin/holidays');
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

function isgranted(permiso, res) {
    if(hbsData.auths[permiso] || hbsData.esAdmin == true){ 
    } else {
        res.status(404)
        res.render('admin/404', hbsData); 
    } 
}
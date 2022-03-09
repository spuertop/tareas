const cxn = require('./connection');
const queries = require('./queries');
const jwt = require('jsonwebtoken');
const registro = require('../databaseCrono/model.registros');
const festivos = require('../databaseCrono/model.festivos');
const usuarios = require('../databaseCrono/model.usuarios');
let hbsData = {layout:'adminlayoutnav'};
//req.user es autor de la orden

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
                    hbsData.nada = true;
                    res.render('admin/index', hbsData);
                } else {
                    //res.render('admin/index', { layout: 'adminlayout', data: users, status: status});
                    hbsData.data = users;
                    hbsData.status = status;
                    res.render('admin/index', hbsData);
                }
            } else {
                hbsData.data = users;
                hbsData.status = status;
                res.render('admin/index', hbsData);
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
                //FIXME: modal de error si no coincide el pass
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
                req.user = decoded.user;
                req.id = decoded.id;
                if (decoded.empresa) req.empresa = decoded.empresa;
                next();
            } else {
                hbsData.layout = 'adminlayout';
            }
        });
    },
    //TODO: Filter by grants
    async getPanelPage(req, res){
        res.render('admin/panel', hbsData);
    },
    async getUsersPage(req, res){
        //Lista de usuarios registrados
        let users = await usuarios.findAll({order:['nombre']});
        users.forEach(item =>{
            if(item.permisos){
                item.permisos = JSON.parse(item.permisos)
            }
        })
        hbsData.users = users;
        res.render('admin/users', hbsData);
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
            console.log('AdminController 106', error)
            res.sendStatus(500)
        }
    },
    async addnewuser(req, res){
        //TODO: verificar permisos C en users
        req.body.isAdmin = false;
        await usuarios.create(req.body);
        res.sendStatus(200);
    },
    async deleteuserbyId(req, res){
        //TODO: verificar permisos D en users
        console.log('usuario peticion', req.user);
        console.log('usuario peticion', req.id);
        console.log('parametro peticion', req.query.id);
        const result = await usuarios.destroy({where: {id:req.query.id}});
        result >= 1 ? res.sendStatus(200) : res.sendStatus(400);
    },
    async updateuser(req, res){
        if(req.body.adminSwitch){
            await usuarios.update({permisos: null, esAdmin: true}, {where:{id:req.params.id}});
        } else {
            await usuarios.update({permisos: JSON.stringify(req.body)},{where:{id:req.params.id}});
        }
        res.redirect('/admin/users');
    }
}
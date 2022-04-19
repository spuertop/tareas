var express = require('express');
var router = express.Router();
var con = require('../database/admincontroller');

router.get('/', con.getAllUsers);
router.post('/signinAdmin', con.signinAdmin);

//Protected routes
router.use(con.isAuthenticated);
router.get('/salir', con.logout);
router.get('/panel', con.getPanelPage);

router.get('/users', con.checkP('ur'), con.getUsersPage);
router.get('/appiausers', con.checkP('ur'), con.appiaUsers); 
router.post('/addnewuser', con.checkP('uc'), con.addnewuser); 
router.get('/deleteuser', con.checkP('ud'), con.deleteuserbyId);
router.post('/updateuser/:id', con.checkP('uu'), con.updateuser);

router.get('/holidays', con.checkP('cr'), con.getHolidaysPage);
router.get('/calendar', con.checkP('cr'), con.getCalendar);
router.post('/updateCalendar', con.checkP('cc'), con.checkP('cd'), con.updateCalendar);

//Records Now
router.get('/records', con.checkP('rr'), con.getRecordsPage);
//Records Last
router.get('/recordsLast', con.checkP('rr'), con.getRecordsLast);
//Records by user
//router.get('/recordsUser');
//Records add
//router.get('/addRecord')

router.get('/delRecord', con.checkP('rd'), con.deleteRecordbyId);
router.get('/getEmpresasJson', con.getEmpresasJson);
router.get('/getServicios/:empresa', con.getServiciosDeUnaEmpresaJson);
router.post('/updateRecord/:id', con.updateRecordById);
router.get('/recordstab31', con.recordstab31);

module.exports = router;

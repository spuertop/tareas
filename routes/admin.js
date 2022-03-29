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

router.get('/records', con.checkP('rr'), con.getRecordsPage);
router.get('/delRecord', con.checkP('rd'), con.deleteRecordbyId);

module.exports = router;

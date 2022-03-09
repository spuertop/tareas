var express = require('express');
var router = express.Router();
var con = require('../database/admincontroller');

router.get('/', con.getAllUsers);
router.post('/signinAdmin', con.signinAdmin);

//Protected routes
router.use(con.isAuthenticated);
router.get('/salir', con.logout);
router.get('/panel', con.getPanelPage);
router.get('/users', con.getUsersPage);

router.get('/appiausers', con.appiaUsers);
router.post('/addnewuser', con.addnewuser);
router.get('/deleteuser', con.deleteuserbyId);
router.post('/updateuser/:id', con.updateuser);

module.exports = router;
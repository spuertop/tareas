//Requires and init
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();

//Router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

//Settings
app.set('port', 4001);

//View engine
app.set('views', path.join(__dirname, '/views'));
app.engine('.hbs', exphbs({ defaultLayout: 'layout', extname: '.hbs', helpers: require('./views/helpers') }));
app.set('view engine', '.hbs');

//Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

//Routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404);
    res.json({ status: 404, title: "Not Found", msg: "Route not found" });
    //res.render('notfound', { layout: false });
});

module.exports = app;
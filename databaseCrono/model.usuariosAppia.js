const {DataTypes} = require('sequelize');
const sequelize = require('./seq.conn');

const Appiausers = sequelize.define('Appiausers',{
    Usuario: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    Nombre: DataTypes.STRING,
    Contrasena: DataTypes.STRING,
    Activo: DataTypes.BOOLEAN
},{
    //other options
});
//Appiausers.sync({ alter: true }); //actualizar sin borrar
//Appiausers.sync({ force: true }); //Borrar todo
module.exports = Appiausers;
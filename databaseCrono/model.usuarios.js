const {DataTypes} = require('sequelize');
const sequelize = require('./seq.conn');

const User = sequelize.define('User',{
    usuario: DataTypes.STRING,
    nombre: DataTypes.STRING,
    esAdmin: {type: DataTypes.BOOLEAN,defaultValue:false},
    permisos: DataTypes.TEXT
},{
    //other options
    tableName: 'Users_OLD'
});
//sequelize.sync({ force: true });
module.exports = User;
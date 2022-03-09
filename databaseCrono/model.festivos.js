const {DataTypes} = require('sequelize');
const sequelize = require('./seq.conn');

const Holiday = sequelize.define('Holiday',{
    dia: DataTypes.DATEONLY,
    tipo: DataTypes.STRING,
},{
    //other options
});
//sequelize.sync({ force: true });
module.exports = Holiday;
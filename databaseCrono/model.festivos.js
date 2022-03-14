const {DataTypes} = require('sequelize');
const sequelize = require('./seq.conn');

const Holiday = sequelize.define('Holiday',{
    dia: DataTypes.DATEONLY,
    tipo: DataTypes.STRING,
    notas: DataTypes.STRING
},{
    //other options
});
//Holiday.sync({ force: true });
//Holiday.sync({});
module.exports = Holiday;
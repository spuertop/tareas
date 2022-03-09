const {DataTypes} = require('sequelize');
const sequelize = require('./seq.conn');

const Record = sequelize.define('Record',{
    centro: DataTypes.STRING,
    codigoUsuario: DataTypes.STRING,
    nombreUsuario:DataTypes.STRING,
    empresa: { type: DataTypes.STRING, defaultValue: 'Moldstock'},
    cliente: DataTypes.STRING, 
    codigoServicio:DataTypes.STRING,
    descripcionServicio: DataTypes.STRING,
    precioServicio:DataTypes.FLOAT,
    dia:DataTypes.DATEONLY,
    tipoDia:{ type: DataTypes.STRING, defaultValue: 'Laborable'},
    horaInicio:{ type: DataTypes.DATE },
    horaFin: DataTypes.DATE,
    duracion:DataTypes.FLOAT,
    importe:DataTypes.FLOAT,
    observaciones: DataTypes.STRING,
},{
    //other options
});

//sequelize.sync({ force: true });
module.exports = Record;
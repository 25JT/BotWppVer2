import mysql from 'mysql2';
import dotenv from 'dotenv';



dotenv.config();

const conexion = mysql.createConnection({
    host: process.env.host,
    database: process.env.database,
    user: process.env.user,
    port: process.env.port,
    password: process.env.password
});

export default conexion;


conexion.connect(function (error) {
    if (error) {
        console.log("Fallo en la conexion " + error);
    } else {
        console.log("Conexion Exitosa");
    }
});
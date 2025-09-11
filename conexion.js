import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Creamos un pool de conexiones (no una sola conexión)
const pool = mysql.createPool({
  host: process.env.host,
  database: process.env.database,
  user: process.env.user,
  port: process.env.port,
  password: process.env.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Esto mantiene la compatibilidad con `conexion.query`
const conexion = pool;

conexion.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Fallo en la conexión:", err);
  } else {
    console.log("✅ Conexión Exitosa a la BD");
    connection.release(); // liberamos la conexión al pool
  }
});

export default conexion;

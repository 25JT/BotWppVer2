import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from 'baileys';
import qrcode from 'qrcode';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import conexion  from './conexion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const server = http.createServer(app);
const io = new Server(server);



app.use(express.json()); // ✅ Necesario para leer JSON en req.body

let numerosenv = null;
let msj = null;

app.post('/validar/datos', (req, res) => {
  const { numeros, mensaje } = req.body;
  //console.log('Números:', numeros);
  //console.log('Mensaje:', mensaje);

  numerosenv = numeros;
  msj = mensaje;





  res.json
    ({ status: 'ok', recibidos: numeros.length });
});

const numerosEnviar = numerosenv
const mensaje = msj


// function hacerAlgoConLosDatos() {
//   if (numerosEnviar && mensaje) {
//     // ya están definidos
//     console.log('Enviar mensaje a:', numerosEnviar, 'con el mensaje:', mensaje);
//   } else {
//     console.log('Datos no disponibles aún');
//   }
// }



app.use(express.static(path.join(__dirname, 'public')));


//REGISTRO DE SESION

//registo
app.post('/registro', (req, res) => {
    const { nombre , apellido,  email, contrasena } = req.body;
    console.log("Nombre: " + nombre);
    console.log("Apellido: " + apellido);
    console.log("Email: " + email);
    console.log("Contrasena: " + contrasena);


    const sql = 'INSERT INTO usuario (contrasena, correo, nombre, apellidos) VALUES (?, ?, ?, ?)';
    conexion.query(sql, [contrasena,  email, nombre, apellido, ], (error, results) => {
        if (error) {
            console.error('Error al registrar usuario:', error);
            return res.status(500).json({ error: 'Error al registrar usuario' });
        }

        if (results.affectedRows > 0) {
            console.log("Usuario registrado correctamente: " + email);
            res.status(200).json({ success: true, message: 'Usuario registrado correctamente' });
        } else {
            res.status(400).json({ success: false, message: 'Error al registrar usuario' });
        }
    })

});






const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

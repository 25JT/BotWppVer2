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
import bcrypt from 'bcrypt';






const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//datos de sesion guardados
app.use(session({
  secret: 'mi-secreto',   // Un secreto único para firmar la sesión
  resave: false,          // No guardar la sesión si no ha habido cambios
  saveUninitialized: true, // Guardar sesiones que aún no han sido inicializadas
  cookie: { secure: false } // Si estás en desarrollo, setea esto como false
}));



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



app.use(express.static(path.join(__dirname, 'public')));



//REGISTRO DE SESION

//registo
app.post('/registro', async (req, res) => {
  const { nombre, apellido, email, contrasena } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10); // Hashear contraseña

    const sql = 'INSERT INTO usuario (contrasena, correo, nombre, apellidos) VALUES (?, ?, ?, ?)';
    conexion.query(sql, [hashedPassword, email, nombre, apellido], (error, results) => {
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
    });
  } catch (error) {
    console.error('Error al hashear contraseña:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// Login
app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;

  conexion.query("SELECT * FROM usuario WHERE correo = ?", [correo], async (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ success: false, message: "Error al buscar el usuario" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

    const usuario = results[0];

    const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

    req.session.userId = usuario.id;
    req.session.usuario = usuario;

    res.status(200).json({ success: true, message: "Inicio de sesión exitoso", userId: usuario.id, correo: usuario.correo,});
  });
});


// Ruta para cerrar sesión
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({ success: false, message: "Error al cerrar sesión" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ success: true, message: "Sesión cerrada correctamente" });
  });
});



//sesion activa frontend
app.get('/sesion', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, userId: req.session.userId });
  } else {
    res.json({ loggedIn: false });
  }
});

//restablecer la contraseña
app.post("/recuperar", (req, res) => {
  const { correo } = req.body;

  conexion.query("SELECT * FROM usuario WHERE correo = ?", [correo], (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Correo no registrado" });
    }

    // Aquí normalmente se enviaría un correo con un enlace para resetear la contraseña
    // Por ahora, podemos simularlo con un mensaje
    console.log(`Instrucciones enviadas al correo: ${correo}`);

    res.status(200).json({ success: true, message: "Correo de recuperación enviado" });
  });
});



//bot qr envio de mensajes


let clientsReady = new Set();
let lastGeneratedQR = null;

io.on('connection', (socket) => {
  console.log('🌐 Cliente conectado');

  socket.on('ready', () => {
    console.log('✅ Cliente listo para recibir QR');
    clientsReady.add(socket.id);

    if (lastGeneratedQR) {
      socket.emit('qr', lastGeneratedQR);
      console.log('📡 QR reenviado al nuevo cliente');
    }
  });

  socket.on('disconnect', () => {
    clientsReady.delete(socket.id);
    console.log('❌ Cliente desconectado');
  });
});

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth'));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const qrImageData = await qrcode.toDataURL(qr);
      lastGeneratedQR = qrImageData;

      for (const [id, socket] of io.of('/').sockets) {
        if (clientsReady.has(id)) {
          socket.emit('qr', qrImageData);
          console.log('📡 QR enviado a cliente listo');
        }
      }
    }

    if (connection === 'open') {
      console.log('✅ Conectado a WhatsApp');

      if (!numerosenv || !msj) {
        console.warn('⚠️ No hay datos para enviar aún');
        return;
      }

      const enviados = [];
      const fallidos = [];

      for (const numero of numerosenv) {
        const jid = `57${numero}@s.whatsapp.net`;

        try {
          const [result] = await sock.onWhatsApp(numero);

          if (!result?.exists) {
            console.warn(`⚠️ El número ${numero} NO está registrado en WhatsApp`);
            fallidos.push({ numero, error: 'No existe en WhatsApp' });
            continue;
          }

          await sock.sendMessage(jid, { text: msj });
          console.log(`📩 Mensaje enviado a ${numero}`);
          enviados.push(numero);
        } catch (err) {
          console.error(`❌ Error enviando mensaje a ${numero}:`, err);
          fallidos.push({ numero, error: err.message });
        }
      }


      //  Emitir resultados a todos los clientes conectados
      for (const [id, socket] of io.of('/').sockets) {
        if (clientsReady.has(id)) {
          socket.emit('done', {
            enviados,
            fallidos: fallidos.map(f => f.numero)
          });

          socket.emit('redirect', '/gracias.html');
        }
      }
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error instanceof Boom;
      const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;

      console.log('🔁 Conexión cerrada.');
      if (isLoggedOut) {
        console.log('⚠️ Sesión cerrada por el usuario. Borrando sesión y reiniciando...');
        fs.rmSync(path.join(__dirname, 'auth'), { recursive: true, force: true });
      }

      if (shouldReconnect || isLoggedOut) {
        setTimeout(() => startSock(), 2000);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
};

startSock();



const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

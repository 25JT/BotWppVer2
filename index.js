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
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import conexion from './conexion.js';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware de sesión
const sessionMiddleware = session({
  secret: 'mi-secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
});

app.use(cookieParser());
app.use(sessionMiddleware);

// Adaptar la sesión a Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});




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
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }
  datosUsuarios.set(userId, { numeros, mensaje });
  res.json({ status: 'ok', recibidos: numeros.length });
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

    res.status(200).json({ success: true, message: "Inicio de sesión exitoso", userId: usuario.id, correo: usuario.correo, });
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
const datosUsuarios = new Map(); // userId => { numeros, mensaje }
const sessions = new Map(); // userId => { sock, authPath }
const sendingQueue = new Map(); // userId => boolean (para evitar envío doble)
const qrsPendientes = new Map(); // userId => qr
const delay = (ms) => new Promise(res => setTimeout(res, ms));

io.on('connection', (socket) => {
  const session = socket.request.session;

  if (!session?.userId) {
    console.log('❌ Cliente no autenticado');
    socket.disconnect();
    return;
  }

  const userId = session.userId;
  console.log(`🌐 Usuario ${userId} conectado por Socket.IO`);

  socket.on('ready', async () => {
    console.log(`✅ Usuario ${userId} listo`);

    if (sessions.has(userId)) {
      const { sock } = sessions.get(userId);

      if (sock?.user && sock?.authState) {
        console.log(`🔒 Usuario ${userId} ya tiene sesión activa. Enviando mensajes...`);
        await delay(500); // ⏳ Tiempo de espera mínimo por concurrencia
        await enviarMensajes(sock, socket, userId);
        return;
      }
    }

    await iniciarSesionWhatsApp(userId, socket);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Usuario ${userId} desconectado`);
  });
});

async function iniciarSesionWhatsApp(userId, socket) {
  const authPath = path.join(__dirname, 'auth', `user_${userId}`);
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false
  });

  sessions.set(userId, { sock, authPath });

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      const qrImageData = await qrcode.toDataURL(qr);
      qrsPendientes.set(userId, qrImageData);
      socket.emit('qr', qrImageData);
      console.log(`📡 QR enviado a usuario ${userId}`);
    }

    if (connection === 'open') {
      console.log(`✅ Usuario ${userId} conectado a WhatsApp`);
      await delay(300); // ⏳ Delay pequeño antes de enviar
      await enviarMensajes(sock, socket, userId);
    }

    if (connection === 'close') {
      const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;

      if (isLoggedOut) {
        console.log(`🗑️ Usuario ${userId} cerró sesión, limpiando datos`);
        sessions.delete(userId);
        qrsPendientes.delete(userId);
        await fs.rm(authPath, { recursive: true, force: true });
      } else {
        console.log(`🔄 Reintentando conexión para usuario ${userId}`);
        await delay(2000); // Espera antes de reconectar
        iniciarSesionWhatsApp(userId, socket);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

async function enviarMensajes(sock, socket, userId) {
  socket.emit('enviando');
  if (sendingQueue.get(userId)) {
    console.log(`⏳ Usuario ${userId} ya está enviando mensajes`);
    return;
  }

  sendingQueue.set(userId, true);

  // Obtén los datos del usuario actual
  const datos = datosUsuarios.get(userId);
  if (!datos || !datos.numeros || !datos.mensaje) {
    console.warn(`⚠️ Usuario ${userId} aún no ha definido números o mensaje`);
    sendingQueue.set(userId, false);
    return;
  }

  const { numeros, mensaje } = datos;
  const enviados = [];
  const fallidos = [];

  for (const numero of numeros) {
    const jid = `57${numero}@s.whatsapp.net`;

    try {
      const [result] = await sock.onWhatsApp(numero);
      if (!result?.exists) {
        console.warn(`⚠️ Número ${numero} no existe`);
        fallidos.push({ numero, error: 'No existe' });
        continue;
      }

      await sock.sendMessage(jid, { text: mensaje });
      enviados.push(numero);
      console.log(`📩 Enviado a ${numero}`);
    } catch (err) {
      fallidos.push({ numero, error: err.message });
      console.error(`❌ Error en ${numero}: ${err.message}`);
    }
  }

  socket.emit('done', {
    enviados,
    fallidos: fallidos.map(f => f.numero)
  });

  socket.emit('redirect', '/gracias.html');
  sendingQueue.set(userId, false);
}








const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

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

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en https://localhost:${PORT}`);
});

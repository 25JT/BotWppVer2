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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const numerosEnviar = ['573165491376', '571111111111', '573014414701'];
const mensaje = 'Hola desde el bot después del login ✅';

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

      const enviados = [];
      const fallidos = [];

      for (const numero of numerosEnviar) {
        try {
          await sock.sendMessage(`${numero}@s.whatsapp.net`, { text: mensaje });
          console.log(`📩 Mensaje enviado a ${numero}`);
          enviados.push(numero);
        } catch (err) {
          console.error(`❌ Error enviando mensaje a ${numero}:`, err);
          fallidos.push({ numero, error: err.message });
        }
      }

      // Emitir resultados a todos los clientes conectados
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

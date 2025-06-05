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
  const session = req.session;
  const userId = session?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const { numeros, mensaje } = req.body;

  if (!Array.isArray(numeros) || numeros.length > 100) {
    return res.status(400).json({ error: 'Máximo 100 números permitidos' });
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

app.get('/estado-envio', (req, res) => {
  const userId = req.session?.userId;
  if (!userId) return res.json({ envio: 'no-autenticado' });

  const datos = datosUsuarios.get(userId);
  if (datos?.enviado) return res.json({ envio: 'finalizado' });
  if (sendingQueue.get(userId) || datos?.pausa) return res.json({ envio: 'en-progreso' });

  return res.json({ envio: 'libre' });
});


//bot qr envio de mensajes
const datosUsuarios = new Map(); // userId => { numeros, mensaje }
const sessions = new Map(); // userId => { sock, authPath }
const sendingQueue = new Map(); // userId => boolean (para evitar envío doble)
const qrsPendientes = new Map(); // userId => qr
const delay = (ms) => new Promise(res => setTimeout(res, ms));

io.on('connection', async (socket) => {
  const session = socket.request.session;

  if (!session?.userId) {
    console.log('❌ Cliente no autenticado');
    socket.disconnect();
    return;
  }

  const userId = session.userId;
  console.log(`🌐 Usuario ${userId} conectado por Socket.IO`);
  // Si ya tenía una sesión previa activa, reconectamos automáticamente
  if (sessions.has(userId)) {
    const { sock } = sessions.get(userId);

  // Si el socket sigue conectado a WhatsApp, volvemos a enviar mensajes o reestablecemos estado
  if (sock?.user && sock?.authState) {
    const datos = datosUsuarios.get(userId);
    if (datos?.enviado) {
      // Ya envió, solo muestra el resumen y redirige
      socket.emit('done', {
        enviados: datos.numeros || [],
        fallidos: [], // Puedes guardar los fallidos si quieres
        resumen: datos.resumen || ''
      });
      socket.emit('redirect', '/gracias.html');
      return;
    }
    console.log(`🔁 Reconectando sesión de WhatsApp existente para usuario ${userId}`);
    socket.emit('reconexionExitosa', 'Reconexión exitosa a WhatsApp');
    await delay(1000); // Evita concurrencia
    await enviarMensajes(sock, socket, userId);
    return;
  }
}

  socket.on('ready', async () => {
  const datos = datosUsuarios.get(userId);
    

  // Si hay pausa activa
  if (datos?.pausa) {
    const ahora = Date.now();
    const tiempoTranscurrido = Math.floor((ahora - datos.pausa.inicio) / 1000);
    const tiempoRestante = datos.pausa.duracion - tiempoTranscurrido;

    if (tiempoRestante > 0) {
      socket.emit('pausaIniciada', {
        mensaje: datos.pausa.mensaje,
        tiempo: tiempoRestante,
      });
      // Opcional: puedes iniciar un temporizador en el cliente para mostrar la cuenta regresiva
      return;
    } else {
      // Si ya pasó la pausa, elimínala
      delete datos.pausa;
      datosUsuarios.set(userId, datos);
    }
  }

  if (datos?.enviado) {
    console.log(`⚠️ Usuario ${userId} ya completó el envío, bloqueando reenvío.`);
    socket.emit('done', {
      enviados: datos.numeros || [],
      fallidos: [], // Si quieres puedes guardar los fallidos también
      resumen: datos.resumen || ''
    });
    socket.emit('redirect', '/gracias.html');
    return;
  }
    console.log(`✅ Usuario ${userId} listo`);

    if (sessions.has(userId)) {
      const { sock } = sessions.get(userId);

      if (sock?.user && sock?.authState) {
        console.log(`🔒 Usuario ${userId} ya tiene sesión activa. Enviando mensajes...`);
        await delay(1000); // ⏳ Tiempo de espera mínimo por concurrencia
        await enviarMensajes(sock, socket, userId);
        return;
      }
    }

    await iniciarSesionWhatsApp(userId, socket);
  });

  socket.on('disconnect', () => {
    console.log(`Socket desconectado para usuario ${userId}, sesión de WhatsApp sigue activa si no se cerró.`);
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
        await delay(400); // ⏳ Delay pequeño antes de enviar
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

  socket.on('cancelar-envio', () => {
    const userId = session.userId;
    if (!userId) return;
    // Marca el envío como cancelado
    if (!datosUsuarios.has(userId)) return;
    const datos = datosUsuarios.get(userId);
    datos.cancelado = true;
    datosUsuarios.set(userId, datos);
    sendingQueue.set(userId, false); // Detiene la cola de envío
    socket.emit('envio-cancelado');
  });


  async function enviarMensajes(sock, socket, userId) {
    const datos = datosUsuarios.get(userId);

  // --- NUEVO: Si hay pausa activa, envía el tiempo restante y retorna ---
  if (datos?.pausa) {
    const ahora = Date.now();
    const tiempoTranscurrido = Math.floor((ahora - datos.pausa.inicio) / 1000);
    const tiempoRestante = datos.pausa.duracion - tiempoTranscurrido;

    if (tiempoRestante > 0) {
      socket.emit('pausaIniciada', {
        mensaje: datos.pausa.mensaje,
        tiempo: tiempoRestante,
      });
      return; // No sigas con el envío hasta que termine la pausa
    } else {
      // Si ya pasó la pausa, elimínala
      delete datos.pausa;
      datosUsuarios.set(userId, datos);
    }
  }

  // --- Luego sigue tu lógica normal ---
  socket.emit('enviando');
  if (sendingQueue.get(userId)) {
    console.log(`⏳ Usuario ${userId} ya está enviando mensajes`);
    return;
  }

  sendingQueue.set(userId, true);

  
  if (!datos || !datos.numeros || !datos.mensaje) {
    console.warn(`⚠️ Usuario ${userId} aún no ha definido números o mensaje`);
    sendingQueue.set(userId, false);
    return;
  }

  const { numeros, mensaje } = datos;
  const enviados = [];
  const fallidos = [];

  const delayAleatorio = () => delay(Math.floor(Math.random() * (10000 - 6000 + 1)) + 4000);

  const saludos = [
    "Hola 👋", "¡Saludos!", "Buenas, ¿cómo estás?", "Un gusto saludarte", "Hola, ¿cómo te va?",
    "¡Qué tal!", "Muy buenas 🌞", "¡Buen día!", "Saludos cordiales 👋", "Hola, espero que estés bien",
    "¡Hola! Te quiero compartir algo interesante", "Hola 👋 ¿cómo va todo?",
    "¡Hola! Espero que tengas un gran día", "¡Hey! ¿Cómo andas?", "Hola, ¡bienvenido!",
    "Hola, quería contarte algo 🤗",
  ];

  const firmas = [
    "Atentamente", "Gracias por tu atención", "Estamos para ayudarte", "Cualquier duda, escríbenos",
    "Saludos cordiales", "Con gusto te apoyamos", "¡Te esperamos!", "Gracias por tu tiempo 🙌",
    "Esperamos tu respuesta", "Con aprecio", "Con estima", "Seguimos en contacto",
    "Gracias por confiar en nosotros", "Aquí estamos para lo que necesites", "¡Éxitos! 💪",
  ];

  const sinonimos = {
    "ganar dinero": ["generar ingresos", "obtener ganancias", "tener ingresos extra", "producir dinero", "recibir pagos", "incrementar tus finanzas"],
    "ventas": ["comercialización", "distribución", "promoción de productos", "negociación", "transacciones", "ofrecer productos"],
    "negocio": ["emprendimiento", "proyecto", "actividad comercial", "iniciativa personal", "microempresa"],
    "premios": ["beneficios", "recompensas", "incentivos", "bonificaciones", "ventajas"],
    "entrega": ["envío", "despacho", "distribución", "remisión", "traslado de productos"],
    "clientes": ["compradores", "usuarios", "personas interesadas", "público", "contactos"],
    "producto": ["artículo", "ítem", "mercancía", "bien", "objeto"],
    "dinero": ["plata", "efectivo", "ingresos", "capital", "fondos", "recursos"],
    "pedido": ["compra", "solicitud", "encargo", "orden"],
    "catálogo": ["colección", "listado de productos", "muestrario", "inventario"],
    "beneficios": ["ventajas", "atributos positivos", "ganancias", "recompensas"],
    "oportunidad": ["posibilidad", "ventana de crecimiento", "propuesta", "alternativa"],
  };

function maquillarMensajeLibre(texto) {
  const extras = [
    "Si tienes dudas, estoy por aquí 👀",
    "Te puedo ayudar cuando quieras ✌️",
    "Sin compromiso, solo quiero compartirlo contigo 😊",
    "Esta info puede ser útil para ti 😉",
    "Es solo una idea, tú decides 💭",
      "Avísame si te interesa.",
       "¡Gracias por tu tiempo!",
  "Quedo atento a tus comentarios.",
  ];

  const signosFinales = ['!', '!!', '.', '...'];
  

  let resultado = texto;

  // Reemplazos con sinónimos
for (const [clave, variantes] of Object.entries(sinonimos)) {
  const regex = new RegExp(`\\b${clave}\\b`, 'gi');

  // Generar una probabilidad aleatoria entre 10% y 50%
  const probabilidadDeReemplazo = Math.random() * (0.4 - 0.0) + 0.1;

  if (regex.test(resultado) && Math.random() < probabilidadDeReemplazo) {
    resultado = resultado.replace(regex, () => {
      return variantes[Math.floor(Math.random() * variantes.length)];
    });
  }
}

  // Agrega frase extra al final con probabilidad
  if (Math.random() < 0.4) {
    resultado += `\n\n${extras[Math.floor(Math.random() * extras.length)]}`;
  }

  // Saludo y firma aleatorios
  let saludo = saludos[Math.floor(Math.random() * saludos.length)];
  let firma = firmas[Math.floor(Math.random() * firmas.length)];

  // Variación de signos de puntuación
  saludo = saludo.replace(/!$/, signosFinales[Math.floor(Math.random() * signosFinales.length)]);
  firma = firma.replace(/!$/, signosFinales[Math.floor(Math.random() * signosFinales.length)]);

  // Estructura fija: saludo, cuerpo y firma
  return `${saludo}\n\n${resultado}\n\n${firma}`;
}


  // Devuelve un número aleatorio entre min y max (inclusive)
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Mezcla el array de números
  function mezclarArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Divide en lotes de tamaño aleatorio entre 10 y 20
  function dividirLotesAleatorios(arr) {
    const mezclado = mezclarArray([...arr]);
    const lotes = [];
    let i = 0;
    while (i < mezclado.length) {
      const tamLote = randomInt(10, 20);
      lotes.push(mezclado.slice(i, i + tamLote));
      i += tamLote;
    }
    return lotes;
  }

  const lotes = dividirLotesAleatorios(numeros);

  for (const [i, lote] of lotes.entries()) {
    // Verifica si fue cancelado antes de cada lote
    if (datosUsuarios.get(userId)?.cancelado) {
      console.log(`🚫 Envío cancelado por el usuario ${userId}`);
      socket.emit('envio-cancelado');
      sendingQueue.set(userId, false);
      return;
    }
    console.log(`🚀 Enviando lote ${i + 1}/${lotes.length} (Usuario ${userId})`);

    for (const numero of lote) {
      // Verifica si fue cancelado antes de cada número
      if (datosUsuarios.get(userId)?.cancelado) {
        console.log(`🚫 Envío cancelado por el usuario ${userId}`);
        socket.emit('envio-cancelado');
        sendingQueue.set(userId, false);
        return;
      }
      await delayAleatorio();

      const mensajeFinal = maquillarMensajeLibre(mensaje);
      const jid = `57${numero}@s.whatsapp.net`;

      try {
        const [result] = await sock.onWhatsApp(numero);
        if (!result?.exists) {
          console.warn(`⚠️ Número ${numero} no existe`);
          fallidos.push({ numero, error: 'No existe' });
          continue;
        }

        await sock.sendMessage(jid, { text: mensajeFinal });
        enviados.push(numero);
        console.log(`📩 Enviado a ${numero}`);
      } catch (err) {
        fallidos.push({ numero, error: err.message });
        console.error(`❌ Error en ${numero}: ${err.message}`);
      }
    }

    if (i < lotes.length - 1) {
      const pausaMs = randomInt(5 * 60 * 1000, 10 * 60 * 1000);
      const pausaSegundos = Math.floor(pausaMs / 1000);
      const pausaMinutos = Math.floor(pausaSegundos / 60);

      const mensajePausa = `⏳ Pausa de ${pausaMinutos} minutos para evitar bloqueos. En breve se continuará...`;
      console.log(`🛑 ${mensajePausa}`);

      // Guarda la pausa en datosUsuarios
      if (datos) {
        datos.pausa = {
          inicio: Date.now(),
          duracion: pausaSegundos,
          mensaje: mensajePausa
        };
        datosUsuarios.set(userId, datos);
      }

      socket.emit('pausaIniciada', {
        mensaje: mensajePausa,
        tiempo: pausaSegundos,
      });

      for (let s = pausaSegundos; s > 0; s--) {
        socket.emit('pausaTiempo', s);
        await delay(1000);
      }

      // Elimina la pausa al terminar
      if (datos) {
        delete datos.pausa;
        datosUsuarios.set(userId, datos);
      }

      socket.emit('pausaFinalizada', '✅ Continuando con el siguiente lote...');
    }
  }

  


  socket.emit('done', {
    enviados,
    fallidos: fallidos.map(f => f.numero)
  });

  const resumen = `
✅ *Resumen de envío de mensajes:*

📬 Enviados: ${enviados.length}
❌ Fallidos: ${fallidos.length}

${enviados.length > 0 ? `📱 Números enviados:\n${enviados.join(', ')}` : ''}
${fallidos.length > 0 ? `🚫 Números fallidos:\n${fallidos.map(f => f.numero).join(', ')}` : ''}
`.trim();

  if (datos) {
    datos.enviado = true;
     datos.resumen = resumen;
    datosUsuarios.set(userId, datos);
  }

// Enviar resumen al número del usuario autenticado
try {
  const jidUsuario = sock.user?.id; // ej: 573001112222@s.whatsapp.net
  
  if (jidUsuario) {
    await sock.sendMessage(jidUsuario, { text: resumen });
    console.log(`📤 Resumen enviado al usuario ${userId}`);
  } else {
    console.warn(`⚠️ No se pudo determinar el JID del usuario ${userId}`);
  }
} catch (err) {
  console.error(`❌ Error al enviar resumen al usuario ${userId}: ${err.message}`);
}
  

// Emitimos en el frontend y limpiamos la cola
socket.emit('done', {
  enviados,
  fallidos: fallidos.map(f => f.numero)
});
sendingQueue.set(userId, false);
socket.emit('redirect', '/gracias.html');
}

}); 
app.post('/cancelar-envio', (req, res) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  const datos = datosUsuarios.get(userId);
  if (datos) {
    datos.cancelado = true;
    datosUsuarios.set(userId, datos);
    sendingQueue.set(userId, false);
  }
  res.json({ ok: true });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
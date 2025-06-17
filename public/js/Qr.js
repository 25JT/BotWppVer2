verificarSesionActiva();

const socket = io();
const qrImage = document.getElementById('qr');
const estado = document.getElementById('estado');
let pausaInterval = null;
let enviando = false;

// Avisar al backend que estamos listos
socket.emit('ready');

socket.on('qr', data => {
  qrImage.src = data;
  estado.innerText = 'Escanea el código QR con tu WhatsApp 📱';
});

socket.on('enviando', () => {
  enviando = true;
  estado.innerHTML = `📤 Enviando mensajes... por favor espera... <div class="spinner-border text-info" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`;
});

socket.on('done', (results) => {
  enviando = false;
  estado.innerHTML = '✅ Mensajes enviados correctamente!';


  sessionStorage.setItem('mensajeResumen', JSON.stringify(results));
  // Redirigir
  setTimeout(() => {
    window.location.href = '/gracias.html';
  }, 2000);

});

socket.on('error', (error) => {
  console.error('Error:', error);
  estado.innerText = '❌ Error al conectar con WhatsApp. Por favor, inténtalo de nuevo.';
});

// Cerrar sesión
async function cerrarSesion() {
  try {
    const response = await fetch("/logout", {
      method: "GET"
    });

    const data = await response.json();
    if (data.success) {
      alertaBien({
        texto: "Sesión cerrada correctamente",
        callback: () => {
          // Redirigir a la página de inicio
          window.location.href = "/"
        }
      })
      // alert("Sesión cerrada correctamente");
      // // Redirigir a la página de inicio
      // window.location.href = "/";
    } else {
      // alert("Error al cerrar sesión: " + data.message);
      alertaError({
        texto: "Error al cerrar sesión. Por favor, inténtalo de nuevo más tarde."
      });
    }
  } catch (error) {
    //  console.error("Error al cerrar sesión:", error);
    alertaError({
      texto: "Error al cerrar sesión. Por favor, inténtalo de nuevo más tarde."
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cancelar = document.querySelector('.btncancelar');
  if (cancelar) {
    cancelar.addEventListener('click', () => {
      socket.emit('cancelar-envio');
      // Opcional: mostrar mensaje de cancelación inmediata
    });
  }
});

socket.on('pausa', (msg) => {
  mostrarNotificacion(msg); // función personalizada que lo muestra al usuario
});

socket.on('cuentaRegresiva', (msg) => {
  actualizarContador(msg); // actualiza en pantalla si quieres mostrar cuenta atrás
});

socket.on('pausaIniciada', ({ mensaje, tiempo }) => {
  const contenedor = document.getElementById('pausa-container');
  const mensajeElem = document.getElementById('pausa-mensaje');
  const tiempoElem = document.getElementById('pausa-tiempo');

  mensajeElem.textContent = mensaje;
  tiempoElem.textContent = `⏳ Tiempo restante: ${formatTiempo(tiempo)}`;
  contenedor.style.display = 'block';

  // Limpia cualquier contador anterior
  if (pausaInterval) clearInterval(pausaInterval);


  let segundosRestantes = tiempo;
  pausaInterval = setInterval(() => {
    segundosRestantes--;
    tiempoElem.textContent = `⏳ Tiempo restante: ${formatTiempo(segundosRestantes)}`;
    if (segundosRestantes <= 0) {
      clearInterval(pausaInterval);
      contenedor.style.display = 'none';
    }
  }, 1000);
});

socket.on('pausaTiempo', (segundosRestantes) => {
  const tiempoElem = document.getElementById('pausa-tiempo');
  tiempoElem.textContent = `⏳ Tiempo restante: ${formatTiempo(segundosRestantes)}`;
});

socket.on('pausaFinalizada', (msg) => {
  const contenedor = document.getElementById('pausa-container');
  const mensajeElem = document.getElementById('pausa-mensaje');
  const tiempoElem = document.getElementById('pausa-tiempo');

  mensajeElem.textContent = msg;
  tiempoElem.textContent = '';
  if (pausaInterval) clearInterval(pausaInterval);
  setTimeout(() => contenedor.style.display = 'none', 5000);
});

// Formato mm:ss
function formatTiempo(segundos) {
  const min = String(Math.floor(segundos / 60)).padStart(2, '0');
  const sec = String(segundos % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

async function verificarSesionActiva() {
  const res = await fetch('/sesion');
  const data = await res.json();
  if (!data.loggedIn) {
    console.log("Usuario no autenticado");
    alertaError({
      texto: "Debes iniciar sesión para enviar datos.",
      callback: () => {
        window.location.href = '/index.html';
      }
    });
  } else {

  }
}

// Manejo de eventos del socket
socket.on('done', (data) => {
  //  console.log('Envío completado', data);

  // Mostrar datos de resumen
  mostrarResumen(data);

  // Plan B: Redirigir después de 5 segundos si no llega el evento redirect
  setTimeout(() => {
    if (!window.redirectTriggered) {
      //   console.log('Redirección por timeout (plan B)');
      window.location.href = '/gracias.html';
    }
  }, 5000);
});

socket.on('redirect', (url) => {
  // console.log('Redireccionando a:', url);
  window.redirectTriggered = true;
  window.location.href = url;
});

// Función para reconexión automática
function setupSocketReconnection() {
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  function connect() {
    const socket = io({
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    socket.on('connect', () => {
      reconnectAttempts = 0;
      //   console.log('Socket conectado');

      // Verificar estado de envío al reconectar
      socket.emit('check-status');
    });

    socket.on('reconnect_failed', () => {
      //  console.error('No se pudo reconectar el socket');
    });

    return socket;
  }

  let socket = connect();

  // Reconexión automática si se pierde la conexión
  setInterval(() => {
    if (!socket.connected && reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      //   console.log(`Intentando reconexión (${reconnectAttempts}/${maxReconnectAttempts})`);
      socket = connect();
    }
  }, 3000);

  return socket;
}

// Inicializar socket al cargar la página


// Verificar estado de envío al cargar la página
socket.emit('check-status');

socket.on('envio-cancelado', () => {
  alertaError({
    texto: 'El envío ha sido cancelado.',
    callback: () => {
      window.location.href = '/principal.html';
    }
  });
});

// window.addEventListener('beforeunload', (e) => {
//   if (enviando) {
//     // Intenta cancelar por socket
//     socket.emit('cancelar-envio');
//     // Y también por HTTP para asegurar la cancelación
//     navigator.sendBeacon('/cancelar-envio');
//   }
// });
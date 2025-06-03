const socket = io();
const qrImage = document.getElementById('qr');
const estado = document.getElementById('estado');

// Avisar al backend que estamos listos
socket.emit('ready');

socket.on('qr', data => {
  qrImage.src = data;
  estado.innerText = 'Escanea el código QR con tu WhatsApp 📱';
});
//linea sospechoza
socket.on('enviando', () => {
  estado.innerHTML = '📤 Enviando mensajes... por favor espera... <span class="spinner"></span>';
});


socket.on('done', (results) => {
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
      alert("Sesión cerrada correctamente");
      // Redirigir a la página de inicio
      window.location.href = "/";
    } else {
      alert("Error al cerrar sesión: " + data.message);
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    alert("Error al cerrar sesión. Por favor, inténtalo de nuevo más tarde.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Agregar el evento de clic al botón de cerrar sesión
  const volver = document.querySelector('.btnvolver');
  if (volver) {
    volver.addEventListener('click', () => {
      window.location.href = "principal.html";
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
  setTimeout(() => contenedor.style.display = 'none', 5000);
});

// Formato mm:ss
function formatTiempo(segundos) {
  const min = String(Math.floor(segundos / 60)).padStart(2, '0');
  const sec = String(segundos % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

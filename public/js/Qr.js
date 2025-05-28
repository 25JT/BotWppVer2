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
      volver.addEventListener('click',() => {
        window.location.href = "principal.html";
      });

    }


  });
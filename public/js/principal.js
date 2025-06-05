
verificarSesionActiva();
verificarEnvioActivo();
const usuarioId = sessionStorage.getItem('usuarioId');
console.log("Usuario ID desde sessionStorage:", usuarioId);


document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btnvolver");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
  const contador = document.getElementById('contador');
  const textarea = document.getElementById('mensaje');

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto'; // Reinicia altura
    textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta al contenido
      const currentLength = textarea.value.length;
  contador.textContent = `${currentLength} / 1000`;

  if (currentLength === textarea.maxLength) {
    alert('Has alcanzado el límite máximo de 1000 caracteres.');
  }
  });

    const contador2 = document.getElementById('contador2');
  const textarea2 = document.getElementById('numeros');

textarea2.addEventListener('input', () => {
  let numeros = textarea2.value;
  const currentLength = textarea2.value.length;
  contador2.textContent = `${currentLength} / 1000`;
 if (currentLength === textarea.maxLength) {
    alert('Has alcanzado el límite máximo de 1000 caracteres.');
  }

  numeros = numeros
    .split(/\n+/) // o usa ',' si separan por coma
    .map(n => n.trim())
    .filter(n => n !== '');

  if (numeros.length > 100) {
    alert('Solo puedes ingresar hasta 100 números');
    // Limita al primeros 100 y actualiza el contenido
    textarea2.value = numeros.slice(0, 100).join('\n');
  }
});

  // Opcional: ajustar altura si ya tiene texto cargado (ej. al editar)
  window.addEventListener('DOMContentLoaded', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  });


function enviarTN() {
  const input = document.querySelector('.telefonos').value;
  const mensaje = document.querySelector('.mensajes').value;

  // 1. Separar por espacios, comas o saltos de línea (uno o más)
  let numeros = input.split(/[\s,]+/);

  // 2. Quitar caracteres vacíos
  numeros = numeros.filter(num => num.trim() !== '');

  // 3. Quitar '+' al inicio si existe
  numeros = numeros.map(num => num.startsWith('+') ? num.slice(1) : num);

  // 4. Filtrar que solo tengan dígitos
  numeros = numeros.filter(num => /^\d+$/.test(num));

  // 5. Filtrar números con al menos 8 dígitos
  numeros = numeros.filter(num => num.length = 10);

  // 6. Eliminar duplicados
  numeros = [...new Set(numeros)];

  console.log(numeros);
  
  validar(numeros, mensaje)
}




async function validar(numeros, mensaje) {
  if (numeros.length === 0 || mensaje.trim() === '') {
    alert('Ingresa los números o el mensaje');
    return;
  }
  const sesionActiva = await fetch('/sesion').then(res => res.json());
  if (sesionActiva.loggedOut) {
    alert("Debes iniciar sesión para enviar datos.");
    window.location.href = '/index.html';
    return;
  }

  try {
    const response = await fetch('/validar/datos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeros, mensaje }) // ✅ ENVÍAS UN OBJETO
    });

    const data = await response.json();
    console.log('Respuesta del backend:', data);
    window.location.href = '/index2.html'
  } catch (error) {
    console.error("Error al enviar datos:", error);
  }
}



async function verificarSesionActiva() {
  const res = await fetch('/sesion');
  const data = await res.json();
  if (!data.loggedIn) {
    console.log ("Usuario no autenticado");
    alert("Debes iniciar sesión para enviar datos.");
    window.location.href = '/index.html';
  } else {
    console.log("Usuario activo: ACTIVO");
  }
}

async function verificarEnvioActivo() {
  const res = await fetch('/estado-envio');
  const data = await res.json();
  if (data.envio === 'en-progreso') {
    // Redirige a index2.html si hay envío en curso o pausa
    window.location.href = '/index2.html';
  }
}






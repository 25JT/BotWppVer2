document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btnvolver");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});

  const textarea = document.getElementById('mensaje');

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto'; // Reinicia altura
    textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta al contenido
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









verificarSesionActiva();
actualizarBotonesSesion();

//animacion de los botones
function creaCuentaAni() {
  gsap.to(window, {
    duration: 1,
    scrollTo: "#creaCuenta",
    ease: "power2.inOut"
  });
}

function masInfo() {
  gsap.to(window, {
    duration: 1,
    scrollTo: "#masInfo",
    ease: "power2.inOut"
  });
}

//abrir modal login
function toggleModal() {
  const modal = document.getElementById('loginModal');
  if (modal.style.display === 'none')  {
    modal.style.display = 'flex';
  }

  modal.classList.toggle('hidden');
  modal.classList.toggle('flex');
   

}

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const correo = e.target.correo.value;
  const contrasena = e.target.contrasena.value;
  if (correo === "" || contrasena === "") {
    alert("Por favor, completa todos los campos.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    alert("Por favor, ingresa un correo electrónico válido.");
    return;
  }

  loginUsuario(correo, contrasena);
  toggleModal();
});


//Evento para el boton de mostrar contraseña
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("bi-eye");
    icon.classList.add("bi-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("bi-eye-slash");
    icon.classList.add("bi-eye");
  }
}


//Funcion registo 
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    registrarUsuario();
  });
});

async function registrarUsuario() {
  const nombre = document.getElementById("exampleInputNombre").value;
  const apellido = document.getElementById("exampleInputApellido").value;
  const email = document.getElementById("exampleInputEmail1").value;
  const emailconfirmacion = document.getElementById("exampleInputEmailconfrim").value;
  const contrasena = document.getElementById("exampleInputPassword1").value;
  const contrasenaConfirm = document.getElementById("Passwordconfirma").value;


  if (nombre === "" || apellido === "" || email === "" || contrasena === "") {
    alert("Por favor, completa todos los campos.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Por favor, ingresa un correo electrónico válido.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailconfirmacion)) {
    alert("Por favor, ingresa un correo electrónico de confirmación válido.");
    return;
  }

  if (email !== emailconfirmacion) {
    alert("Los correos electrónicos no coinciden.");
    return;
  }
  if (contrasena !== contrasenaConfirm) {
    alert("Las contraseñas no coinciden.");
    return;
  }


  if (contrasena.length < 8) {
    alert("La contraseña debe tener al menos 8 caracteres.");
    return;

  }

  

  console.log(email);


  try {
    const response = await fetch("/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: nombre,
        apellido: apellido,
        email: email,
        contrasena: contrasena

      })
    });

    const data = await response.json();
    if (data.success) {
     // alert("Usuario registrado correctamente");
     alert("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
      window.location.href = "index.html"; // Redirigir a la página de inicio
      return;
    } else {
      alert("Error al registrar usuario: " + data.message);
    }
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    alert("Error al registrar usuario. Por favor, inténtalo de nuevo más tarde.");
  }

}


//login




async function loginUsuario(correo, contrasena) {


  const sesionActiva = await fetch('/sesion').then(res => res.json());

  if (sesionActiva.loggedIn) {
    alert("Ya tienes una sesión activa. No puedes iniciar sesión de nuevo.");
    window.location.href = "principal.html"; // Redirigir a la página principal
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo: correo,
        contrasena: contrasena
      })
    });

    const data = await response.json();
    if (data.success) {
      //alert("Login exitoso");
      console.log("Inicio de sesión exitoso:", data);

      // Guardar el usuario en la sesión
      sessionStorage.setItem('userId', data.userId);
      sessionStorage.setItem('correo', data.correo);
      //cambia inicio sesión por cerrar sesión


      //window.location.href = "/main"; // Redirigir a la página principal

      console.log("Inicio de sesión exitoso:", data);
      // Redirigir a la página principal
      window.location.href = "principal.html";
    } else {
      alert("Error al iniciar sesión: " + data.message);
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
  }
}

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


// Verificar sesión al cargar main.html
async function verificarSesionActiva() {
  const res = await fetch('/sesion');
  const data = await res.json();
  if (!data.loggedIn) {
    console.log ("Usuario no autenticado");

  } else {
    console.log("Usuario activo:", data.userId);
    sessionStorage.setItem('userId', data.userId);
    sessionStorage.setItem('correo', data.correo);

  }
}

async function actualizarBotonesSesion() {
  const iniciarSesion = document.querySelector(".iniciarSesion");
  const cerrarSesion = document.querySelector(".cerrarSesion");
  const Inicio = document.querySelector(".inicio");
  const creaCuentaAni = document.querySelector(".creaCuenta");

  try {
    const res = await fetch("/sesion");
    const data = await res.json();

    if (data.loggedIn) {
      iniciarSesion.style.display = "none";
      cerrarSesion.style.display = "inline-block";
      Inicio.style.display = "inline-block";
      creaCuentaAni.style.display = "none";
    } else {
      iniciarSesion.style.display = "inline-block";
      cerrarSesion.style.display = "none";
      Inicio.style.display = "none";
      creaCuentaAni.style.display = "inline-block";
    }
  } catch (error) {
    console.error("Error al verificar sesión:", error);
  }
}

//restablecer contraseña
function abrirRecuperarContrasena() {
    document.getElementById("modalRecuperar").classList.remove("hidden");
     const modal = document.getElementById('loginModal');
     modal.style.display = 'none'; // Ocultar el modal de inicio de sesión
  }

  function cerrarRecuperarContrasena() {
    document.getElementById("modalRecuperar").classList.add("hidden");
  }

  document.getElementById("formRecuperar").addEventListener("submit", async function (e) {
    e.preventDefault();
    const correo = document.getElementById("correoRecuperar").value;

    try {
      const response = await fetch("/recuperar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ correo })
      });

      const data = await response.json();
      if (data.success) {
        alert("Revisa tu correo para continuar el proceso.");
        cerrarRecuperarContrasena();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error al enviar solicitud.");
      console.error(error);
    }
  });
  
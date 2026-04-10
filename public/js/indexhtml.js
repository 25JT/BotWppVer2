

verificarSesionActiva();
actualizarBotonesSesion();

function abrirModalContacto() {
  document.getElementById('modalContacto').classList.remove('hidden');
  document.getElementById('modalContacto').classList.add('flex');
}
function cerrarModalContacto() {
  document.getElementById('modalContacto').classList.add('hidden');
  document.getElementById('modalContacto').classList.remove('flex');
}

// Enviar formulario de contacto
document.addEventListener("DOMContentLoaded", () => {
  const formContacto = document.getElementById("formContacto");
  if (formContacto) {
    formContacto.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombreContacto").value;
      const email = document.getElementById("emailContacto").value;
      const mensaje = document.getElementById("mensajeContacto").value;
 

      try {
        const res = await fetch("/contacto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email, mensaje })
        });
        const data = await res.json();
        if (data.success) {
          alertaBien({
              texto: "Mensaje enviado correctamente.",
              callback: function () {
                  console.log("Se aceptó la alerta");
              }
          });

          document.getElementById("nombreContacto").value = "";
          document.getElementById("emailContacto").value = "";
          document.getElementById("mensajeContacto").value = "";
          cerrarModalContacto();
        } else {
           alertaError({
               texto: "Error al enviar mensaje: " + data.message,
               callback: function () {
                   console.log("Se aceptó la alerta");
               }
           });
        }
      } catch (err) {
         Swal.fire({
        title: 'Error',
        text: "Error al enviar mensaje: " + data.message,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        showCancelButton: false,
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            if (params.callback) {
                params.callback();
            }
        }
    });


    
        ;
      }
    });
  }
});

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

  modal.classList.toggle('hidden');
  modal.classList.toggle('flex');

  // Limpia errores visuales si se mostraron antes
  const form = document.getElementById('loginForm');
  if (form) form.reset();
}


document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const correo = e.target.correo.value;
  const contrasena = e.target.contrasena.value;
  if (correo === "" || contrasena === "") {
    alertaAdvetencia({
      texto: "Por favor, completa todos los campos.",
      callback: function () {
     //   console.log("Se aceptó la alerta");
      }
    })

    
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
 
    alertaAdvetencia({
      texto: "Por favor, ingresa un correo electrónico válido.",
      callback: function () {
      //  console.log("Se aceptó la alerta");
      }
    });
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
      alertaAdvetencia({
      texto: "Por favor, completa todos los campos.",
      callback: function () {
      //  console.log("Se aceptó la alerta");
      }
    })
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
       alertaAdvetencia({
      texto: "Por favor, ingrese un correo válido.",
      callback: function () {
     //   console.log("Se aceptó la alerta");
      }
    })
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailconfirmacion)) {
    alertaAdvetencia({
      texto: "Por favor, ingresa un correo electrónico de confirmación válido.",
      callback: function () {
     //   console.log("Se aceptó la alerta");
      }
    })
    return;
  }

  if (email !== emailconfirmacion) {
    alertaAdvetencia({
      texto: "Los correos electrónicos no coinciden.",
      callback: function () {
     //   console.log("Se aceptó la alerta");
      }
    })
    return;
  }
  if (contrasena !== contrasenaConfirm) {
    alertaAdvetencia({
      texto: "Las contraseñas no coinciden.",
      callback: function () {
     //   console.log("Se aceptó la alerta");
      }
    })
    return;
  }


  if (contrasena.length < 8) {
    alertaAdvetencia({
      texto: "La contraseña debe tener al menos 8 caracteres.",
      callback: function () {
     //   console.log("Se aceptó la alerta");
      }
    })
    return;

  }

  

  //console.log(email);


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
     alertaBien({
       texto: "Usuario registrado correctamente. Por favor valida tu correo para inisiar sesion.",
       callback: function () {
         window.location.href = "index.html"; // Redirigir a la página de inicio
       }
     });
      return;
    } else {
      alertaError({
        texto: "Error al registrar usuario: " + data.message,
        callback: function () {
          console.log("Se aceptó la alerta");
        }
      });
    }
  } catch (error) {
   // console.error("Error al registrar usuario:", error);
    alertaError({
      texto: "Error al registrar usuario. Por favor, inténtalo de nuevo más tarde.",
      callback: function () {
        console.log("Se aceptó la alerta");
      }
    });
  }

}


//login




async function loginUsuario(correo, contrasena) {
  const sesionActiva = await fetch('/sesion').then(res => res.json());

  if (sesionActiva.loggedIn) {
    alertaError({
      texto: "Ya tienes una sesión activa. No puedes iniciar sesión de nuevo.",
      callback: function () {
        window.location.href = "principal.html";
      }
    });
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
      // Guardar el usuario en la sesión
      sessionStorage.setItem('userId', data.userId);
      sessionStorage.setItem('correo', data.correo);

      // Si es el primer login, guarda la bandera para mostrar el tour
      if (data.firstLogin) {
        localStorage.setItem('showTour', '1');
      }

      // Redirigir a la página principal
      window.location.href = "principal.html";
    } else {
      alertaError({
        texto: "Error al iniciar sesión: Por favor, verifica tus credenciales. Si no tienes cuenta, puedes crear una.",
        callback: function () {
        //  console.log("Se aceptó la alerta");
        }
      });
    }
  } catch (error) {
   // console.error("Error al iniciar sesión:", error);
    alertaError({
      texto: "Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.",
      callback: function () {
        console.log("Se aceptó la alerta");
      }
    });
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
      alertaBien({
        texto: "Sesión cerrada correctamente",
        callback: function () {
          // Redirigir a la página de inicio
          window.location.href = "/";
        }
      });
    } else {
      //alert("Error al cerrar sesión: " + data.message);
    }
  } catch (error) {
    //console.error("Error al cerrar sesión:", error);
    alertaError({
      texto: "Error al cerrar sesión. Por favor, inténtalo de nuevo más tarde.",
      callback: function () {
      //  console.log("Se aceptó la alerta");
      }
    });
  }
}

// Suponiendo que tienes un formulario con id="formLogin"
document.getElementById('formLogin').addEventListener('submit', async function (e) {
  e.preventDefault();

  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });
    const data = await res.json();

    if (data.success) {
      // Si es el primer login, guarda la bandera para mostrar el tour
      if (data.firstLogin) {
        localStorage.setItem('showTour', '1');
      }
      // Redirige a principal.html
      window.location.href = '/principal.html';
    } else {
      // Muestra mensaje de error (ajusta según tu UI)
      alertaError({
        texto: data.message || 'Error al iniciar sesión',
        callback: function () {
          console.log("Se aceptó la alerta");
        }
      });
    }
  } catch (err) {
    alertaError({
      texto: 'Error de conexión con el servidor',
      callback: function () {
        console.log("Se aceptó la alerta");
      }
    });
  }
});

// Verificar sesión al cargar main.html
async function verificarSesionActiva() {
  const res = await fetch('/sesion');
  const data = await res.json();
  if (!data.loggedIn) {
    console.log ("Usuario no autenticado");

  } else {
 //   console.log("Usuario activo:", data.userId);
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
  modal.classList.add("hidden"); // oculta con clase
  modal.classList.remove("flex");
  modal.style.display = 'none';  // oculta con estilo directo
}

function cerrarRecuperarContrasena() {
  const recuperarModal = document.getElementById("modalRecuperar");
  const loginModal = document.getElementById("loginModal");

  // Oculta el modal de recuperación
  recuperarModal.classList.add("hidden");

  // Asegura que loginModal se pueda volver a mostrar más adelante
  loginModal.style.display = ''; // limpia el display: none
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
       alertaBien({
          texto: "Se ha enviado un enlace de recuperación a tu correo.",
          callback: function () {
            cerrarRecuperarContrasena();
          }
        });
        cerrarRecuperarContrasena();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alertaError({
        texto: "Error al enviar solicitud.",
        callback: function () {
          console.error(error);
        }
      });
    }
  });

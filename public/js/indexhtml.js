

  console.log("Hola");
   
  

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn");
    if (btn) {
      btn.addEventListener("click", () => {
        window.location.href = "principal.html";
      });
    }
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

 
    if (nombre === "" || apellido === "" || email === "" || contrasena   === "") {
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
      alert("Usuario registrado correctamente");
      window.location.href = "index.html";
    } else {
      alert("Error al registrar usuario: " + data.message);
    }
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    alert("Error al registrar usuario. Por favor, inténtalo de nuevo más tarde.");
  }
  
}



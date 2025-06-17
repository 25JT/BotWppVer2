function alertaAdvetencia(params) {
    Swal.fire({
        title: 'Alerta',
        text:  params.texto,
        icon: 'warning',
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
}   

function alertaBien(params) { 
    Swal.fire({
        title: 'Éxito',
        text: params.texto,
        icon: 'success',
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
}
function alertaSeguro() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Aquí puedes ejecutar la acción segura
            console.log("Acción segura ejecutada");
        }
    });
    
}
function alertaError(params) {
    Swal.fire({
        title: 'Error',
        text: params.texto,
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
    
}




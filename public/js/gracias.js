window.addEventListener('DOMContentLoaded', () => {
    const resumen = document.getElementById('resumen');
    const lista = document.getElementById('lista');

    const stored = sessionStorage.getItem('mensajeResumen');
    if (!stored) {
        resumen.innerText = '❗ No se encontraron resultados de envío.';
        return;
    }

    const { enviados, fallidos } = JSON.parse(stored);

    resumen.innerText = `✅ Enviados: ${enviados.length} | ❌ Fallidos: ${fallidos.length}`;

    // Animar el resumen (número total)
    gsap.fromTo(resumen,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    if (enviados.length > 0) {
        const li = document.createElement('li');
        li.className = 'ok';
        li.innerText = '✅ Correctos: ' + enviados.join(', ');
        lista.appendChild(li);

        gsap.fromTo(li,
            { delay: 0.6, opacity: 0, x: -20 },
            { delay: 0.6, opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
        );
    }

    if (fallidos.length > 0) {
        const li = document.createElement('li');
        li.className = 'fail';
        li.innerText = '❌ Fallidos: ' + fallidos.join(', ');
        lista.appendChild(li);

        gsap.fromTo(li,
            { delay: 0.6, opacity: 0, x: -20 },
            { delay: 0.6,  opacity: 1, x: 0, duration: 0.6, ease: "power2.out", delay: 0.1 }
        );
    }

    gsap.to('.msjR', {
        delay: 0.4,
        opacity: 1,
        x: 0.1,  
        duration: 1,
        ease: "power4.inOut",

    });

});




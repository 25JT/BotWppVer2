// Scroll suave
const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
// ScrollTrigger + Lenis
gsap.registerPlugin(ScrollTrigger)
lenis.on('scroll', ScrollTrigger.update)

ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
        return arguments.length ? lenis.scrollTo(value) : window.scrollY
    },
    getBoundingClientRect() {
        return {
            top: 0, left: 0, width: window.innerWidth, height: window.innerHeight
        }
    },
    pinType: document.body.style.transform ? "transform" : "fixed"
})

//animacion nav

gsap.to(".containerNav", {

    y: 1,
    opacity: 1,
    duration: 1,
    ease: "power4.inOut",

})

const text = new SplitType('.textnav', { types: "words, chars" })
text.chars.forEach(char => {
    const charsTl = gsap.timeline();

    charsTl.from(char, {
        ease: "back.out",
        duration: 1,

    })

    char.addEventListener("mouseenter", () => {
        gsap.to(char, {
            rotate: 360,
            ease: "back.out",
        })
    })
})

    // Obtener el token de la URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    document.getElementById('token').value = token;

    document.getElementById('resetForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const nuevaContrasena = document.getElementById('nuevaContrasena').value;
      const mensajeDiv = document.getElementById('mensaje');
      console.log("Token recibido:", token);

      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaContrasena })
      });
      const data = await res.json();
      if (data.success) {
        mensajeDiv.innerHTML = '<span class="text-success">¡Contraseña actualizada! Ya puedes iniciar sesión.</span>';
        document.getElementById('resetForm').reset();
      } else {
        mensajeDiv.innerHTML = `<span class="text-danger">${data.message}</span>`;
      }
    });

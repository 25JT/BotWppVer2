

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

//letar marca
const text2 = new SplitType('.marcaName', { types: "words, chars" })
text2.chars.forEach(char => {
    const charsTl = gsap.timeline();

    charsTl.from(char, {

        y: gsap.utils.random(-150, 150),
        x: gsap.utils.random(-300, 300),
        rotate: gsap.utils.random(-360, 360),

        ease: "back.out",
        duration: 0.71,

    })

    char.addEventListener("mouseenter", () => {
        gsap.to(char, {
            rotate: 360,
            ease: "back.out",
        })
    })
})
//letra sub marca
gsap.to(".submarca", {
    y: -2,
    delay: 0.5,
    opacity: 1,
    ease: "back.out",
    duration: 2,

})

//boton 

gsap.to(".btnmarca", {
    y: 2,
    delay: 0.5,
    opacity: 1,
    ease: "back.out",
    duration: 1.5
})

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn");

    btn.addEventListener("click", () => {
        // Aplica fade out y escala a todo el body o contenedor principal
        gsap.to("body", {
            opacity: 0,
            scale: 0.98,
            duration: 0.6,
            ease: "power1.inOut",
            onComplete: () => {
                window.location.href = "principal.html";
            }
        });
    });
});


//imagenes

gsap.to(".img1", {
    y: 100,
    opacity: 1,
    delay: 0.5,
    ease: "back.out",
    duration: 1.5
})

gsap.from(".img1", {
    delay: 0.4,

    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    ease: "back.out(2)",
    stagger: 0.3, // animación una tras otra
    onComplete: () => {
        // Después de aparecer, hace un efecto de pulsación
        gsap.to(".img1", {
            scale: 1.06,
            duration: 0.6,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            stagger: 0.3
        });
    }
})

gsap.from('.animacionR', {
    opacity: 0,
    y: 100,
    ease: "power1.in",
    duration: 0.5,

    scrollTrigger: {
        trigger: '.animacionR',
        start: "top 80%",
        end: "center 80%",
        scrub: true,
        markers: false,
        scroller: document.body,

    }
})


gsap.from('.amimacionCrearCuenta',{
     scale:1,
    opacity: 0,
    ease: "power1.in",
    duration: 0.5,
    scrollTrigger: {
        trigger: '.amimacionCrearCuenta',
        start: "top 80%",
        end: "botton 50%",
        scrub: true,
        markers: true,
        scroller: document.body,
    }
})


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

gsap.to('.contenedor', {
    opacity: 1,
    y: 100,
    ease: "power1.in",

})


gsap.to(".final-text", {
    opacity: 1,
    y: 0,
    scrollTrigger: {
        trigger: ".final-text",
        start: "top 85%",
        end: "top 75%",
        scrub: true,
        markers: false,
        scroller: document.body
    }
})
gsap.to(".zoom-letter2", {
    scale: 1.5,
    xPercent: -50,
    yPercent: -50,
    opacity: 1,
    ease: "power2.inOut",
    duration: 1.5,
    transformOrigin: "center center",
    scrollTrigger: {
        trigger: ".zoom-letter2",
        start: "90% 80%",
        end: "60% 50%",
        scrub: true,
        scroller: document.body
    }
});

gsap.to(".final-text3", {
    opacity: 1,
    y: 0,
    scrollTrigger: {
        trigger: ".final-text3",
        start: "top 85%",
        end: "top 75%",
        scrub: true,

        scroller: document.body
    }
})

gsap.to(".final-text4", {
    opacity: 1,
    y: 0,
    scrollTrigger: {
        trigger: ".final-text4",
        start: "top 85%",
        end: "top 75%",
        scrub: true,

        scroller: document.body
    }
})
gsap.to(".final-text5", {
    opacity: 1,
    y: 0,
    scrollTrigger: {
        trigger: ".final-text5",
        start: "top 85%",
        end: "top 75%",
        scrub: true,

        scroller: document.body
    }
})

gsap.to(".final-text6", {
    opacity: 1,
    y: 0,
    scrollTrigger: {
        trigger: ".final-text6",
        start: "top 85%",
        end: "top 75%",
        scrub: true,

        scroller: document.body
    }
})
gsap.to(".final-text6", {
    opacity: 1,
    y: 0,
    scrollTrigger: {
        trigger: ".final-text6",
        start: "top 85%",
        end: "top 75%",
        scrub: true,

        scroller: document.body
    }
})
gsap.to(".final-text7", {
    opacity: 1,
    y: 0,
    scrollTrigger: {
        trigger: ".final-text7",
        start: "top 85%",
        end: "top 75%",
        scrub: true,

        scroller: document.body
    }
})

gsap.to(".final-text8", {
    opacity: 1,
    y: 0,
    scrollTrigger: {
        trigger: ".final-text8",
        start: "top 85%",
        end: "top 75%",
        scrub: true,

        scroller: document.body
    }
})

gsap.to(".final-text9", {
    opacity: 1,
    y: 0,
    scrollTrigger: {
        trigger: ".final-text9",
        start: "top 85%",
        end: "top 75%",
        scrub: true,
        
        scroller: document.body
    }
})

gsap.to(".anifooter", {
    opacity: 1,
    x: 0.5,
    scrollTrigger: {
        trigger: ".anifooter",
        start: "top 95%",
        end: "top 85%",
        scrub: true,
        
  
        scroller: document.body
    }
})




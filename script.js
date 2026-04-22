gsap.registerPlugin(ScrollTrigger);

// 1. CUSTOM CURSOR
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
});

// 2. HERO PARALLAX & GTA DEPTH OF FIELD BLUR
const layers = document.querySelectorAll(".layer");
layers.forEach(layer => {
    const speed = layer.getAttribute("data-speed");
    const yMovement = (1 - speed) * 500; 

    gsap.to(layer, {
        y: yMovement,
        ease: "none",
        scrollTrigger: {
            trigger: ".parallax-container",
            start: "top top",
            end: "bottom top",
            scrub: true,
        }
    });
});

// Efek DoF: Layer paling depan nge-blur saat di-scroll (Menciptakan ilusi 3D kamera)
gsap.to(".layer-fg img", {
    filter: "blur(15px)",
    scale: 1.2,
    scrollTrigger: {
        trigger: ".parallax-container",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// 3. PHILOSOPHY TEXT COLOR REVEAL
gsap.to(".reveal-text", {
    color: "#ffffff",
    scrollTrigger: {
        trigger: ".philosophy-section",
        start: "top 60%",
        end: "bottom 80%",
        scrub: true
    }
});

// 4. SERVICES STAGGER
gsap.from(".service-card", {
    scrollTrigger: { trigger: ".services-section", start: "top 70%" },
    y: 100, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out"
});

// 5. PROCESS VERTICAL PARALLAX
const steps = document.querySelectorAll(".process-step");
steps.forEach(step => {
    const speed = step.getAttribute("data-speed");
    gsap.fromTo(step, 
        { y: 200 }, 
        { 
            y: -200 * speed, 
            ease: "none",
            scrollTrigger: {
                trigger: ".process-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        }
    );
});

// 6. HORIZONTAL SCROLL (SHOWCASE)
const scrollContainer = document.querySelector(".horizontal-scroll-content");
gsap.to(scrollContainer, {
    x: () => -(scrollContainer.scrollWidth - window.innerWidth + 150),
    ease: "none",
    scrollTrigger: {
        trigger: ".portfolio-section",
        start: "top top",
        end: () => `+=${scrollContainer.scrollWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true
    }
});

// 7. STATISTICS NUMBER COUNTER
const counters = document.querySelectorAll('.counter');
counters.forEach(counter => {
    let target = +counter.getAttribute('data-target');
    ScrollTrigger.create({
        trigger: ".stats-section",
        start: "top 80%",
        once: true,
        onEnter: () => {
            gsap.to(counter, {
                innerHTML: target,
                duration: 2,
                snap: { innerHTML: 1 }, // Membulatkan angka agar tidak ada desimal
                ease: "power2.out"
            });
        }
    });
});

// 8. FOOTER FADE UP
gsap.from(".footer-parallax", {
    scrollTrigger: { trigger: ".footer-section", start: "top 80%" },
    y: 50, opacity: 0, duration: 1.5, ease: "power3.out"
});

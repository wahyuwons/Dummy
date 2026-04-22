gsap.registerPlugin(ScrollTrigger);

// 1. CUSTOM CURSOR ANIMATION
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    // Kursor utama (titik putih) mengikuti mouse secara instan
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
    // Follower (lingkaran luar) mengikuti dengan sedikit jeda (lag)
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
});

// Memperbesar lingkaran saat hover pada tautan atau gambar
const hoverElements = document.querySelectorAll('a, .portfolio-item');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(follower, { width: 80, height: 80, backgroundColor: "rgba(255,255,255,0.1)", duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(follower, { width: 40, height: 40, backgroundColor: "transparent", duration: 0.3 });
    });
});

// 2. HERO PARALLAX
const layers = document.querySelectorAll(".layer");
layers.forEach(layer => {
    const speed = layer.getAttribute("data-speed");
    const yMovement = (1 - speed) * 300; 

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

// 3. PHILOSOPHY TEXT REVEAL
// Memecah paragraf menjadi beberapa baris secara kasar untuk animasi
gsap.from(".reveal-text", {
    scrollTrigger: {
        trigger: ".philosophy-section",
        start: "top 70%",
    },
    y: 50,
    opacity: 0,
    duration: 1.5,
    ease: "power3.out"
});

// 4. HORIZONTAL SCROLL PORTFOLIO (Fitur Expert)
const scrollContainer = document.querySelector(".horizontal-scroll-content");

gsap.to(scrollContainer, {
    // Bergerak ke kiri sejauh total lebar konten dikurangi lebar layar
    x: () => -(scrollContainer.scrollWidth - window.innerWidth + (window.innerWidth * 0.2)),
    ease: "none",
    scrollTrigger: {
        trigger: ".portfolio-section",
        start: "top top", // Mulai saat section menyentuh atas layar
        end: () => `+=${scrollContainer.scrollWidth}`, // Durasi scroll sepanjang lebar konten
        pin: true, // Tahan layar agar tidak turun, tapi bergerak ke samping
        scrub: 1, // Smooth scrub
        invalidateOnRefresh: true // Kalkulasi ulang jika ukuran layar berubah
    }
});

// 5. FOOTER ANIMATION
gsap.from(".footer-content h2, .cta-button", {
    scrollTrigger: {
        trigger: ".footer-section",
        start: "top 80%",
    },
    y: 100,
    opacity: 0,
    stagger: 0.2,
    duration: 1,
    ease: "power4.out"
});

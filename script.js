// 1. LENIS SMOOTH SCROLL (Sangat penting untuk feel "Premium")
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing khas web premium
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Hubungkan Lenis dengan GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
gsap.ticker.lagSmoothing(0, 0);

window.addEventListener("load", () => {
    gsap.registerPlugin(ScrollTrigger);

    // 2. KURSOR KUSTOM (Membesar saat hover)
    const cursor = document.querySelector('.cursor');
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    });
    
    // Hover effect untuk kursor
    const links = document.querySelectorAll('a, .gallery-item');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 4, duration: 0.3 }));
        link.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, duration: 0.3 }));
    });

    // 3. PRELOADER ANIMATION
    let counterElement = document.querySelector(".counter");
    let currentValue = 0;
    
    function updateCounter() {
        if(currentValue === 100) return;
        currentValue += Math.floor(Math.random() * 10) + 1;
        if(currentValue > 100) currentValue = 100;
        counterElement.textContent = currentValue + "%";
        
        let delay = Math.floor(Math.random() * 200) + 50;
        setTimeout(updateCounter, delay);
    }
    updateCounter();

    // Timeline Preloader Selesai
    const tl = gsap.timeline({ delay: 2.5 }); // Tunggu angka sampai 100%
    tl.to(".preloader", {
        yPercent: -100, // Menggeser layar hitam ke atas
        duration: 1.5,
        ease: "power4.inOut"
    })
    // 4. HERO ANIMATION (Gambar mengecil dari full screen)
    .fromTo(".hero-image-wrapper", 
        { width: "100vw", height: "100vh", borderRadius: "0px" },
        { width: "60vw", height: "70vh", borderRadius: "20px", duration: 1.5, ease: "power4.inOut" },
        "-=1" // Mulai bersamaan saat layar hitam naik
    )
    .from(".hero-title", { y: 100, opacity: 0, duration: 1, stagger: 0.2 }, "-=1");

    // 5. HERO SCROLL EFFECT (Gambar terus mengecil saat di-scroll)
    gsap.to(".hero-image-wrapper", {
        width: "30vw",
        height: "40vh",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // 6. INTRO TEXT REVEAL (Memecah teks untuk efek transisi)
    const splitText = new SplitType('.stooff-reveal', { types: 'lines' });
    gsap.from(splitText.lines, {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        scrollTrigger: {
            trigger: ".intro-section",
            start: "top 70%",
            end: "bottom 80%",
            scrub: 1
        }
    });

    // 7. PARALLAX PADA GAMBAR GALLERY
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        const img = item.querySelector("img");
        
        // Efek gambar bergeser di dalam frame (Inner Parallax)
        gsap.to(img, {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // 8. ITEM KANAN BERGERAK LEBIH CEPAT (Asymmetrical Scroll)
    gsap.to(".item-right", {
        yPercent: -30,
        scrollTrigger: {
            trigger: ".gallery-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});
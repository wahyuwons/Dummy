// Tunggu sampai seluruh gambar dan struktur HTML ter-load
window.addEventListener("load", () => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. CUSTOM CURSOR
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
        gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
    });

    // 2. HERO PARALLAX & DoF BLUR (FIXED)
    const layers = document.querySelectorAll(".layer");
    layers.forEach(layer => {
        // Ambil elemen img di dalam layer
        const img = layer.querySelector("img");
        if(img) {
            const speed = parseFloat(layer.getAttribute("data-speed"));
            
            gsap.to(img, {
                // Menggerakkan gambar menggunakan yPercent agar dinamis mengikuti ukuran layar
                yPercent: (1 - speed) * 30, 
                ease: "none",
                scrollTrigger: {
                    trigger: ".parallax-container",
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                }
            });
        }
    });

    // Efek Blur pada Foreground (GTA Style)
    gsap.to(".layer-fg img", {
        filter: "blur(15px)",
        scrollTrigger: {
            trigger: ".parallax-container",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // 3. PHILOSOPHY TEXT
    gsap.to(".reveal-text", {
        color: "#ffffff",
        scrollTrigger: {
            trigger: ".philosophy-section",
            start: "top 60%",
            end: "bottom 80%",
            scrub: true
        }
    });

    // 4. BLUEPRINT WORKFLOW ANIMATION
    // Membuat kotak step muncul berurutan dengan sedikit efek melayang
    gsap.from(".blueprint-step", {
        scrollTrigger: {
            trigger: ".blueprint-canvas",
            start: "top 70%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out"
    });

    // 5. KOMBINASI HORIZONTAL SCROLL + INNER PARALLAX
    const scrollContainer = document.querySelector(".horizontal-scroll-content");
    const horizontalImages = gsap.utils.toArray('.image-wrapper img');

    // Animasi A: Menggeser seluruh container ke kiri
    let scrollTween = gsap.to(scrollContainer, {
        x: () => -(scrollContainer.scrollWidth - window.innerWidth + 150),
        ease: "none",
        scrollTrigger: {
            trigger: ".portfolio-section",
            start: "top top",
            end: () => `+=${scrollContainer.scrollWidth}`, // Durasi scroll = lebar konten
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
        }
    });

    // Animasi B: Parallax di dalam gambar saat container bergeser
    horizontalImages.forEach(img => {
        gsap.to(img, {
            xPercent: 30, // Gambar bergerak berlawanan arah dengan scroll container
            ease: "none",
            scrollTrigger: {
                trigger: ".portfolio-section",
                start: "top top",
                end: () => `+=${scrollContainer.scrollWidth}`,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    });

    // 6. Refresh ScrollTrigger untuk memastikan semua koordinat tepat
    ScrollTrigger.refresh();
});
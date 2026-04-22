// Register plugin
gsap.registerPlugin(ScrollTrigger);

// 1. Inisialisasi Smooth Scrolling (Opsional tapi direkomendasikan untuk efek GTA)
// GSAP punya plugin native (ScrollSmoother), tapi berbayar.
// Untuk latihan, kita pakai 'scrub' yang tinggi di ScrollTrigger.

const layers = document.querySelectorAll(".layer");

layers.forEach(layer => {
    // Ambil kecepatan dari atribut HTML data-speed
    const speed = layer.getAttribute("data-speed");
    
    // Perhitungan: semakin besar speed, semakin jauh elemen bergerak ke atas.
    // 1 - speed untuk membalik arah agar sesuai arah scroll.
    const yMovement = (1 - speed) * 500; // 500 adalah nilai intensitas gerakan

    gsap.to(layer, {
        y: yMovement, // Gerakkan elemen di sumbu Y
        ease: "none", // Harus none agar mulus mengikuti scroll
        scrollTrigger: {
            trigger: layer.closest(".parallax-container"),
            start: "top top", // Mulai saat container di paling atas
            end: "bottom top", // Selesai saat container sudah lewat ke atas
            scrub: true, // Animasi MENGIKUTI scroll
        }
    });
});

// 2. Efek Depth of Field (DoF): Menambahkan Blur pada Foreground saat scroll
gsap.to(".layer-fg img", {
    filter: "blur(20px)", // Semakin ke bawah, semakin blur
    scrollTrigger: {
        trigger: ".parallax-container",
        start: "top top",
        end: "bottom top",
        scrub: true,
    }
});
# 🚀 GSAP Portfolio — Deployment Guide
## Clone of leftcoast.refractweb.com style

---

## 📁 Struktur File

```
portfolio/
├── index.html      ← Struktur HTML utama + semua section
├── style.css       ← Semua styling + animasi CSS
├── script.js       ← Semua GSAP + Lenis + ScrollTrigger logic
└── README.md       ← Panduan ini
```

---

## ✏️ Cara Kustomisasi

### 1. Ganti Info Pribadi
Buka `index.html` dan cari-ganti semua:
- `YOUR NAME` → nama kamu
- `yourname@email.com` → email kamu  
- `yourname` di link sosial → username kamu
- `6281234567890` → nomor WhatsApp kamu

### 2. Ganti Proyek Portfolio
Setiap `<li class="work-item">` = satu proyek. Edit:
```html
<a href="https://LINK-WEBSITE-KAMU.netlify.app" target="_blank" ...>
  <h3 class="work-title">Nama Proyek</h3>
  <span class="work-location">Kategori · Teknologi</span>
```
Ganti `src` pada `<img>` dengan screenshot proyekmu.

### 3. Ganti Video Hero
```html
<source src="VIDEO-URL-KAMU.mp4" type="video/mp4" />
```
Upload video ke Cloudinary/Vimeo dan pakai URL-nya.

### 4. Ganti Foto Portrait
```html
<img src="https://URL-FOTO-KAMU.jpg" alt="..." />
```

---

## 🌐 Deploy ke Netlify (Gratis)

### Cara 1 — Drag & Drop (Paling Mudah)
1. Buka [netlify.com](https://netlify.com) → Log in
2. Klik **"Add new site" → "Deploy manually"**
3. **Drag & drop folder `portfolio/`** ke area upload
4. Selesai! Netlify langsung kasih URL

### Cara 2 — Via GitHub
```bash
# Di terminal
git init
git add .
git commit -m "Initial portfolio"
git remote add origin https://github.com/USERNAME/portfolio.git
git push -u origin main
```
Lalu di Netlify: **"Import from Git"** → pilih repo kamu.

---

## ⚙️ Fitur Animasi (GSAP)

| Fitur | Implementasi |
|-------|-------------|
| Smooth scroll | Lenis 1.0.42 |
| Preloader counter | GSAP timeline |
| Hero video parallax | ScrollTrigger scrub |
| Text reveal (lines) | GSAP clipPath/translateY |
| Works list stagger | ScrollTrigger + stagger |
| Marquee strip | GSAP infinite tween |
| Counter animation | GSAP onUpdate |
| Horizontal scroll | ScrollTrigger scrub |
| Portrait parallax | ScrollTrigger scrub |
| Custom cursor | GSAP ticker |
| Scroll progress bar | ScrollTrigger progress |

---

## 🔧 Kustomisasi Warna

Di `style.css`, ubah variabel di `:root`:
```css
:root {
  --clr-bg: #f5f2ee;        /* Background utama (cream) */
  --clr-bg-dark: #0d0d0d;   /* Background gelap */
  --clr-gold: #c9a96e;      /* Warna aksen gold */
  --clr-ink: #0d0d0d;       /* Warna teks utama */
}
```

---

## 📱 Responsivitas

- **Desktop** (>1024px): Full layout dengan horizontal scroll
- **Tablet** (900-1024px): Kolom disederhanakan
- **Mobile** (<900px): Nav burger, single column, preview image disembunyikan

---

## 💡 Tips Performance

1. **Kompres gambar** sebelum upload — pakai [squoosh.app](https://squoosh.app)
2. **Konversi video** ke WebM untuk ukuran lebih kecil
3. **Lazy load images** — tambahkan `loading="lazy"` pada `<img>` yang tidak di viewport awal
4. **Custom domain** — beli di Namecheap/Niagahoster, sambungkan di Netlify DNS

---

©2025 Your Name. All rights reserved.

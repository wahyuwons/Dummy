/**
 * ═══════════════════════════════════════════════════════════
 *  Wahyuwono Portfolio — script.js
 *  GSAP 3.12 + ScrollTrigger + Lenis Smooth Scroll
 *  Inspired by leftcoast.refractweb.com
 * ═══════════════════════════════════════════════════════════
 */

/* ── Anti-FOUC ──────────────────────────────────────────── */
document.documentElement.style.visibility = 'hidden';

/* ── GSAP plugin register ───────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════
   1. LENIS SMOOTH SCROLL
═══════════════════════════════════════════════════════════ */
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.35,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
  });
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
}

/* ═══════════════════════════════════════════════════════════
   2. PRELOADER — EXACT leftcoast style
      SVG path draws → fill fades in → counter → slide up
═══════════════════════════════════════════════════════════ */
function initPreloader() {
  const preloader  = document.getElementById('preloader');
  const pathStroke = preloader.querySelector('.pre-path-stroke');
  const pathFill   = preloader.querySelector('.pre-path-fill');
  const letter     = preloader.querySelector('.pre-letter');
  const numEl      = document.getElementById('preNum');
  const bar        = document.getElementById('preBar');

  // Set initial stroke dasharray/offset via GSAP
  gsap.set(pathStroke, { strokeDashoffset: 1, strokeDasharray: 1 });
  gsap.set(pathFill, { opacity: 0 });
  gsap.set(letter, { opacity: 0 });

  const progress = { val: 0 };

  const tl = gsap.timeline({
    onComplete: exitPreloader
  });

  // 1. Draw stroke
  tl.to(pathStroke, {
    strokeDashoffset: 0,
    duration: 1.6,
    ease: 'power2.inOut',
  });

  // 2. Fill fades in & letter appears
  tl.to(pathFill, { opacity: 0.12, duration: 0.5 }, '-=0.2')
    .to(letter,    { opacity: 1,   duration: 0.4 }, '-=0.3');

  // 3. Counter 0→100
  tl.to(progress, {
    val: 100,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate() {
      const v = Math.round(progress.val);
      numEl.textContent = v;
      bar.style.width = v + '%';
    }
  }, '-=1.2');

  // 4. Exit — slide preloader up
  function exitPreloader() {
    gsap.to(preloader, {
      yPercent: -100,
      duration: 1,
      ease: 'expo.inOut',
      delay: 0.2,
      onStart() {
        document.documentElement.style.visibility = '';
      },
      onComplete() {
        preloader.style.display = 'none';
        initAllAnimations();
      }
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   3. CUSTOM CURSOR
═══════════════════════════════════════════════════════════ */
function initCursor() {
  const cursorEl = document.getElementById('cursor');
  const dot      = cursorEl.querySelector('.cur-dot');
  const ring     = cursorEl.querySelector('.cur-ring');
  const label    = cursorEl.querySelector('.cur-label');

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.set(dot, { x: mx, y: my });
  });

  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.10;
    ry += (my - ry) * 0.10;
    gsap.set(ring,  { x: rx, y: ry });
    gsap.set(label, { x: mx, y: my });
  });

  // Hover states for interactive elements
  document.querySelectorAll('a, button, .flip-card, .exp-card, .skill-panel, .cert-item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  });

  // "View" label for exp cards
  document.querySelectorAll('.exp-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      label.textContent = 'View';
      document.body.classList.add('cur-view');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cur-view');
    });
  });

  // Dark section cursor
  const darkSections = document.querySelectorAll('#hero, .marquee-wrap, .exp-section, .edu-section, .cta-section, #footer');
  darkSections.forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center', end: 'bottom center',
      onEnter:      () => document.body.classList.add('cur-dark'),
      onLeave:      () => document.body.classList.remove('cur-dark'),
      onEnterBack:  () => document.body.classList.add('cur-dark'),
      onLeaveBack:  () => document.body.classList.remove('cur-dark'),
    });
  });

  document.addEventListener('mouseleave', () => gsap.to([dot,ring], { opacity:0, duration:0.3 }));
  document.addEventListener('mouseenter', () => gsap.to([dot,ring], { opacity:1, duration:0.3 }));
}

/* ═══════════════════════════════════════════════════════════
   4. NAVIGATION
═══════════════════════════════════════════════════════════ */
function initNav() {
  const nav        = document.getElementById('nav');
  const burger     = document.getElementById('burgerBtn');
  const mobMenu    = document.getElementById('mobMenu');
  const mobLinks   = document.querySelectorAll('.mob-link');
  const progressBar = document.getElementById('navProgress');

  // Scroll state
  ScrollTrigger.create({
    start: 'top -80',
    onEnter:    () => nav.classList.add('scrolled'),
    onLeaveBack:() => nav.classList.remove('scrolled'),
  });

  // Scroll progress bar
  ScrollTrigger.create({
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      progressBar.style.width = (self.progress * 100) + '%';
    }
  });

  // Mobile menu
  burger.addEventListener('click', () => {
    const isOpen = mobMenu.classList.toggle('open');
    burger.classList.toggle('open');
    document.body.classList.toggle('no-scroll', isOpen);
    if (isOpen) {
      gsap.from('.mob-link', {
        y: 50, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'expo.out', delay: 0.35
      });
    }
  });

  mobLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobMenu.classList.remove('open');
      burger.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  });

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target && lenis) {
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.8, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   5. HERO ANIMATIONS
═══════════════════════════════════════════════════════════ */
function initHero() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // Badge
  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.9 }, 0.1);

  // Title lines — each line wraps inner content
  document.querySelectorAll('.ht-line').forEach((line, i) => {
    const inner = document.createElement('div');
    inner.style.display = 'block';
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
    tl.from(inner, { y: '110%', duration: 1.1 }, 0.2 + i * 0.1);
  });

  tl.to('.hero-sub',     { opacity: 1, y: 0, duration: 0.9 }, 0.65)
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.9 }, 0.75)
    .to('.hero-scroll',  { opacity: 1, duration: 1 }, 1.1);

  // Hero slides interval
  const slides = document.querySelectorAll('.hero-slide');
  const progressEl = document.getElementById('slideProgress');
  let current = 0;

  function nextSlide() {
    slides[current].classList.remove('active-slide');
    slides[current].style.position = 'absolute';
    slides[current].style.top = '0';
    current = (current + 1) % slides.length;
    slides[current].style.position = 'relative';
    slides[current].style.top = 'auto';
    slides[current].classList.add('active-slide');
    progressEl.style.width = ((current + 1) / slides.length * 100) + '%';
  }

  setInterval(nextSlide, 3500);

  // Orbs parallax
  gsap.to('.orb-1', {
    y: -60, x: 30, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
  });
  gsap.to('.orb-2', {
    y: 80, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2 }
  });
  gsap.to('.orb-3', {
    y: -40, x: -20, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
}

/* ═══════════════════════════════════════════════════════════
   6. MARQUEE
═══════════════════════════════════════════════════════════ */
function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  const row   = track.querySelector('.marquee-row');
  const w     = row.offsetWidth;

  gsap.to(track, {
    x: -w,
    duration: 30,
    ease: 'none',
    repeat: -1,
  });

  // Pause on hover
  track.addEventListener('mouseenter', () => gsap.to(track, { timeScale: 0, duration: 0.5, overwrite: 'auto' }));
  track.addEventListener('mouseleave', () => gsap.to(track, { timeScale: 1, duration: 0.5, overwrite: 'auto' }));
}

/* ═══════════════════════════════════════════════════════════
   7. STATS SECTION — reveal text + flip card 3D tilt
═══════════════════════════════════════════════════════════ */
function initStats() {
  // Header reveal
  document.querySelectorAll('#stats .st-line').forEach((line, i) => {
    const inner = document.createElement('span');
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
    gsap.from(inner, {
      y: '110%', duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: '#stats', start: 'top 82%' },
      delay: i * 0.1
    });
  });

  // Flip cards entrance
  gsap.from('.flip-card', {
    y: 60, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: '.flip-grid', start: 'top 80%' }
  });

  // Count-up animation
  document.querySelectorAll('.count').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter() {
        gsap.to(obj, {
          val: target, duration: 2.2, ease: 'power3.out',
          onUpdate() { el.textContent = Math.round(obj.val); }
        });
      }
    });
  });

  // 3D tilt on flip cards
  document.querySelectorAll('.flip-card').forEach(card => {
    const inner = card.querySelector('.flip-inner');
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      // Only tilt if not flipped (no hover for flip)
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   8. REVEAL ANIMATIONS — section-wide
═══════════════════════════════════════════════════════════ */
function initRevealAnimations() {
  // .reveal-up elements
  document.querySelectorAll('.reveal-up').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  // .reveal-line-h sections
  document.querySelectorAll('.reveal-line-h').forEach(h => {
    h.querySelectorAll('.rline').forEach((line, i) => {
      const inner = document.createElement('span');
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
      gsap.from(inner, {
        y: '110%', duration: 1.0, ease: 'expo.out',
        scrollTrigger: { trigger: h, start: 'top 85%' },
        delay: i * 0.1
      });
    });
  });

  // .eyebrow elements
  document.querySelectorAll('.eyebrow').forEach(el => {
    gsap.from(el, {
      opacity: 0, x: -15, duration: 0.8, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   9. ABOUT SECTION
═══════════════════════════════════════════════════════════ */
function initAbout() {
  // Portrait parallax
  const portraitImg = document.querySelector('.portrait-img');
  if (portraitImg) {
    gsap.to(portraitImg, {
      yPercent: -8, ease: 'none',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom', end: 'bottom top',
        scrub: 1.2
      }
    });
  }

  // Float tags entrance
  gsap.from(['.float-tag-1', '.float-tag-2', '.float-tag-3'], {
    opacity: 0, scale: 0.8, stagger: 0.2, duration: 0.8, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: '.portrait-card', start: 'top 75%' }
  });

  // Portrait card entrance
  gsap.from('.portrait-card', {
    opacity: 0, x: 60, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '.about-section', start: 'top 75%' }
  });
}

/* ═══════════════════════════════════════════════════════════
   10. EXPERIENCE CARDS — stagger + 3D tilt on hover
═══════════════════════════════════════════════════════════ */
function initExperience() {
  // Entrance
  gsap.from('.exp-card', {
    opacity: 0, y: 80, stagger: 0.12, duration: 1.0, ease: 'expo.out',
    scrollTrigger: { trigger: '.exp-grid', start: 'top 80%' }
  });

  // 3D tilt on hover
  document.querySelectorAll('.exp-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width  - 0.5;
      const yRatio = (e.clientY - rect.top)  / rect.height - 0.5;
      gsap.to(card, {
        rotationY: xRatio * 8,
        rotationX: -yRatio * 6,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 900,
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.5, ease: 'expo.out' });
    });
  });

  // Color sweep on scroll (background shifts)
  document.querySelectorAll('.exp-card').forEach((card, i) => {
    const color = card.dataset.color || '#111';
    ScrollTrigger.create({
      trigger: card,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => gsap.to('.exp-section', { backgroundColor: color, duration: 0.6 }),
      onLeaveBack: () => {
        const prev = document.querySelectorAll('.exp-card')[Math.max(0, i-1)].dataset.color;
        gsap.to('.exp-section', { backgroundColor: prev, duration: 0.6 });
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   11. SKILLS — bar fill animation
═══════════════════════════════════════════════════════════ */
function initSkills() {
  gsap.from('.skill-panel', {
    opacity: 0, y: 50, stagger: 0.1, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: '.skills-grid', start: 'top 80%' }
  });

  document.querySelectorAll('.sp-fill').forEach(fill => {
    const w = fill.dataset.w;
    ScrollTrigger.create({
      trigger: fill,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(fill, { width: w + '%', duration: 1.3, ease: 'expo.out', delay: 0.2 });
      }
    });
  });

  // Skill panel 3D hover
  document.querySelectorAll('.skill-panel').forEach(panel => {
    panel.addEventListener('mousemove', e => {
      const rect = panel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      gsap.to(panel, {
        rotationY: x * 6, rotationX: -y * 4,
        transformPerspective: 900,
        duration: 0.4, ease: 'power2.out'
      });
    });
    panel.addEventListener('mouseleave', () => {
      gsap.to(panel, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'expo.out' });
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   12. EDUCATION + CERTS
═══════════════════════════════════════════════════════════ */
function initEdu() {
  gsap.from('.bento-edu', {
    opacity: 0, x: -60, duration: 1.0, ease: 'expo.out',
    scrollTrigger: { trigger: '.edu-bento', start: 'top 80%' }
  });

  gsap.from('.cert-item', {
    opacity: 0, y: 30, stagger: 0.06, duration: 0.7, ease: 'expo.out',
    scrollTrigger: { trigger: '.certs-grid', start: 'top 80%' }
  });
}

/* ═══════════════════════════════════════════════════════════
   13. CTA SECTION — parallax floating items + big title
═══════════════════════════════════════════════════════════ */
function initCTA() {
  // CTA title reveal
  document.querySelectorAll('.cta-line').forEach((line, i) => {
    const inner = document.createElement('span');
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
    gsap.from(inner, {
      y: '110%', duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.cta-card', start: 'top 75%' },
      delay: i * 0.12
    });
  });

  gsap.from('.cta-sub, .cta-main-btn', {
    opacity: 0, y: 30, stagger: 0.15, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: '.cta-card', start: 'top 75%' },
    delay: 0.4
  });

  gsap.from('.contact-item', {
    opacity: 0, y: 30, stagger: 0.1, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '.contact-grid', start: 'top 85%' }
  });

  // Floating tech items random movement
  document.querySelectorAll('.cta-float').forEach((el, i) => {
    gsap.to(el, {
      y: gsap.utils.random(-20, 20),
      x: gsap.utils.random(-10, 10),
      rotation: gsap.utils.random(-8, 8),
      duration: gsap.utils.random(3, 5),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.3,
    });
  });

  // Magnetic hover on cta-main-btn
  const ctaBtn = document.querySelector('.cta-main-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('mousemove', e => {
      const rect = ctaBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      gsap.to(ctaBtn, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
    });
    ctaBtn.addEventListener('mouseleave', () => {
      gsap.to(ctaBtn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   14. FOOTER REVEAL
═══════════════════════════════════════════════════════════ */
function initFooter() {
  gsap.from('.footer-brand, .footer-nav-cols, .footer-contact-col', {
    opacity: 0, y: 30, stagger: 0.1, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: '#footer', start: 'top 90%' }
  });
}

/* ═══════════════════════════════════════════════════════════
   15. MAGNETIC NAV LOGO
═══════════════════════════════════════════════════════════ */
function initMagneticLogo() {
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;
  logo.addEventListener('mousemove', e => {
    const rect = logo.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.4;
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.4;
    gsap.to(logo, { x, y, duration: 0.4, ease: 'power2.out' });
  });
  logo.addEventListener('mouseleave', () => {
    gsap.to(logo, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
}

/* ═══════════════════════════════════════════════════════════
   16. SECTION ENTRANCE GENERIC
═══════════════════════════════════════════════════════════ */
function initSectionLines() {
  document.querySelectorAll('.section-desc').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 24, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   BOOT — all in one context for clean cleanup
═══════════════════════════════════════════════════════════ */
function initAllAnimations() {
  gsap.context(() => {
    initLenis();
    initCursor();
    initNav();
    initHero();
    initMarquee();
    initStats();
    initRevealAnimations();
    initAbout();
    initExperience();
    initSkills();
    initEdu();
    initCTA();
    initFooter();
    initMagneticLogo();
    initSectionLines();

    // Final refresh after images loaded
    window.addEventListener('load', () => {
      ScrollTrigger.refresh(true);
    });
  });
}

/* ─── Start preloader on DOM ready ─────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  initPreloader();
});

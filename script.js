/**
 * ════════════════════════════════════════════════════════
 *  PORTFOLIO — script.js
 *  Stack: GSAP 3.12 + ScrollTrigger + Lenis Smooth Scroll
 *  Author: your-name
 * ════════════════════════════════════════════════════════
 */

// ── Prevent FOUC ─────────────────────────────────────────
document.documentElement.style.visibility = 'hidden';

// ── Register plugins ──────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ════════════════════════════════════════════════════════
// 1. LENIS SMOOTH SCROLL
// ════════════════════════════════════════════════════════
let lenis;

function initLenis() {
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  // Connect Lenis to GSAP ticker
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Sync Lenis scroll position with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
}

// ════════════════════════════════════════════════════════
// 2. PRELOADER
// ════════════════════════════════════════════════════════
function initPreloader() {
  const preloader   = document.getElementById('preloader');
  const bar         = preloader.querySelector('.preloader-bar');
  const countEl     = document.getElementById('count-num');
  const logoSpans   = preloader.querySelectorAll('.preloader-logo span');

  // Logo entrance
  gsap.from(logoSpans, {
    y: 60, opacity: 0, duration: 0.8, stagger: 0.1,
    ease: 'expo.out', delay: 0.1
  });

  // Progress counter
  let progress = { val: 0 };
  const tl = gsap.timeline({ delay: 0.3 });

  tl.to(progress, {
    val: 100,
    duration: 2,
    ease: 'power2.inOut',
    onUpdate() {
      const v = Math.round(progress.val);
      countEl.textContent = v;
      bar.style.width = v + '%';
    }
  });

  // Exit animation
  tl.to(preloader, {
    yPercent: -100,
    duration: 0.9,
    ease: 'expo.inOut',
    onComplete() {
      preloader.style.display = 'none';
      document.documentElement.style.visibility = '';
      initAnimations();
    }
  }, '+=0.2');
}

// ════════════════════════════════════════════════════════
// 3. CUSTOM CURSOR
// ════════════════════════════════════════════════════════
function initCursor() {
  const cursorEl  = document.getElementById('cursor');
  const dot       = cursorEl.querySelector('.cursor-dot');
  const circle    = cursorEl.querySelector('.cursor-circle');

  let mouseX = 0, mouseY = 0;
  let circleX = 0, circleY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(dot, { x: mouseX, y: mouseY });
  });

  // Circle lags behind dot — smooth follow
  gsap.ticker.add(() => {
    circleX += (mouseX - circleX) * 0.12;
    circleY += (mouseY - circleY) * 0.12;
    gsap.set(circle, { x: circleX, y: circleY });
  });

  // Hover states
  const hoverTargets = 'a, button, .work-item, .h-scroll-panel';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Dark sections
  const darkSections = document.querySelectorAll('#hero, .marquee-strip, .services-section--dark, .cta-section, #footer');
  darkSections.forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter:      () => document.body.classList.add('cursor-dark'),
      onLeave:      () => document.body.classList.remove('cursor-dark'),
      onEnterBack:  () => document.body.classList.add('cursor-dark'),
      onLeaveBack:  () => document.body.classList.remove('cursor-dark'),
    });
  });

  // Hide cursor on leave
  document.addEventListener('mouseleave', () => gsap.to(cursorEl, { opacity: 0, duration: 0.3 }));
  document.addEventListener('mouseenter', () => gsap.to(cursorEl, { opacity: 1, duration: 0.3 }));
}

// ════════════════════════════════════════════════════════
// 4. NAVIGATION
// ════════════════════════════════════════════════════════
function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('menuToggle');
  const menu   = document.getElementById('mobileMenu');
  const mLinks = document.querySelectorAll('.mobile-link');

  // Scroll state
  ScrollTrigger.create({
    start: 'top -80px',
    onEnter:    () => nav.classList.add('scrolled'),
    onLeaveBack:() => nav.classList.remove('scrolled'),
  });

  // Hero dark nav
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    onEnter:      () => nav.classList.add('dark-nav'),
    onLeave:      () => nav.classList.remove('dark-nav'),
    onEnterBack:  () => nav.classList.add('dark-nav'),
    onLeaveBack:  () => nav.classList.remove('dark-nav'),
  });
  // Set immediately on load
  nav.classList.add('dark-nav');

  // Mobile menu toggle
  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    burger.classList.toggle('open');
    document.body.classList.toggle('no-scroll', isOpen);
    if (isOpen) {
      gsap.from('.mobile-link', {
        y: 60, opacity: 0, duration: 0.6,
        stagger: 0.08, ease: 'expo.out', delay: 0.3
      });
    }
  });

  mLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  });

  // Smooth scroll for nav anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.8, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      }
    });
  });
}

// ════════════════════════════════════════════════════════
// 5. HERO ANIMATIONS
// ════════════════════════════════════════════════════════
function initHero() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // Video parallax on scroll
  gsap.to('.hero-video', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    }
  });

  // Eyebrow
  tl.to('.eyebrow-line', { scaleX: 1, duration: 1, ease: 'expo.out' })
    .to('.eyebrow-text', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');

  // Title lines — each has an inner span that animates up
  document.querySelectorAll('.hero-line').forEach((line, i) => {
    const inner = document.createElement('div');
    inner.style.display = 'block';
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);

    tl.from(inner, {
      y: '110%', duration: 1.1, ease: 'expo.out'
    }, 0.2 + i * 0.12);
  });

  // Sub
  tl.from('.hero-sub p',    { y: 30, opacity: 0, duration: 0.9 }, 0.7)
    .from('.hero-cta',      { y: 20, opacity: 0, duration: 0.8 }, 0.85)
    .to('.hero-scroll-indicator', { opacity: 1, duration: 1 }, 1.2);
}

// ════════════════════════════════════════════════════════
// 6. WORKS LIST ANIMATIONS
// ════════════════════════════════════════════════════════
function initWorksAnimations() {
  const items = document.querySelectorAll('.work-item');

  items.forEach((item, i) => {
    gsap.from(item, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      delay: i * 0.04,
    });

    // Thumb reveal on item enter
    const thumb = item.querySelector('.work-thumb');
    if (thumb) {
      gsap.from(thumb, {
        opacity: 0, scale: 0.8, duration: 0.6, ease: 'expo.out',
        scrollTrigger: { trigger: item, start: 'top 88%' }
      });
    }
  });
}

// ════════════════════════════════════════════════════════
// 7. MARQUEE ANIMATION (GSAP — no CSS keyframe)
// ════════════════════════════════════════════════════════
function initMarquee() {
  // Main marquee
  const track = document.getElementById('marqueeTrack');
  const inner = track.querySelector('.marquee-inner');
  const totalW = inner.offsetWidth;

  gsap.to(track, {
    x: -totalW,
    duration: 28,
    ease: 'none',
    repeat: -1,
  });

  // Logos marquee (reverse)
  const logosTrack = document.getElementById('logosTrack');
  const logosInner = logosTrack.querySelector('.logos-inner');
  const logosW = logosInner.offsetWidth;

  gsap.fromTo(logosTrack,
    { x: -logosW },
    {
      x: 0,
      duration: 22,
      ease: 'none',
      repeat: -1,
    }
  );

  // Slow down on hover
  [track, logosTrack].forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el.animation || {}, { timeScale: 0 });
    });
  });
}

// ════════════════════════════════════════════════════════
// 8. STATS — COUNTER ANIMATION
// ════════════════════════════════════════════════════════
function initCounters() {
  document.querySelectorAll('.count').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter() {
        gsap.to(obj, {
          val: target,
          duration: 2.2,
          ease: 'power3.out',
          onUpdate() {
            el.textContent = Math.round(obj.val);
          }
        });
      }
    });
  });
}

// ════════════════════════════════════════════════════════
// 9. TEXT REVEAL ANIMATIONS
// ════════════════════════════════════════════════════════
function initRevealAnimations() {
  // Headings with .reveal-line-wrap children
  document.querySelectorAll('.reveal-line-wrap').forEach(wrapper => {
    const lines = wrapper.querySelectorAll('.reveal-line');

    // Wrap content in inner divs
    lines.forEach(line => {
      const inner = document.createElement('div');
      inner.style.display = 'block';
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
    });

    const inners = wrapper.querySelectorAll('.reveal-line > div');
    gsap.from(inners, {
      y: '110%',
      duration: 1.1,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 82%',
        toggleActions: 'play none none none',
      }
    });
  });

  // .reveal-up elements
  document.querySelectorAll('.reveal-up').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      }
    });
  });

  // .section-eyebrow
  document.querySelectorAll('.section-eyebrow').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
      }
    });
  });
}

// ════════════════════════════════════════════════════════
// 10. HORIZONTAL SCROLL (GSAP Drag-Based on Scroll)
// ════════════════════════════════════════════════════════
function initHorizontalScroll() {
  setupHScroll('#hScrollOuter', '#hScrollTrack');
  setupHScroll('#hScrollOuter2', '#hScrollTrack2');
}

function setupHScroll(outerSel, trackSel) {
  const outer = document.querySelector(outerSel);
  const track = document.querySelector(trackSel);
  if (!outer || !track) return;

  const panels = track.querySelectorAll('.h-scroll-panel');
  const panelW = panels[0].offsetWidth + 24; // 24 = gap
  const totalScroll = panelW * (panels.length - 1);

  // Drag scroll with mouse
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let currentX = 0;

  outer.addEventListener('mousedown', (e) => {
    isDragging = true;
    outer.style.cursor = 'grabbing';
    startX = e.pageX;
    scrollLeft = currentX;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    outer.style.cursor = '';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.pageX - startX;
    let next = scrollLeft + dx;
    next = Math.max(-totalScroll, Math.min(0, next));
    currentX = next;
    gsap.to(track, { x: next, duration: 0.4, ease: 'power2.out' });
  });

  // Scroll-linked horizontal motion
  const scrollCtx = gsap.context(() => {
    gsap.to(track, {
      x: -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: outer,
        start: 'top 60%',
        end: `+=${totalScroll * 1.5}`,
        scrub: 1.2,
        pin: false,
      }
    });
  }, outer);
}

// ════════════════════════════════════════════════════════
// 11. ABOUT PORTRAIT PARALLAX
// ════════════════════════════════════════════════════════
function initParallax() {
  // Portrait inner image
  const portrait = document.querySelector('.portrait-wrap img');
  if (portrait) {
    gsap.to(portrait, {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }

  // Stats section entrance
  gsap.from('.stat-card', {
    y: 50,
    opacity: 0,
    stagger: 0.1,
    duration: 0.9,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: '.stats-grid',
      start: 'top 80%',
    }
  });

  // CTA section big text scale
  gsap.from('.cta-headline', {
    scale: 0.92,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: '.cta-section',
      start: 'top 75%',
    }
  });

  // Footer logo reveal
  gsap.from('.footer-logo', {
    opacity: 0,
    y: 30,
    duration: 1,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: '#footer',
      start: 'top 90%',
    }
  });
}

// ════════════════════════════════════════════════════════
// 12. H-SCROLL PANELS IMAGE PARALLAX
// ════════════════════════════════════════════════════════
function initPanelImageParallax() {
  document.querySelectorAll('.h-panel-img img').forEach(img => {
    gsap.to(img, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('.h-scroll-panel'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  });
}

// ════════════════════════════════════════════════════════
// 13. EXTERNAL LINK CONFIRMATION (optional UX)
// ════════════════════════════════════════════════════════
function initWorkItemLinks() {
  document.querySelectorAll('.work-item-inner').forEach(item => {
    item.addEventListener('click', (e) => {
      // Ripple effect on click
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        width: 10px; height: 10px;
        background: rgba(201,169,110,0.3);
        transform: translate(-50%, -50%) scale(0);
        left: ${e.clientX - item.getBoundingClientRect().left}px;
        top:  ${e.clientY - item.getBoundingClientRect().top}px;
        pointer-events: none;
      `;
      item.parentElement.appendChild(ripple);
      gsap.to(ripple, {
        scale: 60, opacity: 0, duration: 0.8, ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    });
  });
}

// ════════════════════════════════════════════════════════
// 14. SCROLL PROGRESS LINE IN NAV (optional UX touch)
// ════════════════════════════════════════════════════════
function initScrollProgress() {
  const nav = document.getElementById('nav');
  const line = document.createElement('div');
  line.style.cssText = `
    position: absolute;
    bottom: 0; left: 0;
    height: 2px;
    background: var(--clr-gold);
    width: 0%;
    transform-origin: left;
    z-index: 1;
  `;
  nav.appendChild(line);

  ScrollTrigger.create({
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      gsap.set(line, { width: (self.progress * 100) + '%' });
    }
  });
}

// ════════════════════════════════════════════════════════
// 15. STAGGER IN — FOOTER COLUMNS
// ════════════════════════════════════════════════════════
function initFooterReveal() {
  gsap.from('.footer-col', {
    opacity: 0, y: 30, stagger: 0.1, duration: 0.9, ease: 'expo.out',
    scrollTrigger: {
      trigger: '.footer-nav',
      start: 'top 88%',
    }
  });

  gsap.from('.footer-tagline', {
    opacity: 0, y: 20, duration: 0.8, ease: 'expo.out',
    scrollTrigger: {
      trigger: '.footer-top',
      start: 'top 90%',
    }
  });
}

// ════════════════════════════════════════════════════════
// MAIN INIT — runs after preloader exit
// ════════════════════════════════════════════════════════
function initAnimations() {
  // All in a single gsap.context for clean cleanup
  const ctx = gsap.context(() => {
    initLenis();
    initCursor();
    initNav();
    initHero();
    initWorksAnimations();
    initMarquee();
    initCounters();
    initRevealAnimations();
    initHorizontalScroll();
    initParallax();
    initPanelImageParallax();
    initWorkItemLinks();
    initScrollProgress();
    initFooterReveal();

    // Refresh ScrollTrigger after all images load
    window.addEventListener('load', () => {
      ScrollTrigger.refresh(true);
    });
  });
}

// ════════════════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  initPreloader();
});

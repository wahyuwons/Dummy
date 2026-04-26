/**
 * Wahyuwono Portfolio — script.js
 * GSAP 3.12 + ScrollTrigger + Lenis
 * Clean rebuild — no duplicate functions, no double-wrapping
 */

/* ─── FOUC guard ─────────────────────────────────── */
document.documentElement.style.visibility = 'hidden';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function splitLines(selector) {
  document.querySelectorAll(selector).forEach(h => {
    h.querySelectorAll('.sl').forEach((line, i) => {
      if (line.dataset.split) return; // prevent double-wrapping
      line.dataset.split = '1';
      const inner = document.createElement('span');
      inner.style.cssText = 'display:block;will-change:transform';
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
    });
  });
}

function revealLines(selector, triggerEl) {
  const h = document.querySelector(selector);
  if (!h) return;
  h.querySelectorAll('.sl > span').forEach((inner, i) => {
    gsap.from(inner, {
      y: '110%', duration: 1.05, ease: 'expo.out',
      scrollTrigger: { trigger: triggerEl || h, start: 'top 84%', once: true },
      delay: i * 0.1
    });
  });
}

/* ═══════════════════════════════════════════════════
   1. LENIS
═══════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════
   2. PRELOADER — unique geometric animation
═══════════════════════════════════════════════════ */
function initPreloader() {
  const pre    = document.getElementById('preloader');
  const arc    = pre.querySelector('.pre-arc');
  const diam   = pre.querySelector('.pre-diamond');
  const diam2  = pre.querySelector('.pre-diamond-2');
  const letter = pre.querySelector('.pre-letter');
  const stateEl= document.getElementById('preState');

  const CIRCUMFERENCE = 2 * Math.PI * 128; // r=128
  const states = ['Initializing', 'Loading assets', 'Rendering', 'Almost ready'];
  let stateIdx = 0;

  // Initial state
  gsap.set(diam,   { strokeDashoffset: 1, strokeDasharray: 1 });
  gsap.set(diam2,  { strokeDashoffset: 1, strokeDasharray: 1 });
  gsap.set(letter, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
  arc.style.strokeDasharray = `0 ${CIRCUMFERENCE}`;

  const tl = gsap.timeline({ onComplete: exitPreloader });

  // Draw diamond
  tl.to(diam, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, 0)
    .to(diam2, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.3);

  // Letter pop-in
  tl.to(letter, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 0.6);

  // Arc progress fill
  const prog = { p: 0 };
  tl.to(prog, {
    p: 1, duration: 1.8, ease: 'power2.inOut',
    onUpdate() {
      const filled = prog.p * CIRCUMFERENCE;
      arc.style.strokeDasharray = `${filled} ${CIRCUMFERENCE}`;
      // Cycle state text
      const newIdx = Math.floor(prog.p * states.length);
      if (newIdx !== stateIdx && newIdx < states.length) {
        stateIdx = newIdx;
        if (stateEl) {
          gsap.to(stateEl, { opacity: 0, y: -8, duration: 0.2, onComplete() {
            stateEl.textContent = states[stateIdx];
            gsap.to(stateEl, { opacity: 1, y: 0, duration: 0.2 });
          }});
        }
      }
    }
  }, 0.4);

  function exitPreloader() {
    // Letter scale up then split panels slide
    const exitTl = gsap.timeline({
      onStart() { document.documentElement.style.visibility = ''; }
    });
    exitTl
      .to(letter, { scale: 60, opacity: 0, duration: 0.7, ease: 'power3.in' }, 0)
      .to('.pre-panel-top', { scaleY: 0, duration: 0.7, ease: 'expo.inOut' }, 0.3)
      .to('.pre-panel-bot', { scaleY: 0, duration: 0.7, ease: 'expo.inOut' }, 0.4)
      .to(pre, { opacity: 0, duration: 0.3, onComplete() { pre.style.display = 'none'; boot(); } }, 0.9);
  }
}

/* ═══════════════════════════════════════════════════
   3. CURSOR
═══════════════════════════════════════════════════ */
function initCursor() {
  const wrap = document.getElementById('cursor');
  const dot  = wrap.querySelector('.cur-dot');
  const ring = wrap.querySelector('.cur-ring');
  const txt  = wrap.querySelector('.cur-txt');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.set(dot, { x: mx, y: my });
    gsap.set(txt, { x: mx, y: my });
  });

  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    gsap.set(ring, { x: rx, y: ry });
  });

  // Hover — interactive elements
  const hoverEls = 'a,button,.wcard,.exp-card,.sp,.fc,.dc';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) document.body.classList.add('cur-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('cur-hover');
  });

  // Label on specific elements
  document.querySelectorAll('.wcard').forEach(el => {
    el.addEventListener('mouseenter', () => { txt.textContent = 'Visit ↗'; document.body.classList.add('cur-label'); });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-label'));
  });
  document.querySelectorAll('.drail-outer, .dc').forEach(el => {
    el.addEventListener('mouseenter', () => { txt.textContent = 'Drag'; document.body.classList.add('cur-label'); });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-label'));
  });

  // Dark on dark sections
  const darkSections = '#hero,.marquee-outer,#design,#experience,#contact,#footer';
  document.querySelectorAll(darkSections).forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top center', end: 'bottom center',
      onEnter:     () => document.body.classList.add('cur-dark'),
      onLeave:     () => document.body.classList.remove('cur-dark'),
      onEnterBack: () => document.body.classList.add('cur-dark'),
      onLeaveBack: () => document.body.classList.remove('cur-dark'),
    });
  });

  document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 }));
  document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 }));
}

/* ═══════════════════════════════════════════════════
   4. NAV
═══════════════════════════════════════════════════ */
function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burgerBtn');
  const mob    = document.getElementById('mobMenu');
  const prog   = document.getElementById('navProg');

  ScrollTrigger.create({
    start: 'top -80',
    onEnter:     () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled'),
  });

  ScrollTrigger.create({
    start: 'top top', end: 'bottom bottom',
    onUpdate(self) { if (prog) prog.style.width = (self.progress * 100) + '%'; }
  });

  // Mobile toggle
  burger.addEventListener('click', () => {
    const open = mob.classList.toggle('open');
    burger.classList.toggle('open');
    document.body.classList.toggle('no-scroll', open);
    if (open) {
      gsap.from('.mob-link', { y: 50, opacity: 0, stagger: 0.07, duration: 0.55, ease: 'expo.out', delay: 0.3 });
    }
  });

  document.querySelectorAll('.mob-link').forEach(l => {
    l.addEventListener('click', () => {
      mob.classList.remove('open');
      burger.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  });

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target && lenis) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.8 }); }
    });
  });
}

/* ═══════════════════════════════════════════════════
   5. HERO DOTS FIELD (scattered random dots)
═══════════════════════════════════════════════════ */
function initHeroDots() {
  const field = document.getElementById('hsDots');
  if (!field) return;
  for (let i = 0; i < 40; i++) {
    const d = document.createElement('div');
    d.className = 'hs-dot';
    const sz = Math.random() * 3 + 1.5;
    d.style.cssText = `
      width:${sz}px;height:${sz}px;
      top:${Math.random() * 100}%;left:${Math.random() * 100}%;
      --dur:${(Math.random() * 3 + 2).toFixed(1)}s;
      --del:${(Math.random() * 3).toFixed(1)}s;
    `;
    field.appendChild(d);
  }
}

/* ═══════════════════════════════════════════════════
   6. HERO ANIMATION
═══════════════════════════════════════════════════ */
function initHero() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // Badge
  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.9 }, 0.1);

  // Title lines
  document.querySelectorAll('.hline').forEach((line, i) => {
    const inner = document.createElement('div');
    inner.style.cssText = 'display:block;will-change:transform';
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
    tl.from(inner, { y: '110%', duration: 1.1 }, 0.2 + i * 0.1);
  });

  tl.to('.hero-desc',        { opacity: 1, y: 0, duration: 0.9 }, 0.65)
    .to('.hero-btns',        { opacity: 1, y: 0, duration: 0.9 }, 0.75)
    .to('.hero-ticker',      { opacity: 1, duration: 0.8 }, 0.85)
    .to('.hero-scroll-hint', { opacity: 1, duration: 1 }, 1.0);

  // Shapes subtle entrance
  gsap.from('.hs-ring-lg', { scale: 0.8, opacity: 0, duration: 2, ease: 'expo.out', delay: 0.3 });
  gsap.from('.hs-diamond', { rotate: -30, opacity: 0, duration: 1.8, ease: 'expo.out', delay: 0.4, transformOrigin: 'center' });
  gsap.from('.hs-ring-sm', { opacity: 0, x: 30, duration: 1.2, ease: 'expo.out', delay: 0.6 });
  gsap.from('.hs-cross',   { opacity: 0, scale: 0, duration: 1, ease: 'back.out(1.5)', delay: 0.8, transformOrigin: 'center' });
  gsap.from('.hs-tri',     { opacity: 0, y: 20, duration: 1, ease: 'expo.out', delay: 0.7 });

  // Floating shapes continuous rotation
  gsap.to('.hs-ring-lg', { rotate: 360, duration: 60, ease: 'none', repeat: -1, transformOrigin: 'center' });
  gsap.to('.hs-diamond', { rotate: 360, duration: 40, ease: 'none', repeat: -1, transformOrigin: 'center' });
  gsap.to('.hs-ring-sm', { rotate: -360, duration: 30, ease: 'none', repeat: -1, transformOrigin: 'center' });

  // Orb parallax
  gsap.to('.orb-gold',  { y: -70, x: 40,  ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 } });
  gsap.to('.orb-blue',  { y: 90,  ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2 } });
  gsap.to('.orb-green', { y: -50, x: -30, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });

  // Ticker cycle
  const items = document.querySelectorAll('.ht-item');
  let current = 0;
  if (items.length > 1) {
    setInterval(() => {
      items[current].classList.remove('active-ht');
      current = (current + 1) % items.length;
      items[current].classList.add('active-ht');
    }, 3500);
  }

  // Hero card interval
  const cards = document.querySelectorAll('.hero-card');
  const fill  = document.getElementById('hcFill');
  let ci = 0;
  if (cards.length > 1) {
    setInterval(() => {
      cards[ci].classList.remove('hcard-active');
      cards[ci].style.position = 'absolute';
      ci = (ci + 1) % cards.length;
      cards[ci].style.position = 'relative';
      cards[ci].classList.add('hcard-active');
      if (fill) fill.style.width = ((ci + 1) / cards.length * 100) + '%';
    }, 3500);
  }
}

/* ═══════════════════════════════════════════════════
   7. MARQUEE
═══════════════════════════════════════════════════ */
function initMarquee() {
  const track = document.getElementById('mTrack');
  if (!track) return;
  const row = track.querySelector('.marquee-row');
  if (!row) return;
  const w = row.offsetWidth;
  gsap.to(track, { x: -w, duration: 28, ease: 'none', repeat: -1 });
}

/* ═══════════════════════════════════════════════════
   8. STATS — counters + flip card tilt
═══════════════════════════════════════════════════ */
function initStats() {
  // Section heading
  splitLines('#stats .js-split');
  revealLines('#stats .js-split', '#stats');

  // Desc
  document.querySelectorAll('#stats .js-up').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Flip cards entrance
  gsap.from('.fc', { opacity: 0, y: 50, stagger: 0.1, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '.flip-cards-grid', start: 'top 80%', once: true } });

  // Count-up
  document.querySelectorAll('.cnt').forEach(el => {
    const n = parseInt(el.dataset.n, 10);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter() {
        gsap.to(obj, { v: n, duration: 2.2, ease: 'power3.out', onUpdate() { el.textContent = Math.round(obj.v); } });
      }
    });
  });
}

/* ═══════════════════════════════════════════════════
   9. ABOUT
═══════════════════════════════════════════════════ */
function initAbout() {
  splitLines('#about .js-split');
  revealLines('#about .js-split', '#about');

  document.querySelectorAll('#about .js-up').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Portrait parallax
  const img = document.querySelector('.portrait-img');
  if (img) {
    gsap.to(img, { yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
  }

  // Float chips entrance
  gsap.from('.float-chip', { opacity: 0, scale: 0.8, stagger: 0.18, duration: 0.8, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: '.portrait-frame', start: 'top 75%', once: true } });

  gsap.from('.portrait-frame', { opacity: 0, x: 50, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '#about', start: 'top 78%', once: true } });
}

/* ═══════════════════════════════════════════════════
   10. WORKS — filter + tilt + reveal
═══════════════════════════════════════════════════ */
function initWorks() {
  splitLines('#works .js-split');
  revealLines('#works .js-split', '#works .works-head');

  // Desc / filter
  gsap.from('.works-head-r', { opacity: 0, y: 20, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '.works-head', start: 'top 85%', once: true } });

  // Card stagger
  gsap.from('.wcard', { opacity: 0, y: 55, scale: 0.97, stagger: { amount: 0.5 },
    duration: 0.85, ease: 'expo.out',
    scrollTrigger: { trigger: '.works-bento', start: 'top 80%', once: true } });

  // Filter
  document.querySelectorAll('.wfb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wfb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.f;
      document.querySelectorAll('.wcard').forEach(card => {
        const show = f === 'all' || card.dataset.cat === f;
        card.classList.toggle('hidden-card', !show);
        gsap.to(card, show
          ? { opacity: 1, scale: 1, duration: 0.4, ease: 'expo.out' }
          : { opacity: 0, scale: 0.93, duration: 0.3, ease: 'power2.in' });
      });
    });
  });

  // 3D tilt
  document.querySelectorAll('.wcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, { rotationY: x * 7, rotationX: -y * 5, transformPerspective: 1000, duration: 0.4, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.7, ease: 'expo.out' });
    });
  });
}

/* ═══════════════════════════════════════════════════
   11. DESIGN DRAG RAIL
═══════════════════════════════════════════════════ */
function initDesignRail() {
  const outer = document.getElementById('drailOuter');
  const rail  = document.getElementById('drail');
  const hint  = document.getElementById('drailHint');
  if (!outer || !rail) return;

  // Heading
  splitLines('#design .js-split');
  revealLines('#design .js-split', '#design .design-head');

  document.querySelectorAll('#design .js-up').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: '#design', start: 'top 85%', once: true } });
  });

  // Card entrance
  gsap.from('.dc', { opacity: 0, x: 50, stagger: 0.08, duration: 0.85, ease: 'expo.out',
    scrollTrigger: { trigger: outer, start: 'top 80%', once: true } });

  // Drag logic with momentum
  let isDown = false, startX = 0, currentX = 0, lastX = 0, velX = 0, raf = null;

  function clamp(v) {
    const min = -(rail.scrollWidth - outer.clientWidth + 48);
    return Math.max(Math.min(v, 0), min);
  }
  function setX(x) { currentX = clamp(x); gsap.set(rail, { x: currentX }); }

  function momentum() {
    if (Math.abs(velX) < 0.4) return;
    velX *= 0.91;
    setX(currentX + velX);
    raf = requestAnimationFrame(momentum);
  }

  outer.addEventListener('mousedown', e => {
    isDown = true; startX = e.clientX - currentX; lastX = e.clientX; velX = 0;
    if (raf) cancelAnimationFrame(raf);
    if (hint) hint.classList.add('hidden');
  });
  document.addEventListener('mousemove', e => {
    if (!isDown) return;
    velX = e.clientX - lastX; lastX = e.clientX; setX(e.clientX - startX);
  });
  document.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false; raf = requestAnimationFrame(momentum);
  });

  // Touch
  outer.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX - currentX; velX = 0;
    if (raf) cancelAnimationFrame(raf);
    if (hint) hint.classList.add('hidden');
  }, { passive: true });
  outer.addEventListener('touchmove', e => {
    velX = e.touches[0].clientX - startX - currentX;
    setX(e.touches[0].clientX - startX);
  }, { passive: true });
  outer.addEventListener('touchend', () => { raf = requestAnimationFrame(momentum); });

  // Prevent link clicks while dragging
  rail.addEventListener('click', e => { if (Math.abs(velX) > 3) e.preventDefault(); });

  // Hover tilt on cards
  document.querySelectorAll('.dc').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, { rotationY: x * 8, rotationX: -y * 6, transformPerspective: 900, duration: 0.35, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'expo.out' });
    });
  });
}

/* ═══════════════════════════════════════════════════
   12. EXPERIENCE
═══════════════════════════════════════════════════ */
function initExperience() {
  splitLines('#experience .js-split');
  revealLines('#experience .js-split', '#experience');

  gsap.from('.exp-card', { opacity: 0, y: 70, stagger: 0.12, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: '.exp-grid', start: 'top 80%', once: true } });

  // 3D tilt + bg color shift
  document.querySelectorAll('.exp-card').forEach((card, i) => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, { rotationY: x * 8, rotationX: -y * 6, transformPerspective: 900, duration: 0.4, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'expo.out' });
    });

    const bg = card.dataset.bg || '#111';
    ScrollTrigger.create({
      trigger: card, start: 'top 60%', end: 'bottom 40%',
      onEnter:     () => gsap.to('#experience', { backgroundColor: bg, duration: 0.6 }),
      onLeaveBack: () => { const prev = document.querySelectorAll('.exp-card')[Math.max(0, i - 1)].dataset.bg; gsap.to('#experience', { backgroundColor: prev, duration: 0.6 }); }
    });
  });
}

/* ═══════════════════════════════════════════════════
   13. SKILLS
═══════════════════════════════════════════════════ */
function initSkills() {
  splitLines('#skills .js-split');
  revealLines('#skills .js-split', '#skills');

  document.querySelectorAll('#skills .js-up').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  gsap.from('.sp', { opacity: 0, y: 50, stagger: 0.09, duration: 0.85, ease: 'expo.out',
    scrollTrigger: { trigger: '.skills-grid', start: 'top 80%', once: true } });

  document.querySelectorAll('.sb-fill').forEach(fill => {
    ScrollTrigger.create({
      trigger: fill, start: 'top 88%', once: true,
      onEnter() { gsap.to(fill, { width: fill.dataset.w + '%', duration: 1.3, ease: 'expo.out', delay: 0.15 }); }
    });
  });

  // Tilt
  document.querySelectorAll('.sp').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(el, { rotationY: x * 5, rotationX: -y * 4, transformPerspective: 900, duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'expo.out' });
    });
  });
}

/* ═══════════════════════════════════════════════════
   14. CONTACT / CTA
═══════════════════════════════════════════════════ */
function initContact() {
  splitLines('#contact .js-split');
  revealLines('#contact .js-split', '#contact .cta-card');

  document.querySelectorAll('#contact .js-up').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Float tags gentle movement
  document.querySelectorAll('.cft').forEach((el, i) => {
    gsap.to(el, {
      y: gsap.utils.random(-15, 15),
      x: gsap.utils.random(-8, 8),
      rotate: gsap.utils.random(-6, 6),
      duration: gsap.utils.random(3, 5),
      ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.25
    });
  });

  gsap.from('.ci', { opacity: 0, y: 25, stagger: 0.1, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '.contact-row', start: 'top 85%', once: true } });

  // Magnetic CTA button
  const btn = document.querySelector('.cta-btn');
  if (btn) {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' });
    });
  }
}

/* ═══════════════════════════════════════════════════
   15. FOOTER
═══════════════════════════════════════════════════ */
function initFooter() {
  gsap.from('.ft-brand,.ft-cols,.ft-col', { opacity: 0, y: 25, stagger: 0.08, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: '#footer', start: 'top 90%', once: true } });
}

/* ═══════════════════════════════════════════════════
   16. MAGNETIC NAV LOGO
═══════════════════════════════════════════════════ */
function initNavLogo() {
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;
  logo.addEventListener('mousemove', e => {
    const r = logo.getBoundingClientRect();
    gsap.to(logo, { x: (e.clientX - r.left - r.width / 2) * 0.4, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: 'power2.out' });
  });
  logo.addEventListener('mouseleave', () => {
    gsap.to(logo, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' });
  });
}

/* ═══════════════════════════════════════════════════
   BOOT — called after preloader exits
═══════════════════════════════════════════════════ */
function boot() {
  initLenis();
  initCursor();
  initNav();
  initHero();
  initMarquee();
  initStats();
  initAbout();
  initWorks();
  initDesignRail();
  initExperience();
  initSkills();
  initContact();
  initFooter();
  initNavLogo();
  window.addEventListener('load', () => ScrollTrigger.refresh(true));
}

/* ─── Start ─────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  initHeroDots();
  initPreloader();
});

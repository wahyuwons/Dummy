/**
 * Wahyuwono Portfolio — script.js  v3
 * GSAP 3.12 + ScrollTrigger + Lenis
 *
 * ARCHITECTURE:
 * – HTML: <div class="sl"><span>text</span></div> — NO JS wrapping
 * – All reveals: gsap.from() so GSAP owns initial hidden state
 * – Preloader: ~4s of geometric animation before exit
 */

document.documentElement.style.visibility = 'hidden';
gsap.registerPlugin(ScrollTrigger);

/* ─── HELPERS ─────────────────────────────────────── */
function revealLines(containerEl, triggerEl) {
  const el = typeof containerEl === 'string' ? document.querySelector(containerEl) : containerEl;
  if (!el) return;
  const spans = el.querySelectorAll('.sl > span');
  if (!spans.length) return;
  gsap.from(spans, {
    y: '108%', duration: 1.1, stagger: 0.12, ease: 'expo.out',
    scrollTrigger: { trigger: triggerEl || el, start: 'top 82%', once: true }
  });
}

function revealUp(el, triggerEl, delay) {
  gsap.from(el, {
    opacity: 0, y: 34, duration: 0.9, ease: 'expo.out', delay: delay || 0,
    scrollTrigger: { trigger: triggerEl || el, start: 'top 88%', once: true }
  });
}

function tilt3d(el, strength) {
  const s = strength || 8;
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    gsap.to(el, { rotationY: x*s, rotationX: -y*(s*.7), transformPerspective: 1000, duration: 0.35, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.65, ease: 'expo.out' });
  });
}

/* ═══════════════════════════════════════════════════
   1. LENIS
═══════════════════════════════════════════════════ */
let lenis;
function initLenis() {
  lenis = new Lenis({ duration: 1.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)), smoothTouch: false });
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
}

/* ═══════════════════════════════════════════════════
   2. PRELOADER — ~4s geometric morph
═══════════════════════════════════════════════════ */
function initPreloader() {
  const pre    = document.getElementById('preloader');
  const arc    = pre.querySelector('.pre-arc');
  const diam   = pre.querySelector('.pre-diamond');
  const diam2  = pre.querySelector('.pre-diamond-2');
  const letter = pre.querySelector('.pre-letter');
  const stateEl= document.getElementById('preState');
  const CIRC   = 2 * Math.PI * 128;
  const STATES = ['Initializing', 'Loading assets', 'Building layout', 'Running animations', 'Almost ready'];
  let si = 0;

  gsap.set(diam,   { attr: { 'stroke-dashoffset': 1, 'stroke-dasharray': '1 1' } });
  gsap.set(diam2,  { attr: { 'stroke-dashoffset': 1, 'stroke-dasharray': '1 1' } });
  gsap.set(letter, { opacity: 0, scale: 0.4, transformOrigin: '140px 140px' });
  arc.setAttribute('stroke-dasharray', `0 ${CIRC}`);

  const tl = gsap.timeline({ onComplete: exitPreloader });

  // 0-1s: diamonds draw
  tl.to(diam,  { attr: { 'stroke-dashoffset': 0 }, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to(diam2, { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'power2.inOut' }, 0.25);

  // 0.8s: letter pops in
  tl.to(letter, { opacity: 1, scale: 1, duration: 0.65, ease: 'back.out(2.5)' }, 0.8);

  // 0.5-3.8s: arc progress — SLOW & dramatic
  const prog = { p: 0 };
  tl.to(prog, {
    p: 1, duration: 3.4, ease: 'power1.inOut',
    onUpdate() {
      arc.setAttribute('stroke-dasharray', `${prog.p * CIRC} ${CIRC}`);
      const next = Math.min(Math.floor(prog.p * STATES.length), STATES.length - 1);
      if (next !== si && stateEl) {
        si = next;
        gsap.to(stateEl, { opacity: 0, y: -10, duration: 0.18,
          onComplete() { stateEl.textContent = STATES[si]; gsap.to(stateEl, { opacity: 1, y: 0, duration: 0.22 }); }
        });
      }
    }
  }, 0.5);

  // 4s: letter breathes
  tl.to(letter, { scale: 1.15, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 1 }, 4.0);

  function exitPreloader() {
    gsap.timeline({ onStart() { document.documentElement.style.visibility = ''; } })
      .to(letter, { scale: 90, opacity: 0, duration: 0.7, ease: 'power3.in', transformOrigin: '140px 140px' }, 0)
      .to('.pre-panel-top', { scaleY: 0, duration: 0.8, ease: 'expo.inOut' }, 0.2)
      .to('.pre-panel-bot', { scaleY: 0, duration: 0.8, ease: 'expo.inOut' }, 0.3)
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
  let mx=0, my=0, rx=0, ry=0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.set(dot, { x: mx, y: my });
    gsap.set(txt, { x: mx, y: my });
  });
  gsap.ticker.add(() => {
    rx += (mx-rx)*0.11; ry += (my-ry)*0.11;
    gsap.set(ring, { x: rx, y: ry });
  });

  const HOVER_SEL = 'a,button,.wcard,.exp-card,.sp,.fc,.dc,.ci';
  document.addEventListener('mouseover', e => { if (e.target.closest(HOVER_SEL)) document.body.classList.add('cur-hover'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(HOVER_SEL)) document.body.classList.remove('cur-hover'); });

  document.querySelectorAll('.wcard').forEach(el => {
    el.addEventListener('mouseenter', () => { txt.textContent='Visit ↗'; document.body.classList.add('cur-label'); });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-label'));
  });
  document.querySelectorAll('#drailOuter,.dc').forEach(el => {
    el.addEventListener('mouseenter', () => { txt.textContent='Drag'; document.body.classList.add('cur-label'); });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-label'));
  });

  document.querySelectorAll('#hero,.marquee-outer,#design,#experience,#contact,#footer').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top center', end: 'bottom center',
      onEnter:     () => document.body.classList.add('cur-dark'),
      onLeave:     () => document.body.classList.remove('cur-dark'),
      onEnterBack: () => document.body.classList.add('cur-dark'),
      onLeaveBack: () => document.body.classList.remove('cur-dark'),
    });
  });

  document.addEventListener('mouseleave', () => gsap.to([dot,ring], { opacity:0, duration:0.3 }));
  document.addEventListener('mouseenter', () => gsap.to([dot,ring], { opacity:1, duration:0.3 }));
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

  burger.addEventListener('click', () => {
    const open = mob.classList.toggle('open');
    burger.classList.toggle('open');
    document.body.classList.toggle('no-scroll', open);
    if (open) gsap.from('.mob-link', { y:50, opacity:0, stagger:0.07, duration:0.55, ease:'expo.out', delay:0.3 });
  });
  document.querySelectorAll('.mob-link').forEach(l => {
    l.addEventListener('click', () => {
      mob.classList.remove('open'); burger.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t && lenis) { e.preventDefault(); lenis.scrollTo(t, { duration: 1.8 }); }
    });
  });
}

/* ═══════════════════════════════════════════════════
   5. HERO DOTS
═══════════════════════════════════════════════════ */
function initHeroDots() {
  const field = document.getElementById('hsDots');
  if (!field) return;
  for (let i = 0; i < 45; i++) {
    const d = document.createElement('div');
    d.className = 'hs-dot';
    const sz = Math.random()*3+1.5;
    d.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--dur:${(Math.random()*3+2).toFixed(1)}s;--del:${(Math.random()*4).toFixed(1)}s;`;
    field.appendChild(d);
  }
}

/* ═══════════════════════════════════════════════════
   6. HERO
═══════════════════════════════════════════════════ */
function initHero() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  gsap.set('.hero-badge,.hero-desc,.hero-btns,.hero-ticker,.hero-scroll-hint,.hero-cards-wrap', { opacity: 0, y: 24 });
  tl.to('.hero-badge', { opacity:1, y:0, duration:0.9 }, 0.15);

  // Title lines — each .hline has an overflow:hidden container
  document.querySelectorAll('.hline').forEach((line, i) => {
    const inner = document.createElement('div');
    inner.style.cssText = 'display:block;will-change:transform;transform:translateY(110%)';
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
    tl.to(inner, { y: '0%', duration: 1.15 }, 0.22 + i * 0.1);
  });

  tl.to('.hero-desc',        { opacity:1, y:0, duration:0.9 }, 0.68)
    .to('.hero-btns',        { opacity:1, y:0, duration:0.9 }, 0.80)
    .to('.hero-ticker',      { opacity:1, y:0, duration:0.8 }, 0.92)
    .to('.hero-cards-wrap',  { opacity:1, y:0, duration:0.8 }, 0.95)
    .to('.hero-scroll-hint', { opacity:1, y:0, duration:0.8 }, 1.05);

  // Shapes entrance
  gsap.from('.hs-ring-lg', { scale:0.65, opacity:0, duration:2.4, ease:'expo.out', delay:0.3 });
  gsap.from('.hs-diamond', { rotation:-50, opacity:0, duration:2.0, ease:'expo.out', delay:0.4, transformOrigin:'center' });
  gsap.from('.hs-ring-sm', { opacity:0, x:50, duration:1.4, ease:'expo.out', delay:0.55 });
  gsap.from('.hs-cross',   { opacity:0, scale:0, duration:1.2, ease:'back.out(2.5)', delay:0.75, transformOrigin:'center' });
  gsap.from('.hs-tri',     { opacity:0, y:40, duration:1.1, ease:'expo.out', delay:0.65 });

  // Continuous rotation
  gsap.to('.hs-ring-lg', { rotation:360, duration:60, ease:'none', repeat:-1, transformOrigin:'center' });
  gsap.to('.hs-diamond', { rotation:360, duration:40, ease:'none', repeat:-1, transformOrigin:'center' });
  gsap.to('.hs-ring-sm', { rotation:-360, duration:28, ease:'none', repeat:-1, transformOrigin:'center' });

  // Orb parallax
  gsap.to('.orb-gold',  { y:-80, x:40,  ease:'none', scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:1.5 } });
  gsap.to('.orb-blue',  { y:90,         ease:'none', scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:2   } });
  gsap.to('.orb-green', { y:-50, x:-30, ease:'none', scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:1   } });

  // Ticker
  const items = document.querySelectorAll('.ht-item');
  let ci = 0;
  if (items.length > 1) setInterval(() => {
    items[ci].classList.remove('active-ht');
    ci = (ci+1) % items.length;
    items[ci].classList.add('active-ht');
  }, 3500);

  // Card swap
  const cards = document.querySelectorAll('.hero-card');
  const fill  = document.getElementById('hcFill');
  let hci = 0;
  if (cards.length > 1) setInterval(() => {
    cards[hci].classList.remove('hcard-active');
    cards[hci].style.position = 'absolute';
    hci = (hci+1) % cards.length;
    cards[hci].style.position = 'relative';
    cards[hci].classList.add('hcard-active');
    if (fill) fill.style.width = ((hci+1)/cards.length*100)+'%';
  }, 3500);
}

/* ═══════════════════════════════════════════════════
   7. MARQUEE
═══════════════════════════════════════════════════ */
function initMarquee() {
  const track = document.getElementById('mTrack');
  if (!track) return;
  const row = track.querySelector('.marquee-row');
  if (!row) return;
  requestAnimationFrame(() => {
    const w = row.offsetWidth;
    if (w > 0) gsap.to(track, { x:-w, duration:28, ease:'none', repeat:-1 });
  });
}

/* ═══════════════════════════════════════════════════
   8. STATS
═══════════════════════════════════════════════════ */
function initStats() {
  revealLines('#stats .stats-text-col', '#stats');
  revealUp('#stats .eyebrow', '#stats');
  revealUp('#stats .sec-desc', '#stats .sec-desc', 0.15);

  gsap.from('.fc', { opacity:0, y:65, scale:0.93, stagger:0.12, duration:0.95, ease:'expo.out',
    scrollTrigger:{ trigger:'.flip-cards-grid', start:'top 80%', once:true } });

  document.querySelectorAll('.cnt').forEach(el => {
    const n = parseInt(el.dataset.n, 10), obj = { v:0 };
    ScrollTrigger.create({ trigger:el, start:'top 86%', once:true,
      onEnter() { gsap.to(obj, { v:n, duration:2.4, ease:'power3.out', onUpdate() { el.textContent=Math.round(obj.v); } }); }
    });
  });
}

/* ═══════════════════════════════════════════════════
   9. ABOUT
═══════════════════════════════════════════════════ */
function initAbout() {
  revealLines('#about .about-text', '#about');
  revealUp('#about .eyebrow', '#about');
  revealUp(document.querySelectorAll('#about .sec-desc'), '#about .about-text', 0.1);
  revealUp('#about .about-links', '#about .about-links');

  gsap.from('.portrait-frame', { opacity:0, x:70, duration:1.2, ease:'expo.out',
    scrollTrigger:{ trigger:'#about', start:'top 78%', once:true } });

  const pimg = document.querySelector('.portrait-img');
  if (pimg) gsap.to(pimg, { yPercent:-8, ease:'none',
    scrollTrigger:{ trigger:'#about', start:'top bottom', end:'bottom top', scrub:1.2 } });

  gsap.from('.float-chip', { opacity:0, scale:0.6, stagger:0.18, duration:0.9, ease:'back.out(2)',
    scrollTrigger:{ trigger:'.portrait-frame', start:'top 75%', once:true } });
}

/* ═══════════════════════════════════════════════════
   10. WORKS
═══════════════════════════════════════════════════ */
function initWorks() {
  revealLines('#works .works-head > div:first-child', '#works .works-head');
  revealUp('#works .works-ey', '#works .works-head');
  revealUp('#works .works-head-r', '#works .works-head', 0.18);

  // Cards entrance — dramatic stagger
  gsap.from('.wcard', {
    opacity:0, y:75, scale:0.94, rotationX:10,
    stagger:{ amount:0.65, from:'start' },
    duration:0.95, ease:'expo.out', transformPerspective:1000,
    scrollTrigger:{ trigger:'.works-bento', start:'top 80%', once:true }
  });

  // Filter
  document.querySelectorAll('.wfb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wfb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.f;
      document.querySelectorAll('.wcard').forEach(card => {
        const show = f==='all' || card.dataset.cat===f;
        card.classList.toggle('hidden-card', !show);
        gsap.to(card, show
          ? { opacity:1, scale:1, y:0, duration:0.45, ease:'expo.out' }
          : { opacity:0, scale:0.92, y:20, duration:0.3, ease:'power2.in' });
      });
    });
  });

  // 3D tilt
  document.querySelectorAll('.wcard').forEach(el => tilt3d(el, 9));
}

/* ═══════════════════════════════════════════════════
   11. DESIGN RAIL
═══════════════════════════════════════════════════ */
function initDesignRail() {
  const outer = document.getElementById('drailOuter');
  const rail  = document.getElementById('drail');
  const hint  = document.getElementById('drailHint');
  if (!outer || !rail) return;

  revealLines('#design .design-head', '#design .design-head');
  revealUp('#design .eyebrow', '#design .design-head');
  revealUp(outer.previousElementSibling && outer.previousElementSibling.querySelector('p') || '#design p', '#design .design-head', 0.2);

  gsap.from('.dc', { opacity:0, x:90, stagger:0.09, duration:0.95, ease:'expo.out',
    scrollTrigger:{ trigger:outer, start:'top 80%', once:true } });

  // Drag
  let isDown=false, startX=0, posX=0, lastX=0, vel=0, raf=null;
  function clampX(v) { return Math.max(Math.min(v,0), -(rail.scrollWidth - outer.clientWidth + 48)); }
  function applyX(x) { posX=clampX(x); gsap.set(rail,{x:posX}); }
  function momentum() { if(Math.abs(vel)<0.35) return; vel*=0.91; applyX(posX+vel); raf=requestAnimationFrame(momentum); }

  outer.addEventListener('mousedown', e => {
    isDown=true; startX=e.clientX-posX; lastX=e.clientX; vel=0;
    if(raf) cancelAnimationFrame(raf);
    if(hint) hint.classList.add('hidden');
  });
  document.addEventListener('mousemove', e => { if(!isDown) return; vel=e.clientX-lastX; lastX=e.clientX; applyX(e.clientX-startX); });
  document.addEventListener('mouseup', () => { if(!isDown) return; isDown=false; raf=requestAnimationFrame(momentum); });
  outer.addEventListener('touchstart', e => { startX=e.touches[0].clientX-posX; vel=0; if(raf) cancelAnimationFrame(raf); if(hint) hint.classList.add('hidden'); }, {passive:true});
  outer.addEventListener('touchmove',  e => { vel=e.touches[0].clientX-startX-posX; applyX(e.touches[0].clientX-startX); }, {passive:true});
  outer.addEventListener('touchend',   () => { raf=requestAnimationFrame(momentum); });
  rail.addEventListener('click', e => { if(Math.abs(vel)>3) e.preventDefault(); }, true);

  document.querySelectorAll('.dc').forEach(el => tilt3d(el, 10));
}

/* ═══════════════════════════════════════════════════
   12. EXPERIENCE
═══════════════════════════════════════════════════ */
function initExperience() {
  revealLines('#experience', '#experience');
  revealUp('#experience .eyebrow', '#experience');

  gsap.from('.exp-card', {
    opacity:0, y:90, scale:0.92,
    stagger:0.15, duration:1.05, ease:'expo.out',
    scrollTrigger:{ trigger:'.exp-grid', start:'top 80%', once:true }
  });

  document.querySelectorAll('.exp-card').forEach((card, i) => {
    tilt3d(card, 10);
    const bg = card.dataset.bg || '#111';
    ScrollTrigger.create({
      trigger:card, start:'top 60%', end:'bottom 40%',
      onEnter:     () => gsap.to('#experience', { backgroundColor:bg, duration:0.5 }),
      onLeaveBack: () => {
        const prev = document.querySelectorAll('.exp-card')[Math.max(0,i-1)];
        if (prev) gsap.to('#experience', { backgroundColor:prev.dataset.bg, duration:0.5 });
      }
    });
  });
}

/* ═══════════════════════════════════════════════════
   13. SKILLS
═══════════════════════════════════════════════════ */
function initSkills() {
  revealLines('#skills', '#skills');
  revealUp('#skills .eyebrow', '#skills');

  gsap.from('.sp', {
    opacity:0, y:60, scale:0.94,
    stagger:{ amount:0.4 }, duration:0.92, ease:'expo.out',
    scrollTrigger:{ trigger:'.skills-grid', start:'top 80%', once:true }
  });

  document.querySelectorAll('.sb-fill').forEach(fill => {
    ScrollTrigger.create({ trigger:fill, start:'top 88%', once:true,
      onEnter() { gsap.to(fill, { width:fill.dataset.w+'%', duration:1.4, ease:'expo.out', delay:0.1 }); }
    });
  });

  document.querySelectorAll('.sp').forEach(el => tilt3d(el, 6));
}

/* ═══════════════════════════════════════════════════
   14. CONTACT
═══════════════════════════════════════════════════ */
function initContact() {
  revealLines('#contact .cta-center', '#contact .cta-card');
  revealUp('#contact .cta-center > p', '#contact .cta-card', 0.3);

  gsap.from('.cta-btn', { opacity:0, y:22, scale:0.88, duration:0.8, ease:'back.out(1.5)',
    scrollTrigger:{ trigger:'#contact .cta-card', start:'top 75%', once:true }, delay:0.55 });

  gsap.from('.ci', { opacity:0, y:28, stagger:0.1, duration:0.85, ease:'expo.out',
    scrollTrigger:{ trigger:'.contact-row', start:'top 88%', once:true } });

  // Floating tags drift
  document.querySelectorAll('.cft').forEach((el, i) => {
    gsap.to(el, { y:gsap.utils.random(-14,14), x:gsap.utils.random(-8,8), rotate:gsap.utils.random(-6,6),
      duration:gsap.utils.random(3,5), ease:'sine.inOut', repeat:-1, yoyo:true, delay:i*0.3 });
  });

  // Magnetic button
  const btn = document.querySelector('.cta-btn');
  if (btn) {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x:(e.clientX-r.left-r.width/2)*.35, y:(e.clientY-r.top-r.height/2)*.35, duration:0.4, ease:'power2.out' });
    });
    btn.addEventListener('mouseleave', () => gsap.to(btn, { x:0, y:0, duration:0.7, ease:'elastic.out(1,.4)' }));
  }
}

/* ═══════════════════════════════════════════════════
   15. FOOTER
═══════════════════════════════════════════════════ */
function initFooter() {
  gsap.from('.ft-brand,.ft-col', { opacity:0, y:28, stagger:0.08, duration:0.9, ease:'expo.out',
    scrollTrigger:{ trigger:'#footer', start:'top 90%', once:true } });
}

/* ═══════════════════════════════════════════════════
   16. NAV LOGO MAGNETIC
═══════════════════════════════════════════════════ */
function initNavLogo() {
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;
  logo.addEventListener('mousemove', e => {
    const r = logo.getBoundingClientRect();
    gsap.to(logo, { x:(e.clientX-r.left-r.width/2)*.4, y:(e.clientY-r.top-r.height/2)*.4, duration:0.35, ease:'power2.out' });
  });
  logo.addEventListener('mouseleave', () => gsap.to(logo, { x:0, y:0, duration:0.7, ease:'elastic.out(1,.4)' }));
}

/* ═══════════════════════════════════════════════════
   BOOT
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

window.addEventListener('DOMContentLoaded', () => {
  initHeroDots();
  initPreloader();
});

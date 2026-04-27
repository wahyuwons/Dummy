/**
 * Wahyuwono Portfolio — script.js
 * Three.js + GSAP 3.12 + ScrollTrigger + Lenis
 */

'use strict';

/* ── Prevent FOUC ─────────────────────────────── */
document.documentElement.style.visibility = 'hidden';
gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════
   GLOBAL STATE
══════════════════════════════════════════════════ */
let lenis = null;
const IS_MOBILE = window.innerWidth < 768;

/* ══════════════════════════════════════════════════
   THREE.JS — HERO (particle galaxy)
══════════════════════════════════════════════════ */
function initHeroThree() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !IS_MOBILE });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  camera.position.z = 4;

  /* Particles */
  const COUNT = IS_MOBILE ? 1500 : 3500;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(COUNT * 3);
  const col   = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);

  const goldColor  = new THREE.Color('#d4a96a');
  const whiteColor = new THREE.Color('#ffffff');
  const blueColor  = new THREE.Color('#3b5bdb');

  for (let i = 0; i < COUNT; i++) {
    const r = Math.random() * 6 + 0.5;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos((Math.random() * 2) - 1);
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
    sizes[i]   = Math.random() * 2.5 + 0.5;

    const t = Math.random();
    const c = t < 0.33 ? goldColor : t < 0.66 ? whiteColor : blueColor;
    col[i*3]   = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.025, vertexColors: true, transparent: true,
    opacity: 0.75, sizeAttenuation: true, depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* Floating geometric wireframes */
  const addWire = (geomFn, x, y, z, color) => {
    const mesh = new THREE.LineSegments(
      new THREE.WireframeGeometry(geomFn),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.12 })
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  };

  const ico = addWire(new THREE.IcosahedronGeometry(0.8, 0), -2, 0.5, -1, '#d4a96a');
  const oct = addWire(new THREE.OctahedronGeometry(0.6, 0), 2, -0.5, -1, '#3b5bdb');
  const tor = addWire(new THREE.TorusGeometry(0.5, 0.18, 8, 16), 0, 1.2, -2, '#ffffff');

  /* Mouse parallax */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* Resize */
  const onResize = () => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', onResize);

  /* Animate */
  let t = 0;
  const tick = () => {
    t += 0.004;
    requestAnimationFrame(tick);
    particles.rotation.y = t * 0.04;
    particles.rotation.x = t * 0.015;
    camera.position.x += (mx * 0.3 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.3 - camera.position.y) * 0.04;
    ico.rotation.y = t * 0.6; ico.rotation.x = t * 0.3;
    oct.rotation.y = -t * 0.4; oct.rotation.z = t * 0.2;
    tor.rotation.x = t * 0.5; tor.rotation.z = t * 0.25;
    renderer.render(scene, camera);
  };
  tick();
}

/* ══════════════════════════════════════════════════
   THREE.JS — ABOUT (floating dots behind portrait)
══════════════════════════════════════════════════ */
function initAboutThree() {
  const canvas = document.getElementById('aboutCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const W = canvas.parentElement.offsetWidth;
  const H = canvas.parentElement.offsetHeight || 600;
  renderer.setSize(W, H);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.z = 3;

  const geo = new THREE.BufferGeometry();
  const N   = 400;
  const p   = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    p[i*3]   = (Math.random() - 0.5) * 5;
    p[i*3+1] = (Math.random() - 0.5) * 8;
    p[i*3+2] = (Math.random() - 0.5) * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const mat = new THREE.PointsMaterial({ size: 0.04, color: '#d4a96a', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(geo, mat));

  let t = 0;
  const tick = () => { t += 0.005; requestAnimationFrame(tick); scene.rotation.y = Math.sin(t) * 0.15; renderer.render(scene, camera); };
  tick();
}

/* ══════════════════════════════════════════════════
   THREE.JS — CTA SECTION (flowing ribbons)
══════════════════════════════════════════════════ */
function initCtaThree() {
  const canvas = document.getElementById('ctaCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const W = canvas.parentElement.offsetWidth;
  const H = canvas.parentElement.offsetHeight || 500;
  renderer.setSize(W, H);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W/H, 0.1, 100);
  camera.position.z = 4;

  const geo = new THREE.BufferGeometry();
  const M   = 600;
  const pos = new Float32Array(M * 3);
  for (let i = 0; i < M; i++) {
    pos[i*3]   = (Math.random()-0.5)*8;
    pos[i*3+1] = (Math.random()-0.5)*6;
    pos[i*3+2] = (Math.random()-0.5)*3;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.035, color:'#d4a96a', transparent:true, opacity:0.3, blending:THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  let t = 0;
  const tick = () => { t += 0.003; requestAnimationFrame(tick); pts.rotation.y = t*0.15; pts.rotation.x = t*0.08; renderer.render(scene, camera); };
  tick();
}

/* ══════════════════════════════════════════════════
   PRELOADER — Three.js animated canvas + GSAP
══════════════════════════════════════════════════ */
function initPreloader() {
  const preEl  = document.getElementById('preloader');
  const canvas = document.getElementById('preCanvas');
  const numEl  = document.getElementById('preNum');
  const barEl  = document.getElementById('preBar');
  const stateEl= document.getElementById('preState');
  const logoEl = preEl.querySelector('.pre-logo');

  const STATES = ['Initializing', 'Loading assets', 'Building layout', 'Running animations', 'Almost ready'];
  let si = 0;

  /* --- Three.js preloader scene (spinning rings + particles) --- */
  let preRenderer = null;
  if (typeof THREE !== 'undefined' && canvas) {
    preRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    preRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    preRenderer.setSize(window.innerWidth, window.innerHeight);

    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    cam.position.z = 5;

    /* Ring geometry */
    const ringMat = new THREE.MeshBasicMaterial({ color: '#d4a96a', wireframe: true, transparent: true, opacity: 0.15 });
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.01, 4, 80), ringMat);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.01, 4, 60), new THREE.MeshBasicMaterial({ color:'#ffffff', wireframe:true, transparent:true, opacity:0.06 }));
    const r3 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.01, 4, 50), new THREE.MeshBasicMaterial({ color:'#3b5bdb', wireframe:true, transparent:true, opacity:0.08 }));
    sc.add(r1, r2, r3);

    /* Diamond wireframe */
    const diamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.MeshBasicMaterial({ color:'#d4a96a', wireframe:true, transparent:true, opacity:0.2 })
    );
    sc.add(diamond);

    /* Particles */
    const pGeo = new THREE.BufferGeometry();
    const pN   = 800;
    const pPos = new Float32Array(pN * 3);
    for (let i=0; i<pN; i++) {
      const r=Math.random()*4+1, th=Math.random()*Math.PI*2, ph=Math.acos(Math.random()*2-1);
      pPos[i*3]=r*Math.sin(ph)*Math.cos(th); pPos[i*3+1]=r*Math.sin(ph)*Math.sin(th); pPos[i*3+2]=r*Math.cos(ph);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
    sc.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size:0.04, color:'#d4a96a', transparent:true, opacity:0.6, blending:THREE.AdditiveBlending })));

    let pt = 0;
    const preAnimate = () => {
      if (!preRenderer) return;
      pt += 0.008;
      requestAnimationFrame(preAnimate);
      r1.rotation.x = pt * 0.4; r1.rotation.y = pt * 0.3;
      r2.rotation.x = -pt * 0.5; r2.rotation.z = pt * 0.2;
      r3.rotation.y = pt * 0.6;
      diamond.rotation.y = pt * 0.5; diamond.rotation.x = pt * 0.25;
      preRenderer.render(sc, cam);
    };
    preAnimate();
  }

  /* --- GSAP logo + progress animation --- */
  gsap.set(logoEl, { opacity: 0, scale: 0.5, y: 20 });
  gsap.to(logoEl, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(2)', delay: 0.3 });

  const prog  = { p: 0 };
  const total = 4.5; // total preloader seconds

  function cycleState(pct) {
    const next = Math.min(Math.floor(pct * STATES.length), STATES.length - 1);
    if (next !== si) {
      si = next;
      gsap.to(stateEl, { opacity:0, y:-8, duration:0.18,
        onComplete() {
          stateEl.textContent = STATES[si];
          gsap.to(stateEl, { opacity:1, y:0, duration:0.22 });
        }
      });
    }
  }

  const tl = gsap.timeline({ delay: 0.5, onComplete: exitPre });

  tl.to(prog, {
    p: 1,
    duration: total,
    ease: 'power1.inOut',
    onUpdate() {
      if (numEl) numEl.textContent = Math.round(prog.p * 100);
      if (barEl)  barEl.style.width = (prog.p * 100) + '%';
      cycleState(prog.p);
    }
  });

  function exitPre() {
    if (preRenderer) { preRenderer.dispose(); preRenderer = null; }
    gsap.timeline({ onStart() { document.documentElement.style.visibility = ''; } })
      .to(logoEl,     { scale: 80, opacity: 0, duration: 0.6, ease: 'power3.in' }, 0)
      .to('.pre-flap-t', { scaleY: 0, duration: 0.8, ease: 'expo.inOut' }, 0.2)
      .to('.pre-flap-b', { scaleY: 0, duration: 0.8, ease: 'expo.inOut' }, 0.3)
      .to(preEl, { opacity: 0, duration: 0.3, pointerEvents: 'none',
        onComplete() { preEl.style.display = 'none'; bootAnimations(); }
      }, 0.9);
  }
}

/* ══════════════════════════════════════════════════
   LENIS SMOOTH SCROLL
══════════════════════════════════════════════════ */
function initLenis() {
  lenis = new Lenis({ duration: 1.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)), smoothTouch: false });
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
}

/* ══════════════════════════════════════════════════
   CURSOR
══════════════════════════════════════════════════ */
function initCursor() {
  const wrap = document.getElementById('cursor');
  if (!wrap) return;
  const dot  = wrap.querySelector('.c-dot');
  const ring = wrap.querySelector('.c-ring');
  const txt  = wrap.querySelector('.c-txt');
  let mx=0, my=0, rx=0, ry=0;

  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    gsap.set(dot, { x:mx, y:my });
    gsap.set(txt, { x:mx, y:my });
  });
  gsap.ticker.add(() => {
    rx += (mx-rx)*0.11; ry += (my-ry)*0.11;
    gsap.set(ring, { x:rx, y:ry });
  });

  const hoverSel = 'a,button,.wcard,.exp-card,.sp,.fc,.dc,.ci';
  document.addEventListener('mouseover', e => { if (e.target.closest(hoverSel)) document.body.classList.add('c-hover'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(hoverSel)) document.body.classList.remove('c-hover'); });

  document.querySelectorAll('.wcard').forEach(el => {
    el.addEventListener('mouseenter', () => { txt.textContent='Visit ↗'; document.body.classList.add('c-label'); });
    el.addEventListener('mouseleave', () => document.body.classList.remove('c-label'));
  });
  document.querySelectorAll('#drailOuter,.dc').forEach(el => {
    el.addEventListener('mouseenter', () => { txt.textContent='Drag'; document.body.classList.add('c-label'); });
    el.addEventListener('mouseleave', () => document.body.classList.remove('c-label'));
  });

  document.querySelectorAll('#hero,.marquee-wrap,#design,#experience,#contact,#footer').forEach(sec => {
    ScrollTrigger.create({ trigger:sec, start:'top center', end:'bottom center',
      onEnter:()=>document.body.classList.add('c-dark'), onLeave:()=>document.body.classList.remove('c-dark'),
      onEnterBack:()=>document.body.classList.add('c-dark'), onLeaveBack:()=>document.body.classList.remove('c-dark'),
    });
  });

  document.addEventListener('mouseleave', ()=>gsap.to([dot,ring],{opacity:0,duration:.3}));
  document.addEventListener('mouseenter', ()=>gsap.to([dot,ring],{opacity:1,duration:.3}));
}

/* ══════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════ */
function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burgerBtn');
  const mob    = document.getElementById('mobMenu');
  const prog   = document.getElementById('navProg');

  ScrollTrigger.create({
    start:'top -80',
    onEnter:()=>nav.classList.add('scrolled'),
    onLeaveBack:()=>nav.classList.remove('scrolled'),
  });
  ScrollTrigger.create({
    start:'top top', end:'bottom bottom',
    onUpdate(self){ if(prog) prog.style.width=(self.progress*100)+'%'; }
  });

  if (burger && mob) {
    burger.addEventListener('click', () => {
      const open = mob.classList.toggle('open');
      burger.classList.toggle('open');
      document.body.classList.toggle('no-scroll', open);
      if (open) gsap.from('.mob-link',{y:50,opacity:0,stagger:.07,duration:.55,ease:'expo.out',delay:.3});
    });
    document.querySelectorAll('.mob-link').forEach(l => {
      l.addEventListener('click', ()=>{ mob.classList.remove('open'); burger.classList.remove('open'); document.body.classList.remove('no-scroll'); });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t && lenis) { e.preventDefault(); lenis.scrollTo(t, {duration:1.8}); }
    });
  });
}

/* ══════════════════════════════════════════════════
   HERO GSAP
══════════════════════════════════════════════════ */
function initHeroGsap() {
  /* Set hidden state for elements animated in */
  gsap.set('.hero-badge', { opacity:0, y:20 });
  gsap.set('.hero-sub',   { opacity:0, y:30 });
  gsap.set('.hero-btns',  { opacity:0, y:30 });
  gsap.set('#heroTicker', { opacity:0 });
  gsap.set('#heroCards',  { opacity:0, y:20 });
  gsap.set('#heroScroll', { opacity:0 });
  gsap.set('.hline-inner', { y:'110%' }); // title lines hidden

  const tl = gsap.timeline({ delay:0.2, defaults:{ ease:'expo.out' } });

  tl.to('.hero-badge', { opacity:1, y:0, duration:.9 }, 0)
    .to('.hline-inner', { y:'0%', duration:1.15, stagger:.1 }, .15)
    .to('.hero-sub',    { opacity:1, y:0, duration:.9 }, .65)
    .to('.hero-btns',   { opacity:1, y:0, duration:.9 }, .78)
    .to('#heroTicker',  { opacity:1, duration:.8 }, .88)
    .to('#heroCards',   { opacity:1, y:0, duration:.8 }, .92)
    .to('#heroScroll',  { opacity:1, duration:.8 }, 1.0);

  /* Ticker */
  const items = document.querySelectorAll('.ht-item');
  let ci = 0;
  if (items.length > 1) {
    setInterval(() => {
      items[ci].classList.remove('ht-active');
      ci = (ci+1) % items.length;
      items[ci].classList.add('ht-active');
    }, 3500);
  }

  /* Card swap */
  const cards = document.querySelectorAll('.hcard');
  const fill  = document.getElementById('hcpFill');
  let hci = 0;
  if (cards.length > 1) {
    setInterval(() => {
      cards[hci].classList.remove('hcard-on'); cards[hci].style.position='absolute';
      hci = (hci+1) % cards.length;
      cards[hci].style.position='relative'; cards[hci].classList.add('hcard-on');
      if (fill) fill.style.width = ((hci+1)/cards.length*100)+'%';
    }, 3500);
  }
}

/* ══════════════════════════════════════════════════
   MARQUEE
══════════════════════════════════════════════════ */
function initMarquee() {
  const track = document.getElementById('mTrack');
  if (!track) return;
  const row = track.querySelector('.mrow');
  if (!row) return;
  requestAnimationFrame(() => {
    const w = row.offsetWidth;
    if (w > 0) gsap.to(track, { x:-w, duration:28, ease:'none', repeat:-1 });
  });
}

/* ══════════════════════════════════════════════════
   HELPER — reveal .sl lines on scroll
   Each .sl already contains text directly (no inner wrap needed)
   We animate from y:100% using a clip via overflow:hidden on parent
══════════════════════════════════════════════════ */
function revealSlLines(sectionEl) {
  if (!sectionEl) return;
  sectionEl.querySelectorAll('.sl').forEach((line, i) => {
    /* Wrap content in inner span if not already done */
    if (!line.dataset.wrapped) {
      line.dataset.wrapped = '1';
      const inner = document.createElement('span');
      inner.style.cssText = 'display:block;will-change:transform;';
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
    }
    const inner = line.querySelector('span');
    if (!inner) return;
    gsap.from(inner, {
      y: '106%', duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: sectionEl, start:'top 82%', once:true },
      delay: i * 0.12
    });
  });
}

function revealUp(els, trigger, stagger, delay) {
  gsap.from(els, {
    opacity:0, y:36, duration:.9, ease:'expo.out',
    stagger: stagger||0, delay: delay||0,
    scrollTrigger: { trigger: trigger||els, start:'top 86%', once:true }
  });
}

function tilt3d(el, str) {
  const s = str||8;
  el.addEventListener('mousemove', e => {
    const r=el.getBoundingClientRect();
    gsap.to(el, { rotationY:((e.clientX-r.left)/r.width-.5)*s*2, rotationX:-(((e.clientY-r.top)/r.height-.5)*s*1.4), transformPerspective:1000, duration:.35, ease:'power2.out' });
  });
  el.addEventListener('mouseleave', ()=>gsap.to(el,{rotationY:0,rotationX:0,duration:.65,ease:'expo.out'}));
}

/* ══════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════ */
function initStats() {
  const sec = document.getElementById('stats');
  if (!sec) return;
  revealSlLines(sec.querySelector('.stats-left'));
  revealUp(sec.querySelector('.eyebrow'), sec, 0, 0);
  revealUp(sec.querySelector('.sec-p'), sec, 0, 0.2);

  gsap.from('.fc', {
    opacity:0, y:60, scale:.93,
    stagger:.12, duration:.95, ease:'expo.out',
    scrollTrigger:{ trigger:'.fc-grid', start:'top 80%', once:true }
  });

  document.querySelectorAll('.cnt').forEach(el => {
    const n = parseInt(el.dataset.n, 10);
    const obj = { v:0 };
    ScrollTrigger.create({ trigger:el, start:'top 86%', once:true,
      onEnter() { gsap.to(obj, { v:n, duration:2.4, ease:'power3.out', onUpdate() { el.textContent=Math.round(obj.v); } }); }
    });
  });
}

/* ══════════════════════════════════════════════════
   ABOUT
══════════════════════════════════════════════════ */
function initAbout() {
  const sec = document.getElementById('about');
  if (!sec) return;
  revealSlLines(sec.querySelector('.about-text'));
  revealUp(sec.querySelector('.eyebrow'), sec);
  revealUp(sec.querySelectorAll('.sec-p'), sec, 0.1, 0.15);
  revealUp(sec.querySelector('.about-actions'), sec, 0, 0.25);

  gsap.from('.portrait-card', { opacity:0, x:60, duration:1.2, ease:'expo.out',
    scrollTrigger:{ trigger:sec, start:'top 78%', once:true } });

  const pimg = sec.querySelector('.portrait-img');
  if (pimg) gsap.to(pimg, { yPercent:-8, ease:'none',
    scrollTrigger:{ trigger:sec, start:'top bottom', end:'bottom top', scrub:1.2 } });

  gsap.from('.float-chip', { opacity:0, scale:.6, stagger:.18, duration:.9, ease:'back.out(2)',
    scrollTrigger:{ trigger:'.portrait-card', start:'top 75%', once:true } });
}

/* ══════════════════════════════════════════════════
   WORKS
══════════════════════════════════════════════════ */
function initWorks() {
  const sec = document.getElementById('works');
  if (!sec) return;

  revealSlLines(sec.querySelector('.works-head-l'));
  revealUp(sec.querySelector('.works-ey'), sec);
  revealUp(sec.querySelector('.works-head-r'), sec, 0, 0.18);

  gsap.from('.wcard', {
    opacity:0, y:70, scale:.95, rotationX:8,
    stagger:{ amount:.6, from:'start' },
    duration:.95, ease:'expo.out', transformPerspective:1000,
    scrollTrigger:{ trigger:'.works-bento', start:'top 80%', once:true }
  });

  /* Filter */
  document.querySelectorAll('.wfb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wfb').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.f;
      document.querySelectorAll('.wcard').forEach(card => {
        const show = f==='all' || card.dataset.cat===f;
        card.classList.toggle('hidden-card', !show);
        gsap.to(card, show ? { opacity:1, scale:1, y:0, duration:.4, ease:'expo.out' }
                           : { opacity:0, scale:.93, y:20, duration:.3, ease:'power2.in' });
      });
    });
  });

  document.querySelectorAll('.wcard').forEach(el => tilt3d(el, 9));
}

/* ══════════════════════════════════════════════════
   DESIGN DRAG RAIL
══════════════════════════════════════════════════ */
function initDesignRail() {
  const outer = document.getElementById('drailOuter');
  const rail  = document.getElementById('drail');
  const hint  = document.getElementById('drailHint');
  if (!outer || !rail) return;

  revealSlLines(document.querySelector('#design .design-head-row'));
  revealUp(document.querySelector('#design .eyebrow'), '#design');
  revealUp(document.querySelector('.design-desc'), '#design .design-head-row', 0, .2);

  gsap.from('.dc', { opacity:0, x:80, stagger:.09, duration:.95, ease:'expo.out',
    scrollTrigger:{ trigger:outer, start:'top 80%', once:true } });

  let isDown=false, startX=0, posX=0, lastX=0, vel=0, raf=null;
  function clampX(v){ return Math.max(Math.min(v,0), -(rail.scrollWidth-outer.clientWidth+48)); }
  function applyX(x){ posX=clampX(x); gsap.set(rail,{x:posX}); }
  function momentum(){ if(Math.abs(vel)<.35) return; vel*=.91; applyX(posX+vel); raf=requestAnimationFrame(momentum); }

  outer.addEventListener('mousedown', e=>{ isDown=true; startX=e.clientX-posX; lastX=e.clientX; vel=0; if(raf) cancelAnimationFrame(raf); if(hint) hint.classList.add('hidden'); });
  document.addEventListener('mousemove', e=>{ if(!isDown) return; vel=e.clientX-lastX; lastX=e.clientX; applyX(e.clientX-startX); });
  document.addEventListener('mouseup', ()=>{ if(!isDown) return; isDown=false; raf=requestAnimationFrame(momentum); });
  outer.addEventListener('touchstart', e=>{ startX=e.touches[0].clientX-posX; vel=0; if(raf) cancelAnimationFrame(raf); if(hint) hint.classList.add('hidden'); },{passive:true});
  outer.addEventListener('touchmove', e=>{ vel=e.touches[0].clientX-startX-posX; applyX(e.touches[0].clientX-startX); },{passive:true});
  outer.addEventListener('touchend', ()=>{ raf=requestAnimationFrame(momentum); });
  rail.addEventListener('click', e=>{ if(Math.abs(vel)>3) e.preventDefault(); }, true);

  document.querySelectorAll('.dc').forEach(el=>tilt3d(el,10));
}

/* ══════════════════════════════════════════════════
   EXPERIENCE
══════════════════════════════════════════════════ */
function initExperience() {
  const sec = document.getElementById('experience');
  if (!sec) return;

  revealSlLines(sec);
  revealUp(sec.querySelector('.eyebrow'), sec);

  gsap.from('.exp-card', {
    opacity:0, y:90, scale:.92,
    stagger:.15, duration:1.05, ease:'expo.out',
    scrollTrigger:{ trigger:'.exp-grid', start:'top 80%', once:true }
  });

  document.querySelectorAll('.exp-card').forEach((card, i) => {
    tilt3d(card, 10);
    const bg = card.dataset.bg || '#111';
    ScrollTrigger.create({
      trigger:card, start:'top 60%', end:'bottom 40%',
      onEnter:()=>gsap.to(sec,{backgroundColor:bg,duration:.5}),
      onLeaveBack:()=>{ const p=document.querySelectorAll('.exp-card')[Math.max(0,i-1)]; if(p) gsap.to(sec,{backgroundColor:p.dataset.bg,duration:.5}); }
    });
  });
}

/* ══════════════════════════════════════════════════
   SKILLS
══════════════════════════════════════════════════ */
function initSkills() {
  const sec = document.getElementById('skills');
  if (!sec) return;
  revealSlLines(sec);
  revealUp(sec.querySelector('.eyebrow'), sec);

  gsap.from('.sp', {
    opacity:0, y:60, scale:.94,
    stagger:{ amount:.4 }, duration:.92, ease:'expo.out',
    scrollTrigger:{ trigger:'.skills-grid', start:'top 80%', once:true }
  });

  document.querySelectorAll('.sb-fill').forEach(fill => {
    ScrollTrigger.create({ trigger:fill, start:'top 88%', once:true,
      onEnter(){ gsap.to(fill,{width:fill.dataset.w+'%',duration:1.4,ease:'expo.out',delay:.1}); }
    });
  });

  document.querySelectorAll('.sp').forEach(el=>tilt3d(el,6));
}

/* ══════════════════════════════════════════════════
   CONTACT
══════════════════════════════════════════════════ */
function initContact() {
  const sec = document.getElementById('contact');
  if (!sec) return;

  revealSlLines(sec.querySelector('.cta-center'));
  revealUp(sec.querySelector('.cta-sub'), '.cta-card', 0, .3);

  gsap.from('.cta-btn', { opacity:0, y:22, scale:.88, duration:.8, ease:'back.out(1.5)',
    scrollTrigger:{ trigger:'.cta-card', start:'top 75%', once:true }, delay:.55 });

  gsap.from('.ci', { opacity:0, y:28, stagger:.1, duration:.85, ease:'expo.out',
    scrollTrigger:{ trigger:'.contact-row', start:'top 88%', once:true } });

  document.querySelectorAll('.cft').forEach((el,i) => {
    gsap.to(el, { y:gsap.utils.random(-14,14), x:gsap.utils.random(-8,8), rotate:gsap.utils.random(-6,6),
      duration:gsap.utils.random(3,5), ease:'sine.inOut', repeat:-1, yoyo:true, delay:i*.3 });
  });

  const btn = document.querySelector('.cta-btn');
  if (btn) {
    btn.addEventListener('mousemove', e=>{
      const r=btn.getBoundingClientRect();
      gsap.to(btn,{x:(e.clientX-r.left-r.width/2)*.35,y:(e.clientY-r.top-r.height/2)*.35,duration:.4,ease:'power2.out'});
    });
    btn.addEventListener('mouseleave',()=>gsap.to(btn,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'}));
  }
}

/* ══════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════ */
function initFooter() {
  gsap.from('.ft-brand,.ft-col', { opacity:0, y:28, stagger:.08, duration:.9, ease:'expo.out',
    scrollTrigger:{ trigger:'#footer', start:'top 90%', once:true } });
}

/* ══════════════════════════════════════════════════
   NAV LOGO MAGNETIC
══════════════════════════════════════════════════ */
function initNavLogo() {
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;
  logo.addEventListener('mousemove', e=>{
    const r=logo.getBoundingClientRect();
    gsap.to(logo,{x:(e.clientX-r.left-r.width/2)*.4,y:(e.clientY-r.top-r.height/2)*.4,duration:.35,ease:'power2.out'});
  });
  logo.addEventListener('mouseleave',()=>gsap.to(logo,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'}));
}

/* ══════════════════════════════════════════════════
   BOOT — called after preloader exits
══════════════════════════════════════════════════ */
function bootAnimations() {
  initLenis();
  initCursor();
  initNav();
  initHeroGsap();
  initHeroThree();
  initMarquee();
  initStats();
  initAbout();
  initAboutThree();
  initWorks();
  initDesignRail();
  initExperience();
  initSkills();
  initContact();
  initCtaThree();
  initFooter();
  initNavLogo();
  window.addEventListener('load', () => ScrollTrigger.refresh(true));
}

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  initPreloader();
});

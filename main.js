/**
 * ════════════════════════════════════════════════════════
 *  GRAND THEFT AUTO VI — Rockstar Clone · main.js
 *  GSAP 3 + ScrollTrigger + CustomEase
 *  Full cinematic experience
 * ════════════════════════════════════════════════════════
 */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase);

/* ─── custom eases ─── */
CustomEase.create('cineIn',  '.25,.1,.25,1');
CustomEase.create('cineOut', '.0,.0,.2,1');
CustomEase.create('spring',  '.43,1.58,.55,1');

const qs  = (s,c=document) => c.querySelector(s);
const qsa = (s,c=document) => [...c.querySelectorAll(s)];
const rnd = (a,b) => Math.random()*(b-a)+a;
const lerp = (a,b,t) => a+(b-a)*t;

/* ══════════════════════════════════════════════════════
   CHARACTER PALETTE — cinematic color themes
══════════════════════════════════════════════════════ */
const CHAR_THEMES = {
  intro:   { sky: ['#0a0c18','#141830','#0d1a2e'], accent: '#e9c46a', fog: 'rgba(233,196,106,.04)' },
  jason:   { sky: ['#070d18','#0c1a25','#162030'], accent: '#4a8ab0', fog: 'rgba(74,138,176,.06)' },
  lucia:   { sky: ['#12080a','#1e0d10','#28121a'], accent: '#c8586a', fog: 'rgba(200,88,106,.06)' },
  cal:     { sky: ['#080c06','#111808','#1a2510'], accent: '#6ab05a', fog: 'rgba(106,176,90,.05)' },
  boobie:  { sky: ['#100808','#1c0c08','#241510'], accent: '#e07840', fog: 'rgba(224,120,64,.06)' },
  drequan: { sky: ['#060810','#0c101e','#12182e'], accent: '#8868d0', fog: 'rgba(136,104,208,.06)' },
  raul:    { sky: ['#080610','#10091a','#181025'], accent: '#6870b8', fog: 'rgba(104,112,184,.05)' },
  brian:   { sky: ['#060c10','#0a1418','#101c24'], accent: '#50a0b0', fog: 'rgba(80,160,176,.05)' },
};

/* ══════════════════════════════════════════════════════
   1. LOADER — animated starfield + count-up
══════════════════════════════════════════════════════ */
function initLoader() {
  document.body.style.overflow = 'hidden';

  /* Starfield canvas */
  const lc = qs('#loader-canvas');
  if (lc) {
    const ctx = lc.getContext('2d');
    lc.width  = window.innerWidth;
    lc.height = window.innerHeight;
    const stars = Array.from({length: 200}, () => ({
      x: Math.random()*lc.width, y: Math.random()*lc.height,
      r: Math.random()*1.2+.3, a: Math.random()*.6+.1, v: Math.random()*.3+.05
    }));
    let lraf;
    function drawStars() {
      ctx.clearRect(0,0,lc.width,lc.height);
      stars.forEach(s => {
        s.a += s.v * .02; if(s.a>1){s.a=0.1;}
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(233,196,106,${s.a})`; ctx.fill();
      });
      lraf = requestAnimationFrame(drawStars);
    }
    drawStars();
    window.cancelLoaderAnim = () => cancelAnimationFrame(lraf);
  }

  /* Count-up */
  const bar    = qs('#ld-bar');
  const barGlw = qs('#ld-bar-glow');
  const numEl  = qs('#ld-num');
  const loader = qs('#loader');
  const obj    = { v: 0 };

  gsap.timeline({
    onComplete() {
      if (window.cancelLoaderAnim) window.cancelLoaderAnim();
      document.body.style.overflow = '';
      initHeroEntrance();
    }
  })
  .to(obj, {
    v: 100, duration: 1.8, ease: 'power2.inOut',
    onUpdate() {
      const v = Math.round(obj.v);
      numEl.textContent = v;
      bar.style.width     = v + '%';
      barGlw.style.width  = v + '%';
    }
  })
  .to('.ld-center', { opacity: 0, y: -20, duration: .5, ease: 'cineIn' }, '-=.1')
  .to(loader, {
    clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 0%)',
    duration: .9, ease: 'cineOut',
  }, '-=.2')
  .set(loader, { display: 'none' });
}

/* ══════════════════════════════════════════════════════
   2. CANVAS SYSTEMS
══════════════════════════════════════════════════════ */

/* ── Hero canvas — atmospheric background ── */
function initHeroCanvas() {
  const canvas = qs('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, raf;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const orbs = [
    { x:.62, y:.45, r:.45, c:'rgba(244,129,63,.08)',  speed:.0003 },
    { x:.3,  y:.6,  r:.35, c:'rgba(42,157,143,.06)',   speed:.0005 },
    { x:.85, y:.2,  r:.25, c:'rgba(233,196,106,.05)',  speed:.0004 },
  ];
  let t = 0;

  function draw() {
    ctx.clearRect(0,0,W,H);
    t += .005;
    orbs.forEach((o,i) => {
      const ox = W*(o.x + Math.sin(t*(i+1)*o.speed*200)*.04);
      const oy = H*(o.y + Math.cos(t*(i+1)*o.speed*200)*.04);
      const r  = Math.min(W,H)*o.r;
      const g  = ctx.createRadialGradient(ox,oy,0,ox,oy,r);
      g.addColorStop(0, o.c); g.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(ox,oy,r,0,Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }
  draw();
}

/* ── Hero particles — floating embers ── */
function initHeroParticles() {
  const canvas = qs('#hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const pts = Array.from({length:60}, () => resetPt({}));
  function resetPt(p) {
    p.x   = Math.random()*W; p.y = Math.random()*H+H;
    p.vx  = (Math.random()-.5)*.3; p.vy = -(Math.random()*.5+.2);
    p.r   = Math.random()*1.5+.3;
    p.a   = Math.random()*.4+.05; p.life = 1;
    return p;
  }

  (function loop() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy; p.life-=.003;
      if (p.y<-20||p.life<=0) resetPt(p);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(233,196,106,${p.a*p.life})`; ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
}

/* ── Foreground character silhouette ── */
function initFGCanvas() {
  const canvas = qs('#fg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W,H;
  function resize() { W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; draw(); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    // Ground glow
    const g = ctx.createLinearGradient(0,H*.4,0,H);
    g.addColorStop(0,'transparent');
    g.addColorStop(.5,'rgba(233,196,106,.04)');
    g.addColorStop(1,'rgba(0,0,0,.8)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    // City silhouette
    ctx.fillStyle='rgba(0,0,0,.85)';
    const blds=[
      {x:.02,w:.04,h:.6},{x:.07,w:.02,h:.45},{x:.1,w:.05,h:.7},
      {x:.16,w:.03,h:.5},{x:.2,w:.06,h:.8},{x:.27,w:.02,h:.55},
      {x:.3,w:.04,h:.65},{x:.35,w:.02,h:.4},{x:.38,w:.05,h:.75},
      {x:.45,w:.03,h:.6},{x:.49,w:.06,h:.9},{x:.56,w:.02,h:.5},
      {x:.59,w:.04,h:.7},{x:.64,w:.03,h:.55},{x:.68,w:.05,h:.8},
      {x:.74,w:.02,h:.45},{x:.77,w:.04,h:.65},{x:.82,w:.02,h:.5},
      {x:.85,w:.05,h:.7},{x:.91,w:.03,h:.55},{x:.95,w:.04,h:.6},
    ];
    blds.forEach(b => {
      const bx=W*b.x, bw=W*b.w, bh=H*b.h;
      ctx.fillRect(bx,H-bh,bw,bh);
      // Windows
      for(let wy=H-bh+8;wy<H-8;wy+=14){
        for(let wx=bx+4;wx<bx+bw-4;wx+=8){
          if(Math.random()>.55){
            ctx.fillStyle=`rgba(233,196,106,${Math.random()*.3+.05})`;
            ctx.fillRect(wx,wy,5,8);
            ctx.fillStyle='rgba(0,0,0,.85)';
          }
        }
      }
    });
    // Neon reflection on ground
    const nr = ctx.createLinearGradient(0,H*.8,0,H);
    nr.addColorStop(0,'transparent');
    nr.addColorStop(1,'rgba(233,196,106,.08)');
    ctx.fillStyle=nr; ctx.fillRect(0,0,W,H);
  }
  window.addEventListener('resize', resize);
  resize();
}

/* ── Character panel canvases ── */
const CHAR_COLORS = {
  intro:   { g1:'#0a0c18', g2:'#1a2040', g3:'#0d1530', accent:'rgba(233,196,106,.12)' },
  jason:   { g1:'#070d18', g2:'#0c1e30', g3:'#0a1520', accent:'rgba(74,138,200,.10)' },
  lucia:   { g1:'#120810', g2:'#221018', g3:'#1a0c14', accent:'rgba(220,80,100,.10)' },
  cal:     { g1:'#080c06', g2:'#121e0a', g3:'#0c1808', accent:'rgba(100,180,80,.08)' },
  boobie:  { g1:'#100808', g2:'#201008', g3:'#180c06', accent:'rgba(240,120,60,.10)' },
  drequan: { g1:'#080a14', g2:'#10142a', g3:'#0c1020', accent:'rgba(140,100,220,.09)' },
  raul:    { g1:'#08060e', g2:'#100c1e', g3:'#0c0a18', accent:'rgba(100,110,200,.09)' },
  brian:   { g1:'#060c10', g2:'#0c1820', g3:'#0a1418', accent:'rgba(60,160,180,.08)' },
};

function paintCharCanvas(canvas, charKey) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth  || window.innerWidth;
  const H = canvas.height = canvas.offsetHeight || window.innerHeight;
  const c = CHAR_COLORS[charKey] || CHAR_COLORS.intro;

  // Gradient sky
  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0, c.g1);
  sky.addColorStop(.5, c.g2);
  sky.addColorStop(1, c.g3);
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);

  // Accent haze
  const haze = ctx.createRadialGradient(W*.7,H*.4,0,W*.7,H*.4,W*.6);
  haze.addColorStop(0, c.accent);
  haze.addColorStop(1,'transparent');
  ctx.fillStyle = haze; ctx.fillRect(0,0,W,H);

  // Atmospheric lines
  ctx.strokeStyle = 'rgba(255,255,255,.02)';
  ctx.lineWidth = 1;
  for(let i=0;i<8;i++){
    const y = H*(.1+i*.12);
    ctx.beginPath();
    ctx.moveTo(0,y); ctx.lineTo(W,y);
    ctx.stroke();
  }

  // Ground gradient
  const grd = ctx.createLinearGradient(0,H*.6,0,H);
  grd.addColorStop(0,'transparent');
  grd.addColorStop(1,'rgba(0,0,0,.6)');
  ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);

  // Stars / particles in bg
  for(let i=0;i<30;i++){
    const sx=Math.random()*W, sy=Math.random()*H*.6;
    const sr=Math.random()*.8+.2;
    ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,255,255,${Math.random()*.15})`; ctx.fill();
  }
}

function paintPortraitCanvas(canvas, charKey) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || 500;
  const H = canvas.height = canvas.offsetHeight || 700;
  const c = CHAR_COLORS[charKey] || CHAR_COLORS.intro;

  // Silhouette figure placeholder
  ctx.clearRect(0,0,W,H);

  // Ambient glow behind figure
  const glow = ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,W*.7);
  glow.addColorStop(0, c.accent.replace('.10','.15').replace('.09','.15').replace('.08','.15'));
  glow.addColorStop(1,'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);

  // Abstract figure silhouette
  ctx.fillStyle = c.g1;
  ctx.beginPath();
  // Head
  ctx.arc(W*.5, H*.22, W*.12, 0, Math.PI*2);
  ctx.fill();
  // Body
  ctx.beginPath();
  ctx.moveTo(W*.3, H*.35);
  ctx.quadraticCurveTo(W*.35,H*.25, W*.5,H*.34);
  ctx.quadraticCurveTo(W*.65,H*.25, W*.7,H*.35);
  ctx.lineTo(W*.72, H*.7);
  ctx.quadraticCurveTo(W*.5,H*.75, W*.28,H*.7);
  ctx.closePath();
  ctx.fill();
  // Ground shadow
  const shadow = ctx.createLinearGradient(0,H*.65,0,H);
  shadow.addColorStop(0,'transparent');
  shadow.addColorStop(1,'rgba(0,0,0,.7)');
  ctx.fillStyle = shadow; ctx.fillRect(0,0,W,H);

  // Edge glow
  const edge = ctx.createLinearGradient(W*.4,0,W*.9,0);
  const accent = c.accent.replace('.10','.18').replace('.09','.18').replace('.08','.18').replace('.12','.18');
  edge.addColorStop(0,'transparent'); edge.addColorStop(1, accent);
  ctx.fillStyle = edge; ctx.fillRect(0,0,W,H);
}

function paintLocationCanvas(canvas, locKey) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || 400;
  const H = canvas.height = canvas.offsetHeight || 280;
  const palettes = {
    'vice-city':    { sky:['#1a0d30','#2a1850','#3a2468'], ground:'rgba(30,20,60,.8)', accent:'rgba(233,196,106,.2)' },
    'leonida-keys': { sky:['#0a1820','#0d2030','#102840'], ground:'rgba(10,20,30,.7)', accent:'rgba(42,157,143,.2)' },
    'grassrivers':  { sky:['#081408','#0c1e0c','#102810'], ground:'rgba(8,20,8,.7)',   accent:'rgba(80,160,60,.15)' },
    'port-gellhorn':{ sky:['#100810','#180c18','#201020'], ground:'rgba(16,8,16,.7)',  accent:'rgba(180,80,140,.15)' },
    'ambrosia':     { sky:['#180a06','#28100a','#381810'], ground:'rgba(24,12,8,.7)',  accent:'rgba(244,129,63,.2)' },
    'mount-kalaga': { sky:['#08101a','#0c1828','#102030'], ground:'rgba(8,14,24,.7)',  accent:'rgba(80,130,200,.15)' },
  };
  const p = palettes[locKey] || palettes['vice-city'];
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,p.sky[0]); g.addColorStop(.5,p.sky[1]); g.addColorStop(1,p.sky[2]);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const ag = ctx.createRadialGradient(W*.5,H*.3,0,W*.5,H*.3,W*.5);
  ag.addColorStop(0,p.accent); ag.addColorStop(1,'transparent');
  ctx.fillStyle=ag; ctx.fillRect(0,0,W,H);
  // Terrain silhouette
  ctx.beginPath();
  ctx.moveTo(0,H);
  for(let x=0;x<=W;x+=W/20){
    const h=H*(.4+Math.sin(x*.05+locKey.length*.3)*.2+Math.sin(x*.02)*.15);
    ctx.lineTo(x,h);
  }
  ctx.lineTo(W,H); ctx.closePath();
  ctx.fillStyle=p.ground; ctx.fill();
  const fog=ctx.createLinearGradient(0,H*.5,0,H);
  fog.addColorStop(0,'transparent'); fog.addColorStop(1,'rgba(0,0,0,.5)');
  ctx.fillStyle=fog; ctx.fillRect(0,0,W,H);
}

function paintOutroCanvas() {
  const canvas=qs('#outro-canvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width=canvas.offsetWidth||window.innerWidth;
  const H=canvas.height=canvas.offsetHeight||500;
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0a0810'); g.addColorStop(.4,'#12103a'); g.addColorStop(1,'#080610');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const nr=ctx.createRadialGradient(W*.5,H,0,W*.5,H,W*.8);
  nr.addColorStop(0,'rgba(233,100,40,.15)'); nr.addColorStop(.3,'rgba(233,196,106,.08)'); nr.addColorStop(1,'transparent');
  ctx.fillStyle=nr; ctx.fillRect(0,0,W,H);
  // City lights reflection
  for(let i=0;i<100;i++){
    const lx=Math.random()*W, ly=H*.6+Math.random()*H*.4;
    const lr=Math.random()*2;
    const colors=['rgba(233,196,106,','rgba(233,80,60,','rgba(60,140,233,','rgba(200,80,180,'];
    ctx.beginPath(); ctx.arc(lx,ly,lr,0,Math.PI*2);
    ctx.fillStyle=colors[Math.floor(Math.random()*colors.length)]+`${Math.random()*.4+.1})`; ctx.fill();
  }
}

function paintWishCanvas() {
  const canvas=qs('#wish-canvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width=canvas.offsetWidth||window.innerWidth;
  const H=canvas.height=canvas.offsetHeight||700;
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#070810'); g.addColorStop(1,'#0c0f20');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const cg=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,W*.4);
  cg.addColorStop(0,'rgba(233,196,106,.06)'); cg.addColorStop(1,'transparent');
  ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){
    const sx=Math.random()*W, sy=Math.random()*H, sr=Math.random()*1+.2;
    ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2);
    ctx.fillStyle=`rgba(233,196,106,${Math.random()*.08})`; ctx.fill();
  }
}

function paintVideoModal() {
  const canvas=qs('#vm-canvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width=canvas.offsetWidth||900;
  const H=canvas.height=canvas.offsetHeight||506;
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0a0c1a'); g.addColorStop(1,'#080a14');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const ag=ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,W*.5);
  ag.addColorStop(0,'rgba(233,196,106,.08)'); ag.addColorStop(1,'transparent');
  ctx.fillStyle=ag; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(233,196,106,.04)';
  ctx.font=`900 ${Math.min(W*.25,120)}px Barlow Condensed`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('GTA VI',W*.5,H*.45);
  const scan=ctx.createLinearGradient(0,H*.5,0,H);
  scan.addColorStop(0,'transparent'); scan.addColorStop(1,'rgba(0,0,0,.5)');
  ctx.fillStyle=scan; ctx.fillRect(0,0,W,H);
}

/* All canvas init */
function initAllCanvases() {
  initHeroCanvas();
  initHeroParticles();
  initFGCanvas();
  paintOutroCanvas();
  paintWishCanvas();
  paintVideoModal();
  // Story canvas
  (() => {
    const c=qs('#story-canvas'); if(!c) return;
    const ctx=c.getContext('2d');
    c.width=c.offsetWidth||900; c.height=c.offsetHeight||500;
    const g=ctx.createLinearGradient(0,0,0,c.height);
    g.addColorStop(0,'#080c18'); g.addColorStop(.5,'#101a30'); g.addColorStop(1,'#0a0e1c');
    ctx.fillStyle=g; ctx.fillRect(0,0,c.width,c.height);
    const sg=ctx.createRadialGradient(c.width*.6,c.height*.4,0,c.width*.6,c.height*.4,c.width*.5);
    sg.addColorStop(0,'rgba(42,157,143,.12)'); sg.addColorStop(1,'transparent');
    ctx.fillStyle=sg; ctx.fillRect(0,0,c.width,c.height);
  })();
  // Character bg canvases
  qsa('.char-bg-canvas').forEach(c => paintCharCanvas(c, c.dataset.char));
  // Portrait canvases
  qsa('.portrait-canvas').forEach(c => paintPortraitCanvas(c, c.dataset.portrait));
  // Location canvases
  qsa('.loc-canvas').forEach(c => paintLocationCanvas(c, c.dataset.loc));
}

/* ══════════════════════════════════════════════════════
   3. HERO ENTRANCE
══════════════════════════════════════════════════════ */
function initHeroEntrance() {
  gsap.set(['#hero-logo','#hero-release','#hero-platforms','#hero-ctas','#hero-scroll-hint'], {
    opacity: 0, y: 30
  });
  gsap.set('#hero-vi', { scaleY: 1.15, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'cineOut' } });
  tl
    .to('#hero-logo',        { opacity:1, y:0, duration:1.4 },      .1)
    .to('#hero-vi',          { opacity:1, scaleY:1, duration:1.2 }, .3)
    .to('#hero-release',     { opacity:1, y:0, duration:.9 },       .6)
    .to('#hero-platforms',   { opacity:1, y:0, duration:.8 },       .75)
    .to('#hero-ctas',        { opacity:1, y:0, duration:.8 },       .9)
    .to('#hero-scroll-hint', { opacity:1, y:0, duration:.7 },       1.1);

  // Hero VI text idle breathe
  gsap.to('#hero-vi', {
    textShadow: '0 0 80px rgba(233,196,106,.4)',
    duration: 2.5, ease:'sine.inOut', yoyo:true, repeat:-1, delay:2
  });
}

/* ══════════════════════════════════════════════════════
   4. CUSTOM CURSOR
══════════════════════════════════════════════════════ */
function initCursor() {
  const dot   = qs('#cur-inner');
  const ring  = qs('#cur-outer');
  const label = qs('#cur-label');
  if (!dot) return;
  let cx=-100,cy=-100,rx=-100,ry=-100;

  document.addEventListener('mousemove', e => {
    cx=e.clientX; cy=e.clientY;
    gsap.to('#cursor', { x:cx, y:cy, duration:.07, ease:'none' });
  });
  (function f() {
    rx=lerp(rx,cx,.12); ry=lerp(ry,cy,.12);
    gsap.set('#cur-outer',{x:rx,y:ry});
    requestAnimationFrame(f);
  })();

  // Hover states
  qsa('a,button,.loc-card,.char-panel').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  });
  qsa('.btn-trailer,[id*="trailer"]').forEach(el => {
    el.addEventListener('mouseenter', () => { document.body.classList.add('cur-play'); label.textContent='Play'; });
    el.addEventListener('mouseleave', () => { document.body.classList.remove('cur-play'); });
  });
}

/* ══════════════════════════════════════════════════════
   5. MAGNETIC BUTTONS
══════════════════════════════════════════════════════ */
function initMagnetic() {
  qsa('[data-mag]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r=el.getBoundingClientRect();
      gsap.to(el,{
        x:(e.clientX-r.left-r.width/2)*.3,
        y:(e.clientY-r.top-r.height/2)*.3,
        duration:.4, ease:'power3.out', overwrite:true
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el,{ x:0, y:0, duration:.6, ease:'spring', overwrite:true });
    });
  });
}

/* ══════════════════════════════════════════════════════
   6. NAV
══════════════════════════════════════════════════════ */
function initNav() {
  ScrollTrigger.create({
    start: 80,
    onEnter:     () => qs('#nav').classList.add('scrolled'),
    onLeaveBack: () => qs('#nav').classList.remove('scrolled'),
  });
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = qs(a.getAttribute('href'));
      if(!t) return; e.preventDefault();
      gsap.to(window, { scrollTo:{y:t,offsetY:60}, duration:1.2, ease:'cineOut' });
      closeMob();
    });
  });
}

function closeMob() {
  qs('#nav-ham')?.classList.remove('open');
  qs('#mob-nav')?.classList.remove('open');
  document.body.style.overflow='';
}
function initMobileNav() {
  const ham=qs('#nav-ham'), mob=qs('#mob-nav');
  if(!ham) return;
  ham.addEventListener('click', () => {
    const open=ham.classList.toggle('open');
    mob.classList.toggle('open',open);
    document.body.style.overflow=open?'hidden':'';
    if(open) {
      qsa('.mnl').forEach((l,i)=>{
        gsap.from(l,{y:40,opacity:0,duration:.6,delay:.3+i*.08,ease:'cineOut'});
      });
    }
  });
  qsa('.mnl').forEach(l=>l.addEventListener('click',closeMob));
}

/* ══════════════════════════════════════════════════════
   7. STORY SECTION — scrub reveals (bidirectional)
══════════════════════════════════════════════════════ */
function initStorySection() {
  // Tagline slide up with scrub
  gsap.to('.st-line span', {
    y: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.sec-story', start: 'top 80%', end: 'top 30%', scrub: .8
    }
  });
  gsap.to('.story-p', {
    opacity: 1, y: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.story-p', start: 'top 90%', end: 'top 50%', scrub: .6
    }
  });
  gsap.to('.story-art', {
    opacity: 1, y: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.story-art', start: 'top 92%', end: 'top 55%', scrub: .7
    }
  });

  // Parallax on story art on scroll
  gsap.to('#story-canvas-wrap', {
    y: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '.sec-story', start: 'top bottom', end: 'bottom top', scrub: 1
    }
  });
}

/* ══════════════════════════════════════════════════════
   8. CHARACTER HORIZONTAL SCROLL — core mechanic
══════════════════════════════════════════════════════ */
function initCharacterHScroll() {
  const panels = qsa('.char-panel');
  if (!panels.length) return;

  const track   = qs('#chars-track');
  const sticky  = qs('#chars-sticky');
  const dots    = qsa('.cp-dot');
  const N       = panels.length;

  // Total scroll distance = (panels - 1) * viewport widths
  const totalMove = () => (N-1) * window.innerWidth;
  // Set section height to accommodate total scroll
  const setHeight = () => {
    qs('#characters').style.height = (window.innerHeight + totalMove()) + 'px';
  };
  setHeight();
  window.addEventListener('resize', setHeight);

  // Main horizontal scroll tween — SCRUB bidirectional
  const hTween = gsap.to(track, {
    x: () => -totalMove(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#characters',
      start: 'top top',
      end: () => '+=' + totalMove(),
      scrub: 1,        // ← bidirectional
      pin: sticky,
      invalidateOnRefresh: true,
      onUpdate(self) {
        // Update progress dots
        const idx = Math.round(self.progress * (N-1));
        dots.forEach((d,i) => d.classList.toggle('active', i===idx));

        // Animate char info in/out based on which panel is active
        const rawIdx = self.progress * (N-1);
        panels.forEach((panel, i) => {
          const dist = Math.abs(rawIdx - i);
          const info = panel.querySelector('.char-info');
          const portrait = panel.querySelector('.char-portrait');
          const floatQ = panel.querySelector('[data-float-quote]');
          if (!info) return;
          // Fade + translate info
          gsap.to(info, {
            opacity: dist < .5 ? 1 : 0,
            x: dist < .5 ? 0 : (i < rawIdx ? -30 : 30),
            duration: .3, overwrite: true
          });
          if (portrait) gsap.to(portrait, {
            opacity: dist < .8 ? 1 : 0,
            scale: dist < .5 ? 1 : .95,
            duration: .4, overwrite: true
          });
          if (floatQ) gsap.to(floatQ, {
            opacity: dist < .4 ? .35 : 0,
            y: dist < .4 ? 0 : 20,
            duration: .35, overwrite: true
          });
        });
      }
    }
  });

  // Init — hide all char infos except first
  qsa('.char-info').forEach((el,i)=>gsap.set(el,{opacity:i===0?1:0}));
  qsa('.char-portrait').forEach((el,i)=>gsap.set(el,{opacity:i===0?1:0}));
  qsa('[data-float-quote]').forEach(el=>gsap.set(el,{opacity:0,y:20}));

  // Portrait parallax within each panel — subtle depth
  panels.forEach((panel, i) => {
    const portrait = panel.querySelector('.portrait-canvas');
    if (!portrait) return;
    gsap.to(portrait, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '#characters',
        start: 'top top',
        end: () => '+=' + totalMove(),
        scrub: 2,
      }
    });
  });
}

/* ══════════════════════════════════════════════════════
   9. LOCATIONS — stagger reveal + scrub parallax
══════════════════════════════════════════════════════ */
function initLocations() {
  gsap.from('.loc-header', {
    y: 50, opacity: 0, duration: .9, ease: 'cineOut',
    scrollTrigger: { trigger: '.loc-header', start: 'top 85%', once: true }
  });
  qsa('[data-loc-card]').forEach((card, i) => {
    gsap.fromTo(card,
      { y: 60, opacity: 0, scale: .97 },
      {
        y: 0, opacity: 1, scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card, start: 'top 90%', end: 'top 55%', scrub: .7
        }
      }
    );
    // Canvas parallax
    const canvas = card.querySelector('.loc-canvas');
    if (canvas) {
      gsap.to(canvas, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1.5
        }
      });
    }
  });
}

/* ══════════════════════════════════════════════════════
   10. OUTRO + WISHLIST — cinematic reveal
══════════════════════════════════════════════════════ */
function initOutroAndWish() {
  // Outro
  gsap.fromTo('.outro-quote',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.outro-quote', start: 'top 85%', end: 'top 45%', scrub: .7 }
    }
  );
  gsap.fromTo('.outro-sub',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.outro-sub', start: 'top 88%', end: 'top 50%', scrub: .6 }
    }
  );

  // Wishlist
  ['.wish-logo','.wish-date','.wish-btns','.wish-email-row'].forEach((sel,i) => {
    gsap.fromTo(sel,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: sel, start: 'top 88%', end: 'top 50%', scrub: .7 }
      }
    );
  });
}

/* ══════════════════════════════════════════════════════
   11. HERO PARALLAX — hero elements move on scroll
══════════════════════════════════════════════════════ */
function initHeroParallax() {
  // Logo drifts up
  gsap.to('#hero-logo', {
    y: -80,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
  // VI text scale zoom
  gsap.to('#hero-vi', {
    scale: 1.08, opacity: .6,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
  });
  // Release / platforms fade
  gsap.to(['#hero-release','#hero-platforms','#hero-ctas'], {
    opacity: 0, y: -20,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: '10% top', end: '40% top', scrub: .8 }
  });
  // FG city scroll
  gsap.to('#hero-fg', {
    y: 60,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: .8 }
  });
}

/* ══════════════════════════════════════════════════════
   12. SCROLL PROGRESS BAR
══════════════════════════════════════════════════════ */
function initProgress() {
  // Dynamically created bar
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText='position:fixed;top:0;left:0;height:2px;width:0%;background:linear-gradient(90deg,rgba(233,196,106,.5),#e9c46a);z-index:9990;pointer-events:none;transition:width .1s linear;';
  document.body.appendChild(bar);
  ScrollTrigger.create({
    start:0, end:'max',
    onUpdate: st => { bar.style.width=(st.progress*100)+'%'; }
  });
}

/* ══════════════════════════════════════════════════════
   13. VIDEO MODAL
══════════════════════════════════════════════════════ */
function initVideoModal() {
  const modal   = qs('#video-modal');
  const overlay = qs('#vm-overlay');
  const inner   = qs('.vm-inner');
  const closeBtn= qs('#vm-close');
  const titleEl = qs('#vm-title');
  let isOpen    = false;

  const trailerTitles = {
    '1': 'Grand Theft Auto VI — Official Trailer 1',
    '2': 'Grand Theft Auto VI — Official Trailer 2',
    'cal':    'Cal Hampton Character Trailer',
    'boobie': 'Boobie Ike Character Trailer',
  };

  function openModal(key='1') {
    if (isOpen) return;
    isOpen = true;
    modal.classList.add('open');
    titleEl.textContent = trailerTitles[key] || 'Grand Theft Auto VI';
    gsap.timeline()
      .to(overlay, { opacity:1, duration:.5, ease:'power2.out' })
      .to(inner,   { opacity:1, scale:1, duration:.6, ease:'spring' }, .1);
  }

  function closeModal() {
    if (!isOpen) return;
    gsap.timeline({ onComplete() { modal.classList.remove('open'); isOpen=false; } })
      .to(inner,   { opacity:0, scale:.9, duration:.35, ease:'power3.in' })
      .to(overlay, { opacity:0, duration:.35 }, .1);
  }

  qsa('#btn-trailer-hero,#btn-trailer2-hero').forEach((btn,i) => {
    btn.addEventListener('click', () => openModal(String(i+1)));
  });
  qsa('[data-video]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.video));
  });
  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });
}

/* ══════════════════════════════════════════════════════
   14. CINEMATIC IDLE ANIMATIONS
══════════════════════════════════════════════════════ */
function initIdleAnimations() {
  // Floating VI glow
  gsap.to('.hero-vi-glow', {
    opacity: .6, scale: 1.2,
    duration: 3, ease:'sine.inOut', yoyo:true, repeat:-1
  });

  // Scroll wheel animation
  gsap.to('.scroll-wheel', {
    y: 12, opacity: 0,
    duration: 1.8, ease:'power2.in', repeat:-1
  });

  // Hero badge pulse
  gsap.to('.badge-dot::after', {});

  // Nav logo subtle hover glow
  gsap.to('#nav-logo', {
    filter: 'drop-shadow(0 0 8px rgba(233,196,106,.3))',
    duration: 2, ease:'sine.inOut', yoyo:true, repeat:-1, delay:1
  });

  // Character intro arrow
  gsap.to('.ci-arrow', {
    x: 8, duration: 1.2, ease:'sine.inOut', yoyo:true, repeat:-1
  });

  // Wishlist VI breathe
  gsap.to('.wish-vi', {
    filter: 'drop-shadow(0 0 60px rgba(233,196,106,.2))',
    duration: 3, ease:'sine.inOut', yoyo:true, repeat:-1
  });
}

/* ══════════════════════════════════════════════════════
   15. 3D CARD TILT
══════════════════════════════════════════════════════ */
function initCardTilt() {
  qsa('.loc-card,.wish-btn,.btn-trailer').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r=card.getBoundingClientRect();
      const rx=((e.clientY-r.top-r.height/2)/r.height)*-6;
      const ry=((e.clientX-r.left-r.width/2)/r.width)*6;
      gsap.to(card,{rotationX:rx,rotationY:ry,transformPerspective:800,duration:.3,ease:'power3.out',overwrite:true});
    });
    card.addEventListener('mouseleave',()=>{
      gsap.to(card,{rotationX:0,rotationY:0,duration:.7,ease:'spring',overwrite:true});
    });
  });
}

/* ══════════════════════════════════════════════════════
   16. FOOTER REVEAL
══════════════════════════════════════════════════════ */
function initFooter() {
  gsap.from('.ft-top,.ft-nav,.ft-rating,.ft-copy', {
    y: 20, opacity: 0, stagger: .1, duration: .8, ease:'cineOut',
    scrollTrigger: { trigger:'#footer', start:'top 92%', once:true }
  });
}

/* ══════════════════════════════════════════════════════
   17. CHAR PANEL ATMOSPHERE — subtle ambient color shift
══════════════════════════════════════════════════════ */
function initAmbientShift() {
  const panels = qsa('.char-panel');
  const bgEl   = document.body;
  const themes = {
    intro:   '#070810', jason:'#070d18', lucia:'#120810', cal:'#080c06',
    boobie:  '#100808', drequan:'#080a14', raul:'#08060e', brian:'#060c10',
  };

  ScrollTrigger.create({
    trigger: '#characters',
    start: 'top top',
    end: () => '+=' + ((panels.length-1) * window.innerWidth),
    scrub: 1,
    onUpdate(self) {
      const idx  = Math.floor(self.progress * (panels.length-.01));
      const key  = panels[idx]?.dataset?.char;
      const color = themes[key] || '#070810';
      gsap.to('body', { backgroundColor: color, duration:.5, overwrite:true });
    }
  });

  // Reset after characters
  ScrollTrigger.create({
    trigger: '#locations',
    start: 'top 80%',
    onEnter: () => gsap.to('body',{backgroundColor:'#070810',duration:.8}),
    onLeaveBack: ()=>{}
  });
}

/* ══════════════════════════════════════════════════════
   MAIN INIT
══════════════════════════════════════════════════════ */
function init() {
  // Init all canvases first
  initAllCanvases();

  // Cursor
  initCursor();
  initMagnetic();

  // Loader starts everything
  initLoader();

  // Nav
  initNav();
  initMobileNav();

  // Animations
  initHeroParallax();
  initStorySection();
  initCharacterHScroll();
  initLocations();
  initOutroAndWish();
  initAmbientShift();
  initProgress();
  initIdleAnimations();
  initCardTilt();
  initFooter();

  // Video modal
  initVideoModal();

  // Resize handling
  let resizeTm;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTm);
    resizeTm = setTimeout(() => {
      // Repaint canvases
      initAllCanvases();
      ScrollTrigger.refresh();
    }, 300);
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ─── Boot ─── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

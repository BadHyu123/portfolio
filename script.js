/* Nguyen The Huy (BadHyu123) · doodle portfolio
   Line boil · 3D Pirate Medal (spring grab) · Hand-drawn 3D Loot (spring grab coins & dice)
   Glowing Pirate Parchment Underworld · 3D tilt cards · pull hand · copy mail · letter wave */
'use strict';

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────────────────────
   1. Line boil: re-seed displacement noise for hand-drawn wobble
   ───────────────────────────────────────────────────────────── */
const noise = $('#boil feTurbulence');
if (!calm && noise) {
  let seed = 0;
  setInterval(() => noise.setAttribute('seed', seed = (seed + 1) % 4), 130);
}

/* ─────────────────────────────────────────────────────────────
   2. Custom Interactive Doodle Cursor
   ───────────────────────────────────────────────────────────── */
const cursor = $('#customCursor');
let cursorX = -100, cursorY = -100;
let targetCursorX = -100, targetCursorY = -100;

if (cursor && !calm) {
  addEventListener('pointermove', e => {
    targetCursorX = e.clientX;
    targetCursorY = e.clientY;
  }, { passive: true });

  (function renderCursor() {
    cursorX += (targetCursorX - cursorX) * 0.35;
    cursorY += (targetCursorY - cursorY) * 0.35;
    cursor.style.transform = `translate3d(${cursorX - 6}px, ${cursorY - 6}px, 0)`;
    requestAnimationFrame(renderCursor);
  })();

  const setHover = () => cursor.classList.add('hovering');
  const unsetHover = () => cursor.classList.remove('hovering');

  $$('a, button, [data-tilt], #head, #pull, .sign, .hints li').forEach(el => {
    el.addEventListener('pointerenter', setHover);
    el.addEventListener('pointerleave', unsetHover);
  });
}

/* ─────────────────────────────────────────────────────────────
   3. 3D Pirate Medal Mascot: Spring Grab Physics & 3D Tilt
   ───────────────────────────────────────────────────────────── */
const head = $('#head');
const headShadow = $('#headShadow');
const eyes = $('#eyes');

let x = 0, y = 0, vx = 0, vy = 0, tilt = 0, grab = null;
let tiltX = 0, tiltY = 0, liftZ = 0;
let normMouseX = 0, normMouseY = 0;

head.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  grab = { dx: e.clientX - x, dy: e.clientY - y };
  head.setPointerCapture(e.pointerId);
  head.classList.add('grabbed');
  if (cursor) cursor.classList.add('grabbing');
  e.stopPropagation();
});

head.addEventListener('pointermove', e => {
  if (!grab) return;
  const nx = e.clientX - grab.dx, ny = e.clientY - grab.dy;
  vx = nx - x; vy = ny - y;
  x = nx; y = ny;
});

const drop = () => {
  if (!grab) return;
  grab = null;
  head.classList.remove('grabbed');
  if (cursor) cursor.classList.remove('grabbing');
};
head.addEventListener('pointerup', drop);
head.addEventListener('pointercancel', drop);

// Track global pointer for 3D puppet perspective tilt
addEventListener('pointermove', e => {
  const r = head.getBoundingClientRect();
  const hx = r.left + r.width / 2;
  const hy = r.top + r.height / 2;
  const dx = e.clientX - hx;
  const dy = e.clientY - hy;

  normMouseX = Math.max(-1, Math.min(1, dx / (innerWidth * 0.45)));
  normMouseY = Math.max(-1, Math.min(1, dy / (innerHeight * 0.45)));

  // Eyes follow pointer
  if (eyes) {
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 320) * 9.5;
    eyes.setAttribute('transform', `translate(${dx / d * k} ${dy / d * k})`);
  }
}, { passive: true });

(function stepHead() {
  if (grab) {
    vx *= 0.82;
    vy *= 0.82;
    liftZ += (55 - liftZ) * 0.22; // Lift medal in 3D
  } else {
    // Spring physics back to center
    vx = (vx - x * 0.065) * 0.84;
    vy = (vy - y * 0.065) * 0.84;
    x += vx;
    y += vy;
    liftZ += (0 - liftZ) * 0.16;
  }

  // 3D rotations: Z for spring swing, X & Y for 3D perspective depth + velocity
  const targetTiltZ = Math.max(-35, Math.min(35, vx * 1.4));
  tilt += (targetTiltZ - tilt) * 0.15;

  let targetTiltX = grab ? Math.max(-30, Math.min(30, -vy * 1.2)) : normMouseY * -16;
  let targetTiltY = grab ? Math.max(-45, Math.min(45, vx * 1.4)) : normMouseX * 18;

  // If dragged far horizontally, tilt to reveal 3D medal thickness and rim
  if (grab && Math.abs(x) > 120) {
    targetTiltY += (x > 0 ? 30 : -30);
  }

  tiltX += (targetTiltX - tiltX) * 0.14;
  tiltY += (targetTiltY - tiltY) * 0.14;

  head.style.transform = `translate3d(${x}px, ${y}px, ${liftZ}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${tilt}deg)`;

  // Dynamic 3D ground shadow underneath medal
  if (headShadow) {
    const shadowX = -50 + (x * 0.08) - (tiltY * 0.25);
    const shadowY = (y * 0.12);
    const shadowScale = Math.max(0.4, 1 - liftZ * 0.012);
    const shadowOpacity = Math.max(0.08, 0.42 - liftZ * 0.006);
    headShadow.style.transform = `translate(${shadowX}%, ${shadowY}px) scale(${shadowScale})`;
    headShadow.style.opacity = shadowOpacity;
  }

  requestAnimationFrame(stepHead);
})();

/* ─────────────────────────────────────────────────────────────
   4. 3D Tilt Cards for Projects
   ───────────────────────────────────────────────────────────── */
$$('.tilt-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rotX = -py * 16;
    const rotY = px * 16;

    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
    card.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
    card.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  });
});

/* ─────────────────────────────────────────────────────────────
   5. Pull hand: opens the About panel
   ───────────────────────────────────────────────────────────── */
const pull = $('#pull');
let pullFrom = null;
pull.addEventListener('pointerdown', e => {
  pullFrom = e.clientX;
  pull.setPointerCapture(e.pointerId);
});
pull.addEventListener('pointermove', e => {
  if (pullFrom !== null) pull.style.translate = `${Math.max(-260, Math.min(0, e.clientX - pullFrom))}px 0`;
});
const letGo = () => { pullFrom = null; pull.style.translate = ''; };
pull.addEventListener('pointerup', letGo);
pull.addEventListener('pointercancel', letGo);
pull.addEventListener('dragstart', e => e.preventDefault());

addEventListener('keydown', e => {
  if (e.key === 'Escape' && location.hash === '#about') location.hash = '';
});

/* ─────────────────────────────────────────────────────────────
   6. Copy e-mail
   ───────────────────────────────────────────────────────────── */
const mail = $('#copyMail');
if (mail) {
  mail.addEventListener('click', async () => {
    const addr = mail.dataset.mail;
    try { await navigator.clipboard.writeText(addr); }
    catch { location.href = `mailto:${addr}`; return; }
    const note = mail.querySelector('.copied');
    note.textContent = 'copied!';
    setTimeout(() => { note.textContent = ''; }, 1600);
  });
}

/* ─────────────────────────────────────────────────────────────
   7. Letter wave on hover
   ───────────────────────────────────────────────────────────── */
$$('.wave').forEach(el => {
  const text = el.textContent.trim();
  const sr = document.createElement('span');
  sr.className = 'sr';
  sr.textContent = text;
  el.replaceChildren(sr, ...[...text].map((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch;
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', i);
    return s;
  }));
});

/* ─────────────────────────────────────────────────────────────
   8. Underworld: Glowing Pirate Treasure Parchment Map & Embers
   ───────────────────────────────────────────────────────────── */
const under = $('#underworld');
const uctx = under.getContext('2d');
const mask = document.createElement('canvas');
const mctx = mask.getContext('2d');
const spot = $('.head-spot');
const skull = new Image();
skull.src = 'skull.svg';

const TILE = 72, GAP = 5, LEVELS = 8, SIDE = TILE - GAP;
let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, heat, glow, burn = null, burning = false;
const flames = [];
const sparks = [];

// Pre-render Antique Pirate Treasure Parchment Map for the revealed layer
const mapCanvas = document.createElement('canvas');
const mapCtx = mapCanvas.getContext('2d');

function renderTreasureMap() {
  mapCanvas.width = W * dpr;
  mapCanvas.height = H * dpr;
  mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Deep rich antique parchment background (warm dark brown, not harsh pitch black)
  mapCtx.fillStyle = '#1e1412';
  mapCtx.fillRect(0, 0, W, H);

  // Subtle paper grain vignette
  const grad = mapCtx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.8);
  grad.addColorStop(0, '#261b18');
  grad.addColorStop(1, '#140c0b');
  mapCtx.fillStyle = grad;
  mapCtx.fillRect(0, 0, W, H);

  // Hand-drawn doodle nautical chart lines
  mapCtx.strokeStyle = 'rgba(245, 222, 179, 0.22)';
  mapCtx.lineWidth = 1.5;
  mapCtx.setLineDash([8, 12]);

  // Compass rose lines
  const cx = W * 0.2, cy = H * 0.3;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    mapCtx.beginPath();
    mapCtx.moveTo(cx, cy);
    mapCtx.lineTo(cx + Math.cos(a) * 180, cy + Math.sin(a) * 180);
    mapCtx.stroke();
  }

  // Compass star in corner
  mapCtx.beginPath();
  mapCtx.arc(cx, cy, 32, 0, Math.PI * 2);
  mapCtx.stroke();
  mapCtx.setLineDash([]);
  mapCtx.font = "16px 'Patrick Hand SC', cursive";
  mapCtx.fillStyle = 'rgba(245, 222, 179, 0.45)';
  mapCtx.fillText('N', cx - 5, cy - 40);

  // Treasure Island doodle in corner
  mapCtx.strokeStyle = 'rgba(245, 222, 179, 0.35)';
  mapCtx.lineWidth = 2;
  mapCtx.beginPath();
  mapCtx.ellipse(W * 0.8, H * 0.75, 110, 65, 0.2, 0, Math.PI * 2);
  mapCtx.stroke();

  // "X marks the spot"
  mapCtx.strokeStyle = '#ff3344';
  mapCtx.lineWidth = 3.5;
  mapCtx.beginPath();
  mapCtx.moveTo(W * 0.79 - 14, H * 0.75 - 14);
  mapCtx.lineTo(W * 0.79 + 14, H * 0.75 + 14);
  mapCtx.moveTo(W * 0.79 + 14, H * 0.75 - 14);
  mapCtx.lineTo(W * 0.79 - 14, H * 0.75 + 14);
  mapCtx.stroke();

  // Sea waves doodle
  mapCtx.strokeStyle = 'rgba(245, 222, 179, 0.2)';
  mapCtx.lineWidth = 2;
  const drawWave = (wx, wy) => {
    mapCtx.beginPath();
    mapCtx.arc(wx, wy, 16, Math.PI, 0);
    mapCtx.arc(wx + 32, wy, 16, Math.PI, 0);
    mapCtx.stroke();
  };
  drawWave(W * 0.45, H * 0.85);
  drawWave(W * 0.15, H * 0.75);
  drawWave(W * 0.82, H * 0.25);
}

// Tile dither with warm glowing borders
const dither = [0, 1].map(() => {
  const n = Math.ceil(SIDE / 2), noise = Array.from({ length: n * n }, Math.random);
  return Array.from({ length: LEVELS + 1 }, (_, level) => {
    const c = document.createElement('canvas');
    c.width = c.height = SIDE;
    const g = c.getContext('2d');

    // Fill grain
    noise.forEach((v, i) => {
      if (v < level / LEVELS) {
        g.fillStyle = '#fff';
        g.fillRect((i % n) * 2, (i / n | 0) * 2, 2, 2);
      }
    });

    g.globalCompositeOperation = 'destination-in';
    g.beginPath();
    g.roundRect(0, 0, SIDE, SIDE, 14);
    g.fill();
    return c;
  });
});

function fit() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  for (const c of [under, mask]) { c.width = W * dpr; c.height = H * dpr; }
  cols = Math.ceil(W / TILE); rows = Math.ceil(H / TILE);
  heat = new Float32Array(cols * rows);
  glow = new Float32Array(cols * rows);
  renderTreasureMap();
}
fit();
addEventListener('resize', fit);

function heatAt(px, py) {
  const r = TILE * 1.9;
  for (let row = Math.max(0, (py - r) / TILE | 0); row <= Math.min(rows - 1, (py + r) / TILE | 0); row++) {
    for (let col = Math.max(0, (px - r) / TILE | 0); col <= Math.min(cols - 1, (px + r) / TILE | 0); col++) {
      const d = Math.hypot((col + 0.5) * TILE - px, (row + 0.5) * TILE - py);
      const i = row * cols + col;
      heat[i] = Math.max(heat[i], Math.min(1.6, (r - d) / (r * 0.4)));
    }
  }

  // Spawn burning sparks at drag location
  if (Math.random() < 0.6) {
    sparks.push({
      x: px + (Math.random() - 0.5) * 24,
      y: py + (Math.random() - 0.5) * 24,
      vx: (Math.random() - 0.5) * 2,
      vy: -(1.5 + Math.random() * 3),
      life: 1,
      decay: 0.02 + Math.random() * 0.03,
      size: 2.5 + Math.random() * 3,
      color: Math.random() > 0.4 ? '#ff9900' : '#ffdd44'
    });
  }
}

const TONGUES = [[70, 0.6], [130, 0.9], [200, 1.2], [265, 0.95], [330, 0.65]];
function drawSkull(now) {
  const r = spot.getBoundingClientRect(), s = r.width / 400;
  uctx.save();
  uctx.translate(r.left + r.width / 2 + x, r.top + r.height / 2 + y);
  uctx.rotate(tilt * Math.PI / 180);
  uctx.scale(s, s);
  uctx.translate(-200, -195);

  for (let k = 0; k < 7; k++) {
    const [tx, power] = TONGUES[Math.random() * TONGUES.length | 0];
    const fx = tx + (Math.random() + Math.random() - 1) * 34;
    flames.push({
      x: fx, y: (Math.abs(fx - 200) < 88 ? 70 + ((fx - 200) / 88) ** 2 * 50 : 125) + 22,
      vy: -(1.4 + Math.random() * 2.2) * power, life: 1, decay: 0.014 + Math.random() * 0.014,
      size: 3 + Math.random() * 4, ph: tx,
    });
  }

  // Draw warm flame particles
  for (let i = flames.length; i--;) {
    const p = flames[i];
    if ((p.life -= p.decay) <= 0) { flames.splice(i, 1); continue; }
    p.x += Math.sin(now / 180 + p.ph) * 0.7 - tilt * 0.03;
    p.y += p.vy;
    const rad = p.size * (0.4 + p.life * 0.6);
    uctx.fillStyle = p.life > 0.5 ? '#ffeedd' : '#ffaa33';
    uctx.beginPath();
    uctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
    uctx.fill();
  }

  // Glow halo behind skull
  uctx.shadowColor = '#ff5500';
  uctx.shadowBlur = 24;
  if (skull.complete) uctx.drawImage(skull, 0, 0, 400, 390);
  uctx.shadowBlur = 0;
  uctx.restore();
}

const meLabel = $('.me');
function stillMe() {
  const r = meLabel.getBoundingClientRect();
  if (!r.width) return;
  const size = parseFloat(getComputedStyle(meLabel).fontSize);
  uctx.save();
  uctx.translate(r.right, r.top + r.height / 2);
  uctx.rotate(-8 * Math.PI / 180);
  uctx.font = `bold ${size}px 'Patrick Hand SC', cursive`;
  uctx.fillStyle = '#ffda44';
  uctx.shadowColor = '#ff6600';
  uctx.shadowBlur = 10;
  uctx.textAlign = 'right';
  uctx.textBaseline = 'middle';
  uctx.fillText('still me →', 0, 0);
  uctx.shadowBlur = 0;
  uctx.restore();
}

function underworld(now) {
  if (burn) heatAt(burn.x, burn.y);
  let alive = !!burn || sparks.length > 0;
  const set = dither[(now / 130 | 0) % 2];
  mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mctx.imageSmoothingEnabled = false;
  mctx.clearRect(0, 0, W, H);

  for (let i = 0; i < heat.length; i++) {
    heat[i] = Math.max(0, heat[i] - 0.012);
    glow[i] += (heat[i] - glow[i]) * 0.2;
    const level = Math.round(Math.min(1, glow[i]) * LEVELS);
    if (!level) continue;
    alive = true;
    mctx.drawImage(set[level], (i % cols) * TILE + GAP / 2, (i / cols | 0) * TILE + GAP / 2);
  }

  uctx.globalCompositeOperation = 'source-over';
  uctx.setTransform(1, 0, 0, 1, 0, 0);
  uctx.clearRect(0, 0, W * dpr, H * dpr);

  // Draw rich Antique Treasure Map
  uctx.drawImage(mapCanvas, 0, 0);

  // Draw Glowing Skull & label
  uctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawSkull(now);
  stillMe();

  // Draw flying sparks along burn path
  for (let i = sparks.length; i--;) {
    const s = sparks[i];
    if ((s.life -= s.decay) <= 0) { sparks.splice(i, 1); continue; }
    s.x += s.vx;
    s.y += s.vy;
    uctx.fillStyle = s.color;
    uctx.beginPath();
    uctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
    uctx.fill();
  }

  // Mask out revealed areas with dither tiles
  uctx.setTransform(1, 0, 0, 1, 0, 0);
  uctx.globalCompositeOperation = 'destination-in';
  uctx.drawImage(mask, 0, 0);

  if (alive) requestAnimationFrame(underworld);
  else burning = false;
}

// Background scratch / burn trigger
addEventListener('pointerdown', e => {
  if (e.button !== 0 || location.hash === '#about' || e.target.closest('#head, #pull, .about, a, button')) return;
  // If Three.js grabbed a 3D loot, don't trigger burn
  if (window.__threeGrabbed) return;

  burn = { x: e.clientX, y: e.clientY };
  heatAt(burn.x, burn.y);
  if (!burning) { burning = true; requestAnimationFrame(underworld); }
});

addEventListener('pointermove', e => {
  if (!burn) return;
  const dx = e.clientX - burn.x, dy = e.clientY - burn.y;
  const steps = Math.ceil(Math.hypot(dx, dy) / (TILE / 3));
  for (let k = 1; k <= steps; k++) heatAt(burn.x + dx * k / steps, burn.y + dy * k / steps);
  burn.x = e.clientX; burn.y = e.clientY;
}, { passive: true });

for (const type of ['pointerup', 'pointercancel', 'blur']) {
  addEventListener(type, () => { burn = null; });
}

/* ─────────────────────────────────────────────────────────────
   9. Three.js: Hand-Drawn Doodle 3D Loot (Spring Grab Coins & Dice)
   ───────────────────────────────────────────────────────────── */
function initThreeWorld() {
  if (typeof THREE === 'undefined' || calm) return;

  const canvas = $('#three-stage');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 24;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // Ambient lighting for clean comic/doodle appearance
  const ambient = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xfff5e0, 0.7);
  dirLight.position.set(10, 15, 12);
  scene.add(dirLight);

  // ── Hand-Drawn Coin Texture (Doodle ink-line art with cross-hatching) ──
  function createHandDrawnCoinTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 512;
    const ctx = cvs.getContext('2d');

    // Warm golden paper base
    ctx.fillStyle = '#f8cf47';
    ctx.beginPath();
    ctx.arc(256, 256, 246, 0, Math.PI * 2);
    ctx.fill();

    // Thick hand-drawn ink border
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Dotted inner coin ring
    ctx.lineWidth = 8;
    ctx.setLineDash([16, 14]);
    ctx.beginPath();
    ctx.arc(256, 256, 210, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Doodle Skull in center
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = 12;

    // Skull cranium
    ctx.beginPath();
    ctx.arc(256, 220, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Skull jaw
    ctx.fillRect(222, 260, 68, 50);
    ctx.strokeRect(222, 260, 68, 50);

    // Teeth lines
    ctx.beginPath();
    ctx.moveTo(244, 262); ctx.lineTo(244, 308);
    ctx.moveTo(268, 262); ctx.lineTo(268, 308);
    ctx.stroke();

    // Skull eyes (doodle ink dots)
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.ellipse(230, 226, 16, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(282, 226, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(234, 218, 5, 0, Math.PI * 2);
    ctx.arc(286, 218, 5, 0, Math.PI * 2);
    ctx.fill();

    // Hand-drawn cross-hatching shadow on coin side
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = 5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(330 + i * 14, 290 - i * 12);
      ctx.lineTo(390 + i * 14, 350 - i * 12);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(cvs);
  }

  // ── Hand-Drawn Dice Texture (Boiled doodle pip dots on antique paper) ──
  function createHandDrawnDiceTexture(pips) {
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 256;
    const ctx = cvs.getContext('2d');

    // Antique white paper base
    ctx.fillStyle = '#faf8f2';
    ctx.fillRect(0, 0, 256, 256);

    // Thick hand-drawn border
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = 14;
    ctx.strokeRect(8, 8, 240, 240);

    // Doodle ink pips
    ctx.fillStyle = '#1c1c1c';
    const drawPip = (px, py) => {
      ctx.beginPath();
      ctx.arc(px, py, 20, 0, Math.PI * 2);
      ctx.fill();
      // Mini white shine on pip
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px + 4, py - 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1c1c';
    };

    if (pips === 1) drawPip(128, 128);
    if (pips === 2) { drawPip(70, 70); drawPip(186, 186); }
    if (pips === 3) { drawPip(70, 70); drawPip(128, 128); drawPip(186, 186); }
    if (pips === 4) { drawPip(70, 70); drawPip(186, 70); drawPip(70, 186); drawPip(186, 186); }
    if (pips === 5) { drawPip(70, 70); drawPip(186, 70); drawPip(128, 128); drawPip(70, 186); drawPip(186, 186); }
    if (pips === 6) { drawPip(70, 60); drawPip(70, 128); drawPip(70, 196); drawPip(186, 60); drawPip(186, 128); drawPip(186, 196); }

    return new THREE.CanvasTexture(cvs);
  }

  const coinTex = createHandDrawnCoinTexture();
  const coinMat = new THREE.MeshToonMaterial({
    map: coinTex,
    color: 0xffe259,
  });

  const diceMats = [1, 6, 2, 5, 3, 4].map(p => new THREE.MeshToonMaterial({
    map: createHandDrawnDiceTexture(p),
    color: 0xffffff
  }));

  // Outline helper: thick black comic ink stroke
  function addComicInkOutline(mesh, geom, width = 4) {
    const edges = new THREE.EdgesGeometry(geom, 22);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x1c1c1c, linewidth: width })
    );
    mesh.add(line);
  }

  // Interactive 3D Objects list
  const artifacts = [];

  // 1. Spawning Hand-Drawn Gold Doubloons
  const coinGeom = new THREE.CylinderGeometry(1.6, 1.6, 0.32, 32);
  const coinPositions = [
    { x: -14, y: 7.5, z: -1, rx: 0.6, ry: 0.3 },
    { x: 13.5, y: 8, z: -2, rx: -0.4, ry: 0.8 },
    { x: -13.5, y: -7, z: 1, rx: 0.2, ry: -0.5 },
    { x: 12.5, y: -6.5, z: -1.5, rx: 0.5, ry: 0.4 },
    { x: -11, y: 0.5, z: 2, rx: 0.8, ry: 0.2 },
  ];

  coinPositions.forEach((pos, idx) => {
    const coin = new THREE.Mesh(coinGeom, coinMat);
    coin.position.set(pos.x, pos.y, pos.z);
    coin.rotation.set(pos.rx, pos.ry, idx * 0.8);
    addComicInkOutline(coin, coinGeom, 4);
    scene.add(coin);

    artifacts.push({
      mesh: coin,
      basePos: new THREE.Vector3(pos.x, pos.y, pos.z),
      springVel: new THREE.Vector3(),
      rotSpeed: { x: 0.008 + idx * 0.003, y: 0.012 + idx * 0.004, z: 0.005 },
      floatSpeed: 0.0016 + idx * 0.0004,
      phase: idx * 1.5,
      spinImpulse: { x: 0, y: 0 },
      isGrabbed: false,
      grabOffset: new THREE.Vector3()
    });
  });

  // 2. Hand-Drawn Pirate Dice
  const diceGeom = new THREE.BoxGeometry(1.8, 1.8, 1.8);
  const dice = new THREE.Mesh(diceGeom, diceMats);
  dice.position.set(13.5, 0.5, 1);
  dice.rotation.set(0.6, 0.4, 0.2);
  addComicInkOutline(dice, diceGeom, 4);
  scene.add(dice);

  artifacts.push({
    mesh: dice,
    basePos: new THREE.Vector3(13.5, 0.5, 1),
    springVel: new THREE.Vector3(),
    rotSpeed: { x: 0.009, y: 0.014, z: 0.007 },
    floatSpeed: 0.0018,
    phase: 2.7,
    spinImpulse: { x: 0, y: 0 },
    isGrabbed: false,
    grabOffset: new THREE.Vector3()
  });

  // 3. Hand-Drawn Compass Star (Octahedron)
  const starGeom = new THREE.OctahedronGeometry(1.3, 0);
  const starMat = new THREE.MeshToonMaterial({ color: 0xffd952 });
  const star = new THREE.Mesh(starGeom, starMat);
  star.position.set(0, 9.5, -2.5);
  addComicInkOutline(star, starGeom, 3);
  scene.add(star);

  artifacts.push({
    mesh: star,
    basePos: new THREE.Vector3(0, 9.5, -2.5),
    springVel: new THREE.Vector3(),
    rotSpeed: { x: 0.012, y: 0.016, z: 0.009 },
    floatSpeed: 0.002,
    phase: 0.9,
    spinImpulse: { x: 0, y: 0 },
    isGrabbed: false,
    grabOffset: new THREE.Vector3()
  });

  // ── Raycasting & Spring Grab for 3D Coins & Dice ──
  const raycaster = new THREE.Raycaster();
  const mouse3d = new THREE.Vector2(-999, -999);
  const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let grabbedArtifact = null;
  let lastGrabPos = new THREE.Vector3();
  let grabDragVel = new THREE.Vector3();

  addEventListener('pointermove', e => {
    mouse3d.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse3d.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (grabbedArtifact) {
      raycaster.setFromCamera(mouse3d, camera);
      const hitPt = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(mousePlane, hitPt)) {
        const newPos = hitPt.add(grabbedArtifact.grabOffset);
        grabDragVel.copy(newPos).sub(grabbedArtifact.mesh.position);
        grabbedArtifact.mesh.position.copy(newPos);

        // Tilt 3D mesh according to drag speed
        grabbedArtifact.spinImpulse.x += -grabDragVel.y * 0.12;
        grabbedArtifact.spinImpulse.y += grabDragVel.x * 0.12;
      }
    }
  }, { passive: true });

  // Pointer Down: Grab 3D coin or dice!
  addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('#head, #pull, .about, a, button')) return;

    raycaster.setFromCamera(mouse3d, camera);
    const intersects = raycaster.intersectObjects(artifacts.map(a => a.mesh), false);

    if (intersects.length > 0) {
      const hit = artifacts.find(a => a.mesh === intersects[0].object);
      if (hit) {
        grabbedArtifact = hit;
        hit.isGrabbed = true;
        window.__threeGrabbed = true; // Signals Underworld not to burn background

        // Set drag plane parallel to screen at object's Z depth
        mousePlane.set(new THREE.Vector3(0, 0, 1), -hit.mesh.position.z);
        const hitPt = new THREE.Vector3();
        raycaster.ray.intersectPlane(mousePlane, hitPt);
        hit.grabOffset.copy(hit.mesh.position).sub(hitPt);
        lastGrabPos.copy(hitPt);

        // Spin burst on grab
        hit.spinImpulse.x += (Math.random() - 0.5) * 0.4;
        hit.spinImpulse.y += (Math.random() - 0.5) * 0.4;

        if (cursor) cursor.classList.add('grabbing');
        e.stopPropagation();
      }
    }
  });

  // Pointer Up: Release 3D coin or dice with spring bounce
  const release3DLoot = () => {
    if (grabbedArtifact) {
      grabbedArtifact.isGrabbed = false;
      // Transfer drag velocity to spring velocity for a satisfying toss!
      grabbedArtifact.springVel.copy(grabDragVel).multiplyScalar(0.35);
      grabbedArtifact = null;
      window.__threeGrabbed = false;
      if (cursor) cursor.classList.remove('grabbing');
    }
  };
  addEventListener('pointerup', release3DLoot);
  addEventListener('pointercancel', release3DLoot);

  // Responsive resize
  addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 3D Render Loop
  let clock = 0;
  function animateThree() {
    requestAnimationFrame(animateThree);
    clock += 0.016;

    // Check hover state
    raycaster.setFromCamera(mouse3d, camera);
    const intersects = raycaster.intersectObjects(artifacts.map(a => a.mesh), false);
    const hoveredMesh = intersects.length > 0 ? intersects[0].object : null;

    artifacts.forEach(item => {
      const isHit = item.mesh === hoveredMesh;
      const speedMult = isHit ? 2.5 : 1.0;

      // Spin inertia
      item.spinImpulse.x *= 0.92;
      item.spinImpulse.y *= 0.92;

      item.mesh.rotation.x += item.rotSpeed.x * speedMult + item.spinImpulse.x;
      item.mesh.rotation.y += item.rotSpeed.y * speedMult + item.spinImpulse.y;
      item.mesh.rotation.z += item.rotSpeed.z * speedMult;

      if (!item.isGrabbed) {
        // Spring physics: pull smoothly back to base position
        const diffX = item.basePos.x - item.mesh.position.x;
        const diffY = item.basePos.y - item.mesh.position.y;
        const diffZ = item.basePos.z - item.mesh.position.z;

        item.springVel.x = (item.springVel.x + diffX * 0.075) * 0.84;
        item.springVel.y = (item.springVel.y + diffY * 0.075) * 0.84;
        item.springVel.z = (item.springVel.z + diffZ * 0.075) * 0.84;

        item.mesh.position.add(item.springVel);

        // Subtle gentle bobbing when resting
        const floatY = Math.sin(clock * 1.8 + item.phase) * 0.012;
        item.mesh.position.y += floatY;
      }
    });

    renderer.render(scene, camera);
  }

  animateThree();
}

// Initialize Three.js when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThreeWorld);
} else {
  initThreeWorld();
}

/* Nguyen The Huy (BadHyu123) · doodle portfolio
   Line boil · draggable spring head · pull hand · copy mail · letter wave */
'use strict';

const $ = sel => document.querySelector(sel);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Line boil: re-seed the displacement noise so strokes "wobble" like hand-drawn frames */
const noise = $('#boil feTurbulence');
if (!calm) {
  let seed = 0;
  setInterval(() => noise.setAttribute('seed', seed = (seed + 1) % 4), 130);
}

/* 2. Head: grab + drag, springs back home and tilts with velocity; eyes follow the pointer */
const head = $('#head');
const eyes = $('#eyes');
let x = 0, y = 0, vx = 0, vy = 0, tilt = 0, grab = null;

head.addEventListener('pointerdown', e => {
  grab = { dx: e.clientX - x, dy: e.clientY - y };
  head.setPointerCapture(e.pointerId);
  head.classList.add('grabbed');
});
head.addEventListener('pointermove', e => {
  if (!grab) return;
  const nx = e.clientX - grab.dx, ny = e.clientY - grab.dy;
  vx = nx - x; vy = ny - y; x = nx; y = ny;
});
const drop = () => { grab = null; head.classList.remove('grabbed'); };
head.addEventListener('pointerup', drop);
head.addEventListener('pointercancel', drop);

(function step() {
  if (grab) { vx *= 0.8; vy *= 0.8; }
  else { vx = (vx - x * 0.06) * 0.84; vy = (vy - y * 0.06) * 0.84; x += vx; y += vy; }
  tilt += (Math.max(-35, Math.min(35, vx * 1.4)) - tilt) * 0.15;
  head.style.transform = `translate(${x}px, ${y}px) rotate(${tilt}deg)`;
  requestAnimationFrame(step);
})();

addEventListener('pointermove', e => {
  const r = head.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 300) * 9;
  eyes.setAttribute('transform', `translate(${dx / d * k} ${dy / d * k})`);
}, { passive: true });

/* 3. Pull hand: follows the pointer while dragged; the click (from <a href="#about">) opens the panel */
const pull = $('#pull');
let pullFrom = null;
pull.addEventListener('pointerdown', e => { pullFrom = e.clientX; pull.setPointerCapture(e.pointerId); });
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

/* 4. Copy e-mail (falls back to mailto when the clipboard is blocked) */
const mail = $('#copyMail');
mail.addEventListener('click', async () => {
  const addr = mail.dataset.mail;
  try { await navigator.clipboard.writeText(addr); }
  catch { location.href = `mailto:${addr}`; return; }
  const note = mail.querySelector('.copied');
  note.textContent = 'copied!';
  setTimeout(() => { note.textContent = ''; }, 1600);
});

/* 5. Letter wave: split link labels into letters, keep the plain text for screen readers */
document.querySelectorAll('.wave').forEach(el => {
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

/* 6. Underworld: press + drag on the red background to burn rounded tiles through to a dark
   layer where a flaming pirate skull sits under the head. Tiles "heat" near the pointer and cool
   off; their coverage is drawn with nested random grain, so they dissolve in and out. */
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

// dither[variant][level]: one rounded tile per coverage level; levels share the same noise so
// grain grows instead of reshuffling. Two variants alternate to make the grain shimmer.
const dither = [0, 1].map(() => {
  const n = Math.ceil(SIDE / 2), noise = Array.from({ length: n * n }, Math.random);
  return Array.from({ length: LEVELS + 1 }, (_, level) => {
    const c = document.createElement('canvas');
    c.width = c.height = SIDE;
    const g = c.getContext('2d');
    noise.forEach((v, i) => { if (v < level / LEVELS) g.fillRect((i % n) * 2, (i / n | 0) * 2, 2, 2); });
    g.globalCompositeOperation = 'destination-in';
    g.beginPath();
    g.roundRect(0, 0, SIDE, SIDE, 12);
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
}
fit();
addEventListener('resize', fit);

function heatAt(px, py) {
  const r = TILE * 1.9;
  for (let row = Math.max(0, (py - r) / TILE | 0); row <= Math.min(rows - 1, (py + r) / TILE | 0); row++) {
    for (let col = Math.max(0, (px - r) / TILE | 0); col <= Math.min(cols - 1, (px + r) / TILE | 0); col++) {
      const d = Math.hypot((col + 0.5) * TILE - px, (row + 0.5) * TILE - py);
      const i = row * cols + col;
      heat[i] = Math.max(heat[i], Math.min(1.6, (r - d) / (r * 0.4))); // >1 = stays solid a while
    }
  }
}

// Flame tongues rise from behind the hat (skull-local units, same 400x390 frame as the head SVG)
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
  uctx.fillStyle = '#fff';
  uctx.beginPath();
  for (let i = flames.length; i--;) {
    const p = flames[i];
    if ((p.life -= p.decay) <= 0) { flames.splice(i, 1); continue; }
    p.x += Math.sin(now / 180 + p.ph) * 0.7 - tilt * 0.03;
    p.y += p.vy;
    const rad = p.size * (0.4 + p.life * 0.6);
    uctx.moveTo(p.x + rad, p.y);
    uctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
  }
  uctx.fill();
  if (skull.complete) uctx.drawImage(skull, 0, 0, 400, 390);
  uctx.restore();
}

// The "me →" label's underworld twin, drawn where the red one sits
const meLabel = $('.me');
function stillMe() {
  const r = meLabel.getBoundingClientRect();
  if (!r.width) return; // hidden on mobile
  const size = parseFloat(getComputedStyle(meLabel).fontSize);
  uctx.save();
  uctx.translate(r.right, r.top + r.height / 2);
  uctx.rotate(-8 * Math.PI / 180);
  uctx.font = `${size}px 'Patrick Hand SC', cursive`;
  uctx.fillStyle = '#fff';
  uctx.textAlign = 'right';
  uctx.textBaseline = 'middle';
  uctx.fillText('still me →', 0, 0);
  uctx.restore();
}

function underworld(now) {
  if (burn) heatAt(burn.x, burn.y);
  let alive = !!burn;
  const set = dither[(now / 130 | 0) % 2];
  mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mctx.imageSmoothingEnabled = false; // keep the grain crisp on HiDPI
  mctx.clearRect(0, 0, W, H);
  for (let i = 0; i < heat.length; i++) {
    heat[i] = Math.max(0, heat[i] - 0.01);
    glow[i] += (heat[i] - glow[i]) * 0.2;
    const level = Math.round(Math.min(1, glow[i]) * LEVELS);
    if (!level) continue;
    alive = true;
    mctx.drawImage(set[level], (i % cols) * TILE + GAP / 2, (i / cols | 0) * TILE + GAP / 2);
  }

  uctx.globalCompositeOperation = 'source-over';
  uctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  uctx.fillStyle = '#1c1c1c';
  uctx.fillRect(0, 0, W, H);
  drawSkull(now);
  stillMe();
  uctx.setTransform(1, 0, 0, 1, 0, 0);
  uctx.globalCompositeOperation = 'destination-in';
  uctx.drawImage(mask, 0, 0);

  if (alive) requestAnimationFrame(underworld);
  else burning = false;
}

addEventListener('pointerdown', e => {
  if (e.button !== 0 || location.hash === '#about' || e.target.closest('.head, .pull, .about')) return;
  burn = { x: e.clientX, y: e.clientY };
  heatAt(burn.x, burn.y);
  if (!burning) { burning = true; requestAnimationFrame(underworld); }
});
addEventListener('pointermove', e => {
  if (!burn) return;
  const dx = e.clientX - burn.x, dy = e.clientY - burn.y;
  const steps = Math.ceil(Math.hypot(dx, dy) / (TILE / 3)); // fill the gaps on fast strokes
  for (let k = 1; k <= steps; k++) heatAt(burn.x + dx * k / steps, burn.y + dy * k / steps);
  burn.x = e.clientX; burn.y = e.clientY;
}, { passive: true });
for (const type of ['pointerup', 'pointercancel', 'blur']) addEventListener(type, () => { burn = null; });

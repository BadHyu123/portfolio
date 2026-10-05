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

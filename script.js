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
   1b. Animated Beach Shoreline Background (Canvas)
   Faithfully inspired by ref-bg.png: diagonal shoreline, sand rivulets,
   turbulent breaking white foam, sea foam lace, luminous turquoise ocean
   ───────────────────────────────────────────────────────────── */
(function initBeachBg() {
  const cvs = $('#beach-bg');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  let W, H, dpr;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cvs.width = W * dpr;
    cvs.height = H * dpr;
  }
  resize();
  addEventListener('resize', resize);

  // Generate fixed sand drainage rivulet paths (like in ref-bg.png)
  const rivulets = [];
  const RIV_COUNT = 38;
  for (let i = 0; i < RIV_COUNT; i++) {
    rivulets.push({
      xRatio: 0.05 + (i / RIV_COUNT) * 0.9 + (Math.random() - 0.5) * 0.02,
      width: 1.5 + Math.random() * 3.5,
      alpha: 0.06 + Math.random() * 0.12,
      waviness: 6 + Math.random() * 12,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Mouse ripple interaction on ocean
  const ripples = [];
  addEventListener('pointermove', e => {
    // Only spawn ripples on ocean area (bottom half)
    const normY = e.clientY / H;
    if (normY > 0.42 && ripples.length < 15 && Math.random() < 0.3) {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        r: 4,
        maxR: 35 + Math.random() * 25,
        alpha: 0.35
      });
    }
  }, { passive: true });

  // Coastline base curve (diagonal slope from top-left to right-center)
  function coastBaseY(xN, time) {
    // Diagonal slope: ~32% at left (X=0) down to ~50% at right (X=1)
    const baseSlope = 0.32 + xN * 0.20;

    // Tidal surge cycle (waves surge up into sand and recede)
    const tideCycle = time * 0.85;
    const tideSurge = Math.sin(tideCycle) * 0.038
                    + Math.sin(tideCycle * 1.9 + xN * 3.0) * 0.015;

    // Organic shoreline undulation
    const undulation = Math.sin(xN * 5.2 + time * 0.4) * 0.016
                     + Math.sin(xN * 9.8 - time * 0.6) * 0.008
                     + Math.cos(xN * 3.1 + 0.8) * 0.014;

    return baseSlope + tideSurge + undulation;
  }

  function drawBeach(time) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ───────────────────────────────────────────────────────────
    // 1. DEEP OCEAN BASE (Luminous Tropical Turquoise Gradient)
    // ───────────────────────────────────────────────────────────
    const oceanGrad = ctx.createLinearGradient(0, H * 0.35, 0, H);
    oceanGrad.addColorStop(0, '#2de2e6');     // shallow bright turquoise
    oceanGrad.addColorStop(0.22, '#00c6d4');  // vibrant tropical teal
    oceanGrad.addColorStop(0.48, '#029ab5');  // rich cyan blue
    oceanGrad.addColorStop(0.75, '#016f8a');  // deep ocean blue
    oceanGrad.addColorStop(1, '#014559');     // deep sapphire marine
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, W, H);

    // Sunlight caustics ribbons on water (moving organic shimmer)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 3;
    for (let c = 0; c < 7; c++) {
      const cy = H * (0.55 + c * 0.065) + Math.sin(time * 0.5 + c * 1.8) * 8;
      ctx.beginPath();
      for (let s = 0; s <= 30; s++) {
        const cx = (s / 30) * W;
        const wave = Math.sin(s * 0.6 + time * 1.2 + c * 1.1) * 6
                   + Math.cos(s * 1.2 - time * 0.9) * 3;
        ctx[s === 0 ? 'moveTo' : 'lineTo'](cx, cy + wave);
      }
      ctx.stroke();
    }

    // Sparkle caustics dots on deep water
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    for (let i = 0; i < 28; i++) {
      const sx = ((i * 3821 + time * 20) % W);
      const sy = H * 0.58 + ((i * 5923) % (H * 0.40)) + Math.sin(time + i) * 4;
      const sr = 1.2 + Math.sin(time * 2 + i * 2.5) * 0.8;
      if (sr > 0.5) {
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // ───────────────────────────────────────────────────────────
    // 2. SAND SHORELINE (Top-right area with drainage rivulets)
    // ───────────────────────────────────────────────────────────
    const steps = 100;

    // Draw sand landmass
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    for (let i = steps; i >= 0; i--) {
      const xN = i / steps;
      const yN = coastBaseY(xN, time);
      ctx.lineTo(xN * W, yN * H);
    }
    ctx.closePath();

    // Warm natural sand gradient (matching ref-bg.png top-down sand)
    const sandGrad = ctx.createLinearGradient(W * 0.6, 0, 0, H * 0.55);
    sandGrad.addColorStop(0, '#f9edd8');     // fine dry sunny sand
    sandGrad.addColorStop(0.35, '#ebd3b0');  // warm honey beach sand
    sandGrad.addColorStop(0.75, '#dec29a');  // darker packed sand
    sandGrad.addColorStop(1, '#caa778');     // coastal sand bank
    ctx.fillStyle = sandGrad;
    ctx.fill();

    // Vertical drainage sand rivulets (the prominent texture in ref-bg.png)
    ctx.save();
    rivulets.forEach(riv => {
      const startX = riv.xRatio * W;
      const startY = 0;
      const endY = coastBaseY(riv.xRatio, time) * H - 8;
      if (endY <= startY) return;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const subSteps = 16;
      for (let s = 1; s <= subSteps; s++) {
        const prog = s / subSteps;
        const curY = startY + prog * (endY - startY);
        const curX = startX + Math.sin(prog * riv.waviness + riv.phase) * 9
                            + Math.cos(prog * 5.0) * 3;
        ctx.lineTo(curX, curY);
      }
      ctx.strokeStyle = `rgba(145, 108, 68, ${riv.alpha})`;
      ctx.lineWidth = riv.width;
      ctx.lineCap = 'round';
      ctx.stroke();
    });
    ctx.restore();

    // Sand micro-grain texture
    ctx.fillStyle = 'rgba(130, 95, 55, 0.04)';
    for (let i = 0; i < 45; i++) {
      const gx = ((i * 8191 + 17) % W);
      const gy = ((i * 4937 + 11) % (H * 0.42));
      ctx.fillRect(gx, gy, 1.8, 1.8);
    }

    // ───────────────────────────────────────────────────────────
    // 3. WET GLOSSY SAND STRIP (Left behind as tide recedes)
    // ───────────────────────────────────────────────────────────
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const xN = i / steps;
      const yN = coastBaseY(xN, time) - 0.038;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](xN * W, yN * H);
    }
    for (let i = steps; i >= 0; i--) {
      const xN = i / steps;
      const yN = coastBaseY(xN, time);
      ctx.lineTo(xN * W, yN * H);
    }
    ctx.closePath();
    // Wet sand with glossy sky reflection
    const wetGrad = ctx.createLinearGradient(0, H * 0.25, 0, H * 0.55);
    wetGrad.addColorStop(0, 'rgba(185, 150, 110, 0.15)');
    wetGrad.addColorStop(0.7, 'rgba(165, 130, 90, 0.48)');
    wetGrad.addColorStop(1, 'rgba(135, 105, 75, 0.65)');
    ctx.fillStyle = wetGrad;
    ctx.fill();

    // ───────────────────────────────────────────────────────────
    // 4. CRASHING TURBULENT WHITE WAVE FOAM (Dense Multi-layer Froth)
    // ───────────────────────────────────────────────────────────
    // Foam shadow beneath breaking wave crest
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const xN = i / steps;
      const yN = coastBaseY(xN, time) + 0.018;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](xN * W, yN * H);
    }
    for (let i = steps; i >= 0; i--) {
      const xN = i / steps;
      const yN = coastBaseY(xN, time) + 0.052;
      ctx.lineTo(xN * W, yN * H);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 140, 160, 0.35)';
    ctx.fill();

    // 4 Layered Wave Foam Crests (Dense foaming crest as in ref-bg.png)
    const foamBands = [
      { offset: -0.008, width: 0.048, alpha: 0.96, freq: 8.5 },
      { offset: 0.012,  width: 0.038, alpha: 0.88, freq: 11.2 },
      { offset: 0.032,  width: 0.028, alpha: 0.65, freq: 14.5 },
      { offset: 0.048,  width: 0.020, alpha: 0.42, freq: 18.0 },
    ];

    foamBands.forEach((band, bIdx) => {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const xN = i / steps;
        const wobble = Math.sin(xN * band.freq + time * 1.6 + bIdx) * 0.009
                     + Math.cos(xN * 16.0 - time * 2.2) * 0.004;
        const yN = coastBaseY(xN, time) + band.offset + wobble;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](xN * W, yN * H);
      }
      for (let i = steps; i >= 0; i--) {
        const xN = i / steps;
        const wobble = Math.sin(xN * (band.freq + 2) + time * 1.8 + bIdx) * 0.008;
        const yN = coastBaseY(xN, time) + band.offset + band.width + wobble;
        ctx.lineTo(xN * W, yN * H);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${band.alpha})`;
      ctx.fill();
    });

    // ───────────────────────────────────────────────────────────
    // 5. SEA FOAM LACE & CELL BUBBLE NETWORKS (Organic Froth Web)
    // ───────────────────────────────────────────────────────────
    ctx.save();
    // Clusters of bubble cells in the back-wash
    const BUBBLE_COUNT = 65;
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const xN = ((i * 7331 + 41) % 100) / 100;
      const baseCoast = coastBaseY(xN, time);
      const distFromCrest = 0.015 + ((i * 3571) % 65) / 1000;
      const bubY = (baseCoast + distFromCrest) * H + Math.sin(time * 1.8 + i) * 6;
      const bubX = xN * W + Math.cos(time + i * 2) * 5;
      const bubR = 2.5 + ((i * 911) % 6) + Math.sin(time * 2 + i) * 1.2;

      // Foam bubble with clear water center
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + (i % 3) * 0.2})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(bubX, bubY, Math.max(1, bubR), 0, Math.PI * 2);
      ctx.stroke();

      // Dense bubble fill
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
        ctx.fill();
      }
    }

    // Froth spray dots on sand edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    for (let i = 0; i < 48; i++) {
      const xN = ((i * 5179 + time * 8) % W) / W;
      const sprayY = (coastBaseY(xN, time) - 0.012 + Math.sin(time * 2 + i * 3) * 0.016) * H;
      const sprayX = xN * W;
      const r = 1.2 + Math.sin(time * 3 + i) * 0.8;
      ctx.beginPath();
      ctx.arc(sprayX, sprayY, Math.max(0.6, r), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ───────────────────────────────────────────────────────────
    // 6. INTERACTIVE WATER RIPPLES ON POINTER MOVE
    // ───────────────────────────────────────────────────────────
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.r += 0.8;
      rip.alpha *= 0.95;
      if (rip.r >= rip.maxR || rip.alpha < 0.02) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, rip.r * 1.8, rip.r * 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ───────────────────────────────────────────────────────────
    // 7. VINTAGE PIRATE DOODLE DETAILS ON SHORE (Compass & Palm)
    // ───────────────────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = 'rgba(40, 25, 15, 0.18)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Palm tree on top-right beach
    const palmX = W * 0.89;
    const palmBaseY = (coastBaseY(0.89, time) - 0.08) * H;
    if (palmBaseY > 30) {
      // Trunk
      ctx.beginPath();
      ctx.moveTo(palmX, palmBaseY);
      ctx.quadraticCurveTo(palmX - 12, palmBaseY - 45, palmX + 8, palmBaseY - 85);
      ctx.stroke();
      // Fronds
      const fBase = palmBaseY - 85;
      [[-28, -18], [24, -20], [-18, -32], [22, -28], [-4, -36]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(palmX + 8, fBase);
        ctx.quadraticCurveTo(palmX + dx, fBase + dy * 0.6, palmX + dx * 1.8, fBase + dy * 0.8);
        ctx.stroke();
      });
    }

    // Gentle mini starfish doodle on sand
    const starX = W * 0.16;
    const starY = (coastBaseY(0.16, time) - 0.09) * H;
    if (starY > 20) {
      ctx.strokeStyle = 'rgba(215, 60, 60, 0.28)';
      ctx.fillStyle = 'rgba(235, 90, 80, 0.22)';
      ctx.beginPath();
      for (let s = 0; s < 5; s++) {
        const a1 = (s * Math.PI * 2) / 5 - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        const r1 = 12, r2 = 5;
        ctx[s === 0 ? 'moveTo' : 'lineTo'](starX + Math.cos(a1) * r1, starY + Math.sin(a1) * r1);
        ctx.lineTo(starX + Math.cos(a2) * r2, starY + Math.sin(a2) * r2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  if (!calm) {
    let t = 0;
    (function loopBeach() {
      t += 0.016;
      drawBeach(t);
      requestAnimationFrame(loopBeach);
    })();
  } else {
    drawBeach(0);
  }
})();

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
  if (e.button === 2) {
    // Playful 3D spring tilt kick on right click
    vx += (Math.random() - 0.5) * 35;
    vy += -25;
    tilt += (Math.random() - 0.5) * 25;
    return;
  }
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
   8. Underworld: Glowing Antique Pirate Treasure Map (Right-Click Reveal)
   ───────────────────────────────────────────────────────────── */
// Prevent browser context menu globally for smooth right-click interactions
window.addEventListener('contextmenu', e => {
  e.preventDefault();
});

const under = $('#underworld');
const uctx = under.getContext('2d');
const mask = document.createElement('canvas');
const mctx = mask.getContext('2d');
const spot = $('.head-spot');
const skull = new Image();
skull.src = 'skull.svg';

let W = 0, H = 0, dpr = 1;
let isRightRevealing = false;
let curRevX = 0, curRevY = 0, lastRevX = null, lastRevY = null;
let isRevealingActive = false;
let fadeFrames = 0;
const FADE_TOTAL = 56;

const flames = [];
const sparks = [];

// Pre-render Antique Pirate Treasure Parchment Map for the revealed layer
const mapCanvas = document.createElement('canvas');
const mapCtx = mapCanvas.getContext('2d');

function drawCompassRose(ctx, cx, cy, rad) {
  ctx.save();
  // Outer circle with degree marks
  ctx.strokeStyle = '#4e2f17';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, rad * 0.88, 0, Math.PI * 2);
  ctx.stroke();

  // Degree ticks
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
    const isMajor = (a % (Math.PI / 4) < 0.01);
    const r1 = isMajor ? rad * 0.76 : rad * 0.84;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
    ctx.stroke();
  }

  // 8 Major Points (alternating filled & parchment)
  const pts = 8;
  for (let i = 0; i < pts; i++) {
    const a = (i * Math.PI * 2) / pts - Math.PI / 2;
    const aLeft = a - Math.PI / pts;
    const aRight = a + Math.PI / pts;
    const rTip = i % 2 === 0 ? rad * 0.84 : rad * 0.62;
    const rInner = rad * 0.22;

    // Left half (dark sepia)
    ctx.fillStyle = '#3c210e';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * rTip, cy + Math.sin(a) * rTip);
    ctx.lineTo(cx + Math.cos(aLeft) * rInner, cy + Math.sin(aLeft) * rInner);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right half (light parchment)
    ctx.fillStyle = '#faecd6';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * rTip, cy + Math.sin(a) * rTip);
    ctx.lineTo(cx + Math.cos(aRight) * rInner, cy + Math.sin(aRight) * rInner);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // North Fleur-de-lis / arrow
  ctx.fillStyle = '#c41e1e';
  ctx.beginPath();
  ctx.moveTo(cx, cy - rad * 0.95);
  ctx.lineTo(cx - 7, cy - rad * 0.75);
  ctx.lineTo(cx, cy - rad * 0.8);
  ctx.lineTo(cx + 7, cy - rad * 0.75);
  ctx.closePath();
  ctx.fill();

  // Cardinal letters
  ctx.font = "bold 19px 'Patrick Hand SC', cursive";
  ctx.fillStyle = '#3a1e0b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', cx, cy - rad - 14);
  ctx.fillText('S', cx, cy + rad + 14);
  ctx.fillText('E', cx + rad + 15, cy);
  ctx.fillText('W', cx - rad - 15, cy);

  ctx.restore();
}

function drawTreasureIsland(ctx, ix, iy) {
  ctx.save();
  ctx.translate(ix, iy);

  // Shallow reef buffer (dashed coastline)
  ctx.strokeStyle = 'rgba(100, 60, 25, 0.35)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.ellipse(0, 0, 150, 95, 0.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Island mass
  ctx.fillStyle = '#ddbe89';
  ctx.strokeStyle = '#4a2c15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-110, -20);
  ctx.bezierCurveTo(-90, -75, -20, -70, 30, -55);
  ctx.bezierCurveTo(85, -60, 125, -20, 115, 25);
  ctx.bezierCurveTo(95, 75, 20, 68, -40, 55);
  ctx.bezierCurveTo(-95, 60, -125, 20, -110, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Coastline ink hachures
  ctx.strokeStyle = 'rgba(74, 44, 21, 0.4)';
  ctx.lineWidth = 1.2;
  for (let a = 0; a < Math.PI * 2; a += 0.22) {
    const rx = Math.cos(a) * 95, ry = Math.sin(a) * 55;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + Math.cos(a) * 10, ry + Math.sin(a) * 10);
    ctx.stroke();
  }

  // Mountain ridges
  ctx.strokeStyle = '#4a2c15';
  ctx.lineWidth = 2.5;
  const drawMtn = (mx, my, h) => {
    ctx.beginPath();
    ctx.moveTo(mx - h * 0.7, my + h * 0.5);
    ctx.lineTo(mx, my - h * 0.5);
    ctx.lineTo(mx + h * 0.7, my + h * 0.5);
    ctx.stroke();
    // Shading
    ctx.beginPath();
    ctx.moveTo(mx, my - h * 0.5);
    ctx.lineTo(mx - h * 0.2, my + h * 0.5);
    ctx.stroke();
  };
  drawMtn(-50, -10, 32);
  drawMtn(-15, -22, 40);
  drawMtn(25, -12, 34);

  // Palm Trees
  const drawPalm = (px, py) => {
    ctx.strokeStyle = '#4a2c15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + 8, py - 18, px + 12, py - 32);
    ctx.stroke();
    // Fronds
    ctx.lineWidth = 2;
    for (const [dx, dy] of [[-14, -6], [-10, 4], [14, -6], [10, 5], [0, -14]]) {
      ctx.beginPath();
      ctx.moveTo(px + 12, py - 32);
      ctx.quadraticCurveTo(px + 12 + dx * 0.6, py - 32 + dy * 0.6, px + 12 + dx, py - 32 + dy);
      ctx.stroke();
    }
  };
  drawPalm(60, 15);
  drawPalm(78, 22);

  // Skull Rock doodle
  ctx.font = "bold 20px 'Patrick Hand SC', cursive";
  ctx.fillStyle = '#4a2c15';
  ctx.textAlign = 'center';
  ctx.fillText('Skull Rock', -20, 24);

  // Crimson Red "X Marks the Spot"
  ctx.strokeStyle = '#c81c1c';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(40, -5); ctx.lineTo(66, 20);
  ctx.moveTo(66, -5); ctx.lineTo(40, 20);
  ctx.stroke();

  ctx.font = "bold 18px 'Patrick Hand SC', cursive";
  ctx.fillStyle = '#c81c1c';
  ctx.fillText('X', 53, -12);
  ctx.font = "15px 'Patrick Hand SC', cursive";
  ctx.fillStyle = '#4a2c15';
  ctx.fillText('10,000 Doubloons', 53, 38);

  ctx.restore();
}

function drawGalleon(ctx, gx, gy) {
  ctx.save();
  ctx.translate(gx, gy);

  // Ship hull
  ctx.fillStyle = '#5c381c';
  ctx.strokeStyle = '#2b170a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-55, -4);
  ctx.bezierCurveTo(-45, 20, 40, 22, 65, 0);
  ctx.lineTo(50, -12);
  ctx.lineTo(-45, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cannon ports
  ctx.fillStyle = '#1c1c1c';
  for (let cp = -25; cp <= 35; cp += 18) {
    ctx.fillRect(cp, -2, 6, 6);
  }

  // 3 Masts
  ctx.strokeStyle = '#2b170a';
  ctx.lineWidth = 3;
  const masts = [-24, 6, 36];
  const heights = [55, 68, 50];
  masts.forEach((mx, i) => {
    const mh = heights[i];
    ctx.beginPath();
    ctx.moveTo(mx, -12);
    ctx.lineTo(mx, -12 - mh);
    ctx.stroke();

    // Billowing sails
    ctx.fillStyle = '#f8ecd6';
    ctx.strokeStyle = '#2b170a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx - 15, -12 - mh * 0.3);
    ctx.quadraticCurveTo(mx, -12 - mh * 0.45, mx + 15, -12 - mh * 0.3);
    ctx.lineTo(mx + 13, -12 - mh * 0.85);
    ctx.quadraticCurveTo(mx, -12 - mh * 0.95, mx - 13, -12 - mh * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Jolly Roger Pirate Flag on main mast
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(6, -82, 18, 12);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(14, -76, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Waves beneath hull
  ctx.strokeStyle = 'rgba(74, 44, 21, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-40, 20, 14, Math.PI, 0);
  ctx.arc(-12, 20, 14, Math.PI, 0);
  ctx.arc(16, 20, 14, Math.PI, 0);
  ctx.arc(44, 20, 14, Math.PI, 0);
  ctx.stroke();

  // Ship Name
  ctx.font = "italic 16px 'Patrick Hand SC', cursive";
  ctx.fillStyle = '#4a2c15';
  ctx.textAlign = 'center';
  ctx.fillText('The Black Pearl', 0, 38);

  ctx.restore();
}

function drawKraken(ctx, kx, ky) {
  ctx.save();
  ctx.translate(kx, ky);

  ctx.strokeStyle = '#422410';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  const tentacles = [
    { x: -35, cx1: -45, cy1: -35, cx2: -20, cy2: -65, ex: -30, ey: -85 },
    { x: -12, cx1: -15, cy1: -45, cx2: 10, cy2: -80, ex: -5, ey: -105 },
    { x: 14, cx1: 18, cy1: -40, cx2: 38, cy2: -75, ex: 25, ey: -95 },
    { x: 38, cx1: 48, cy1: -30, cx2: 60, cy2: -55, ex: 72, ey: -70 }
  ];

  tentacles.forEach(t => {
    ctx.beginPath();
    ctx.moveTo(t.x, 0);
    ctx.bezierCurveTo(t.cx1, t.cy1, t.cx2, t.cy2, t.ex, t.ey);
    ctx.stroke();

    // Suction cups
    ctx.fillStyle = '#f5e3c6';
    ctx.lineWidth = 2;
    for (let f = 0.3; f <= 0.85; f += 0.22) {
      const sx = t.x + (t.ex - t.x) * f + 4;
      const sy = t.ey * f + 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  });

  // Sea splashes
  ctx.strokeStyle = 'rgba(74, 44, 21, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 48, Math.PI * 0.9, Math.PI * 2.1);
  ctx.stroke();

  ctx.font = "bold 18px 'Patrick Hand SC', cursive";
  ctx.fillStyle = '#c41e1e';
  ctx.textAlign = 'center';
  ctx.fillText('Here be Monsters!', 10, 24);

  ctx.restore();
}

function drawMapTitleBanner(ctx, bx, by) {
  ctx.save();
  ctx.translate(bx, by);

  // Scrolled ribbon banner
  ctx.fillStyle = '#f5e1bf';
  ctx.strokeStyle = '#462711';
  ctx.lineWidth = 2.5;

  const bw = 210, bh = 42;
  // Banner body
  ctx.beginPath();
  ctx.moveTo(-bw, -bh / 2);
  ctx.quadraticCurveTo(0, -bh / 2 + 8, bw, -bh / 2);
  ctx.lineTo(bw, bh / 2);
  ctx.quadraticCurveTo(0, bh / 2 + 8, -bw, bh / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ribbon notch ends
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * bw, -bh / 2 + 6);
    ctx.lineTo(dir * (bw + 26), 0);
    ctx.lineTo(dir * bw, bh / 2 - 6);
    ctx.lineTo(dir * (bw + 12), 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Text inside banner
  ctx.font = "bold 22px 'Patrick Hand SC', cursive";
  ctx.fillStyle = '#3a1f0d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('~ CHARTS OF CAPTAIN BADHYU ~', 0, 0);

  ctx.font = "14px 'Patrick Hand SC', cursive";
  ctx.fillStyle = '#6e4522';
  ctx.fillText('Anno 2026 · Seven Seas of Code', 0, 26);

  ctx.restore();
}

function renderTreasureMap() {
  mapCanvas.width = W * dpr;
  mapCanvas.height = H * dpr;
  mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Warm rich antique parchment background
  const bgGrad = mapCtx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.15, W * 0.5, H * 0.5, Math.max(W, H) * 0.85);
  bgGrad.addColorStop(0, '#f5e4c6');
  bgGrad.addColorStop(0.5, '#ebd0a2');
  bgGrad.addColorStop(0.85, '#d6b37a');
  bgGrad.addColorStop(1, '#a88144');
  mapCtx.fillStyle = bgGrad;
  mapCtx.fillRect(0, 0, W, H);

  // Antique coffee & rum stain rings
  mapCtx.save();
  mapCtx.strokeStyle = 'rgba(120, 75, 25, 0.08)';
  mapCtx.lineWidth = 14;
  mapCtx.beginPath();
  mapCtx.arc(W * 0.28, H * 0.72, 75, 0, Math.PI * 2);
  mapCtx.stroke();
  mapCtx.lineWidth = 6;
  mapCtx.beginPath();
  mapCtx.arc(W * 0.74, H * 0.26, 90, 0, Math.PI * 2);
  mapCtx.stroke();
  mapCtx.restore();

  // Antique map border with coordinate ticks
  mapCtx.save();
  mapCtx.strokeStyle = '#523216';
  mapCtx.lineWidth = 3;
  mapCtx.strokeRect(18, 18, W - 36, H - 36);
  mapCtx.lineWidth = 1.2;
  mapCtx.strokeRect(24, 24, W - 48, H - 48);

  mapCtx.beginPath();
  for (let x = 40; x < W - 40; x += 40) {
    mapCtx.moveTo(x, 18); mapCtx.lineTo(x, 24);
    mapCtx.moveTo(x, H - 18); mapCtx.lineTo(x, H - 24);
  }
  for (let y = 40; y < H - 40; y += 40) {
    mapCtx.moveTo(18, y); mapCtx.lineTo(24, y);
    mapCtx.moveTo(W - 18, y); mapCtx.lineTo(W - 24, y);
  }
  mapCtx.stroke();
  mapCtx.restore();

  // Rhumb navigation lines (golden brown dashed rays)
  mapCtx.save();
  mapCtx.strokeStyle = 'rgba(130, 80, 32, 0.22)';
  mapCtx.lineWidth = 1.2;
  mapCtx.setLineDash([8, 14]);
  const rhumbHubs = [
    { x: W * 0.18, y: H * 0.25 },
    { x: W * 0.82, y: H * 0.72 },
    { x: W * 0.5, y: H * 0.88 }
  ];
  rhumbHubs.forEach(hub => {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      mapCtx.beginPath();
      mapCtx.moveTo(hub.x, hub.y);
      mapCtx.lineTo(hub.x + Math.cos(a) * Math.max(W, H), hub.y + Math.sin(a) * Math.max(W, H));
      mapCtx.stroke();
    }
  });
  mapCtx.restore();

  // 16-point Antique Compass Rose
  drawCompassRose(mapCtx, W * 0.18, H * 0.26, 68);

  // Treasure Island ("Skull Isle")
  drawTreasureIsland(mapCtx, W * 0.78, H * 0.68);

  // The Black Pearl Galleon
  drawGalleon(mapCtx, W * 0.28, H * 0.64);

  // Giant Sea Kraken
  drawKraken(mapCtx, W * 0.82, H * 0.26);

  // Decorative Title Banner
  drawMapTitleBanner(mapCtx, W * 0.5, 52);

  // Depth soundings & sea waves
  mapCtx.save();
  mapCtx.font = "14px 'Patrick Hand SC', cursive";
  mapCtx.fillStyle = 'rgba(90, 52, 22, 0.42)';
  const soundings = [
    { x: W * 0.42, y: H * 0.35, d: '18' },
    { x: W * 0.58, y: H * 0.28, d: '24' },
    { x: W * 0.38, y: H * 0.82, d: '14' },
    { x: W * 0.62, y: H * 0.84, d: '32' },
    { x: W * 0.12, y: H * 0.52, d: '8' },
    { x: W * 0.92, y: H * 0.52, d: '45' }
  ];
  soundings.forEach(s => mapCtx.fillText(`${s.d} fm`, s.x, s.y));

  // Sea wave crests
  mapCtx.strokeStyle = 'rgba(90, 52, 22, 0.25)';
  mapCtx.lineWidth = 1.8;
  const drawWave = (wx, wy) => {
    mapCtx.beginPath();
    mapCtx.arc(wx, wy, 16, Math.PI, 0);
    mapCtx.arc(wx + 32, wy, 16, Math.PI, 0);
    mapCtx.stroke();
  };
  drawWave(W * 0.46, H * 0.46);
  drawWave(W * 0.56, H * 0.74);
  drawWave(W * 0.12, H * 0.78);
  drawWave(W * 0.86, H * 0.86);
  mapCtx.restore();
}

function fit() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  for (const c of [under, mask]) { c.width = W * dpr; c.height = H * dpr; }
  renderTreasureMap();
}
fit();
addEventListener('resize', fit);

function drawSparkleStar(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx, cy, cx + size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + size);
  ctx.quadraticCurveTo(cx, cy, cx - size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - size);
  ctx.fill();
  ctx.restore();
}

function emitSparks(px, py, count = 2) {
  for (let k = 0; k < count; k++) {
    if (sparks.length > 95) sparks.shift();
    const isStar = Math.random() < 0.28;
    sparks.push({
      x: px + (Math.random() - 0.5) * 32,
      y: py + (Math.random() - 0.5) * 32,
      vx: (Math.random() - 0.5) * 2.6,
      vy: -(1.4 + Math.random() * 2.8),
      life: 1.0,
      decay: 0.018 + Math.random() * 0.022,
      size: isStar ? (3.5 + Math.random() * 3.5) : (2 + Math.random() * 3),
      isStar,
      ph: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? '#ffbe3b' : (Math.random() > 0.5 ? '#ffe985' : '#ff7a18')
    });
  }
}

// Organic feathered stamp onto mask canvas
function stampRevealMask(px, py) {
  mctx.save();
  mctx.setTransform(1, 0, 0, 1, 0, 0);
  mctx.globalCompositeOperation = 'source-over';

  const rad = 72 * dpr;
  const g = mctx.createRadialGradient(px * dpr, py * dpr, 0, px * dpr, py * dpr, rad);
  g.addColorStop(0, 'rgba(255, 255, 255, 1)');
  g.addColorStop(0.65, 'rgba(255, 255, 255, 0.96)');
  g.addColorStop(0.85, 'rgba(255, 255, 255, 0.42)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0)');
  mctx.fillStyle = g;
  mctx.beginPath();
  mctx.arc(px * dpr, py * dpr, rad, 0, Math.PI * 2);
  mctx.fill();

  // 2 subtle organic secondary stamps for natural feathered/torn edge
  for (let i = 0; i < 2; i++) {
    const ox = px + (Math.random() - 0.5) * 28;
    const oy = py + (Math.random() - 0.5) * 28;
    const sRad = (rad * (0.6 + Math.random() * 0.3));
    const sg = mctx.createRadialGradient(ox * dpr, oy * dpr, 0, ox * dpr, oy * dpr, sRad);
    sg.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    sg.addColorStop(1, 'rgba(255, 255, 255, 0)');
    mctx.fillStyle = sg;
    mctx.beginPath();
    mctx.arc(ox * dpr, oy * dpr, sRad, 0, Math.PI * 2);
    mctx.fill();
  }

  mctx.restore();
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
  if (isRightRevealing) {
    // Keep ambient embers and subtle pulse at cursor
    emitSparks(curRevX, curRevY, 1);
  } else {
    fadeFrames--;
    mctx.save();
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.globalCompositeOperation = 'destination-out';
    mctx.fillStyle = 'rgba(0, 0, 0, 0.048)';
    mctx.fillRect(0, 0, mask.width, mask.height);
    mctx.restore();
  }

  // 1. Draw base antique treasure map onto uctx
  uctx.setTransform(1, 0, 0, 1, 0, 0);
  uctx.globalCompositeOperation = 'source-over';
  uctx.clearRect(0, 0, W * dpr, H * dpr);
  uctx.drawImage(mapCanvas, 0, 0);

  // 2. Draw skull & "still me →" at medal position
  uctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawSkull(now);
  stillMe();

  // 3. Mask out non-revealed regions with mask canvas
  uctx.setTransform(1, 0, 0, 1, 0, 0);
  uctx.globalCompositeOperation = 'destination-in';
  uctx.drawImage(mask, 0, 0);

  // 4. Draw golden glow aura & flying sparks on top
  uctx.globalCompositeOperation = 'source-over';
  uctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (isRightRevealing) {
    const flare = uctx.createRadialGradient(curRevX, curRevY, 8, curRevX, curRevY, 85);
    flare.addColorStop(0, 'rgba(255, 220, 90, 0.45)');
    flare.addColorStop(0.4, 'rgba(255, 150, 30, 0.22)');
    flare.addColorStop(0.8, 'rgba(255, 80, 10, 0.06)');
    flare.addColorStop(1, 'rgba(255, 50, 0, 0)');
    uctx.fillStyle = flare;
    uctx.beginPath();
    uctx.arc(curRevX, curRevY, 85, 0, Math.PI * 2);
    uctx.fill();
  }

  // Draw floating golden sand particles and twinkle stars
  for (let i = sparks.length; i--;) {
    const s = sparks[i];
    if ((s.life -= s.decay) <= 0) { sparks.splice(i, 1); continue; }
    s.x += s.vx + Math.sin(now / 150 + s.ph) * 0.7;
    s.y += s.vy;
    const currentSize = s.size * (0.3 + s.life * 0.7);
    uctx.save();
    uctx.globalAlpha = Math.min(1, s.life * 1.2);
    if (s.isStar) {
      drawSparkleStar(uctx, s.x, s.y, currentSize, s.color);
    } else {
      uctx.fillStyle = s.color;
      uctx.shadowColor = s.color;
      uctx.shadowBlur = 6;
      uctx.beginPath();
      uctx.arc(s.x, s.y, currentSize, 0, Math.PI * 2);
      uctx.fill();
    }
    uctx.restore();
  }

  const shouldContinue = isRightRevealing || fadeFrames > 0 || sparks.length > 0;
  if (shouldContinue) {
    requestAnimationFrame(underworld);
  } else {
    mctx.clearRect(0, 0, mask.width, mask.height);
    uctx.clearRect(0, 0, W * dpr, H * dpr);
    isRevealingActive = false;
  }
}

// Right-Click Reveal Trigger & Gestures
addEventListener('pointerdown', e => {
  if (e.button !== 2 || location.hash === '#about') return;
  if (e.target.closest('.panel, .sign')) return;

  isRightRevealing = true;
  curRevX = lastRevX = e.clientX;
  curRevY = lastRevY = e.clientY;
  fadeFrames = FADE_TOTAL;

  stampRevealMask(curRevX, curRevY);
  emitSparks(curRevX, curRevY, 6);

  if (cursor) cursor.classList.add('revealing');

  if (!isRevealingActive) {
    isRevealingActive = true;
    requestAnimationFrame(underworld);
  }
});

addEventListener('pointermove', e => {
  if (!isRightRevealing) return;

  const dx = e.clientX - lastRevX;
  const dy = e.clientY - lastRevY;
  const dist = Math.hypot(dx, dy);
  const step = Math.max(1, Math.ceil(dist / 10));

  for (let k = 1; k <= step; k++) {
    const interX = lastRevX + dx * (k / step);
    const interY = lastRevY + dy * (k / step);
    stampRevealMask(interX, interY);
  }

  emitSparks(e.clientX, e.clientY, 2);
  curRevX = lastRevX = e.clientX;
  curRevY = lastRevY = e.clientY;
}, { passive: true });

for (const type of ['pointerup', 'pointercancel', 'blur']) {
  addEventListener(type, e => {
    if (e && e.button !== undefined && e.button !== 2 && type === 'pointerup') return;
    if (isRightRevealing) {
      isRightRevealing = false;
      lastRevX = null;
      lastRevY = null;
      if (cursor) cursor.classList.remove('revealing');
    }
  });
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

  // Pointer Down: Grab 3D coin/dice on left click, playful spin flick on right click
  addEventListener('pointerdown', e => {
    if (e.target.closest('#head, #pull, .about, a, button')) return;

    raycaster.setFromCamera(mouse3d, camera);
    const intersects = raycaster.intersectObjects(artifacts.map(a => a.mesh), false);

    if (intersects.length > 0) {
      const hit = artifacts.find(a => a.mesh === intersects[0].object);
      if (hit) {
        if (e.button === 2) {
          // Right-click on 3D loot: give it a playful spin flick and jump!
          hit.spinImpulse.x += (Math.random() - 0.5) * 0.9 + 0.35;
          hit.spinImpulse.y += (Math.random() - 0.5) * 0.9 + 0.45;
          hit.springVel.z += 1.4;
          return;
        }
        if (e.button === 0) {
          grabbedArtifact = hit;
          hit.isGrabbed = true;
          window.__threeGrabbed = true;

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

    // Check hover state and expose to underworld
    raycaster.setFromCamera(mouse3d, camera);
    const intersects = raycaster.intersectObjects(artifacts.map(a => a.mesh), false);
    const hoveredMesh = intersects.length > 0 ? intersects[0].object : null;
    window.__threeHovered = !!hoveredMesh;

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

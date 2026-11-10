'use strict';
/* Effekt-Engine: jede Aura besteht aus Ebenen (Layers). Alles hängt nur von der Zeit t ab (kein Zustand),
   darum sehen Vorschaubilder, Bühne und Kino gleich aus. Koordinaten: g = {cx, cy, R, W, H, u (=R/100), q (Qualität), seed, av} */
(function () {
  const SPR = {};
  function glowSprite(col) {
    if (SPR[col]) return SPR[col];
    const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
    const c = cv.getContext('2d'), g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.16, col); g.addColorStop(0.5, hexA(col, 0.3)); g.addColorStop(1, hexA(col, 0));
    c.fillStyle = g; c.fillRect(0, 0, s, s);
    return (SPR[col] = cv);
  }
  function dot(c, x, y, s, col, a) { c.globalAlpha = a; c.drawImage(glowSprite(col), x - s, y - s, s * 2, s * 2); }
  function mixQ(a, b, t) { return mixHex(a, b, Math.round(clamp(t, 0, 1) * 6) / 6); }
  function rainbowAt(hh) { return hsl(Math.floor(hh * 18) * 20, 85, 64); }
  function col(pal, p, k, def) { return pal[p[k] != null ? p[k] : def]; }

  /* ---------- Teilchen-Formen ---------- */
  function shapeDraw(c, shape, x, y, s, rot, color, a, i, p) {
    switch (shape) {
      case 'star': dot(c, x, y, s * 1.6, color, a * 0.5); c.globalAlpha = a; c.fillStyle = '#fff';
        c.save(); c.translate(x, y); c.rotate(rot * 0.3); c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(0, 0, s, 0); c.quadraticCurveTo(0, 0, 0, s); c.quadraticCurveTo(0, 0, -s, 0); c.quadraticCurveTo(0, 0, 0, -s); c.fill(); c.restore(); break;
      case 'heart': c.globalAlpha = a; c.fillStyle = color; c.save(); c.translate(x, y); c.rotate(Math.sin(rot) * 0.3); c.beginPath(); c.moveTo(0, s * 0.8); c.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.7, -s, 0, -s * 0.3); c.bezierCurveTo(s * 0.7, -s, s * 1.4, -s * 0.1, 0, s * 0.8); c.fill(); c.restore(); break;
      case 'petal': c.globalAlpha = a; c.fillStyle = color; c.beginPath(); c.ellipse(x, y, s, s * 0.52, rot, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(x - s * 0.2, y - s * 0.1, s * 0.5, s * 0.2, rot, 0, TAU); c.fill(); break;
      case 'feather': c.globalAlpha = a; c.fillStyle = color; c.beginPath(); c.ellipse(x, y, s * 1.5, s * 0.5, rot, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - Math.cos(rot) * s * 1.5, y - Math.sin(rot) * s * 1.5); c.lineTo(x + Math.cos(rot) * s * 1.5, y + Math.sin(rot) * s * 1.5); c.stroke(); break;
      case 'snow': c.globalAlpha = a; c.strokeStyle = color; c.lineWidth = Math.max(1, s * 0.25); c.beginPath(); for (let k = 0; k < 3; k++) { const an = rot + (k * Math.PI) / 3; c.moveTo(x + Math.cos(an) * s, y + Math.sin(an) * s); c.lineTo(x - Math.cos(an) * s, y - Math.sin(an) * s); } c.stroke(); break;
      case 'rain': c.globalAlpha = a * 0.8; c.strokeStyle = color; c.lineWidth = Math.max(1, s * 0.2); c.beginPath(); c.moveTo(x, y); c.lineTo(x - s * 0.7, y + s * 3); c.stroke(); break;
      case 'bubble': c.globalAlpha = a * 0.8; c.strokeStyle = color; c.lineWidth = Math.max(1, s * 0.2); c.beginPath(); c.arc(x, y, s, 0, TAU); c.stroke(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x - s * 0.35, y - s * 0.35, s * 0.2, 0, TAU); c.fill(); break;
      case 'glyph': { c.globalAlpha = a; c.fillStyle = color; c.font = '700 ' + Math.round(s * 1.6) + 'px ui-rounded,system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; const tx = p && p.text ? p.text : '?'; c.save(); c.translate(x, y); c.rotate(Math.sin(rot) * 0.3); c.fillText(tx.length > 1 ? tx : tx, 0, 0); c.restore(); break; }
      case 'coin': { c.globalAlpha = a; c.save(); c.translate(x, y); c.scale(Math.abs(Math.cos(rot * 1.5)) * 0.8 + 0.2, 1);
        const g = c.createLinearGradient(-s, -s, s, s); g.addColorStop(0, '#fff2a8'); g.addColorStop(1, '#d9a020'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, s, 0, TAU); c.fill(); c.strokeStyle = '#a06a10'; c.lineWidth = s * 0.15; c.stroke(); c.beginPath(); c.arc(0, 0, s * 0.6, 0, TAU); c.stroke(); c.restore(); break; }
      case 'sprinkle': c.globalAlpha = a; c.fillStyle = color; c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); c.roundRect ? c.roundRect(-s, -s * 0.3, s * 2, s * 0.6, s * 0.3) : c.rect(-s, -s * 0.3, s * 2, s * 0.6); c.fill(); c.restore(); break;
      case 'ember': dot(c, x, y, s * 1.5, color, a); break;
      default: dot(c, x, y, s * 1.4, color, a);
    }
  }

  /* ---------- Ebenen ---------- */
  const L = {};
  L.glow = (c, g, p, t, pal) => {
    const r = g.R * (p.r || 1) * (1 + Math.sin(t * (p.pulse || 1.5)) * 0.04), co = col(pal, p, 'c', 2), y = g.cy + (p.y || 0) * g.R;
    const gr = c.createRadialGradient(g.cx, y, 0, g.cx, y, r);
    const a = p.a == null ? 0.4 : p.a; gr.addColorStop(0, hexA(co, a)); gr.addColorStop(0.5, hexA(co, a * 0.4)); gr.addColorStop(1, hexA(co, 0));
    c.fillStyle = gr; c.fillRect(g.cx - r, y - r, r * 2, r * 2);
  };
  L.rays = (c, g, p, t, pal) => {
    const n = p.n || 12, len = (p.len || 1.6) * g.R, w = p.w || 0.5, rot = t * (p.speed == null ? 0.2 : p.speed) + (p._i || 0), co = col(pal, p, 'c', 2);
    const gr = c.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, len);
    gr.addColorStop(0, hexA(co, p.a == null ? 0.5 : p.a)); gr.addColorStop(1, hexA(co, 0)); c.fillStyle = gr; c.beginPath();
    for (let i = 0; i < n; i++) { const a0 = rot + (i * TAU) / n; c.moveTo(g.cx, g.cy); c.arc(g.cx, g.cy, len, a0, a0 + (TAU / n) * w); c.closePath(); }
    c.fill();
  };
  L.beams = (c, g, p, t, pal) => {
    const n = p.n || 8, len = (p.len || 2.2) * g.R, rot = t * (p.speed == null ? 0.15 : p.speed);
    for (let i = 0; i < n; i++) {
      const co = p.rainbow ? rainbowAt(i / n + t * 0.03) : pal[i % 2 ? (p.c2 != null ? p.c2 : 3) : (p.c != null ? p.c : 2)];
      const a0 = rot + (i * TAU) / n, gr = c.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, len);
      gr.addColorStop(0, hexA(co, p.a == null ? 0.25 : p.a)); gr.addColorStop(1, hexA(co, 0)); c.fillStyle = gr;
      c.beginPath(); c.moveTo(g.cx, g.cy); c.arc(g.cx, g.cy, len, a0, a0 + (TAU / n) * 0.62); c.closePath(); c.fill();
    }
  };
  L.burst = (c, g, p, t, pal) => {
    const n = Math.ceil((p.n || 30) * g.q), co = col(pal, p, 'c', 2); c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU + hash(i + g.seed) * 0.3, f = fract(t * (p.speed || 0.5) + hash(i * 3 + g.seed)), r0 = g.R * (0.5 + f * (p.len || 2));
      c.strokeStyle = hexA(co, (1 - f) * (p.a == null ? 0.5 : p.a)); c.lineWidth = g.u * (1 + hash(i) * 1.5);
      c.beginPath(); c.moveTo(g.cx + Math.cos(ang) * r0, g.cy + Math.sin(ang) * r0); c.lineTo(g.cx + Math.cos(ang) * (r0 + g.R * 0.35 * (1 - f * 0.5)), g.cy + Math.sin(ang) * (r0 + g.R * 0.35 * (1 - f * 0.5))); c.stroke();
    }
  };
  L.rings = (c, g, p, t, pal) => {
    const n = p.n || 3, sq = p.squash || 1, y = g.cy + (p.y || 0) * g.R;
    for (let i = 0; i < n; i++) {
      const f = fract(t * (p.speed == null ? 0.3 : p.speed) + i / n), r = g.R * (0.3 + f * (p.max || 1.6));
      c.strokeStyle = hexA(p.rainbow ? rainbowAt(i / n + t * 0.05) : col(pal, p, 'c', 2), (f < 0 ? 1 - ((f % 1) + 1) % 1 : 1 - f) * (p.a == null ? 0.6 : p.a));
      c.lineWidth = ((p.lw || 3) * (1 - f) + 1) * g.u * 0.7; c.beginPath(); c.ellipse(g.cx, y, r, r * sq, 0, 0, TAU); c.stroke();
    }
  };
  L.shock = (c, g, p, t, pal) => {
    const f = fract(t / (p.period || 3)), co = col(pal, p, 'c', 2), r = g.R * (0.2 + easeOut(f) * 3.4);
    const gr = c.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.R * 1.6); const fl = Math.pow(1 - f, 3) * (p.a == null ? 0.9 : p.a);
    gr.addColorStop(0, hexA('#ffffff', fl)); gr.addColorStop(0.4, hexA(co, fl * 0.6)); gr.addColorStop(1, hexA(co, 0)); c.fillStyle = gr; c.fillRect(g.cx - g.R * 1.6, g.cy - g.R * 1.6, g.R * 3.2, g.R * 3.2);
    c.strokeStyle = hexA(mixQ(co, pal[p.c2 != null ? p.c2 : 4], f), (1 - f) * 0.9); c.lineWidth = (1 - f) * 16 * g.u + 1; c.beginPath(); c.arc(g.cx, g.cy, r, 0, TAU); c.stroke();
    c.lineWidth = (1 - f) * 5 * g.u + 0.5; c.strokeStyle = hexA('#ffffff', (1 - f) * 0.8); c.beginPath(); c.arc(g.cx, g.cy, r * 0.93, 0, TAU); c.stroke();
  };
  L.orbit = (c, g, p, t, pal) => {
    const n = Math.ceil((p.n || 6) * Math.min(1, g.q + 0.2)), rx = (p.rx || 1) * g.R, ry = (p.ry || 0.4) * g.R, tilt = p.tilt || 0, sp = p.speed || 0.5, tr = p.trail || 5, co = col(pal, p, 'c', 3);
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < n; i++) {
      const vr = 0.85 + hash(i * 2.3 + g.seed) * 0.3, base = (i / n) * TAU + t * sp * (0.8 + hash(i + 5) * 0.4);
      for (let k = 0; k < tr; k++) {
        const an = base - k * 0.09, x = Math.cos(an) * rx * vr, y = Math.sin(an) * ry * vr;
        dot(c, g.cx + x * ct - y * st, g.cy + x * st + y * ct, (p.size || 6) * g.u * (1 - k / tr) * 0.9, co, (1 - k / tr) * 0.9);
      }
    }
  };
  L.rise = (c, g, p, t, pal) => {
    const n = Math.max(2, Math.ceil((p.n || 20) * g.q)), spd = p.speed || 0.2, sh = p.shape || 'dot', dir = p.dir == null ? -1 : p.dir, sz = (p.size || 5) * g.u, sw = p.sway || 0, av = g.av;
    c.textAlign = 'center';
    for (let i = 0; i < n; i++) {
      const s0 = g.seed * 31 + (p._i || 0) * 17 + i * 1.37, r1 = hash(s0), r2 = hash(s0 + 0.5), r3 = hash(s0 + 1.5), r4 = hash(s0 + 2.5);
      const f = fract(r1 + t * spd * (0.6 + 0.8 * r2));
      let x, y;
      if (p.radial) { const an = r3 * TAU, rr = f * g.R * (p.rmax || 2.4); x = g.cx + Math.cos(an) * rr; y = g.cy + Math.sin(an) * rr; }
      else if (p.suck) { const an = r3 * TAU + f * 5, rr = g.R * (2.5 * (1 - f) + 0.45); x = g.cx + Math.cos(an) * rr; y = g.cy + Math.sin(an) * rr * 0.55; }
      else if (p.focus) { const sp = (p.spread || 0.3) * g.R * 3; x = av.x + (r3 - 0.5) * sp * (1 - f * 0.65) + Math.sin(t * 2.3 + r4 * TAU) * sw * g.R * 0.06 * f; y = lerp(av.y + av.r * 0.95, av.y - g.R * 1.9, f); }
      else { x = g.cx + (r3 - 0.5) * (p.spread == null ? 1 : p.spread) * g.W + Math.sin(t * 1.3 + r4 * TAU) * sw * g.R * 0.1 * (0.4 + f); y = dir < 0 ? lerp(g.H * 1.06, -g.H * 0.06, f) : lerp(-g.H * 0.06, g.H * 1.06, f); }
      const al = Math.sin(Math.PI * f) * (p.a == null ? 1 : p.a);
      const color = p.rainbow ? rainbowAt(r4 + t * 0.04) : p.c2 != null ? mixQ(pal[p.c != null ? p.c : 3], pal[p.c2], f) : pal[p.c != null ? p.c : 3];
      const s = sz * (0.55 + r4 * 0.9) * (sh === 'ember' ? 1 - f * 0.5 : 1);
      shapeDraw(c, sh, x, y, s, t * (0.6 + r2) + r1 * TAU, color, al, i, p);
    }
  };
  L.spiral = (c, g, p, t, pal) => {
    const arms = p.arms || 3, n = Math.ceil((p.n || 80) * g.q), rr = (p.r || 1.5) * g.R, tw = p.twist || 5, rot = t * (p.speed || 0.2), c1 = col(pal, p, 'c', 2), c2 = col(pal, p, 'c2', 3);
    for (let a = 0; a < arms; a++) for (let j = 0; j < n; j++) {
      const u = (j + 1) / n, r = Math.pow(u, 0.75) * rr, th = (a * TAU) / arms + u * tw + rot, jit = (hash(a * 100 + j + g.seed) - 0.5) * g.R * 0.14 * u;
      dot(c, g.cx + Math.cos(th) * r + jit, g.cy + Math.sin(th) * r * (p.flat || 0.82) + jit, (p.size || 5) * g.u * (1.1 - u * 0.6) * (0.6 + hash(j * 3 + a) * 0.8), mixQ(c1, c2, u), (p.a == null ? 0.8 : p.a) * (1 - u * 0.35));
    }
    dot(c, g.cx, g.cy, g.R * 0.7, c1, 0.5);
  };
  L.stars = (c, g, p, t, pal) => {
    const n = Math.ceil((p.n || 60) * Math.min(1, g.q + 0.3)), co = col(pal, p, 'c', 4);
    for (let i = 0; i < n; i++) {
      const x = hash(i * 3.1 + g.seed) * g.W, y = hash(i * 7.7 + g.seed * 2) * g.H, tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + hash(i) * 1.6) + i));
      dot(c, x, y, (0.5 + hash(i * 1.9) * 1.6) * g.u * 2.2, co, tw * 0.9);
    }
  };
  L.lightning = (c, g, p, t, pal) => {
    const rate = p.rate || 2, co = col(pal, p, 'c', 2), nb = p.n || 2; c.lineCap = 'round'; c.lineJoin = 'round';
    for (let b = 0; b < nb; b++) {
      const tt = t * rate + b * 0.37, slot = Math.floor(tt), ph = tt - slot; if (ph > 0.4) continue;
      const al = (1 - ph / 0.4) * (p.a == null ? 0.9 : p.a), sd = slot * 13.7 + b * 5.1 + g.seed;
      let x0, y0, x1, y1;
      if (p.from === 'center') { const an = hash(sd) * TAU; x0 = g.cx; y0 = g.cy; x1 = g.cx + Math.cos(an) * g.R * 2.3; y1 = g.cy + Math.sin(an) * g.R * 2.3; }
      else { x0 = g.cx + (hash(sd) - 0.5) * g.W * 0.9; y0 = -10; x1 = g.cx + (hash(sd + 1) - 0.5) * g.R * 1.6; y1 = g.cy + g.R * 0.6 + hash(sd + 2) * g.R * 0.4; }
      const seg = 12, pts = [], dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
      for (let i = 0; i <= seg; i++) { const f = i / seg, j = (hash(sd + i * 1.7) - 0.5) * g.R * 0.45 * Math.sin(Math.PI * f) * 1.2; pts.push([x0 + dx * f + nx * j, y0 + dy * f + ny * j]); }
      const pass = [[10, hexA(co, al * 0.22)], [4, hexA(co, al * 0.7)], [1.6, hexA('#ffffff', al)]];
      pass.forEach((ps) => { c.strokeStyle = ps[1]; c.lineWidth = ps[0] * g.u * 0.8 * (p.w || 1); c.beginPath(); pts.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](q[0], q[1])); c.stroke(); });
    }
    c.globalAlpha = 1;
  };
  L.aurora = (c, g, p, t, pal) => {
    const n = p.n || 3, y0 = g.H * (p.y == null ? 0.2 : p.y), hh = g.H * (p.h || 0.35), step = Math.max(8, g.W / 60);
    for (let k = 0; k < n; k++) {
      const co = pal[[p.c, p.c2, p.c3][k % 3] != null ? [p.c, p.c2, p.c3][k % 3] : 2];
      const gr = c.createLinearGradient(0, y0 - hh * 0.2, 0, y0 + hh * 1.4); gr.addColorStop(0, hexA(co, 0)); gr.addColorStop(0.25, hexA(co, p.a == null ? 0.5 : p.a)); gr.addColorStop(1, hexA(co, 0));
      c.fillStyle = gr; c.beginPath(); const tops = [];
      for (let x = 0; x <= g.W + step; x += step) { const yy = y0 + k * hh * 0.18 + Math.sin(x * 0.011 + t * 0.5 + k * 2) * g.H * 0.05 + Math.sin(x * 0.027 - t * 0.31 + k) * g.H * 0.03; tops.push([x, yy]); c[x ? 'lineTo' : 'moveTo'](x, yy); }
      for (let x = g.W + step; x >= 0; x -= step) { const hgt = hh * (0.75 + 0.35 * Math.sin(x * 0.02 + t * 0.9 + k * 1.3)); c.lineTo(x, y0 + k * hh * 0.18 + hgt + Math.sin(x * 0.011 + t * 0.5 + k * 2) * g.H * 0.05); }
      c.closePath(); c.fill();
      c.strokeStyle = hexA(co, (p.a == null ? 0.5 : p.a) * 0.4); c.lineWidth = 1.2 * g.u;
      c.beginPath(); tops.forEach((q, i) => { if (i % 2 === 0) { c.moveTo(q[0], q[1]); c.lineTo(q[0], q[1] + hh * (0.55 + 0.4 * Math.sin(q[0] * 0.03 + t + k))); } }); c.stroke();
    }
  };
  L.waves = (c, g, p, t, pal) => {
    const n = p.n || 3, step = Math.max(6, g.W / 70);
    for (let k = 0; k < n; k++) {
      const y0 = g.H * (p.y == null ? 0.72 : p.y) + k * g.H * 0.05, co = mixQ(col(pal, p, 'c', 2), col(pal, p, 'c2', 3), k / Math.max(1, n - 1));
      const gr = c.createLinearGradient(0, y0 - g.H * 0.05, 0, g.H); gr.addColorStop(0, hexA(co, p.a == null ? 0.5 : p.a)); gr.addColorStop(1, hexA(co, 0.05)); c.fillStyle = gr;
      c.beginPath(); c.moveTo(0, g.H);
      for (let x = 0; x <= g.W + step; x += step) c.lineTo(x, y0 + Math.sin(x * 0.012 * (1 + 0.2 * k) + t * (p.speed || 1) + k * 1.7) * g.H * (p.amp || 0.04));
      c.lineTo(g.W, g.H); c.closePath(); c.fill();
    }
  };
  L.blackhole = (c, g, p, t, pal) => {
    const r = g.R * (p.r || 0.6), c1 = col(pal, p, 'c', 2), c2 = col(pal, p, 'c2', 3), y = g.cy - g.R * 0.35;
    c.save(); c.translate(g.cx, y); c.rotate(-0.28);
    for (let k = 0; k < 26; k++) {
      const u = k / 26, rx = r * (1.15 + u * 1.1); c.strokeStyle = hexA(mixQ(c1, c2, u), (1 - u) * 0.28); c.lineWidth = g.u * 3.2; c.beginPath(); c.ellipse(0, 0, rx, rx * 0.26, 0, 0, TAU); c.stroke();
    }
    for (let i = 0; i < 26; i++) { const rx = r * (1.15 + hash(i + g.seed) * 1.0), an = t * (2.2 / Math.pow(rx / r, 1.5)) + hash(i * 3) * TAU; dot(c, Math.cos(an) * rx, Math.sin(an) * rx * 0.26, g.u * (3 + hash(i) * 4), mixQ(c1, '#ffffff', hash(i + 9) * 0.7), 0.9); }
    c.restore();
    c.globalCompositeOperation = 'source-over';
    const gr = c.createRadialGradient(g.cx, y, r * 0.7, g.cx, y, r * 1.12); gr.addColorStop(0, '#000'); gr.addColorStop(0.82, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.beginPath(); c.arc(g.cx, y, r * 1.12, 0, TAU); c.fill();
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = hexA('#ffffff', 0.85); c.lineWidth = g.u * 2.4; c.beginPath(); c.arc(g.cx, y, r * 1.02, 0, TAU); c.stroke();
    c.strokeStyle = hexA(c1, 0.35); c.lineWidth = g.u * 7; c.beginPath(); c.arc(g.cx, y, r * 1.06, 0, TAU); c.stroke();
    c.save(); c.translate(g.cx, y); c.rotate(-0.28); c.strokeStyle = hexA(mixQ(c1, '#ffffff', 0.4), 0.9); c.lineWidth = g.u * 3; c.beginPath(); c.ellipse(0, 0, r * 1.5, r * 0.4, 0, Math.PI * 1.02, Math.PI * 1.98); c.stroke(); c.restore();
  };
  L.mandala = (c, g, p, t, pal) => {
    const n = p.n || 8, lay = p.layers || 2, c1 = col(pal, p, 'c', 2), c2 = col(pal, p, 'c2', 3);
    for (let l = 0; l < lay; l++) {
      const len = g.R * (p.r || 1.2) * (1 - l * 0.2), w = len * 0.22, rot = t * (p.speed || 0.05) * (l % 2 ? -1 : 1) + l * 0.3;
      for (let i = 0; i < n; i++) {
        c.save(); c.translate(g.cx, g.cy); c.rotate(rot + (i * TAU) / n);
        const gr = c.createLinearGradient(0, 0, 0, -len); gr.addColorStop(0, hexA(c1, 0)); gr.addColorStop(0.5, hexA(mixQ(c1, c2, l / lay), p.a == null ? 0.25 : p.a)); gr.addColorStop(1, hexA(c2, (p.a == null ? 0.25 : p.a) * 1.4));
        c.fillStyle = gr; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(w, -len * 0.5, 0, -len); c.quadraticCurveTo(-w, -len * 0.5, 0, 0); c.fill();
        c.strokeStyle = hexA(c2, 0.35); c.lineWidth = g.u * 0.9; c.stroke(); c.restore();
      }
    }
  };
  L.polys = (c, g, p, t, pal) => {
    const list = p.n || [3, 6], co = col(pal, p, 'c', 2); c.lineJoin = 'round';
    list.forEach((sd, i) => {
      const r = g.R * (0.65 + i * 0.22), rot = t * (p.speed || 0.15) * (i % 2 ? -1 : 1) + i;
      for (const [w, a] of [[(p.lw || 2) * 3.2, 0.18], [p.lw || 2, 0.85]]) {
        c.strokeStyle = hexA(p.rainbow ? rainbowAt(i / list.length + t * 0.05) : co, a * (p.a == null ? 0.7 : p.a)); c.lineWidth = w * g.u * 0.6; c.beginPath();
        for (let k = 0; k <= sd; k++) { const an = rot + (k * TAU) / sd; c[k ? 'lineTo' : 'moveTo'](g.cx + Math.cos(an) * r, g.cy + Math.sin(an) * r); } c.stroke();
      }
    });
  };
  L.crystal = (c, g, p, t, pal) => {
    const n = p.n || 6, len = g.R * (p.r || 1), c1 = col(pal, p, 'c', 2), c2 = col(pal, p, 'c2', 4), rot = t * (p.speed || 0.06); c.lineCap = 'round';
    for (const [w, co, a] of [[5, c1, 0.3], [1.8, c2, 0.95]]) {
      c.strokeStyle = hexA(co, a * (p.a == null ? 0.7 : p.a)); c.lineWidth = w * g.u * 0.7; c.beginPath();
      for (let i = 0; i < n; i++) {
        const an = rot + (i * TAU) / n, ca = Math.cos(an), sa = Math.sin(an);
        c.moveTo(g.cx, g.cy); c.lineTo(g.cx + ca * len, g.cy + sa * len);
        [[0.42, 0.34], [0.68, 0.24]].forEach((b) => { const bx = g.cx + ca * len * b[0], by = g.cy + sa * len * b[0]; [-1, 1].forEach((s) => { const ba = an + s * 1.0; c.moveTo(bx, by); c.lineTo(bx + Math.cos(ba) * len * b[1], by + Math.sin(ba) * len * b[1]); }); });
      }
      c.stroke();
    }
  };
  L.eye = (c, g, p, t, pal) => {
    const cx = g.cx, cy = g.cy - g.R * 0.3, w = g.R * (p.r || 1.3), bl = Math.max(0.08, 1 - Math.pow(Math.max(0, 1 - Math.abs(fract(t / 6.5) - 0.5) * 22), 1)), hh = w * 0.62 * Math.min(1, bl + 0.0);
    const c1 = col(pal, p, 'c', 2), c2 = col(pal, p, 'c2', 3), c3 = col(pal, p, 'c3', 4);
    c.save(); c.beginPath(); c.moveTo(cx - w, cy); c.quadraticCurveTo(cx, cy - hh * 1.9, cx + w, cy); c.quadraticCurveTo(cx, cy + hh * 1.9, cx - w, cy); c.closePath(); c.clip();
    c.globalCompositeOperation = 'source-over'; const bg = c.createRadialGradient(cx, cy, 0, cx, cy, w); bg.addColorStop(0, '#0b1230'); bg.addColorStop(1, '#02040d'); c.fillStyle = bg; c.fillRect(cx - w, cy - w, w * 2, w * 2);
    const ix = cx + Math.sin(t * 0.4) * w * 0.12, iy = cy + Math.cos(t * 0.31) * hh * 0.1, ir = hh * 0.95;
    const ig = c.createRadialGradient(ix, iy, ir * 0.2, ix, iy, ir); ig.addColorStop(0, hexA(c3, 1)); ig.addColorStop(0.5, hexA(c2, 1)); ig.addColorStop(1, hexA(c1, 1)); c.fillStyle = ig; c.beginPath(); c.arc(ix, iy, ir, 0, TAU); c.fill();
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = hexA('#ffffff', 0.25); c.lineWidth = g.u * 0.8; c.beginPath(); for (let i = 0; i < 48; i++) { const an = (i / 48) * TAU + t * 0.05; c.moveTo(ix + Math.cos(an) * ir * 0.32, iy + Math.sin(an) * ir * 0.32); c.lineTo(ix + Math.cos(an) * ir * (0.8 + hash(i) * 0.2), iy + Math.sin(an) * ir * (0.8 + hash(i) * 0.2)); } c.stroke();
    c.globalCompositeOperation = 'source-over'; c.fillStyle = '#000'; c.beginPath(); c.ellipse(ix, iy, ir * 0.2, ir * (0.34 + Math.sin(t) * 0.03), 0, 0, TAU); c.fill();
    c.globalCompositeOperation = 'lighter'; dot(c, ix - ir * 0.3, iy - ir * 0.35, ir * 0.18, '#ffffff', 0.9); c.restore();
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = hexA(c1, 0.9); c.lineWidth = g.u * 3; c.beginPath(); c.moveTo(cx - w, cy); c.quadraticCurveTo(cx, cy - hh * 1.9, cx + w, cy); c.quadraticCurveTo(cx, cy + hh * 1.9, cx - w, cy); c.stroke();
    c.strokeStyle = hexA(c1, 0.25); c.lineWidth = g.u * 10; c.stroke();
  };
  L.wings = (c, g, p, t, pal) => {
    const av = g.av, c1 = col(pal, p, 'c', 2), c2 = col(pal, p, 'c2', 3), span = (p.span || 1.8) * g.R, fl = Math.sin(t * (p.flap || 1) * 2.2) * 0.16, nf = 8;
    [-1, 1].forEach((s) => {
      for (let k = 0; k < nf; k++) {
        const fr = k / (nf - 1), ang = -0.35 + fr * 1.55 + fl * (0.4 + fr), len = span * (1 - fr * 0.42) * (0.92 + 0.08 * Math.sin(t * 3 + k + (p.style === 'fire' ? 5 : 0))), wdt = len * 0.15;
        c.save(); c.translate(av.x + s * av.r * 0.7, av.y - av.r * 0.15); c.scale(s, 1); c.rotate(-ang);
        const gr = c.createLinearGradient(0, 0, len, 0);
        if (p.style === 'fire') { gr.addColorStop(0, hexA(c2, 0.9)); gr.addColorStop(0.55, hexA(c1, 0.7)); gr.addColorStop(1, hexA(c1, 0)); }
        else { gr.addColorStop(0, hexA('#ffffff', 0.95 * (p.a || 1))); gr.addColorStop(0.7, hexA(c1, 0.55)); gr.addColorStop(1, hexA(c2, 0)); }
        c.fillStyle = gr; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.45, -wdt * 1.3, len, 0); c.quadraticCurveTo(len * 0.45, wdt * 1.1, 0, 0); c.fill();
        c.strokeStyle = hexA(c1, 0.5); c.lineWidth = g.u * 1; c.stroke(); c.restore();
      }
    });
  };
  L.clock = (c, g, p, t, pal) => {
    const co = col(pal, p, 'c', 3), r = g.R * (p.r || 1.2), a = p.a == null ? 0.5 : p.a;
    c.strokeStyle = hexA(co, a); c.lineWidth = g.u * 2.2; c.beginPath(); c.arc(g.cx, g.cy, r, 0, TAU); c.stroke(); c.lineWidth = g.u * 1; c.beginPath(); c.arc(g.cx, g.cy, r * 0.92, 0, TAU); c.stroke();
    c.beginPath(); for (let i = 0; i < 12; i++) { const an = (i / 12) * TAU; c.moveTo(g.cx + Math.cos(an) * r * 0.92, g.cy + Math.sin(an) * r * 0.92); c.lineTo(g.cx + Math.cos(an) * r * (i % 3 ? 0.84 : 0.78), g.cy + Math.sin(an) * r * (i % 3 ? 0.84 : 0.78)); } c.lineWidth = g.u * 1.8; c.stroke();
    if (p.hands) { c.lineWidth = g.u * 3; c.lineCap = 'round'; [[t * 1.2, 0.72], [t * 0.1, 0.5]].forEach((h) => { c.beginPath(); c.moveTo(g.cx, g.cy); c.lineTo(g.cx + Math.sin(h[0]) * r * h[1], g.cy - Math.cos(h[0]) * r * h[1]); c.stroke(); }); }
    const gears = [[-1.05, 0.25, 0.4, 10, 1], [1.0, 0.2, 0.34, 9, -1], [0.1, 1.05, 0.3, 8, 1], [-0.7, -0.85, 0.26, 8, -1]].slice(0, p.gears || 0);
    gears.forEach((q, i) => {
      const gx = g.cx + q[0] * g.R, gy = g.cy + q[1] * g.R, gr = q[2] * g.R, tn = q[3], rot = t * 0.5 * q[4] + i; c.beginPath();
      for (let k = 0; k < tn * 2; k++) { const an = rot + (k / (tn * 2)) * TAU, rr = k % 2 ? gr * 0.82 : gr; c[k ? 'lineTo' : 'moveTo'](gx + Math.cos(an) * rr, gy + Math.sin(an) * rr); }
      c.closePath(); c.fillStyle = hexA(co, a * 0.18); c.fill(); c.strokeStyle = hexA(co, a); c.lineWidth = g.u * 1.6; c.stroke(); c.beginPath(); c.arc(gx, gy, gr * 0.3, 0, TAU); c.stroke();
    });
  };
  L.matrix = (c, g, p, t, pal) => {
    const n = Math.ceil((p.n || 24) * Math.min(1, g.q + 0.25)), co = col(pal, p, 'c', 2), fs = Math.max(10, 13 * g.u), chars = 'DERP01<>/|=+*#$%ABX';
    c.font = '700 ' + fs + 'px ui-monospace,Menlo,monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * g.W, hd = fract(hash(i * 1.7 + g.seed) + t * (0.12 + hash(i) * 0.2)) * (g.H + fs * 12);
      for (let j = 0; j < 11; j++) {
        const y = hd - j * fs * 1.15; if (y < -fs || y > g.H + fs) continue;
        const ch = chars[Math.floor(hash(Math.floor(t * 5 + j * 0.3) * 1.3 + i * 7 + j) * chars.length)];
        c.globalAlpha = j === 0 ? 1 : (1 - j / 11) * (p.a == null ? 0.8 : p.a); c.fillStyle = j === 0 ? '#ffffff' : co; c.fillText(ch, x, y);
      }
    }
  };
  L.glitch = (c, g, p, t, pal) => {
    const rate = p.rate || 6, slot = Math.floor(t * rate), nb = Math.ceil(7 * g.q + 2);
    for (let i = 0; i < nb; i++) {
      const sd = slot * 3.3 + i * 11.1 + g.seed, w = g.W * (0.08 + hash(sd) * 0.5), x = hash(sd + 1) * g.W - w * 0.2, y = hash(sd + 2) * g.H, hh = g.u * (1.5 + hash(sd + 3) * 10);
      c.fillStyle = hexA(hash(sd + 4) > 0.5 ? col(pal, p, 'c', 2) : col(pal, p, 'c2', 3), (p.a == null ? 0.4 : p.a) * hash(sd + 5)); c.fillRect(x, y, w, hh);
    }
  };
  L.scan = (c, g, p, t) => {
    c.fillStyle = 'rgba(0,0,0,' + (p.a == null ? 0.2 : p.a) + ')'; const st = Math.max(3, Math.round(3 * g.u)); c.beginPath();
    for (let y = (t * 20) % (st * 2); y < g.H; y += st * 2) c.rect(0, y, g.W, st * 0.7);
    c.fill();
  };
  L.text404 = (c, g, p, t, pal) => {
    const fs = g.R * 1.45, jit = hash(Math.floor(t * 10)) > 0.75 ? (hash(Math.floor(t * 30)) - 0.5) * g.R * 0.12 : 0;
    c.font = '900 ' + fs + 'px ui-rounded,system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = g.u * 2.5; c.lineJoin = 'round';
    [[-g.u * 3, pal[2]], [g.u * 3, pal[4]], [0, '#ffffff']].forEach((q, i) => { c.strokeStyle = hexA(q[1], i === 2 ? 0.55 : 0.5); c.strokeText('404', g.cx + q[0] + jit, g.cy - g.R * 0.1); });
    c.fillStyle = hexA(pal[2], 0.12); c.fillText('404', g.cx + jit, g.cy - g.R * 0.1);
  };
  L.windows = (c, g, p, t, pal) => {
    const n = p.n || 5; c.textAlign = 'left'; c.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const slot = Math.floor(t * 0.8 + i * 0.7), sd = slot * 1.3 + i * 9.7 + g.seed, ph = fract(t * 0.8 + i * 0.7); if (ph > 0.85 || hash(sd + 7) > 0.8) continue;
      const w = g.R * (0.9 + hash(sd) * 0.5), hh = w * 0.55, x = g.cx + (hash(sd + 4) > 0.5 ? 1 : -1) * (g.R * 0.95 + hash(sd + 1) * g.R * 1.3) - w / 2, y = g.cy + (hash(sd + 2) - 0.5) * g.R * 2.8 - hh / 2;
      c.globalAlpha = 0.9; c.fillStyle = '#18080c'; c.fillRect(x, y, w, hh); c.strokeStyle = pal[2]; c.lineWidth = g.u * 1.4; c.strokeRect(x, y, w, hh);
      c.fillStyle = pal[2]; c.fillRect(x, y, w, hh * 0.2); c.fillStyle = '#fff'; c.font = '700 ' + hh * 0.14 + 'px ui-monospace,monospace'; c.fillText('FEHLER', x + w * 0.06, y + hh * 0.1);
      c.fillStyle = pal[4]; c.font = '700 ' + hh * 0.3 + 'px ui-monospace,monospace'; c.fillText(hash(sd + 3) > 0.5 ? 'AURA?' : '404', x + w * 0.1, y + hh * 0.58);
    }
  };
  L.moon = (c, g, p, t, pal) => {
    const r = g.R * (p.r || 0.8) * 0.9, x = g.cx + (p.x || 0) * g.R, y = g.cy + (p.y || 0) * g.R, co = col(pal, p, 'c', 4);
    const gl = c.createRadialGradient(x, y, r * 0.8, x, y, r * 2.2); gl.addColorStop(0, hexA(co, 0.35)); gl.addColorStop(1, hexA(co, 0)); c.fillStyle = gl; c.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
    c.globalCompositeOperation = 'source-over';
    const gr = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, mixHex(co, '#a8b4d8', 0.5)); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = 'rgba(80,90,130,.25)'; [[-.3, -.2, .2], [.25, .15, .26], [-.1, .45, .13], [.4, -.4, .1]].forEach((q) => { c.beginPath(); c.arc(x + q[0] * r, y + q[1] * r, q[2] * r, 0, TAU); c.fill(); });
  };
  L.sun = (c, g, p, t, pal) => {
    const r = g.R * (p.r || 1) * 0.85, co = col(pal, p, 'c', 2), c2 = col(pal, p, 'c2', 3);
    const gl = c.createRadialGradient(g.cx, g.cy, r * 0.7, g.cx, g.cy, r * 2); gl.addColorStop(0, hexA(co, 0.5)); gl.addColorStop(1, hexA(co, 0)); c.fillStyle = gl; c.fillRect(g.cx - r * 2, g.cy - r * 2, r * 4, r * 4);
    c.globalCompositeOperation = 'source-over'; const gr = c.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, r); gr.addColorStop(0, '#fffbe0'); gr.addColorStop(0.5, c2); gr.addColorStop(1, co);
    c.fillStyle = gr; c.beginPath(); for (let i = 0; i <= 48; i++) { const an = (i / 48) * TAU, rr = r * (1 + 0.03 * Math.sin(an * 12 + t * 2)); c[i ? 'lineTo' : 'moveTo'](g.cx + Math.cos(an) * rr, g.cy + Math.sin(an) * rr); } c.fill();
  };
  L.planet = (c, g, p, t, pal) => {
    const r = g.R * (p.r || 1.1), x = g.cx, y = g.cy + g.R * 1.3, c1 = col(pal, p, 'c', 3), c2 = col(pal, p, 'c2', 2);
    const gl = c.createRadialGradient(x, y, r * 0.9, x, y, r * 1.5); gl.addColorStop(0, hexA(c2, 0.35)); gl.addColorStop(1, hexA(c2, 0)); c.fillStyle = gl; c.fillRect(x - r * 1.5, y - r * 1.5, r * 3, r * 3);
    c.globalCompositeOperation = 'source-over'; c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip();
    const gr = c.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r); gr.addColorStop(0, '#f0c890'); gr.addColorStop(1, mixHex(c1, '#5a3418', 0.6)); c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2);
    c.fillStyle = '#4a2410'; [[-.5, -.2, .1], [.2, -.5, .09], [.5, .1, .12], [-.1, .3, .1], [-.6, .4, .08], [.1, -.15, .07]].forEach((q) => { c.beginPath(); c.arc(x + q[0] * r, y + q[1] * r, q[2] * r, 0, TAU); c.fill(); });
    c.fillStyle = c2; c.beginPath(); c.moveTo(x - r, y - r); for (let i = 0; i <= 20; i++) { const xx = x - r + (i / 20) * r * 2; c.lineTo(xx, y - r * 0.55 + Math.sin(i * 1.7) * r * 0.08 + (i % 2) * r * 0.06); } c.lineTo(x + r, y - r); c.closePath(); c.fill();
    c.restore(); c.globalCompositeOperation = 'lighter';
    const dn = p.donuts || 5;
    for (let k = 0; k < dn; k++) {
      const an = (k / dn) * TAU + t * 0.28, dx = x + Math.cos(an) * r * 1.5, dy = y - r * 0.15 + Math.sin(an) * r * 0.45, s = g.R * 0.13 * (1 + Math.sin(an) * 0.2);
      c.strokeStyle = hexA('#ff8ac0', 0.9); c.lineWidth = s * 0.85; c.beginPath(); c.arc(dx, dy, s, 0, TAU); c.stroke(); c.strokeStyle = hexA('#fff2c8', 0.5); c.lineWidth = s * 0.25; c.beginPath(); c.arc(dx, dy, s * 1.2, 0, TAU); c.stroke();
      dot(c, dx, dy, s * 2.2, '#ff8ac0', 0.3);
    }
  };
  L.ribbon = (c, g, p, t, pal) => {
    const n = Math.ceil((p.n || 40) * Math.min(1, g.q + 0.3)), c1 = col(pal, p, 'c', 2), c2 = col(pal, p, 'c2', 3), sp = p.speed || 0.5, ph = p.ph || 0;
    const pos = (tt) => ({ x: g.cx + Math.cos(tt * 0.9 + ph) * g.R * 1.45 + Math.cos(tt * 2.3 + ph) * g.R * 0.3, y: g.cy + Math.sin(tt * 1.3 + ph) * g.R * 1.0 + Math.sin(tt * 3.1) * g.R * 0.2 });
    for (let j = n - 1; j >= 0; j--) {
      const tt = t * sp - j * 0.055, q = pos(tt), u = j / n, s = g.R * 0.2 * (1 - u * 0.85) * (p.size || 1) + g.R * 0.03;
      dot(c, q.x, q.y, s * 2.4, mixQ(c1, c2, u), 0.5 * (1 - u * 0.5));
      c.globalAlpha = 0.9; c.fillStyle = mixQ(c1, '#ffffff', 0.15 + 0.2 * (1 - u)); c.beginPath(); c.arc(q.x, q.y, s, 0, TAU); c.fill();
      c.strokeStyle = hexA(c2, 0.6); c.lineWidth = g.u; c.beginPath(); c.arc(q.x, q.y, s * 0.62, Math.PI * 0.1, Math.PI * 0.9); c.stroke();
    }
    const hd = pos(t * sp), nx = pos(t * sp - 0.03), an = Math.atan2(hd.y - nx.y, hd.x - nx.x), hs = g.R * 0.26 * (p.size || 1);
    c.save(); c.translate(hd.x, hd.y); c.rotate(an); c.fillStyle = mixQ(c1, '#ffffff', 0.35); c.beginPath(); c.ellipse(hs * 0.2, 0, hs * 1.15, hs * 0.85, 0, 0, TAU); c.fill();
    c.fillStyle = hexA(c2, 0.9); [-1, 1].forEach((s) => { c.beginPath(); c.moveTo(-hs * 0.3, s * hs * 0.5); c.lineTo(-hs * 1.2, s * hs * 1.1); c.lineTo(-hs * 0.7, s * hs * 0.3); c.closePath(); c.fill(); });
    c.fillStyle = '#fff'; [-1, 1].forEach((s) => { c.beginPath(); c.arc(hs * 0.55, s * hs * 0.38, hs * 0.2, 0, TAU); c.fill(); }); c.fillStyle = '#10101c'; [-1, 1].forEach((s) => { c.beginPath(); c.arc(hs * 0.62, s * hs * 0.38, hs * 0.1, 0, TAU); c.fill(); });
    c.restore();
  };
  L.lens = (c, g, p, t, pal) => {
    const co = col(pal, p, 'c', 3), y = g.cy + (p.y || 0) * g.R, a = p.a == null ? 0.7 : p.a, pulse = 0.85 + Math.sin(t * 1.4) * 0.15;
    const gr = c.createLinearGradient(g.cx - g.W * 0.7, 0, g.cx + g.W * 0.7, 0); gr.addColorStop(0, hexA(co, 0)); gr.addColorStop(0.5, hexA(co, a * pulse)); gr.addColorStop(1, hexA(co, 0));
    c.fillStyle = gr; c.fillRect(g.cx - g.W * 0.7, y - g.u * 1.4, g.W * 1.4, g.u * 2.8); c.fillStyle = gr; c.globalAlpha = 0.35; c.fillRect(g.cx - g.W * 0.7, y - g.u * 5, g.W * 1.4, g.u * 10);
    c.globalAlpha = 1; dot(c, g.cx, y, g.R * 0.5 * pulse, '#ffffff', 0.7);
    for (let i = 0; i < 4; i++) { const f = (i - 1.5) * 0.45; dot(c, g.cx + f * g.R * 1.8, y, g.R * (0.08 + hash(i) * 0.1), mixQ(co, '#ff9ad0', i / 3), 0.35); }
  };
  L.confetti = (c, g, p, t, pal) => {
    const n = Math.ceil((p.n || 30) * g.q);
    for (let i = 0; i < n; i++) { const r1 = hash(i + g.seed), f = fract(r1 + t * 0.2 * (0.6 + hash(i + 3))), x = g.cx + (hash(i * 3) - 0.5) * g.W * 1.1, y = lerp(-g.H * 0.05, g.H * 1.05, f); c.save(); c.translate(x, y); c.rotate(t * 3 * hash(i + 7) + i); c.globalAlpha = 0.9; c.fillStyle = rainbowAt(hash(i + 11)); c.fillRect(-g.u * 3, -g.u * 1.5, g.u * 6, g.u * 3); c.restore(); }
  };

  const NOADD = { windows: 1, planet: 0 };
  /* Der Hintergrund und die Aura. o: {k: 0..1 Einblendung, noDerp, derpOnly, expr} */
  function drawBackdrop(c, g, a) {
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const r = Math.max(g.W, g.H) * 0.75, gr = c.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, r);
    gr.addColorStop(0, a.pal[0]); gr.addColorStop(1, a.pal[1]); c.fillStyle = gr; c.fillRect(0, 0, g.W, g.H);
  }
  function renderAura(c, a, g, t, o) {
    o = o || {};
    g.u = g.R / 100; g.q = g.q || 1; g.seed = a.seed;
    const avs = a.av || {}, ar = g.R * 0.62 * (avs.s || 1);
    g.av = { x: g.cx, y: g.cy + g.R * (avs.y || 0), r: ar };
    const k = o.k == null ? 1 : o.k;
    c.save();
    drawBackdrop(c, g, a);
    const run = (front) => {
      a.fx.forEach((l, i) => {
        const p = l[1]; if (!!p.f !== front) return; p._i = i;
        c.globalCompositeOperation = NOADD[l[0]] ? 'source-over' : 'lighter'; c.globalAlpha = k; c.lineWidth = 1; c.shadowBlur = 0;
        c.save(); (L[l[0]] || (() => { }))(c, g, p, t, a.pal); c.restore();
      });
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    };
    run(false);
    // Derp
    const body = a.body || a.pal[2], pop = o.pop || 0;
    const dr = ar * (1 + pop * 0.22);
    const base = { expr: o.expr || a.expr, body, acc: a.acc, seed: a.seed, squash: pop * -0.08, alpha: 1 };
    if (a.mirror) {
      const my = g.av.y + ar * 1.04;
      c.save(); c.beginPath(); c.rect(0, my, g.W, g.H); c.clip(); c.translate(0, my * 2); c.scale(1, -1); const gx = c.createLinearGradient(0, my - ar * 1.6, 0, my); drawDerp(c, g.av.x, g.av.y, dr, t, Object.assign({}, base, { alpha: 0.28 })); c.restore();
      c.save(); const fg = c.createLinearGradient(0, my, 0, my + ar * 1.2); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, hexA(a.pal[1], 0.9)); c.fillStyle = fg; c.fillRect(0, my, g.W, ar * 1.3); c.restore();
    }
    if (a.rgb) {
      const spike = hash(Math.floor(t * 9)) > 0.78 ? 1 : 0.25, off = Math.sin(t * 37) * g.u * 3 * spike + g.u * 1.5;
      c.globalCompositeOperation = 'lighter'; drawDerp(c, g.av.x - off, g.av.y, dr, t, Object.assign({}, base, { body: '#ff2a6a', alpha: 0.55, acc: [] }));
      drawDerp(c, g.av.x + off, g.av.y, dr, t, Object.assign({}, base, { body: '#2affee', alpha: 0.55, acc: [] })); c.globalCompositeOperation = 'source-over';
    }
    drawDerp(c, g.av.x, g.av.y, dr, t, base);
    run(true);
    c.restore();
  }

  const thumbCache = {};
  function thumb(a, size) {
    const key = a.id + size; if (thumbCache[key]) return thumbCache[key];
    const dpr = 2, cv = document.createElement('canvas'); cv.width = cv.height = size * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr);
    const g = { cx: size / 2, cy: size * 0.5, R: size * 0.3, W: size, H: size, q: 0.8 };
    renderAura(c, a, g, 2.4 + a.seed * 0.37, {});
    return (thumbCache[key] = cv.toDataURL('image/webp', 0.85));
  }
  window.FX = { renderAura, drawBackdrop, thumb, dot, glowSprite, rainbowAt, layers: L };
})();
/* Szene ohne Derp (für das Wetter hinter dem Spiel) */
window.FX.scene = function (c, a, g, t) {
  g.u = g.R / 100; g.q = g.q || 1; g.seed = a.seed || 1; g.av = { x: g.cx, y: g.cy, r: g.R * 0.6 };
  FX.drawBackdrop(c, g, a);
  a.fx.forEach((l, i) => { const p = l[1]; p._i = i; c.save(); c.globalCompositeOperation = l[0] === 'windows' ? 'source-over' : 'lighter'; c.lineWidth = 1; (FX.layers[l[0]] || (() => { }))(c, g, p, t, a.pal); c.restore(); });
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
};

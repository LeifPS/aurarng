'use strict';
/* Der Derp: eine Figur, komplett aus Code gezeichnet. Ausdruck und Zubehör kommen aus der Aura. */
(function () {
  const OUT = '#241438';

  function blob(c, r, t, seed) {
    const n = 12, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, rad = r * (1 + 0.035 * Math.sin(t * 1.7 + i * 1.3 + seed));
      pts.push([Math.cos(a) * rad * 0.98, Math.sin(a) * rad * 1.0 + (Math.sin(a) > 0 ? r * 0.03 : 0)]);
    }
    c.beginPath();
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let m0 = mid(pts[n - 1], pts[0]);
    c.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) { const p = pts[i], m = mid(p, pts[(i + 1) % n]); c.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
    c.closePath();
  }
  function shade(hex, k) { return k >= 0 ? mixHex(hex, '#ffffff', k) : mixHex(hex, '#000000', -k); }
  function heart(c, x, y, s) {
    c.beginPath(); c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.8, y - s * 1.1, x, y - s * 0.35);
    c.bezierCurveTo(x + s * 0.8, y - s * 1.1, x + s * 1.5, y - s * 0.1, x, y + s * 0.9); c.fill();
  }
  function star5(c, x, y, s, rot) {
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? s * 0.45 : s; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
  }

  /* ---------- Zubehör (Koordinaten: Mitte des Derps = 0, Radius = r) ---------- */
  const ACC = {
    crown(c, r, t, o) {
      const y = -r * 0.98, w = r * 0.62;
      c.save(); c.translate(0, Math.sin(t * 2) * r * 0.01);
      c.beginPath(); c.moveTo(-w, y); c.lineTo(-w * 1.05, y - r * 0.5); c.lineTo(-w * 0.5, y - r * 0.26); c.lineTo(0, y - r * 0.62); c.lineTo(w * 0.5, y - r * 0.26); c.lineTo(w * 1.05, y - r * 0.5); c.lineTo(w, y); c.closePath();
      const g = c.createLinearGradient(0, y - r * 0.6, 0, y); g.addColorStop(0, '#fff2a8'); g.addColorStop(1, '#e0a020');
      c.fillStyle = g; c.fill(); c.lineWidth = r * 0.04; c.strokeStyle = OUT; c.stroke();
      [[-w * 1.05, y - r * 0.5], [0, y - r * 0.62], [w * 1.05, y - r * 0.5]].forEach((p, i) => { c.fillStyle = ['#ff4a6a', '#4ad6ff', '#7aff9a'][i]; c.beginPath(); c.arc(p[0], p[1], r * 0.055, 0, TAU); c.fill(); });
      c.fillStyle = '#ff4a6a'; c.beginPath(); c.arc(0, y - r * 0.12, r * 0.06, 0, TAU); c.fill();
      c.restore();
    },
    halo(c, r, t, o) {
      const y = -r * 1.28 + Math.sin(t * 2.2) * r * 0.04;
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(0, y, r * 0.1, 0, y, r * 0.8); g.addColorStop(0, 'rgba(255,240,160,.5)'); g.addColorStop(1, 'rgba(255,240,160,0)');
      c.fillStyle = g; c.fillRect(-r, y - r, r * 2, r * 2); c.restore();
      c.lineWidth = r * 0.09; c.strokeStyle = '#ffe680'; c.beginPath(); c.ellipse(0, y, r * 0.52, r * 0.15, 0, 0, TAU); c.stroke();
      c.lineWidth = r * 0.03; c.strokeStyle = '#fffbe0'; c.beginPath(); c.ellipse(0, y - r * 0.015, r * 0.52, r * 0.15, 0, Math.PI * 1.1, Math.PI * 1.8); c.stroke();
    },
    horns(c, r) {
      [-1, 1].forEach((s) => {
        c.beginPath(); c.moveTo(s * r * 0.35, -r * 0.82); c.quadraticCurveTo(s * r * 0.62, -r * 1.05, s * r * 0.58, -r * 1.38); c.quadraticCurveTo(s * r * 0.3, -r * 1.1, s * r * 0.12, -r * 0.92); c.closePath();
        c.fillStyle = '#f4ead0'; c.fill(); c.lineWidth = r * 0.04; c.strokeStyle = OUT; c.stroke();
      });
    },
    shades(c, r) {
      c.fillStyle = '#10101c'; c.strokeStyle = OUT; c.lineWidth = r * 0.04;
      [-1, 1].forEach((s) => { c.beginPath(); c.roundRect ? c.roundRect(s * r * 0.34 - r * 0.25, -r * 0.34, r * 0.5, r * 0.34, r * 0.1) : c.rect(s * r * 0.34 - r * 0.25, -r * 0.34, r * 0.5, r * 0.34); c.fill(); c.stroke(); });
      c.beginPath(); c.moveTo(-r * 0.09, -r * 0.22); c.lineTo(r * 0.09, -r * 0.22); c.lineWidth = r * 0.06; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = r * 0.035;
      [-1, 1].forEach((s) => { c.beginPath(); c.moveTo(s * r * 0.34 - r * 0.14, -r * 0.3); c.lineTo(s * r * 0.34 - r * 0.04, -r * 0.3); c.stroke(); });
    },
    headband(c, r) {
      c.fillStyle = '#ff4a6a'; c.strokeStyle = OUT; c.lineWidth = r * 0.035;
      c.beginPath(); c.moveTo(-r * 0.93, -r * 0.5); c.quadraticCurveTo(0, -r * 0.78, r * 0.93, -r * 0.5); c.lineTo(r * 0.9, -r * 0.34); c.quadraticCurveTo(0, -r * 0.62, -r * 0.9, -r * 0.34); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(r * 0.85, -r * 0.43); c.lineTo(r * 1.2, -r * 0.3); c.lineTo(r * 1.1, -r * 0.5); c.closePath(); c.fill(); c.stroke();
    },
    nightcap(c, r, t) {
      c.fillStyle = '#4a5ad6'; c.strokeStyle = OUT; c.lineWidth = r * 0.04;
      c.beginPath(); c.moveTo(-r * 0.8, -r * 0.55); c.quadraticCurveTo(-r * 0.4, -r * 1.5, r * 0.6 + Math.sin(t * 2) * r * 0.05, -r * 1.2); c.quadraticCurveTo(r * 0.5, -r * 0.9, r * 0.8, -r * 0.55); c.quadraticCurveTo(0, -r * 0.8, -r * 0.8, -r * 0.55); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(r * 0.62 + Math.sin(t * 2) * r * 0.05, -r * 1.2, r * 0.11, 0, TAU); c.fill(); c.stroke();
    },
    thirdeye(c, r, t) {
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(0, -r * 0.62, 0, 0, -r * 0.62, r * 0.4); g.addColorStop(0, 'rgba(180,120,255,.7)'); g.addColorStop(1, 'rgba(180,120,255,0)'); c.fillStyle = g; c.fillRect(-r * 0.5, -r * 1.1, r, r); c.restore();
      c.fillStyle = '#fff'; c.strokeStyle = OUT; c.lineWidth = r * 0.03; c.beginPath(); c.ellipse(0, -r * 0.62, r * 0.14, r * 0.09, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#b86aff'; c.beginPath(); c.arc(Math.sin(t * 1.5) * r * 0.04, -r * 0.62, r * 0.06, 0, TAU); c.fill();
    },
    wolfears(c, r) {
      [-1, 1].forEach((s) => {
        c.beginPath(); c.moveTo(s * r * 0.25, -r * 0.88); c.lineTo(s * r * 0.6, -r * 1.4); c.lineTo(s * r * 0.82, -r * 0.7); c.closePath();
        c.fillStyle = '#9aa8c8'; c.fill(); c.lineWidth = r * 0.04; c.strokeStyle = OUT; c.stroke();
        c.beginPath(); c.moveTo(s * r * 0.36, -r * 0.88); c.lineTo(s * r * 0.58, -r * 1.2); c.lineTo(s * r * 0.7, -r * 0.8); c.closePath(); c.fillStyle = '#e8a8c0'; c.fill();
      });
    },
    dogears(c, r, t) {
      [-1, 1].forEach((s) => {
        c.save(); c.translate(s * r * 0.72, -r * 0.7); c.rotate(s * (0.5 + Math.sin(t * 2 + s) * 0.06));
        c.beginPath(); c.ellipse(0, r * 0.28, r * 0.2, r * 0.4, 0, 0, TAU); c.fillStyle = '#1a1030'; c.fill(); c.lineWidth = r * 0.04; c.strokeStyle = '#6a3aa8'; c.stroke(); c.restore();
      });
    },
    chefhat(c, r) {
      c.fillStyle = '#ffffff'; c.strokeStyle = OUT; c.lineWidth = r * 0.04;
      [[-.38, -1.12, .3], [0, -1.28, .36], [.38, -1.12, .3]].forEach((p) => { c.beginPath(); c.arc(p[0] * r, p[1] * r, p[2] * r, 0, TAU); c.fill(); c.stroke(); });
      c.beginPath(); c.rect(-r * 0.5, -r * 1.0, r, r * 0.3); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(-r * 0.46, -r * 1.02, r * 0.92, r * 0.26);
    },
    boltcrown(c, r, t) {
      c.fillStyle = '#ffe14a'; c.strokeStyle = OUT; c.lineWidth = r * 0.035;
      [-.5, 0, .5].forEach((x, i) => {
        c.save(); c.translate(x * r, -r * 1.05 - (i === 1 ? r * 0.1 : 0)); c.rotate(x * 0.5);
        c.beginPath(); c.moveTo(r * 0.1, -r * 0.34); c.lineTo(-r * 0.12, r * 0.0); c.lineTo(r * 0.02, r * 0.0); c.lineTo(-r * 0.1, r * 0.34); c.lineTo(r * 0.16, -r * 0.06); c.lineTo(0, -r * 0.06); c.closePath(); c.fill(); c.stroke(); c.restore();
      });
    },
    bolt(c, r) {
      c.fillStyle = '#ffd24a'; c.strokeStyle = OUT; c.lineWidth = r * 0.03;
      c.beginPath(); c.moveTo(r * 0.06, -r * 0.8); c.lineTo(-r * 0.12, -r * 0.55); c.lineTo(r * 0.0, -r * 0.55); c.lineTo(-r * 0.1, -r * 0.34); c.lineTo(r * 0.14, -r * 0.6); c.lineTo(r * 0.02, -r * 0.6); c.closePath(); c.fill(); c.stroke();
    },
    tissue(c, r, t) {
      c.fillStyle = '#ff6a6a'; c.beginPath(); c.arc(0, r * 0.12, r * 0.07, 0, TAU); c.fill();
      c.save(); c.translate(r * 0.7, r * 0.3); c.rotate(-0.4 + Math.sin(t * 2) * 0.05); c.fillStyle = '#ffffff'; c.strokeStyle = OUT; c.lineWidth = r * 0.03;
      c.beginPath(); c.rect(-r * 0.2, -r * 0.2, r * 0.4, r * 0.4); c.fill(); c.stroke(); c.restore();
    },
  };
  /* hinter dem Körper */
  const ACC_BACK = {
    tailfire(c, r, t) {
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const a = -0.9 + i * 0.45, f = 0.7 + 0.3 * Math.sin(t * 7 + i * 2);
        const g = c.createRadialGradient(Math.sin(a) * r * 0.9, r * 0.95, 0, Math.sin(a) * r * 0.9, r * 0.95, r * 0.5 * f);
        g.addColorStop(0, 'rgba(255,230,120,.9)'); g.addColorStop(1, 'rgba(255,90,20,0)'); c.fillStyle = g; c.fillRect(Math.sin(a) * r * 0.9 - r, r * 0.95 - r, r * 2, r * 2);
      }
      c.restore();
    },
  };

  /* ---------- Gesicht ---------- */
  function eyeWhite(c, x, y, rx, ry, dark) {
    c.fillStyle = dark ? '#000' : '#fff'; c.strokeStyle = OUT; c.lineWidth = rx * 0.22;
    c.beginPath(); c.ellipse(x, y, rx, ry || rx, 0, 0, TAU); c.fill(); c.stroke();
  }
  function pupil(c, x, y, s) { c.fillStyle = '#140a22'; c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x - s * 0.3, y - s * 0.3, s * 0.3, 0, TAU); c.fill(); }
  function mouth(c, r, t, kind) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    const lw = r * 0.05; c.strokeStyle = OUT; c.lineWidth = lw;
    const y = r * 0.32;
    switch (kind) {
      case 'tongue': {
        c.beginPath(); c.moveTo(-r * 0.26, y); c.quadraticCurveTo(0, y + r * 0.26, r * 0.26, y); c.stroke();
        const w = Math.sin(t * 3) * r * 0.02;
        c.fillStyle = '#ff7a9a'; c.beginPath(); c.moveTo(-r * 0.09, y + r * 0.1); c.quadraticCurveTo(-r * 0.1 + w, y + r * 0.4, 0 + w, y + r * 0.4); c.quadraticCurveTo(r * 0.1 + w, y + r * 0.4, r * 0.09, y + r * 0.1); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(w, y + r * 0.16); c.lineTo(w, y + r * 0.3); c.lineWidth = lw * 0.5; c.stroke(); break; }
      case 'smirk':
        c.beginPath(); c.moveTo(-r * 0.2, y + r * 0.06); c.quadraticCurveTo(r * 0.06, y + r * 0.14, r * 0.28, y - r * 0.06); c.stroke(); break;
      case 'o':
        c.fillStyle = '#3a1030'; c.beginPath(); c.ellipse(0, y + r * 0.1, r * 0.1, r * 0.14 + Math.sin(t * 9) * r * 0.01, 0, 0, TAU); c.fill(); c.stroke(); break;
      case 'grin': {
        c.beginPath(); c.moveTo(-r * 0.4, y - r * 0.04); c.quadraticCurveTo(0, y + r * 0.5, r * 0.4, y - r * 0.04); c.closePath(); c.fillStyle = '#3a1030'; c.fill(); c.stroke();
        c.save(); c.clip(); c.fillStyle = '#fff'; c.fillRect(-r * 0.4, y - r * 0.05, r * 0.8, r * 0.14); c.restore();
        c.beginPath(); c.moveTo(-r * 0.4, y - r * 0.04); c.quadraticCurveTo(0, y + r * 0.5, r * 0.4, y - r * 0.04); c.closePath(); c.stroke(); break; }
      case 'open':
        c.beginPath(); c.moveTo(-r * 0.3, y - r * 0.02); c.quadraticCurveTo(0, y + r * 0.46, r * 0.3, y - r * 0.02); c.closePath(); c.fillStyle = '#3a1030'; c.fill(); c.stroke();
        c.fillStyle = '#ff7a9a'; c.beginPath(); c.ellipse(0, y + r * 0.23, r * 0.12, r * 0.07, 0, 0, TAU); c.fill(); break;
      case 'frown':
        c.beginPath(); c.moveTo(-r * 0.2, y + r * 0.14); c.quadraticCurveTo(0, y - r * 0.04, r * 0.2, y + r * 0.14); c.stroke(); break;
      case 'flat':
        c.beginPath(); c.moveTo(-r * 0.16, y + r * 0.06); c.lineTo(r * 0.16, y + r * 0.06); c.stroke(); break;
      case 'wavy':
        c.beginPath(); for (let i = 0; i <= 10; i++) { const x = -r * 0.22 + (i / 10) * r * 0.44; c[i ? 'lineTo' : 'moveTo'](x, y + r * 0.08 + Math.sin(i * 1.3 + t * 6) * r * 0.03); } c.stroke(); break;
      case 'teeth':
        c.beginPath(); c.moveTo(-r * 0.3, y + r * 0.1); c.lineTo(r * 0.3, y + r * 0.1); c.lineTo(r * 0.24, y - r * 0.04); c.lineTo(-r * 0.24, y - r * 0.04); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.stroke();
        c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(i * r * 0.1, y - r * 0.04); c.lineTo(i * r * 0.1, y + r * 0.1); } c.lineWidth = lw * 0.5; c.stroke(); break;
      case 'snore':
        c.fillStyle = '#3a1030'; c.beginPath(); c.ellipse(0, y + r * 0.1, r * 0.07 + Math.sin(t * 2) * r * 0.02, r * 0.07 + Math.sin(t * 2) * r * 0.03, 0, 0, TAU); c.fill(); c.stroke(); break;
      case 'tongueSide':
        c.beginPath(); c.moveTo(-r * 0.22, y + r * 0.04); c.quadraticCurveTo(0, y + r * 0.22, r * 0.22, y + r * 0.04); c.stroke();
        c.fillStyle = '#ff7a9a'; c.beginPath(); c.moveTo(r * 0.08, y + r * 0.12); c.quadraticCurveTo(r * 0.3, y + r * 0.4, r * 0.18, y + r * 0.24); c.quadraticCurveTo(r * 0.22, y + r * 0.1, r * 0.08, y + r * 0.12); c.fill(); c.stroke(); break;
      default:
        c.beginPath(); c.moveTo(-r * 0.22, y); c.quadraticCurveTo(0, y + r * 0.2, r * 0.22, y); c.stroke();
    }
  }
  function face(c, r, t, expr, o) {
    const ex = r * 0.32, ey = -r * 0.16, er = r * 0.21, tw = o.seed || 0;
    c.lineCap = 'round'; c.lineJoin = 'round';
    const wob = (k) => [Math.cos(t * 0.9 + k) * r * 0.06, Math.sin(t * 1.3 + k * 2) * r * 0.06];
    const hasShades = o.acc && o.acc.indexOf('shades') >= 0;
    if (hasShades) { mouth(c, r, t, expr === 'grin' ? 'grin' : 'smirk'); return; }
    switch (expr) {
      case 'derp': { const a = wob(0), b = wob(2.3); eyeWhite(c, -ex, ey, er, er * 1.05); eyeWhite(c, ex, ey, er * 1.1, er * 1.15); pupil(c, -ex + a[0] - r * 0.02, ey + a[1] - r * 0.03, r * 0.075); pupil(c, ex + b[0] + r * 0.03, ey + b[1] + r * 0.04, r * 0.095); mouth(c, r, t, 'tongue'); break; }
      case 'smug': eyeWhite(c, -ex, ey, er, er); eyeWhite(c, ex, ey, er, er); pupil(c, -ex + r * 0.07, ey + r * 0.03, r * 0.08); pupil(c, ex + r * 0.07, ey + r * 0.03, r * 0.08);
        c.fillStyle = shade(o.body, -0.1); c.strokeStyle = OUT; c.lineWidth = r * 0.04;
        [-ex, ex].forEach((x) => { c.beginPath(); c.moveTo(x - er * 1.15, ey - er * 0.05); c.lineTo(x + er * 1.15, ey - er * 0.35); c.lineTo(x + er * 1.15, ey - er * 1.3); c.lineTo(x - er * 1.15, ey - er * 1.3); c.closePath(); c.fill(); });
        c.beginPath(); c.moveTo(-ex - er * 1.1, ey - er * 0.05); c.lineTo(-ex + er * 1.1, ey - er * 0.35); c.moveTo(ex - er * 1.1, ey - er * 0.05); c.lineTo(ex + er * 1.1, ey - er * 0.35); c.stroke(); mouth(c, r, t, 'smirk'); break;
      case 'shock': eyeWhite(c, -ex, ey, er * 1.2, er * 1.3); eyeWhite(c, ex, ey, er * 1.2, er * 1.3); pupil(c, -ex, ey, r * 0.04); pupil(c, ex, ey, r * 0.04); mouth(c, r, t, 'o'); break;
      case 'dead': c.strokeStyle = OUT; c.lineWidth = r * 0.07; [-ex, ex].forEach((x) => { c.beginPath(); c.moveTo(x - er * 0.8, ey - er * 0.8); c.lineTo(x + er * 0.8, ey + er * 0.8); c.moveTo(x + er * 0.8, ey - er * 0.8); c.lineTo(x - er * 0.8, ey + er * 0.8); c.stroke(); }); mouth(c, r, t, 'tongueSide'); break;
      case 'zen': c.strokeStyle = OUT; c.lineWidth = r * 0.055; [-ex, ex].forEach((x) => { c.beginPath(); c.arc(x, ey + er * 0.2, er * 0.85, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }); mouth(c, r, t, 'default'); break;
      case 'rage': eyeWhite(c, -ex, ey, er, er * 0.9); eyeWhite(c, ex, ey, er, er * 0.9); pupil(c, -ex, ey + r * 0.02, r * 0.07); pupil(c, ex, ey + r * 0.02, r * 0.07);
        c.strokeStyle = OUT; c.lineWidth = r * 0.08; c.beginPath(); c.moveTo(-ex - er * 1.2, ey - er * 1.5); c.lineTo(-ex + er * 1.1, ey - er * 0.7); c.moveTo(ex + er * 1.2, ey - er * 1.5); c.lineTo(ex - er * 1.1, ey - er * 0.7); c.stroke(); mouth(c, r, t, 'teeth'); break;
      case 'love': [-ex, ex].forEach((x) => { c.fillStyle = '#ff3a7a'; c.strokeStyle = OUT; c.lineWidth = r * 0.035; const s = er * (1 + Math.sin(t * 5) * 0.1); heart(c, x, ey, s * 0.95); c.stroke(); }); mouth(c, r, t, 'open'); break;
      case 'void': c.fillStyle = '#000'; [-ex, ex].forEach((x) => { c.beginPath(); c.ellipse(x, ey, er * 1.05, er * 1.15, 0, 0, TAU); c.fill(); c.strokeStyle = '#8a6aff'; c.lineWidth = r * 0.025; c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, ey, r * 0.03 + Math.sin(t * 3) * r * 0.01, 0, TAU); c.fill(); c.fillStyle = '#000'; }); mouth(c, r, t, 'flat'); break;
      case 'star': [-ex, ex].forEach((x) => { c.fillStyle = '#ffe14a'; c.strokeStyle = OUT; c.lineWidth = r * 0.035; star5(c, x, ey, er * 1.25, t * 0.8); c.stroke(); }); mouth(c, r, t, 'open'); break;
      case 'cross': eyeWhite(c, -ex, ey, er, er); eyeWhite(c, ex, ey, er, er); pupil(c, -ex + er * 0.55, ey + r * 0.03, r * 0.09); pupil(c, ex - er * 0.55, ey + r * 0.03, r * 0.09); mouth(c, r, t, 'tongue'); break;
      case 'sleep': c.strokeStyle = OUT; c.lineWidth = r * 0.055; [-ex, ex].forEach((x) => { c.beginPath(); c.arc(x, ey - er * 0.2, er * 0.8, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); }); mouth(c, r, t, 'snore'); break;
      case 'wink': eyeWhite(c, -ex, ey, er, er); pupil(c, -ex + r * 0.03, ey, r * 0.085); c.strokeStyle = OUT; c.lineWidth = r * 0.06; c.beginPath(); c.arc(ex, ey + er * 0.3, er * 0.8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); mouth(c, r, t, 'tongue'); break;
      case 'grin': eyeWhite(c, -ex, ey, er, er); eyeWhite(c, ex, ey, er, er); pupil(c, -ex + r * 0.02, ey - r * 0.05, r * 0.08); pupil(c, ex + r * 0.02, ey - r * 0.05, r * 0.08); mouth(c, r, t, 'grin'); break;
      case 'flat': c.fillStyle = OUT; [-ex, ex].forEach((x) => { c.beginPath(); c.arc(x, ey, r * 0.05, 0, TAU); c.fill(); }); mouth(c, r, t, 'flat'); break;
      case 'sad': eyeWhite(c, -ex, ey, er, er); eyeWhite(c, ex, ey, er, er); pupil(c, -ex, ey + r * 0.09, r * 0.08); pupil(c, ex, ey + r * 0.09, r * 0.08); c.fillStyle = '#7ad6ff'; c.beginPath(); c.ellipse(ex + er * 0.8, ey + er * 1.4 + ((t * 0.7) % 1) * r * 0.2, r * 0.035, r * 0.055, 0, 0, TAU); c.fill(); mouth(c, r, t, 'frown'); break;
      case 'sick': eyeWhite(c, -ex, ey, er, er * 0.8); eyeWhite(c, ex, ey, er, er * 0.8); pupil(c, -ex, ey, r * 0.06); pupil(c, ex, ey, r * 0.06); mouth(c, r, t, 'wavy'); break;
      default: eyeWhite(c, -ex, ey, er); eyeWhite(c, ex, ey, er); pupil(c, -ex, ey, r * 0.08); pupil(c, ex, ey, r * 0.08); mouth(c, r, t, 'default');
    }
  }

  Object.assign(ACC, {
    partyhat(c, r) {
      c.save(); c.translate(r * 0.12, -r * 0.9); c.rotate(0.18); c.beginPath(); c.moveTo(-r * 0.38, 0); c.lineTo(0, -r); c.lineTo(r * 0.38, 0); c.closePath();
      const g = c.createLinearGradient(-r * 0.38, 0, r * 0.38, 0); g.addColorStop(0, '#ff5ac8'); g.addColorStop(1, '#7a5aff'); c.fillStyle = g; c.fill(); c.lineWidth = r * 0.04; c.strokeStyle = OUT; c.stroke();
      c.fillStyle = '#ffe14a'; [[-0.1, -0.3], [0.08, -0.55], [0.12, -0.2]].forEach((q) => { c.beginPath(); c.arc(q[0] * r, q[1] * r, r * 0.045, 0, TAU); c.fill(); });
      c.beginPath(); c.arc(0, -r * 1.02, r * 0.1, 0, TAU); c.fill(); c.stroke(); c.restore();
    },
    tophat(c, r) {
      c.save(); c.translate(0, -r * 0.9); c.fillStyle = '#1c1428'; c.strokeStyle = OUT; c.lineWidth = r * 0.04;
      c.beginPath(); c.ellipse(0, 0, r * 0.62, r * 0.14, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.rect(-r * 0.38, -r * 0.62, r * 0.76, r * 0.62); c.fill(); c.stroke();
      c.fillStyle = '#c8344a'; c.fillRect(-r * 0.38, -r * 0.2, r * 0.76, r * 0.12); c.beginPath(); c.ellipse(0, -r * 0.62, r * 0.38, r * 0.1, 0, 0, TAU); c.fillStyle = '#2e2244'; c.fill(); c.stroke(); c.restore();
    },
    wizard(c, r) {
      c.save(); c.translate(0, -r * 0.88); c.fillStyle = '#4a3aa8'; c.strokeStyle = OUT; c.lineWidth = r * 0.04; c.beginPath(); c.ellipse(0, 0, r * 0.7, r * 0.15, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.42, 0); c.quadraticCurveTo(-r * 0.2, -r * 0.7, r * 0.28, -r * 1.1); c.quadraticCurveTo(r * 0.5, -r, r * 0.52, -r * 0.8); c.quadraticCurveTo(r * 0.3, -r * 0.45, r * 0.42, 0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffe14a'; star5(c, -r * 0.05, -r * 0.35, r * 0.1, 0); star5(c, r * 0.2, -r * 0.7, r * 0.07, 0.4); c.fillRect(-r * 0.42, -r * 0.1, r * 0.84, r * 0.1); c.restore();
    },
    bunnyears(c, r, t) {
      [-1, 1].forEach((s) => {
        c.save(); c.translate(s * r * 0.3, -r * 0.88); c.rotate(s * (0.12 + Math.sin(t * 2 + s) * 0.04)); c.beginPath(); c.ellipse(0, -r * 0.42, r * 0.17, r * 0.5, 0, 0, TAU); c.fillStyle = '#f4f0ff'; c.fill(); c.lineWidth = r * 0.04; c.strokeStyle = OUT; c.stroke();
        c.beginPath(); c.ellipse(0, -r * 0.42, r * 0.08, r * 0.36, 0, 0, TAU); c.fillStyle = '#ffb0c8'; c.fill(); c.restore();
      });
    },
    catears(c, r) {
      [-1, 1].forEach((s) => {
        c.beginPath(); c.moveTo(s * r * 0.2, -r * 0.9); c.lineTo(s * r * 0.5, -r * 1.35); c.lineTo(s * r * 0.78, -r * 0.75); c.closePath(); c.fillStyle = '#ffb86a'; c.fill(); c.lineWidth = r * 0.04; c.strokeStyle = OUT; c.stroke();
        c.beginPath(); c.moveTo(s * r * 0.34, -r * 0.9); c.lineTo(s * r * 0.5, -r * 1.2); c.lineTo(s * r * 0.66, -r * 0.82); c.closePath(); c.fillStyle = '#ff8aa8'; c.fill();
      });
    },
    antenna(c, r, t) {
      [-1, 1].forEach((s) => {
        const w = s * r * 0.12 * Math.sin(t * 3), bx = s * r * 0.32 + w, by = -r * 1.44; c.strokeStyle = OUT; c.lineWidth = r * 0.05; c.beginPath(); c.moveTo(s * r * 0.2, -r * 0.92); c.quadraticCurveTo(s * r * 0.3, -r * 1.2, bx, by); c.stroke();
        c.fillStyle = '#7aff9a'; c.lineWidth = r * 0.035; c.beginPath(); c.arc(bx, by, r * 0.09, 0, TAU); c.fill(); c.stroke();
      });
    },
    flower(c, r) {
      c.save(); c.translate(-r * 0.5, -r * 0.78); c.rotate(-0.3);
      for (let i = 0; i < 6; i++) { c.rotate(TAU / 6); c.beginPath(); c.ellipse(0, -r * 0.17, r * 0.1, r * 0.17, 0, 0, TAU); c.fillStyle = '#ff9ac8'; c.fill(); c.lineWidth = r * 0.025; c.strokeStyle = OUT; c.stroke(); }
      c.beginPath(); c.arc(0, 0, r * 0.1, 0, TAU); c.fillStyle = '#ffe14a'; c.fill(); c.stroke(); c.restore();
    },
    eyepatch(c, r) {
      c.strokeStyle = '#1c1428'; c.lineWidth = r * 0.05; c.beginPath(); c.moveTo(-r * 0.92, -r * 0.5); c.lineTo(r * 0.92, -r * 0.02); c.stroke();
      c.fillStyle = '#1c1428'; c.beginPath(); c.ellipse(-r * 0.34, -r * 0.18, r * 0.25, r * 0.2, 0.3, 0, TAU); c.fill();
    },
    propeller(c, r, t) {
      c.save(); c.translate(0, -r * 0.98); c.fillStyle = '#ff5a5a'; c.strokeStyle = OUT; c.lineWidth = r * 0.04; c.beginPath(); c.ellipse(0, r * 0.06, r * 0.46, r * 0.22, 0, Math.PI, TAU); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffe14a'; c.beginPath(); c.rect(-r * 0.04, -r * 0.24, r * 0.08, r * 0.18); c.fill(); c.stroke();
      c.fillStyle = '#6ad6ff'; c.beginPath(); c.ellipse(0, -r * 0.26, r * 0.4 * Math.abs(Math.cos(t * 14)) + r * 0.04, r * 0.05, 0, 0, TAU); c.fill(); c.stroke(); c.restore();
    },
    beanie(c, r) {
      c.save(); c.translate(0, -r * 0.8); c.fillStyle = '#4aa8ff'; c.strokeStyle = OUT; c.lineWidth = r * 0.04;
      c.beginPath(); c.moveTo(-r * 0.7, 0); c.quadraticCurveTo(-r * 0.7, -r * 0.75, 0, -r * 0.78); c.quadraticCurveTo(r * 0.7, -r * 0.75, r * 0.7, 0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#f4f0ff'; c.beginPath(); c.rect(-r * 0.72, -r * 0.06, r * 1.44, r * 0.2); c.fill(); c.stroke(); c.beginPath(); c.arc(0, -r * 0.8, r * 0.15, 0, TAU); c.fill(); c.stroke(); c.restore();
    },
    carrot(c, r) {
      c.save(); c.translate(0, r * 0.12); c.fillStyle = '#ff8a2a'; c.strokeStyle = OUT; c.lineWidth = r * 0.035; c.beginPath(); c.moveTo(-r * 0.08, -r * 0.05); c.lineTo(r * 0.62, r * 0.08); c.lineTo(-r * 0.08, r * 0.17); c.closePath(); c.fill(); c.stroke(); c.restore();
    },
    headphones(c, r) {
      c.strokeStyle = '#2a2a3c'; c.lineWidth = r * 0.1; c.beginPath(); c.arc(0, -r * 0.05, r * 1.02, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
      [-1, 1].forEach((s) => { c.fillStyle = '#ff5ac8'; c.strokeStyle = OUT; c.lineWidth = r * 0.04; c.beginPath(); c.ellipse(s * r * 1.0, -r * 0.02, r * 0.14, r * 0.26, 0, 0, TAU); c.fill(); c.stroke(); });
    },
    bowtie(c, r) {
      c.fillStyle = '#e0344a'; c.strokeStyle = OUT; c.lineWidth = r * 0.035; [-1, 1].forEach((s) => { c.beginPath(); c.moveTo(0, r * 0.8); c.lineTo(s * r * 0.3, r * 0.66); c.lineTo(s * r * 0.3, r * 0.94); c.closePath(); c.fill(); c.stroke(); });
      c.beginPath(); c.arc(0, r * 0.8, r * 0.07, 0, TAU); c.fill(); c.stroke();
    },
  });

  /* Hauptfunktion. o: expr, body, acc[], alpha, dark (Schattenriss), seed, squash */
  function drawDerp(c, x, y, r, t, o) {
    o = o || {};
    const body = o.body || '#8fd0ff', seed = o.seed || 0;
    c.save(); c.translate(x, y);
    const bob = Math.sin(t * 2.4 + seed) * 0.025 + (o.squash || 0);
    c.scale(1 - bob * 0.6, 1 + bob);
    c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    const acc = o.acc || [];
    acc.forEach((a) => ACC_BACK[a] && ACC_BACK[a](c, r, t, o));
    // Füße
    c.lineWidth = r * 0.05; c.strokeStyle = o.dark ? '#000' : OUT;
    c.fillStyle = o.dark ? '#000' : shade(body, -0.25);
    [-1, 1].forEach((s) => { c.beginPath(); c.ellipse(s * r * 0.34, r * 0.95, r * 0.22, r * 0.12, 0, 0, TAU); c.fill(); c.stroke(); });
    // Arme
    [-1, 1].forEach((s) => {
      const wv = Math.sin(t * 3.1 + (s > 0 ? 1.6 : 0)) * r * 0.1;
      c.fillStyle = o.dark ? '#000' : shade(body, -0.08); c.beginPath(); c.ellipse(s * r * 0.97, r * 0.12 + wv, r * 0.14, r * 0.2, s * 0.5, 0, TAU); c.fill(); c.stroke();
    });
    // Körper
    blob(c, r, t, seed);
    if (o.dark) { c.fillStyle = '#000'; c.fill(); c.lineWidth = r * 0.05; c.stroke(); }
    else {
      const g = c.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.15);
      g.addColorStop(0, shade(body, 0.45)); g.addColorStop(0.45, body); g.addColorStop(1, shade(body, -0.35));
      c.fillStyle = g; c.fill(); c.lineWidth = r * 0.05; c.strokeStyle = OUT; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-r * 0.42, -r * 0.62, r * 0.18, r * 0.09, -0.6, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,100,140,.35)'; [-1, 1].forEach((s) => { c.beginPath(); c.ellipse(s * r * 0.58, r * 0.12, r * 0.12, r * 0.075, 0, 0, TAU); c.fill(); });
      face(c, r, t, o.expr || 'derp', { body, acc, seed });
    }
    if (!o.dark) acc.forEach((a) => ACC[a] && ACC[a](c, r, t, o));
    c.restore();
  }
  window.drawDerp = drawDerp;
})();

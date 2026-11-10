'use strict';
/* Kleine Helfer */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const TAU = Math.PI * 2;
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const fract = (x) => x - Math.floor(x);
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOut = (t) => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
/* Gleicher Zufall bei gleicher Zahl: damit alle Effekte nur von der Zeit abhängen (Vorschaubilder, Kino und Bühne sehen gleich aus) */
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return s - Math.floor(s); }

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + (a < 0 ? 0 : a > 1 ? 1 : +a.toFixed(3)) + ')';
}
function mixHex(a, b, t) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(x >> 16, y >> 16, t)), g = Math.round(lerp((x >> 8) & 255, (y >> 8) & 255, t)), bl = Math.round(lerp(x & 255, y & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

const nf = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
function fmt(n) { return nf.format(Math.round(n)); }
function fmtShort(n) {
  n = Math.round(n);
  const u = [[1e15, ' Brd.'], [1e12, ' Bio.'], [1e9, ' Mrd.'], [1e6, ' Mio.']];
  for (const [v, s] of u) if (n >= v) { const x = n / v; return (x >= 100 ? nf.format(x) : x.toLocaleString('de-DE', { maximumFractionDigits: 1 })) + s; }
  return nf.format(n);
}
function fmtLuck(x) { return '×' + (x >= 100 ? nf.format(x) : x.toLocaleString('de-DE', { maximumFractionDigits: x >= 10 ? 1 : 2 })); }
function fmtTime(s) {
  s = Math.max(0, Math.ceil(s));
  const m = Math.floor(s / 60), r = s % 60;
  return m + ':' + String(r).padStart(2, '0');
}
function fmtDur(ms) {
  const m = Math.round(ms / 60000);
  if (m < 1) return 'unter 1 Minute';
  if (m < 60) return m + ' Min.';
  const h = Math.floor(m / 60);
  return h + ' Std.' + (m % 60 ? ' ' + (m % 60) + ' Min.' : '');
}
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  if (props) for (const k in props) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'text') e.textContent = v;
    else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') for (const sk in v) { if (sk.startsWith('--')) e.style.setProperty(sk, v[sk]); else e.style[sk] = v[sk]; }
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

'use strict';
/* Aura RNG: Spiellogik und Oberfläche */
(function () {
  const KEY = 'aurarng.save.v1';
  const ICONS = {
    dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="8.5" cy="8.5" r=".6"/><circle cx="15.5" cy="8.5" r=".6"/><circle cx="12" cy="12" r=".6"/><circle cx="8.5" cy="15.5" r=".6"/><circle cx="15.5" cy="15.5" r=".6"/>',
    coll: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    shop: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.6 10c.3-1.2 1.4-1.7 2.4-1.7s2.2.5 2.2 1.6c0 2.2-4.6 1.2-4.6 3.5 0 1.1 1.2 1.7 2.4 1.7 1.1 0 2.1-.5 2.4-1.5"/>',
    lab: '<path d="M9.5 3.5h5M10.5 3.5v5.6L5.2 18a2.2 2.2 0 0 0 1.9 3.3h9.8a2.2 2.2 0 0 0 1.9-3.3l-5.3-8.9V3.5"/><path d="M7.5 15h9"/>',
    ach: '<path d="M8 20.5h8M12 16.5v4M7 3.5h10v5.2a5 5 0 0 1-10 0z"/><path d="M7 5.5H4v1.2a3.3 3.3 0 0 0 3 3.3M17 5.5h3v1.2a3.3 3.3 0 0 1-3 3.3"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.7 7.7 0 0 0 .06-3l2-1.5-2-3.4-2.4.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.4-.9-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.4-.9a7.6 7.6 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.4.9 2-3.4z"/>',
    bolt: '<path d="M13 2.5 4.5 14h6.5l-1 7.5L19.5 10H13z"/>',
    clover: '<circle cx="9" cy="8.5" r="3.6"/><circle cx="15" cy="8.5" r="3.6"/><circle cx="9" cy="14.5" r="3.6"/><circle cx="15" cy="14.5" r="3.6"/><path d="M12 12l0 9"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5.2"/>',
    auto: '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 3.5v5h-5"/>',
    moon: '<path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a6.8 6.8 0 0 0 10 10z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    flask: '<path d="M9.5 3.5h5M10.5 3.5v5.6L5.2 18a2.2 2.2 0 0 0 1.9 3.3h9.8a2.2 2.2 0 0 0 1.9-3.3l-5.3-8.9V3.5"/>',
  };
  const ico = (n) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || '') + '</svg>';
  const tierCol = (t) => TIERS[t].color;

  /* ---------- Spielstand ---------- */
  function fresh() {
    return { v: 1, born: Date.now(), coins: 0, total: 0, rolls: 0, inv: {}, up: { luck: 0, speed: 0, coin: 0, multi: 0, auto: 0, sleep: 0 }, pot: {}, act: {}, ach: {}, best: 0, bestId: null, shown: null, multi: 1, auto: false,
      st: { pokes: 0, drunk: 0, kinos: 0, big: 0, away: 0 }, set: { ton: true, musik: true, kino: 'voll', q: 'auto' }, tick: Date.now() };
  }
  function load() {
    let o = null; try { o = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
    const f = fresh(); if (!o || typeof o !== 'object') return f;
    for (const k in f) { if (o[k] == null) continue; if (f[k] && typeof f[k] === 'object') Object.assign(f[k], o[k]); else f[k] = o[k]; }
    return f;
  }
  let S = load(), dirty = false;
  function save() { dirty = true; }
  function flush() { if (!dirty) return; dirty = false; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  setInterval(flush, 3000);

  /* ---------- Werte ---------- */
  const potMult = (kind) => { let m = 1; const t = Date.now(); for (const id in S.act) { const p = POTION_BY_ID[id]; if (p && p.kind === kind && S.act[id] > t) m = Math.max(m, p.mult); } return m; };
  const luck = () => UPS.luck.val(S.up.luck) * potMult('luck');
  const cdSec = () => UPS.speed.val(S.up.speed) / potMult('speed');
  const coinM = () => UPS.coin.val(S.up.coin) * potMult('coin');
  const multiMax = () => UPS.multi.val(S.up.multi);
  const weatherNow = () => wetterZu(Date.now());
  const fmtOdds = (n) => '1 zu ' + fmt(n);
  const found = () => Object.keys(S.inv).length;

  /* ---------- Zustand der Oberfläche ---------- */
  const stage = { aura: S.shown && AURA_BY_ID[S.shown] ? AURA_BY_ID[S.shown] : AURA_BY_ID.nix, pop: 0, expr: null, exprUntil: 0 };
  let cdStart = 0, cdEnd = 0, holding = false, sheet = null, Q = 1, newColl = 0;
  const K = { open: false };

  /* ---------- Kleine UI-Helfer ---------- */
  const toastBox = () => $('#toasts');
  function toast(text, sub, gold) {
    const t = h('div', { class: 'toast' + (gold ? ' gold' : '') }, text, sub ? h('small', { text: sub }) : null);
    toastBox().append(t); while (toastBox().children.length > 3) toastBox().firstChild.remove();
    setTimeout(() => t.remove(), 3100);
  }
  function floatText(txt, color) {
    const f = h('div', { class: 'float', text: txt, style: { color: color || '' } }); f.style.left = 44 + Math.random() * 12 + '%'; $('#floats').append(f); setTimeout(() => f.remove(), 1100);
  }
  let lastCoins = -1;
  function showCoins() {
    const n = $('#coin-n'); n.textContent = fmtShort(S.coins);
    if (lastCoins >= 0 && S.coins > lastCoins) { const p = $('#coins'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
    lastCoins = S.coins;
  }
  function setInfo(a, res) {
    $('#aura-tier').textContent = TIERS[a.tier].name; $('#aura-info').style.setProperty('--tc', tierCol(a.tier));
    $('#aura-name').textContent = a.name;
    $('#aura-odds').textContent = fmtOdds(a.odds) + (res && res.isNew ? '  ·  NEU!' : '') + (res && res.n > 1 ? '  ·  bester von ' + res.n : '');
    const el = $('#aura-info'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  }

  /* ---------- Würfeln ---------- */
  function rollCore(n, forceId) {
    const now = Date.now(), wid = weatherNow().id, lk = luck(), cm = coinM();
    let best = null, coins = 0; const counts = {}, fresh = [];
    for (let i = 0; i < n; i++) {
      const a = forceId ? AURA_BY_ID[forceId] : pickAura(lk, wid);
      counts[a.id] = (counts[a.id] || 0) + 1; coins += coinsFor(a, cm);
      if (!best || a.odds > best.odds) best = a;
    }
    S.rolls += n; S.coins += coins; S.total += coins;
    for (const id in counts) { if (!S.inv[id]) { S.inv[id] = { n: 0, t: now }; fresh.push(id); } S.inv[id].n += counts[id]; }
    if (best.odds > S.best) { S.best = best.odds; S.bestId = best.id; }
    S.shown = best.id;
    return { best, coins, counts, n, isNew: fresh.indexOf(best.id) >= 0, fresh };
  }
  let lastSfx = 0;
  function tryRoll(manual, forceId) {
    const t = performance.now();
    if (K.open || t < cdEnd) return false;
    const n = Math.min(S.multi, multiMax());
    const res = rollCore(n, forceId);
    const cd = cdSec() * 1000; cdStart = t; cdEnd = t + cd;
    present(res, manual, cd);
    return true;
  }
  function present(res, manual, cd) {
    const a = res.best, t = a.tier;
    stage.aura = a; stage.pop = 1; stage.t0 = performance.now(); setInfo(a, res);
    if (res.fresh.length) { newColl += res.fresh.length; $('#tabs [data-tab=coll] .badge').hidden = false; }
    showCoins();
    if (res.n === 1 && t === 0 || res.n === 1 && cd < 450) { /* kurze Pausen: nicht jeden Wurf anzeigen */ }
    floatText('+' + fmtShort(res.coins), '#ffd24a');
    const feed = $('#feed');
    if (t >= 1 || res.n > 1) {
      const it = h('div', { class: 'feed-i', style: { '--tc': tierCol(t) } }, h('i'), a.name, res.n > 1 ? h('span', { text: '×' + res.n }) : null);
      feed.append(it); while (feed.children.length > 4) feed.firstChild.remove(); setTimeout(() => it.remove(), 6200);
    }
    const nowt = performance.now();
    if (K.skipSound || nowt - lastSfx > 90 || t >= 3) { lastSfx = nowt; if (cd > 500 || manual) SFX.roll(); }
    if (t >= 5 && S.set.kino !== 'aus') { S.st.kinos++; openKino(res); }
    else {
      SFX.pop(t);
      if (t >= 3) { banner(a); shake(); }
    }
    if (t >= 5) S.st.big++;
    checkAch(); save();
    if (sheet === 'shop') renderSheet();
  }
  function banner(a) {
    const b = $('#banner'); b.style.setProperty('--tc', tierCol(a.tier)); $('#banner-tier').textContent = TIERS[a.tier].name; $('#banner-name').textContent = a.name;
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
  }
  function shake() { const s = $('#stage'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); }

  /* ---------- Erfolge ---------- */
  const ACH = [];
  [[10, 'Erste Schritte', 20], [100, 'Würfel-Lehrling', 100], [1000, 'Würfel-Meister', 1000], [10000, 'Würfel-Wahnsinn', 20000], [100000, 'Würfel-Gott', 400000]].forEach(([g, n, r]) => ACH.push({ id: 'r' + g, name: n, text: fmt(g) + ' Mal würfeln', goal: g, get: () => S.rolls, reward: r }));
  [[5, 'Sammler', 100], [15, 'Sammelwut', 800], [30, 'Aura-Fan', 20000], [AURAS.length, 'Alles gefunden!', 5000000]].forEach(([g, n, r]) => ACH.push({ id: 'c' + g, name: n, text: g === AURAS.length ? 'Alle ' + g + ' Auren finden' : g + ' verschiedene Auren finden', goal: g, get: found, reward: r }));
  ['Selten', 'Episch', 'Legendär', 'Mythisch', 'Göttlich', 'Kosmisch', 'Unmöglich'].forEach((n, i) => { const t = i + 3; ACH.push({ id: 't' + t, name: n + '!', text: 'Eine Aura der Stufe „' + TIERS[t].name + '“ würfeln', goal: 1, get: () => (Object.keys(S.inv).some((id) => AURA_BY_ID[id].tier === t) ? 1 : 0), reward: [300, 2000, 20000, 200000, 2e6, 2e7, 2e8][i] }); });
  ACH.push({ id: 'coin1', name: 'Taschengeld', text: '1.000 Derp-Taler verdienen', goal: 1000, get: () => S.total, reward: 50 });
  ACH.push({ id: 'coin2', name: 'Reich!', text: '1 Million Derp-Taler verdienen', goal: 1e6, get: () => S.total, reward: 20000 });
  ACH.push({ id: 'buy1', name: 'Aufgerüstet', text: 'Das erste Upgrade kaufen', goal: 1, get: () => (Object.values(S.up).some((v) => v > 0) ? 1 : 0), reward: 50 });
  ACH.push({ id: 'auto1', name: 'Faulpelz', text: 'Den Auto-Würfler freischalten', goal: 1, get: () => S.up.auto, reward: 200 });
  ACH.push({ id: 'pot1', name: 'Prost!', text: 'Einen Trank trinken', goal: 1, get: () => S.st.drunk, reward: 100 });
  ACH.push({ id: 'pot2', name: 'Trinkfest', text: '25 Tränke trinken', goal: 25, get: () => S.st.drunk, reward: 5000 });
  ACH.push({ id: 'poke', name: 'Nasenstüber', text: 'Den Derp 50 Mal anstupsen', goal: 50, get: () => S.st.pokes, reward: 150 });
  ACH.push({ id: 'wet', name: 'Wetterfrosch', text: 'Eine Wetter-Aura finden', goal: 1, get: () => (Object.keys(S.inv).some((id) => AURA_BY_ID[id].biome) ? 1 : 0), reward: 1000 });
  ACH.push({ id: 'big5', name: 'Glückspilz', text: '5 Auren ab „Legendär“ würfeln', goal: 5, get: () => S.st.big, reward: 60000 });
  function checkAch() {
    ACH.forEach((a) => {
      if (S.ach[a.id] || a.get() < a.goal) return;
      S.ach[a.id] = Date.now(); S.coins += a.reward; S.total += a.reward; showCoins();
      toast('Erfolg: ' + a.name, '+' + fmtShort(a.reward) + ' Derp-Taler', true); setTimeout(() => SFX.ach(), 250); save();
    });
  }

  /* ---------- Upgrades und Tränke ---------- */
  function buyUp(k) {
    const u = UPS[k], lv = S.up[k]; if (lv >= u.max) return;
    const cost = u.cost(lv); if (S.coins < cost) { SFX.no(); toast('Zu wenig Derp-Taler'); return; }
    S.coins -= cost; S.up[k]++; showCoins(); SFX.buy();
    if (k === 'multi') S.multi = Math.min(S.multi, multiMax());
    if (k === 'auto') toast('Auto-Würfler freigeschaltet', 'Schalte ihn links neben dem Würfel ein.');
    if (k === 'sleep' && S.up.sleep === 1) toast('Schlaf-Würfeln freigeschaltet', 'Der Derp würfelt auch bei geschlossenem Spiel, wenn Auto an ist.');
    checkAch(); save(); renderSheet(); renderControls();
  }
  function buyPot(id) {
    const p = POTION_BY_ID[id]; if (S.coins < p.price) { SFX.no(); toast('Zu wenig Derp-Taler'); return; }
    S.coins -= p.price; S.pot[id] = (S.pot[id] || 0) + 1; showCoins(); SFX.buy(); save(); renderSheet();
  }
  function drink(id) {
    const p = POTION_BY_ID[id]; if (!(S.pot[id] > 0)) return;
    S.pot[id]--; const t = Date.now(); S.act[id] = Math.max(t, S.act[id] || 0) + p.dur * 1000; S.st.drunk++; SFX.drink();
    toast(p.name + ' getrunken', p.kind === 'luck' ? 'Glück ×' + p.mult : p.kind === 'speed' ? 'Pause durch ' + p.mult : 'Taler ×' + p.mult);
    checkAch(); save(); renderSheet(); renderControls();
  }

  /* ---------- Steuerung ---------- */
  function renderControls() {
    const multi = Math.min(S.multi, multiMax()); S.multi = multi;
    $('#multi-n').textContent = '×' + multi;
    const au = $('#btn-auto'); au.classList.toggle('locked', !S.up.auto); au.setAttribute('aria-pressed', S.auto && S.up.auto ? 'true' : 'false');
    const chips = $('#chips'); chips.innerHTML = '';
    chips.append(h('div', { class: 'chip' }, 'Glück ', h('b', { text: fmtLuck(luck()) })));
    const t = Date.now();
    POTIONS.forEach((p) => { if (S.act[p.id] > t) chips.append(h('div', { class: 'chip pot', style: { '--pc': p.color } }, h('b', { text: p.name }), ' ', h('span', { class: 'mono', text: fmtTime((S.act[p.id] - t) / 1000) }))); });
  }
  function renderWeather() {
    const w = weatherNow(); $('#w-name').textContent = w.name; $('#w-text').textContent = w.text; $('#w-time').textContent = fmtTime(wetterRest(Date.now()) / 1000);
    $('#weather-chip').style.setProperty('--wc', w.sky[0] === '#2a2350' ? '#9a7bff' : '#' + w.sky[0].slice(1).replace(/./g, (c) => c));
    const col = { normal: '#9a7bff', nacht: '#7a8cff', gewitter: '#ffe14a', regenbogen: '#ff6a9a', schnee: '#7ad6ff', nebel: '#b8d0e0', vollmond: '#dfe6ff', glitch: '#2affee', singularitaet: '#b86aff' }[w.id];
    $('#weather-chip').style.setProperty('--wc', col);
  }

  /* ---------- Leinwand: Bühne ---------- */
  const scv = $('#stagecv'), sc = scv.getContext('2d');
  let sW = 0, sH = 0, sDpr = 1;
  function sizeStage() {
    const r = $('#stage').getBoundingClientRect(); sDpr = Math.min(window.devicePixelRatio || 1, 2);
    sW = Math.max(10, Math.round(r.width)); sH = Math.max(10, Math.round(r.height)); scv.width = Math.round(sW * sDpr); scv.height = Math.round(sH * sDpr);
  }
  new ResizeObserver(sizeStage).observe($('#stage'));
  function drawStage(ms) {
    const a = stage.aura, t = ms / 1000; sc.setTransform(sDpr, 0, 0, sDpr, 0, 0);
    stage.pop = Math.max(0, stage.pop - 0.035 * 1);
    const expr = performance.now() < stage.exprUntil ? stage.expr : null;
    const R = Math.min(sW * 0.36, sH * 0.31), g = { cx: sW / 2, cy: sH * 0.44, R, W: sW, H: sH, q: Q };
    FX.renderAura(sc, a, g, t, { pop: stage.pop, expr });
  }

  /* ---------- Leinwand: Wetter ---------- */
  const wcv = $('#weather'), wc = wcv.getContext('2d');
  const WSCENE = {
    normal: { pal: ['#2a2350', '#0e0a22', '#9a7bff', '#ff9ad0', '#ffe14a'], fx: [['rise', { n: 14, c: 3, shape: 'dot', size: 5, speed: .05, dir: -1, spread: 1.1, a: .5 }]], seed: 3 },
    nacht: { pal: ['#101a3d', '#03061a', '#7a8cff', '#b0baff', '#fff6c8'], fx: [['stars', { n: 90, c: 4 }], ['moon', { c: 4, r: .5, x: -1.4, y: -1.5 }]], seed: 5 },
    gewitter: { pal: ['#232845', '#080a18', '#ffe14a', '#8fb0ff', '#ffffff'], fx: [['rise', { n: 50, c: 3, shape: 'rain', size: 5, speed: .9, dir: 1, spread: 1.3 }], ['lightning', { rate: .45, c: 2, n: 2, from: 'sky', a: .7 }]], seed: 7 },
    regenbogen: { pal: ['#3b2a63', '#150f2b', '#ff6a9a', '#ffe14a', '#6ae8ff'], fx: [['beams', { n: 7, a: .12, speed: .05, rainbow: true, len: 3 }], ['rise', { n: 30, rainbow: true, shape: 'dot', size: 6, speed: .08, dir: -1, spread: 1.1, a: .6 }]], seed: 9 },
    schnee: { pal: ['#27456b', '#0b1830', '#7ad6ff', '#b0ecff', '#ffffff'], fx: [['rise', { n: 60, c: 4, shape: 'snow', size: 5, speed: .1, dir: 1, spread: 1.2, sway: 1 }]], seed: 11 },
    nebel: { pal: ['#3a4a55', '#10171c', '#b8d0e0', '#e0f0f8', '#ffffff'], fx: [['rise', { n: 16, c: 3, shape: 'dot', size: 40, speed: .04, dir: -1, spread: 1.2, sway: 3, a: .14 }]], seed: 13 },
    vollmond: { pal: ['#1e2a55', '#060a1c', '#c8d6ff', '#7a8cff', '#ffffff'], fx: [['stars', { n: 80, c: 4 }], ['moon', { c: 4, r: 1.1, x: 1.1, y: -1.6 }]], seed: 15 },
    glitch: { pal: ['#0b1f1f', '#020909', '#2affee', '#ff2ad1', '#ffffff'], fx: [['matrix', { n: 16, c: 2, a: .3 }], ['glitch', { rate: 4, c: 2, c2: 3, a: .22 }], ['scan', { a: .18 }]], seed: 17 },
    singularitaet: { pal: ['#2a1048', '#05020d', '#b86aff', '#ff9a3a', '#ffe0a8'], fx: [['stars', { n: 100, c: 4 }], ['spiral', { arms: 3, n: 70, c: 2, c2: 3, twist: 4, speed: .1, r: 1.6, size: 5, a: .45 }]], seed: 19 },
  };
  let wW = 0, wH = 0, curW = null, wFrame = 0;
  function sizeWeather() { wW = window.innerWidth; wH = window.innerHeight; wcv.width = Math.round(wW / 1.5); wcv.height = Math.round(wH / 1.5); }
  window.addEventListener('resize', sizeWeather); sizeWeather();
  function drawWeather(ms) {
    const w = weatherNow();
    if (!curW || curW !== w.id) { if (curW) { wcv.style.transition = 'opacity .5s'; wcv.style.opacity = 0; setTimeout(() => { wcv.style.opacity = 1; }, 450); } curW = w.id; renderWeather(); }
    if ((wFrame++ & 1) && !K.open) return;
    const sc2 = WSCENE[w.id] || WSCENE.normal; wc.setTransform(wcv.width / wW, 0, 0, wcv.height / wH, 0, 0);
    const R = Math.min(wW, wH) * 0.22; FX.scene(wc, sc2, { cx: wW / 2, cy: wH * 0.35, R, W: wW, H: wH, q: Math.min(Q, .6) }, ms / 1000);
  }

  /* ---------- Kino: große Enthüllung ab „Legendär“ ---------- */
  const kcv = $('#kinocv'), kc = kcv.getContext('2d');
  let kW = 0, kH = 0, kDpr = 1;
  function sizeKino() { kDpr = Math.min(window.devicePixelRatio || 1, 2); kW = window.innerWidth; kH = window.innerHeight; kcv.width = Math.round(kW * kDpr); kcv.height = Math.round(kH * kDpr); }
  window.addEventListener('resize', () => { if (K.open) sizeKino(); });
  function openKino(res) {
    const a = res.best, tier = a.tier; let intro = [0, 0, 0, 0, 0, 1.7, 2.5, 3.5, 4.5, 6][tier];
    if (S.set.kino === 'kurz') intro = Math.max(0.9, intro * 0.4);
    Object.assign(K, { open: true, a, res, t0: performance.now(), intro, reveal: false, canClose: false, autoClose: S.auto && S.up.auto && tier <= 6 ? 3800 : 0, revealAt: 0 });
    sizeKino();
    const el = $('#kino'); el.hidden = false; el.className = ''; el.style.setProperty('--tc', tierCol(tier));
    $('.k-tier', el).textContent = TIERS[tier].name.toUpperCase(); $('.k-name', el).textContent = a.name; $('.k-odds', el).textContent = fmtOdds(a.odds);
    $('.k-desc', el).textContent = a.desc; $('.k-gain', el).textContent = '+' + fmt(res.coins) + ' Derp-Taler' + (res.n > 1 ? '  ·  bester von ' + res.n + ' Würfen' : '');
    $('.k-new', el).hidden = !res.isNew;
    if (tier >= 7) el.classList.add('cine');
    SFX.cinematic(tier, intro);
  }
  function closeKino() {
    if (!K.open) return; K.open = false; $('#kino').hidden = true; cdEnd = Math.max(cdEnd, performance.now() + 350);
    if (sheet === 'coll') renderSheet();
  }
  function drawKino(ms) {
    const a = K.a, tier = a.tier, et = (ms - K.t0) / 1000, c = kc, tc = tierCol(tier); c.setTransform(kDpr, 0, 0, kDpr, 0, 0);
    const cx = kW / 2, cy = kH * 0.4, R = Math.min(kW, kH * 0.8) * 0.34, big = Math.max(kW, kH);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(0, 0, kW, kH);
    if (et < K.intro) {
      const p = et / K.intro, amp = (1.2 + tier * 1.1) * p * p;
      c.save(); c.translate((Math.random() - 0.5) * amp * 2, (Math.random() - 0.5) * amp * 2);
      const bg = c.createRadialGradient(cx, cy, 0, cx, cy, big * 0.8); bg.addColorStop(0, hexA(a.pal[0], 0.15 + p * 0.7)); bg.addColorStop(1, '#000'); c.fillStyle = bg; c.fillRect(0, 0, kW, kH);
      c.globalCompositeOperation = 'lighter';
      FX.dot(c, cx, cy, R * (0.9 + p * 1.8), a.pal[2], 0.25 + p * 0.6);
      const n = Math.round((70 + tier * 18) * Math.max(0.5, Q)), sc = kW < 600 ? 1 : 1.4;
      for (let i = 0; i < n; i++) {
        const ph = fract(hash(i) * 5 + p * (1.4 + hash(i + 9) * 1.6)), r = lerp(big * 0.7, R * 0.18, Math.pow(ph, 1.6)), ang = hash(i * 3.7) * TAU + p * 4 + ph * (2 + hash(i) * 3);
        FX.dot(c, cx + Math.cos(ang) * r, cy + Math.sin(ang) * r * 0.75, (2 + hash(i + 2) * 4) * sc, [a.pal[2], a.pal[3], a.pal[4], tc][i % 4], Math.sin(ph * Math.PI) * (0.3 + p * 0.7));
      }
      if (tier >= 6) {
        c.lineCap = 'round';
        for (let r = 0; r < 8 + tier; r++) {
          const an = hash(r * 5.3) * TAU, len = R * p * (0.8 + hash(r) * 2.2); c.strokeStyle = hexA('#ffffff', 0.3 * p + 0.05); c.lineWidth = 1 + hash(r + 3) * 1.6; c.beginPath(); c.moveTo(cx, cy);
          for (let s = 1; s <= 6; s++) { const f = s / 6, j = (hash(r * 7 + s + Math.floor(et * 12)) - 0.5) * R * 0.25 * f; c.lineTo(cx + Math.cos(an) * len * f - Math.sin(an) * j, cy + Math.sin(an) * len * f + Math.cos(an) * j); } c.stroke();
        }
      }
      c.globalCompositeOperation = 'source-over';
      drawDerp(c, cx, cy, R * 0.62 * (1 + p * 0.1), et, { dark: true, seed: a.seed });
      c.restore();
      return;
    }
    const el = $('#kino');
    if (!K.reveal) { K.reveal = true; K.revealAt = ms; el.classList.add('reveal'); const f = $('.k-flash', el); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
    const rt = (ms - K.revealAt) / 1000; K.canClose = rt > 0.8;
    const sh = Math.max(0, 1 - rt * 2) * (3 + tier * 1.6);
    c.save(); c.translate((Math.random() - 0.5) * sh * 2, (Math.random() - 0.5) * sh * 2);
    const g = { cx, cy, R, W: kW, H: kH, q: Q };
    FX.renderAura(c, a, g, et, { k: easeOut(rt / 0.7), pop: Math.max(0, 1 - rt * 1.6) });
    c.globalCompositeOperation = 'lighter';
    for (let j = 0; j < 2; j++) { const f = clamp((rt - j * 0.15) / 1.4, 0, 1); if (f < 1) { c.strokeStyle = hexA(j ? '#ffffff' : tc, 1 - f); c.lineWidth = (1 - f) * (18 - j * 8) + 1; c.beginPath(); c.arc(cx, cy, easeOut(f) * big * 0.9, 0, TAU); c.stroke(); } }
    c.globalCompositeOperation = 'source-over';
    if (tier >= 6 && rt < 7) FX.layers.confetti(c, g, { n: Math.round(34 * Q) }, et, a.pal);
    c.restore();
    if (K.autoClose && rt * 1000 > K.autoClose) closeKino();
  }
  $('#kino').addEventListener('pointerdown', () => { if (K.open && K.canClose) closeKino(); });

  /* ---------- Fenster: Sammlung, Shop, Labor, Erfolge ---------- */
  const ui = { filter: 'alle' };
  const TITLES = { coll: 'Sammlung', shop: 'Shop', lab: 'Labor', ach: 'Erfolge' };
  function openSheet(name) {
    if (sheet === name) { closeSheet(); return; }
    sheet = name; $('#sheet').hidden = false; SFX.tab();
    $$('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
    if (name === 'coll') { newColl = 0; $('#tabs [data-tab=coll] .badge').hidden = true; }
    $('#sheet-body').scrollTop = 0; renderSheet();
  }
  function closeSheet() { sheet = null; $('#sheet').hidden = true; $$('#tabs button').forEach((b) => b.classList.remove('on')); }
  function renderSheet() {
    if (!sheet) return;
    const body = $('#sheet-body'), keep = body.scrollTop; $('#sheet-title').textContent = TITLES[sheet]; body.innerHTML = '';
    ({ coll: renderColl, shop: renderShop, lab: renderLab, ach: renderAch })[sheet](body);
    body.scrollTop = keep;
  }
  function renderColl(body) {
    $('#sheet-sub').textContent = found() + ' von ' + AURAS.length + ' gefunden';
    const fl = [['alle', 'Alle'], ['da', 'Gefunden'], ['fehlt', 'Fehlend'], ['wetter', 'Wetter']];
    body.append(h('div', { class: 'filters' }, fl.map(([k, n]) => h('button', { class: ui.filter === k ? 'on' : '', text: n, onclick: () => { ui.filter = k; SFX.click(); renderSheet(); } }))));
    const list = AURAS.slice().sort((a, b) => a.odds - b.odds).filter((a) => ui.filter === 'alle' || (ui.filter === 'da' && S.inv[a.id]) || (ui.filter === 'fehlt' && !S.inv[a.id]) || (ui.filter === 'wetter' && a.biome));
    if (!list.length) body.append(h('p', { class: 'hint', text: 'Hier ist noch nichts. Würfle weiter!' }));
    const grid = h('div', { class: 'grid' });
    list.forEach((a) => {
      const inv = S.inv[a.id], c = h('button', { class: 'cardx' + (inv ? '' : ' locked') + (S.shown === a.id ? ' eq' : ''), style: { '--tc': tierCol(a.tier) }, onclick: () => { SFX.click(); openDetail(a); } },
        h('div', { class: 'th' }, inv ? h('img', { src: FX.thumb(a, 160), alt: a.name, width: 160, height: 160 }) : h('span', { class: 'q', text: '?' })),
        h('div', { class: 'nm', text: inv ? a.name : '???' }), h('div', { class: 'od', text: fmtOdds(a.odds) }), inv ? h('span', { class: 'cnt', text: '×' + fmtShort(inv.n) }) : null);
      grid.append(c);
    });
    body.append(grid);
  }
  function upRow(k) {
    const u = UPS[k], lv = S.up[k], maxed = lv >= u.max, cost = maxed ? 0 : u.cost(lv), can = !maxed && S.coins >= cost;
    const cur = u.show(u.val(lv)), nxt = maxed ? null : u.show(u.val(lv + 1));
    return h('div', { class: 'rowx' }, h('div', { class: 'ico', html: '<span class="ic">' + ico(u.ic) + '</span>' }),
      h('div', { class: 'mid' }, h('div', { class: 'nm' }, u.name, u.max > 1 ? h('span', { class: 'lv', text: 'Stufe ' + lv + '/' + u.max }) : null), h('div', { class: 'ds', text: u.text }),
        h('div', { class: 'st', text: maxed ? cur + '  (Maximum)' : cur + '  →  ' + nxt })),
      maxed ? h('div', { class: 'btn ghost small', text: 'Fertig' }) : h('button', { class: 'btn gold' + (can ? '' : ' off'), onclick: () => buyUp(k) }, h('span', { class: 'ic', html: ico('coin') }), fmtShort(cost)));
  }
  function renderShop(body) {
    $('#sheet-sub').textContent = fmtShort(S.coins) + ' Derp-Taler';
    body.append(h('p', { class: 'hint', text: 'Mit Derp-Talern wird dein Derp besser im Würfeln. Jede Aura bringt Taler, seltene viel mehr.' }));
    body.append(h('div', { class: 'list' }, ['luck', 'speed', 'coin', 'multi', 'auto', 'sleep'].map(upRow)));
  }
  function renderLab(body) {
    $('#sheet-sub').textContent = fmtShort(S.coins) + ' Derp-Taler';
    body.append(h('p', { class: 'hint', text: 'Tränke wirken eine Weile. Von jeder Sorte zählt nur der stärkste Trank, aber Glück, Tempo und Taler wirken zusammen.' }));
    const t = Date.now();
    body.append(h('div', { class: 'list' }, POTIONS.map((p) => {
      const have = S.pot[p.id] || 0, act = S.act[p.id] > t, can = S.coins >= p.price;
      const eff = p.kind === 'luck' ? 'Glück ×' + p.mult : p.kind === 'speed' ? 'Pause ÷' + p.mult : 'Taler ×' + p.mult;
      return h('div', { class: 'rowx', style: { '--pc': p.color } }, h('div', { class: 'ico', style: { background: 'linear-gradient(160deg,' + p.color + ',rgba(0,0,0,.3))' }, html: '<span class="ic">' + ico('flask') + '</span>' }),
        h('div', { class: 'mid' }, h('div', { class: 'nm', text: p.name }), h('div', { class: 'ds', text: p.text }), h('div', { class: 'st' }, eff + ' für ' + fmtDur(p.dur * 1000) + '  ·  im Beutel: ', h('span', { class: 'pcount', text: have }), act ? h('span', { class: 'pcount', text: '  (läuft noch ' + fmtTime((S.act[p.id] - t) / 1000) + ')' }) : null)),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          h('button', { class: 'btn gold small' + (can ? '' : ' off'), onclick: () => buyPot(p.id) }, h('span', { class: 'ic', html: ico('coin') }), fmtShort(p.price)),
          h('button', { class: 'btn small' + (have ? '' : ' off'), onclick: () => drink(p.id), text: 'Trinken' })));
    })));
  }
  function renderAch(body) {
    const done = ACH.filter((a) => S.ach[a.id]).length; $('#sheet-sub').textContent = done + ' von ' + ACH.length;
    const list = ACH.slice().sort((a, b) => (S.ach[a.id] ? 1 : 0) - (S.ach[b.id] ? 1 : 0));
    body.append(h('div', { class: 'list' }, list.map((a) => {
      const val = Math.min(a.goal, a.get()), ok = !!S.ach[a.id];
      return h('div', { class: 'rowx' + (ok ? ' done' : '') }, h('div', { class: 'ico', html: '<span class="ic">' + ico(ok ? 'star' : 'ach') + '</span>' }),
        h('div', { class: 'mid' }, h('div', { class: 'nm', text: a.name }), h('div', { class: 'ds', text: a.text }), ok ? h('div', { class: 'st', text: 'Erledigt' }) : h('div', null, h('div', { class: 'prog' }, h('i', { style: { width: (val / a.goal) * 100 + '%' } })), h('div', { class: 'ds', text: fmtShort(val) + ' / ' + fmtShort(a.goal) }))),
        h('div', { class: 'pcount', text: '+' + fmtShort(a.reward) }));
    })));
  }

  /* ---------- Detail, Einstellungen, Hinweise ---------- */
  let modalRaf = 0;
  function openModal(node) { $('#modal-box').innerHTML = ''; $('#modal-box').append(node); $('#modal').hidden = false; }
  function closeModal() { $('#modal').hidden = true; cancelAnimationFrame(modalRaf); modalRaf = 0; $('#modal-box').innerHTML = ''; }
  $('#modal').addEventListener('pointerdown', (e) => { if (e.target === $('#modal')) closeModal(); });
  function openDetail(a) {
    const inv = S.inv[a.id], wn = a.biome ? WETTER.find((w) => w.id === a.biome).name : null, wid = weatherNow().id;
    const ch = auraChance(a, luck(), a.biome || wid);
    const cv = h('canvas', { width: 480, height: 480 });
    const node = h('div', { class: 'det', style: { '--tc': tierCol(a.tier) } }, cv,
      h('h3', { text: inv ? a.name : '???' }), h('div', { class: 'tc' }, h('span', { class: 'chip', text: TIERS[a.tier].name })),
      h('p', { text: inv ? a.desc : 'Noch nicht gefunden.' + (wn ? ' Taucht nur bei „' + wn + '“ auf.' : '') }),
      h('div', { class: 'facts' }, h('div', null, 'Seltenheit', h('b', { text: fmtOdds(a.odds) })), h('div', null, 'Mit deinem Glück', h('b', { text: ch > 0 ? fmtOdds(Math.round(1 / ch)) : (wn ? 'nur bei ' + wn : '–') })),
        h('div', null, 'Gefunden', h('b', { text: inv ? '×' + fmt(inv.n) : 'noch nie' })), h('div', null, 'Zuerst am', h('b', { text: inv ? new Date(inv.t).toLocaleDateString('de-DE') : '–' }))),
      h('div', { class: 'acts' }, inv ? h('button', { class: 'btn', text: 'Auf der Bühne zeigen', onclick: () => { S.shown = a.id; stage.aura = a; stage.pop = 0.6; setInfo(a); save(); closeModal(); closeSheet(); SFX.pop(Math.min(3, a.tier)); } }) : null, h('button', { class: 'btn ghost', text: 'Schließen', onclick: closeModal })));
    openModal(node);
    const c = cv.getContext('2d'), dpr = 2, S0 = 480;
    const loop = (ms) => { modalRaf = requestAnimationFrame(loop); c.setTransform(1, 0, 0, 1, 0, 0); c.scale(S0 / 240, S0 / 240);
      const g = { cx: 120, cy: 120, R: 76, W: 240, H: 240, q: Math.max(0.5, Q) };
      if (inv) FX.renderAura(c, a, g, ms / 1000, {});
      else { FX.drawBackdrop(c, g, a); drawDerp(c, 120, 120, 50, ms / 1000, { dark: true, seed: a.seed }); c.fillStyle = 'rgba(255,255,255,.35)'; c.font = '900 40px ui-rounded,system-ui'; c.textAlign = 'center'; c.fillText('?', 120, 128); } };
    loop(performance.now());
  }
  function seg(opts, cur, on) { return h('div', { class: 'seg' }, opts.map(([v, n]) => h('button', { class: cur === v ? 'on' : '', text: n, onclick: (e) => { on(v); $$('button', e.target.parentNode).forEach((b) => b.classList.remove('on')); e.target.classList.add('on'); SFX.click(); } }))); }
  function applyAudio() { SFX.set({ ton: S.set.ton, musik: S.set.musik }); }
  function openSettings() {
    SFX.click(); let sure = false;
    const resetBtn = h('button', { class: 'btn ghost', text: 'Alles zurücksetzen', onclick: () => { if (!sure) { sure = true; resetBtn.textContent = 'Wirklich alles löschen?'; resetBtn.style.color = '#ff7a8a'; return; } try { localStorage.removeItem(KEY); } catch (e) { } S = fresh(); dirty = false; location.reload(); } });
    const stat = (n, v) => h('div', { class: 'stat' }, h('span', { text: n }), h('b', { text: v }));
    const best = S.bestId ? AURA_BY_ID[S.bestId] : null;
    const node = h('div', { class: 'set' }, h('div', { class: 'title-row' }, h('h3', { text: 'Einstellungen' }), h('button', { class: 'iconbtn', 'aria-label': 'Schließen', html: ico('close'), onclick: closeModal })),
      h('div', { class: 'opt' }, h('div', null, 'Ton'), seg([[true, 'An'], [false, 'Aus']], S.set.ton, (v) => { S.set.ton = v; applyAudio(); save(); })),
      h('div', { class: 'opt' }, h('div', null, 'Musik', h('small', { text: 'Ruhige Zufallsmelodie' })), seg([[true, 'An'], [false, 'Aus']], S.set.musik, (v) => { S.set.musik = v; applyAudio(); save(); })),
      h('div', { class: 'opt' }, h('div', null, 'Große Enthüllung', h('small', { text: 'Das Kino ab „Legendär“' })), seg([['voll', 'Voll'], ['kurz', 'Kurz'], ['aus', 'Aus']], S.set.kino, (v) => { S.set.kino = v; save(); })),
      h('div', { class: 'opt' }, h('div', null, 'Effekte', h('small', { text: 'Sparsam hilft bei ruckelndem Handy' })), seg([['auto', 'Normal'], ['low', 'Sparsam']], S.set.q, (v) => { S.set.q = v; Q = v === 'low' ? 0.45 : 1; save(); })),
      h('div', { class: 'opt' }, h('div', null, 'Spielstand-Code', h('small', { text: 'Spielstand in ein anderes Fenster mitnehmen' })), h('button', { class: 'btn small', text: 'Öffnen', onclick: () => { if (window.LGH && LGH.oeffnen) LGH.oeffnen(); else toast('Hier nicht verfügbar'); } })),
      h('h4', { text: 'Statistik' }), stat('Würfe', fmt(S.rolls)), stat('Auren gefunden', found() + ' von ' + AURAS.length), stat('Seltenste Aura', best ? best.name : '–'), stat('Derp-Taler verdient', fmtShort(S.total)), stat('Tränke getrunken', fmt(S.st.drunk)), stat('Derp angestupst', fmt(S.st.pokes)),
      h('div', { style: { marginTop: '16px', textAlign: 'center' } }, resetBtn));
    openModal(node);
  }

  /* ---------- Schlaf-Würfeln ---------- */
  function offline() {
    const el = Date.now() - (S.tick || Date.now());
    if (!(S.auto && S.up.auto && S.up.sleep > 0) || el < 60000) { S.tick = Date.now(); return; }
    const lv = S.up.sleep, ms = Math.min(el, lv * 3600e3), eff = lv * 0.2, cd = UPS.speed.val(S.up.speed), n = Math.min(40000, Math.floor((ms / 1000 / cd) * eff * Math.min(S.multi, multiMax())));
    if (n < 5) { S.tick = Date.now(); return; }
    const t0 = S.tick, lk = UPS.luck.val(S.up.luck), cm = UPS.coin.val(S.up.coin), counts = {}, fresh = []; let coins = 0, best = null;
    for (let i = 0; i < n; i++) {
      const w = wetterZu(t0 + (ms * i) / n), a = pickAura(lk, w.id); counts[a.id] = (counts[a.id] || 0) + 1; coins += coinsFor(a, cm); if (!best || a.odds > best.odds) best = a;
    }
    S.rolls += n; S.coins += coins; S.total += coins; const now = Date.now();
    for (const id in counts) { if (!S.inv[id]) { S.inv[id] = { n: 0, t: now }; fresh.push(id); } S.inv[id].n += counts[id]; }
    if (best.odds > S.best) { S.best = best.odds; S.bestId = best.id; }
    if (best.tier >= 5) S.st.big++;
    S.tick = Date.now(); if (fresh.length) { newColl += fresh.length; $('#tabs [data-tab=coll] .badge').hidden = false; }
    showCoins(); checkAch(); save(); flush();
    const top = Object.keys(counts).map((id) => AURA_BY_ID[id]).sort((a, b) => b.odds - a.odds).slice(0, 4);
    openModal(h('div', { class: 'det set' }, h('h3', { text: 'Willkommen zurück!' }),
      h('p', { text: 'Dein Derp hat ' + fmtDur(ms) + ' lang im Schlaf gewürfelt: ' + fmt(n) + ' Würfe, ' + fmtShort(coins) + ' Derp-Taler.' }),
      h('div', { class: 'stat' }, h('span', { text: 'Neue Auren' }), h('b', { text: fresh.length })),
      top.map((a) => h('div', { class: 'stat' }, h('span', { text: a.name + '  ·  ' + TIERS[a.tier].name }), h('b', { text: '×' + fmt(counts[a.id]) }))),
      h('div', { class: 'acts' }, h('button', { class: 'btn', text: 'Weiter', onclick: closeModal }))));
    SFX.pop(Math.min(4, best.tier));
  }

  /* ---------- Start und Hauptschleife ---------- */
  function init() {
    $('#coin-ic').innerHTML = ico('coin'); $('#btn-settings').innerHTML = ico('gear'); $('#auto-ic').innerHTML = ico('auto'); $('#roll-ic').innerHTML = ico('dice');
    $$('#tabs button').forEach((b) => { $('.ic', b).innerHTML = ico(b.dataset.tab); b.addEventListener('click', () => openSheet(b.dataset.tab)); });
    $('#sheet-close').innerHTML = ico('close'); $('#sheet-close').addEventListener('click', () => { SFX.click(); closeSheet(); });
    $('#btn-settings').addEventListener('click', openSettings);
    const roll = $('#btn-roll');
    roll.addEventListener('pointerdown', (e) => { e.preventDefault(); SFX.unlock(); holding = true; roll.classList.add('held'); tryRoll(true); });
    const up = () => { holding = false; roll.classList.remove('held'); };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => roll.addEventListener(ev, up));
    $('#btn-auto').addEventListener('click', () => {
      if (!S.up.auto) { SFX.no(); toast('Auto-Würfler fehlt noch', 'Im Shop freischalten.'); return; }
      S.auto = !S.auto; SFX.click(); save(); renderControls();
    });
    $('#btn-multi').addEventListener('click', () => {
      const steps = MULTI_STEPS.filter((v) => v <= multiMax()); if (steps.length < 2) { SFX.no(); toast('Mehrfachwurf fehlt noch', 'Im Shop freischalten.'); return; }
      S.multi = steps[(steps.indexOf(S.multi) + 1) % steps.length]; SFX.click(); save(); renderControls();
    });
    $('#stage').addEventListener('pointerdown', (e) => {
      if (e.target !== scv || K.open) return;
      S.st.pokes++; stage.pop = 0.8; stage.expr = ['shock', 'star', 'love', 'wink', 'derp', 'grin'][Math.floor(Math.random() * 6)]; stage.exprUntil = performance.now() + 900; SFX.derp(); checkAch(); save();
    });
    document.addEventListener('pointerdown', () => { SFX.unlock(); applyAudio(); }, { once: true, passive: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (!$('#modal').hidden) closeModal(); else if (sheet) closeSheet(); }
      if ((e.key === ' ' || e.key === 'Enter') && $('#modal').hidden && !K.open && document.activeElement === document.body) { e.preventDefault(); tryRoll(true); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { S.tick = Date.now(); dirty = true; flush(); } else offline(); });
    window.addEventListener('pagehide', () => { S.tick = Date.now(); dirty = true; flush(); });
    if (S.set.q === 'low') Q = 0.45;
    setInfo(stage.aura); if (!S.shown) { $('#aura-tier').textContent = 'Auren-Würfler'; $('#aura-name').textContent = 'Dein Derp'; $('#aura-odds').textContent = 'Würfle deine erste Aura!'; }
    showCoins(); renderControls(); renderWeather(); sizeStage(); checkAch();
    offline();
    requestAnimationFrame(frame);
  }
  let lastMs = performance.now(), fpsAcc = 0, fpsN = 0, sec = 0;
  function frame(ms) {
    requestAnimationFrame(frame);
    const dt = Math.min(100, ms - lastMs); lastMs = ms; fpsAcc += dt; fpsN++;
    if (fpsN >= 90) { const avg = fpsAcc / fpsN; if (S.set.q !== 'low') { if (avg > 27 && Q > 0.4) Q = Math.max(0.4, Q - 0.2); else if (avg < 19 && Q < 1) Q = Math.min(1, Q + 0.1); } fpsAcc = 0; fpsN = 0; }
    if (!K.open && ms >= cdEnd && (holding || (S.auto && S.up.auto))) tryRoll(holding);
    const prog = cdEnd > cdStart ? clamp((ms - cdStart) / (cdEnd - cdStart), 0, 1) : 1, rb = $('#btn-roll');
    rb.style.setProperty('--pd', prog * 360 + 'deg'); rb.classList.toggle('ready', prog >= 1);
    if (K.open) drawKino(ms); else drawStage(ms);
    drawWeather(ms);
    if (ms - sec > 500) {
      sec = ms; S.tick = Date.now();
      $('#w-time').textContent = fmtTime(wetterRest(Date.now()) / 1000);
      $('#cd-text').textContent = prog < 1 ? 'Pause ' + ((cdEnd - ms) / 1000).toFixed(1).replace('.', ',') + ' s' : S.auto && S.up.auto ? 'Auto-Würfler läuft' : 'Halte den Knopf für Dauer-Würfeln';
      renderControls(); if (sheet === 'lab') renderSheet();
    }
  }
  window.__arng = { get S() { return S; }, tryRoll, openKino, force: (id) => { cdEnd = 0; return tryRoll(true, id); }, AURAS, setCoins: (n) => { S.coins = n; showCoins(); save(); }, stage };
  init();
})();

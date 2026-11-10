'use strict';
/* Derp RNG: Spiellogik und Oberfläche */
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
    derp: '<circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="10.5" r=".8"/><circle cx="15" cy="10.5" r=".8"/><path d="M9 15c1.8 1.6 4.2 1.6 6 0"/>',
    cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 10.5a4 4 0 0 1-.5 8z"/>',
    flask: '<path d="M9.5 3.5h5M10.5 3.5v5.6L5.2 18a2.2 2.2 0 0 0 1.9 3.3h9.8a2.2 2.2 0 0 0 1.9-3.3l-5.3-8.9V3.5"/>',
  };
  const ico = (n) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || '') + '</svg>';
  const tierCol = (t) => TIERS[t].color;

  /* ---------- Spielstand ---------- */
  function fresh() {
    return { v: 1, born: Date.now(), coins: 0, total: 0, rolls: 0, inv: {}, up: { luck: 0, speed: 0, coin: 0, weather: 0, collect: 0, multi: 0, auto: 0, sleep: 0 }, pot: {}, act: {}, ach: {}, best: 0, bestId: null, shown: null, multi: 1, auto: false,
      rb: { n: 0, klee: 0, all: 0, run: 0, up: { luck: 0, coin: 0, speed: 0, start: 0, auto: 0, sleep: 0 } }, q: [], qdone: 0, daily: { day: '', streak: 0, best: 0 }, wpot: null,
      st: { pokes: 0, drunk: 0, wdrunk: 0, kinos: 0, big: 0, away: 0 }, set: { ton: true, musik: true, kino: 'voll', q: 'auto' }, tick: Date.now() };
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
  const kleeMul = () => 1 + 0.03 * S.rb.all;
  const baseLuck = () => UPS.luck.val(S.up.luck) * kleeMul() * (1 + 0.1 * S.rb.up.luck);
  const baseCoin = () => UPS.coin.val(S.up.coin) * (1 + 0.2 * S.rb.up.coin) * (1 + UPS.collect.val(S.up.collect) * found());
  const baseCd = () => UPS.speed.val(S.up.speed) * Math.pow(0.97, S.rb.up.speed);
  const bioM = () => UPS.weather.val(S.up.weather);
  const luck = () => baseLuck() * potMult('luck');
  const cdSec = () => Math.max(0.1, baseCd() / potMult('speed'));
  const coinM = () => baseCoin() * potMult('coin');
  function addCoins(n) { S.coins += n; S.total += n; S.rb.run += n; }
  const multiMax = () => UPS.multi.val(S.up.multi);
  const wRest = () => (S.wpot && S.wpot.until > Date.now() ? S.wpot.until - Date.now() : wetterRest(Date.now()));
  const weatherNow = () => { const w = S.wpot; if (w && w.until > Date.now() && WETTER_BY_ID[w.wid]) return WETTER_BY_ID[w.wid]; return wetterZu(Date.now()); };
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
    toastBox().append(t); while (toastBox().children.length > 2) toastBox().firstChild.remove();
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
    const stg = $('#stage'); stg.style.setProperty('--tc', tierCol(a.tier)); stg.style.setProperty('--gi', [0, 0.05, 0.2, 0.4, 0.55, 0.75, 0.9, 1, 1, 1][a.tier]);
    $('#aura-name').textContent = a.name;
    $('#aura-odds').textContent = fmtOdds(a.odds) + (res && res.isNew ? '  ·  NEU!' : '') + (res && res.n > 1 ? '  ·  bester von ' + res.n : '');
    const el = $('#aura-info'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  }

  /* ---------- Würfeln ---------- */
  function rollCore(n, forceId) {
    const now = Date.now(), wid = weatherNow().id, lk = luck(), cm = coinM();
    let best = null, coins = 0; const counts = {}, fresh = [];
    for (let i = 0; i < n; i++) {
      const a = forceId ? AURA_BY_ID[forceId] : pickAura(lk, wid, null, bioM());
      counts[a.id] = (counts[a.id] || 0) + 1; coins += coinsFor(a, cm);
      if (!best || a.odds > best.odds) best = a;
    }
    S.rolls += n; addCoins(coins);
    for (const id in counts) { if (!S.inv[id]) { S.inv[id] = { n: 0, t: now }; fresh.push(id); } S.inv[id].n += counts[id]; }
    if (best.odds > S.best) { S.best = best.odds; S.bestId = best.id; }
    S.shown = best.id;
    qAdd('rolls', n); qAdd('coins', coins); if (fresh.length) qAdd('new', fresh.length); qTier(best.tier);
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
    const a = res.best, t = a.tier, kino = t >= 5 && S.set.kino !== 'aus';
    if (res.fresh.length) { newColl += res.fresh.length; $('#tabs [data-tab=coll] .badge').hidden = false; }
    showCoins();
    const nowt = performance.now();
    if (K.skipSound || nowt - lastSfx > 90 || t >= 3) { lastSfx = nowt; if (cd > 500 || manual) SFX.roll(); }
    const charge = !kino && (manual || cd >= 800) ? Math.min(cd * 0.55, 240 + t * 70) : 0;
    if (kino) { S.st.kinos++; stage.aura = a; stage.pop = 1; setInfo(a, res); floatText('+' + fmtShort(res.coins), '#ffd24a'); openKino(res); }
    else if (charge > 90) {
      stage.charge = { t0: performance.now(), dur: charge, tc: tierCol(t), tier: t }; const rb = $('#btn-roll'); rb.classList.add('rolling');
      setTimeout(() => { stage.charge = null; rb.classList.remove('rolling'); reveal(res, manual, cd); }, charge);
    } else reveal(res, manual, cd);
    if (t >= 5) S.st.big++;
    checkAch(); save();
    if (sheet === 'shop') renderSheet();
  }
  function reveal(res, manual, cd) {
    const a = res.best, t = a.tier;
    stage.aura = a; stage.pop = 1; stage.t0 = performance.now(); setInfo(a, res);
    floatText('+' + fmtShort(res.coins), '#ffd24a');
    const feed = $('#feed');
    if (t >= 1 || res.n > 1) {
      const it = h('div', { class: 'feed-i', style: { '--tc': tierCol(t) } }, h('i'), a.name, res.n > 1 ? h('span', { text: '×' + res.n }) : null);
      feed.append(it); while (feed.children.length > 4) feed.firstChild.remove(); setTimeout(() => it.remove(), 6200);
    }
    SFX.pop(t);
    if (t >= 3) { banner(a); shake(); }
    if (t >= 2) flash(t);
    if (manual || cd >= 500) flyCoins(Math.min(9, 1 + t * 1));
  }
  function flash(t) {
    const f = $('#flash'); f.style.setProperty('--fa', 0.18 + t * 0.07); f.style.setProperty('--tc', tierCol(t));
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  }
  let flying = 0;
  function flyCoins(n) {
    if (flying > 22) return; const src = $('#stage').getBoundingClientRect(), dst = $('#coin-ic').getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const e = h('i', { class: 'fcoin' }); document.body.append(e); flying++;
      const x0 = src.left + src.width / 2 + (Math.random() - 0.5) * 70, y0 = src.top + src.height * 0.45 + (Math.random() - 0.5) * 40, x1 = dst.left + dst.width / 2, y1 = dst.top + dst.height / 2;
      const an = e.animate([{ transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(.3)', opacity: 0 }, { transform: 'translate(' + (x0 + (Math.random() - 0.5) * 90) + 'px,' + (y0 - 40 - Math.random() * 50) + 'px) scale(1)', opacity: 1, offset: 0.28 }, { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.5)', opacity: 0.9 }],
        { duration: 700 + i * 50, delay: i * 45, easing: 'cubic-bezier(.45,0,.75,.55)', fill: 'both' });
      an.onfinish = () => { e.remove(); flying--; if (i === n - 1) { const p = $('#coins'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); } };
    }
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
  ACH.push({ id: 'r1000000', name: 'Würfel-Unendlich', text: '1.000.000 Mal würfeln', goal: 1e6, get: () => S.rolls, reward: 5e7 });
  [200, 1500, 8000, 60000, 400000, 3e6, 2e7, 1.5e8, 1.5e9, 2e10].forEach((r, i) => { const T = TIERS[i], n = AURAS.filter((a) => a.tier === i).length; ACH.push({ id: 'full' + i, name: 'Komplett: ' + T.name, text: 'Alle ' + n + ' Auren der Stufe „' + T.name + '“ finden', goal: n, get: () => AURAS.filter((a) => a.tier === i && S.inv[a.id]).length, reward: r }); });
  ACH.push({ id: 'coin3', name: 'Milliardär', text: '1 Milliarde Derp-Taler verdienen', goal: 1e9, get: () => S.total, reward: 1e7 });
  ACH.push({ id: 'coin4', name: 'Derp-Dagobert', text: '1 Billion Derp-Taler verdienen', goal: 1e12, get: () => S.total, reward: 1e10 });
  [[1, 'Aufsteiger', 2e4], [3, 'Dreimal Derp', 3e5], [10, 'Phönix-Derp', 5e6]].forEach(([g, n, r]) => ACH.push({ id: 'rb' + g, name: n, text: g + (g === 1 ? ' Mal' : ' Mal') + ' aufsteigen', goal: g, get: () => S.rb.n, reward: r }));
  [[10, 'Fleißbienchen', 2000], [50, 'Mission: Möglich', 5e4], [200, 'Auftragsprofi', 2e6]].forEach(([g, n, r]) => ACH.push({ id: 'q' + g, name: n, text: g + ' Missionen erledigen', goal: g, get: () => S.qdone, reward: r }));
  [[3, 'Stammgast', 1000], [7, 'Wochen-Derp', 2e4], [30, 'Monats-Derp', 1e6]].forEach(([g, n, r]) => ACH.push({ id: 'dl' + g, name: n, text: g + ' Tage in Folge das Tagesgeschenk holen', goal: g, get: () => S.daily.best, reward: r }));
  const NBIO = AURAS.filter((a) => a.biome).length;
  ACH.push({ id: 'wet5', name: 'Wettermacher', text: '5 Wetter-Auren finden', goal: 5, get: () => Object.keys(S.inv).filter((id) => AURA_BY_ID[id].biome).length, reward: 1e5 });
  ACH.push({ id: 'wetall', name: 'Wetter-Meister', text: 'Alle ' + NBIO + ' Wetter-Auren finden', goal: NBIO, get: () => Object.keys(S.inv).filter((id) => AURA_BY_ID[id].biome).length, reward: 5e7 });
  ACH.push({ id: 'wp1', name: 'Wetterhexe', text: 'Einen Wetter-Trank trinken', goal: 1, get: () => S.st.wdrunk, reward: 2000 });
  ACH.push({ id: 'wp10', name: 'Wetterfee', text: '10 Wetter-Tränke trinken', goal: 10, get: () => S.st.wdrunk, reward: 1e5 });
  ACH.push({ id: 'lk25', name: 'Gurken-König', text: 'Die Glücks-Gurke auf Stufe 25', goal: 25, get: () => S.up.luck, reward: 5e4 });
  ACH.push({ id: 'lk50', name: 'Gurken-Gott', text: 'Die Glücks-Gurke auf Stufe 50', goal: 50, get: () => S.up.luck, reward: 5e6 });
  ACH.push({ id: 'poke2', name: 'Stups-Meister', text: 'Den Derp 500 Mal anstupsen', goal: 500, get: () => S.st.pokes, reward: 1e4 });
  ACH.push({ id: 'mu1', name: 'Mehrfach-Mensch', text: 'Den Mehrfachwurf freischalten', goal: 1, get: () => S.up.multi, reward: 3000 });
  ACH.push({ id: 'sl1', name: 'Schlafmütze', text: 'Das Schlaf-Würfeln freischalten', goal: 1, get: () => S.up.sleep, reward: 2000 });
  ACH.push({ id: 'kino25', name: 'Kino-Fan', text: '25 große Enthüllungen erleben', goal: 25, get: () => S.st.kinos, reward: 1e5 });
  function checkAch() {
    ACH.forEach((a) => {
      if (S.ach[a.id] || a.get() < a.goal) return;
      S.ach[a.id] = Date.now(); addCoins(a.reward); showCoins();
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
    S.pot[id]--; const t = Date.now(); S.st.drunk++; SFX.drink(); qAdd('potion', 1);
    if (p.kind === 'weather') {
      S.act[id] = t + p.dur * 1000; S.wpot = { wid: p.wid, until: t + p.dur * 1000, id }; S.st.wdrunk++;
      toast(WETTER_BY_ID[p.wid].name, 'Das Wetter gehört dir für ' + fmtDur(p.dur * 1000) + '.', true);
    } else {
      S.act[id] = Math.max(t, S.act[id] || 0) + p.dur * 1000;
      toast(p.name + ' getrunken', p.kind === 'luck' ? 'Glück ×' + p.mult : p.kind === 'speed' ? 'Pause durch ' + p.mult : 'Taler ×' + p.mult);
    }
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
    const w = weatherNow(); $('#w-name').textContent = w.name; $('#w-text').textContent = w.text; $('#w-time').textContent = fmtTime(wRest() / 1000);
    $('#weather-chip').style.setProperty('--wc', w.sky[0] === '#2a2350' ? '#9a7bff' : '#' + w.sky[0].slice(1).replace(/./g, (c) => c));
    const col = { normal: '#9a7bff', nacht: '#7a8cff', gewitter: '#ffe14a', regenbogen: '#ff6a9a', schnee: '#7ad6ff', nebel: '#b8d0e0', vollmond: '#dfe6ff', glitch: '#2affee', singularitaet: '#b86aff', meteor: '#ffe9a0', vulkan: '#ff5a1a', fruehling: '#ff9ac8', disco: '#ff5ac8', finsternis: '#ff9a3a' }[w.id];
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
    const ch = stage.charge, expr = performance.now() < stage.exprUntil ? stage.expr : ch ? 'shock' : null;
    const R = Math.min(sW * 0.36, sH * 0.31), g = { cx: sW / 2, cy: sH * 0.44, R, W: sW, H: sH, q: Q };
    if (ch) {
      const p = clamp((ms - ch.t0) / ch.dur, 0, 1); sc.save(); const sh = p * p * (1.5 + ch.tier * 0.6); sc.translate((Math.random() - 0.5) * sh * 2, (Math.random() - 0.5) * sh * 2);
      FX.renderAura(sc, a, g, t, { pop: 0, expr }); drawCharge(sc, g, ch, p); sc.restore();
    } else FX.renderAura(sc, a, g, t, { pop: stage.pop, expr });
  }
  function drawCharge(c, g, ch, p) {
    const n = Math.round((14 + ch.tier * 5) * Math.max(0.5, Q)), e = easeInOut(p), tc = ch.tc;
    c.save(); c.globalCompositeOperation = 'lighter';
    FX.dot(c, g.cx, g.cy, g.R * (0.4 + p * 0.9), tc, 0.12 + p * 0.5);
    for (let i = 0; i < n; i++) {
      const r = lerp(g.R * 2.3, g.R * 0.22, e) * (0.75 + 0.5 * hash(i + 5)), an = hash(i * 1.7) * TAU + p * 4.5 * (1 + hash(i) * 0.5);
      FX.dot(c, g.cx + Math.cos(an) * r, g.cy + Math.sin(an) * r * 0.85, 2 + hash(i + 2) * 3.4, i % 3 === 0 ? '#ffffff' : tc, 0.25 + p * 0.7);
    }
    c.strokeStyle = hexA(tc, 0.7 * (1 - p)); c.lineWidth = 2 + (1 - p) * 4; c.beginPath(); c.arc(g.cx, g.cy, g.R * (2.2 - 1.7 * e), 0, TAU); c.stroke();
    c.restore();
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
    meteor: { pal: ['#14204a', '#040712', '#ffe9a0', '#8ab0ff', '#ffffff'], fx: [['stars', { n: 90, c: 4 }], ['meteors', { n: 7, c: 4 }]], seed: 21 },
    vulkan: { pal: ['#3a1208', '#100402', '#ff5a1a', '#ffa02a', '#ffe08a'], fx: [['glow', { c: 2, r: 3, y: 1.4, a: .3 }], ['waves', { n: 3, c: 2, c2: 3, y: .8, amp: .05, speed: .8, a: .4 }], ['rise', { n: 40, c: 3, shape: 'ember', size: 6, speed: .22, dir: -1, spread: 1.1, a: .8 }]], seed: 23 },
    fruehling: { pal: ['#3a2048', '#150b1d', '#ff9ac8', '#ffd0e4', '#fff0a0'], fx: [['rise', { n: 45, c: 3, shape: 'petal', size: 6, speed: .1, dir: 1, spread: 1.2, sway: 2 }], ['rise', { n: 14, c: 4, shape: 'dot', size: 5, speed: .06, dir: -1, spread: 1.1, a: .5 }]], seed: 25 },
    disco: { pal: ['#2a1048', '#0a0316', '#ff5ac8', '#6ae8ff', '#ffe14a'], fx: [['discoball', { r: .45, y: -1.7 }], ['rise', { n: 26, rainbow: true, shape: 'dot', size: 5, speed: .12, dir: -1, spread: 1.1, a: .6 }]], seed: 27 },
    finsternis: { pal: ['#241020', '#040106', '#ff9a3a', '#ffe08a', '#ff5a8a'], fx: [['stars', { n: 60, c: 4 }], ['eclipse', { c: 2, r: .75, x: 0, y: -1.1 }]], seed: 29 },
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
  const TITLES = { coll: 'Sammlung', shop: 'Shop', lab: 'Labor', derp: 'Derp', ach: 'Erfolge' };
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
    ({ coll: renderColl, shop: renderShop, lab: renderLab, derp: renderDerp, ach: renderAch })[sheet](body);
    body.scrollTop = keep;
  }
  function renderColl(body) {
    const tot = AURAS.length, got = found(); $('#sheet-sub').textContent = got + ' von ' + tot + ' gefunden';
    body.append(h('div', { class: 'collbar' }, h('div', { class: 'prog big' }, h('i', { style: { width: (got / tot) * 100 + '%' } })), h('span', { class: 'mono', text: Math.floor((got / tot) * 100) + ' %' })));
    const fl = [['alle', 'Alle'], ['da', 'Gefunden'], ['fehlt', 'Fehlend'], ['wetter', 'Wetter']];
    body.append(h('div', { class: 'filters' }, fl.map(([k, n]) => h('button', { class: ui.filter === k ? 'on' : '', text: n, onclick: () => { ui.filter = k; SFX.click(); renderSheet(); } }))));
    const pass = (a) => ui.filter === 'alle' || (ui.filter === 'da' && S.inv[a.id]) || (ui.filter === 'fehlt' && !S.inv[a.id]) || (ui.filter === 'wetter' && a.biome);
    let any = false;
    TIERS.forEach((T) => {
      const all = AURAS.filter((a) => a.tier === T.id); if (!all.length) return;
      const list = all.filter(pass).sort((a, b) => a.odds - b.odds); if (!list.length) return; any = true;
      const have = all.filter((a) => S.inv[a.id]).length;
      body.append(h('div', { class: 'tierhead' + (have === all.length ? ' full' : ''), style: { '--tc': T.color } }, h('b', { text: T.name }), h('span', { class: 'mono', text: have + '/' + all.length }), h('i')));
      const grid = h('div', { class: 'grid' });
      list.forEach((a) => {
        const inv = S.inv[a.id], foil = inv ? (a.tier >= 6 ? ' holo' : a.tier >= 3 ? ' foil' : '') : '';
        grid.append(h('button', { class: 'cardx t' + a.tier + (inv ? '' : ' locked') + foil + (S.shown === a.id ? ' eq' : ''), style: { '--tc': tierCol(a.tier) }, onclick: () => { SFX.click(); openDetail(a); } },
          h('div', { class: 'th' }, inv ? h('img', { src: FX.thumb(a, 160), alt: a.name, width: 160, height: 160 }) : h('span', { class: 'q', text: '?' })),
          h('div', { class: 'nm', text: inv ? a.name : '???' }), h('div', { class: 'od', text: fmtOdds(a.odds) }), inv ? h('span', { class: 'cnt', text: '×' + fmtShort(inv.n) }) : null));
      });
      body.append(grid);
    });
    if (!any) body.append(h('p', { class: 'hint', text: 'Hier ist noch nichts. Würfle weiter!' }));
  }
  const UPCOL = { weather: '#4ab8ff', collect: '#ff8ac8', luck: '#3ddc84', speed: '#ff9a3a', coin: '#ffc83a', multi: '#ff5ac8', auto: '#2ad6c0', sleep: '#6a7bff' };
  function upRow(k) {
    const u = UPS[k], lv = S.up[k], maxed = lv >= u.max, cost = maxed ? 0 : u.cost(lv), can = !maxed && S.coins >= cost;
    const cur = u.show(u.val(lv)), nxt = maxed ? null : u.show(u.val(lv + 1));
    return h('div', { class: 'rowx' }, h('div', { class: 'ico', style: { '--ic': UPCOL[k] || '#9a7bff' }, html: '<span class="ic">' + ico(u.ic) + '</span>' }),
      h('div', { class: 'mid' }, h('div', { class: 'nm' }, u.name, u.max > 1 ? h('span', { class: 'lv', text: 'Stufe ' + lv + '/' + u.max }) : null), h('div', { class: 'ds', text: u.text }),
        h('div', { class: 'st', text: maxed ? cur + '  (Maximum)' : cur + '  →  ' + nxt })),
      maxed ? h('div', { class: 'btn ghost small', text: 'Fertig' }) : h('button', { class: 'btn gold' + (can ? '' : ' off'), onclick: () => buyUp(k) }, h('span', { class: 'ic', html: ico('coin') }), fmtShort(cost)));
  }
  function renderShop(body) {
    $('#sheet-sub').textContent = fmtShort(S.coins) + ' Derp-Taler';
    body.append(h('p', { class: 'hint', text: 'Mit Derp-Talern wird dein Derp besser im Würfeln. Jede Aura bringt Taler, seltene viel mehr.' }));
    body.append(h('div', { class: 'list' }, ['luck', 'speed', 'coin', 'weather', 'collect', 'multi', 'auto', 'sleep'].map(upRow)));
  }
  function potRow(p, t) {
    const have = S.pot[p.id] || 0, act = S.act[p.id] > t, can = S.coins >= p.price;
    const eff = p.kind === 'luck' ? 'Glück ×' + p.mult : p.kind === 'speed' ? 'Pause ÷' + p.mult : p.kind === 'coin' ? 'Taler ×' + p.mult : 'Wetter: ' + WETTER_BY_ID[p.wid].name;
    return h('div', { class: 'rowx', style: { '--pc': p.color } }, h('div', { class: 'ico', style: { '--ic': p.color }, html: '<span class="ic">' + ico(p.kind === 'weather' ? 'cloud' : 'flask') + '</span>' }),
      h('div', { class: 'mid' }, h('div', { class: 'nm', text: p.name }), h('div', { class: 'ds', text: p.text }), h('div', { class: 'st' }, eff + ' für ' + fmtDur(p.dur * 1000) + '  ·  im Beutel: ', h('span', { class: 'pcount', text: have }), act ? h('span', { class: 'pcount', text: '  (läuft noch ' + fmtTime((S.act[p.id] - t) / 1000) + ')' }) : null)),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        h('button', { class: 'btn gold small' + (can ? '' : ' off'), onclick: () => buyPot(p.id) }, h('span', { class: 'ic', html: ico('coin') }), fmtShort(p.price)),
        h('button', { class: 'btn small' + (have ? '' : ' off'), onclick: () => drink(p.id), text: 'Trinken' })));
  }
  function renderLab(body) {
    $('#sheet-sub').textContent = fmtShort(S.coins) + ' Derp-Taler';
    body.append(h('p', { class: 'hint', text: 'Tränke wirken eine Weile. Von jeder Sorte zählt nur der stärkste Trank, aber Glück, Tempo und Taler wirken zusammen.' }));
    const t = Date.now();
    body.append(h('div', { class: 'list' }, POTIONS.filter((p) => p.kind !== 'weather').map((p) => potRow(p, t))));
    body.append(h('h4', { class: 'sec', text: 'Wetter-Tränke' }), h('p', { class: 'hint', text: 'Erzwingen für ein paar Minuten ein bestimmtes Wetter. Perfekt, um Wetter-Auren zu jagen.' }));
    body.append(h('div', { class: 'list' }, POTIONS.filter((p) => p.kind === 'weather').map((p) => potRow(p, t))));
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
      h('h4', { text: 'Statistik' }), stat('Würfe', fmt(S.rolls)), stat('Auren gefunden', found() + ' von ' + AURAS.length), stat('Seltenste Aura', best ? best.name : '–'), stat('Derp-Taler verdient', fmtShort(S.total)), stat('Tränke getrunken', fmt(S.st.drunk)), stat('Derp angestupst', fmt(S.st.pokes)), stat('Rang', rank()), stat('Aufstiege', fmt(S.rb.n)), stat('Missionen erledigt', fmt(S.qdone)),
      h('div', { style: { marginTop: '16px', textAlign: 'center' } }, resetBtn));
    openModal(node);
  }

  /* ---------- Schlaf-Würfeln ---------- */
  function offline() {
    const el = Date.now() - (S.tick || Date.now());
    if (!(S.auto && S.up.auto && S.up.sleep > 0) || el < 60000) { S.tick = Date.now(); return; }
    const lv = S.up.sleep, ms = Math.min(el, lv * 3600e3), eff = lv * 0.2 * (1 + 0.2 * S.rb.up.sleep), cd = baseCd(), n = Math.min(40000, Math.floor((ms / 1000 / cd) * eff * Math.min(S.multi, multiMax())));
    if (n < 5) { S.tick = Date.now(); return; }
    const t0 = S.tick, lk = baseLuck(), cm = baseCoin(), bm = bioM(), counts = {}, fresh = []; let coins = 0, best = null;
    for (let i = 0; i < n; i++) {
      const w = wetterZu(t0 + (ms * i) / n), a = pickAura(lk, w.id, null, bm); counts[a.id] = (counts[a.id] || 0) + 1; coins += coinsFor(a, cm); if (!best || a.odds > best.odds) best = a;
    }
    S.rolls += n; addCoins(coins); qAdd('rolls', n); const now = Date.now();
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


  /* ---------- Missionen ---------- */
  const QTYPES = {
    rolls: { text: (q) => 'Würfle ' + fmt(q.goal) + ' Mal', f: 1, ic: 'dice' },
    coins: { text: (q) => 'Verdiene ' + fmtShort(q.goal) + ' Derp-Taler durchs Würfeln', f: 1, ic: 'coin' },
    tier: { text: (q) => 'Würfle eine Aura ab „' + TIERS[q.tier].name + '“', f: 1.6, ic: 'star' },
    new: { text: (q) => 'Finde ' + q.goal + (q.goal > 1 ? ' neue Auren' : ' neue Aura'), f: 1.3, ic: 'coll' },
    potion: { text: (q) => 'Trinke ' + q.goal + (q.goal > 1 ? ' Tränke' : ' Trank'), f: 1.1, ic: 'flask' },
    poke: { text: (q) => 'Stups den Derp ' + q.goal + ' Mal an', f: 0.6, ic: 'derp' },
  };
  const qBase = () => Math.max(300, S.rb.run * 0.04, S.total * 0.002);
  function qMake(avoid) {
    const kinds = ['rolls', 'coins', 'tier', 'poke'];
    if (found() < AURAS.length - 2) kinds.push('new');
    if (S.total > 1500) kinds.push('potion');
    const free = kinds.filter((k) => avoid.indexOf(k) < 0), pool = free.length ? free : kinds, k = pool[Math.floor(Math.random() * pool.length)];
    const q = { k, p: 0, goal: 1, tier: 0 };
    if (k === 'rolls') q.goal = Math.round((30 + Math.min(S.rolls / 40, 400)) / 5) * 5;
    if (k === 'coins') q.goal = Math.round(Math.max(500, S.rb.run * 0.15, S.total * 0.004));
    if (k === 'tier') q.tier = clamp(Math.round(tierOf(S.best) * 0.6) + 1, 1, 6);
    if (k === 'new') q.goal = found() < 20 ? 2 : 1;
    if (k === 'potion') q.goal = S.st.drunk > 15 ? 2 : 1;
    if (k === 'poke') q.goal = 20 + Math.round(Math.min(S.st.pokes / 10, 60));
    q.rew = Math.round(qBase() * QTYPES[k].f * (k === 'tier' ? 1 + q.tier * 0.5 : 1));
    return q;
  }
  function qFill() { S.q = S.q.filter((q) => q && QTYPES[q.k]); while (S.q.length < 3) S.q.push(qMake(S.q.map((x) => x.k))); }
  function qAdd(k, n) { let ch = false; S.q.forEach((q) => { if (q.k === k && q.p < q.goal) { q.p = Math.min(q.goal, q.p + n); ch = true; } }); if (ch) { save(); if (sheet === 'derp') renderSheet(); } }
  function qTier(t) { S.q.forEach((q) => { if (q.k === 'tier' && q.p < 1 && t >= q.tier) { q.p = 1; save(); } }); }
  function qClaim(i) {
    const q = S.q[i]; if (!q || q.p < q.goal) return;
    addCoins(q.rew); S.qdone++; S.q.splice(i, 1); qFill(); showCoins(); SFX.ach(); toast('Mission erledigt', '+' + fmtShort(q.rew) + ' Derp-Taler', true);
    if (S.qdone % 5 === 0) { const pid = ['luck1', 'coin1', 'speed1'][Math.floor(Math.random() * 3)]; S.pot[pid] = (S.pot[pid] || 0) + 1; setTimeout(() => toast('Bonus: ' + POTION_BY_ID[pid].name, 'Liegt in deinem Beutel.', true), 600); }
    checkAch(); save(); renderSheet(); updBadges();
  }
  function updBadges() {
    const b = $('#tabs [data-tab=derp] .badge'); if (!b) return;
    b.hidden = !(S.q.some((q) => q.p >= q.goal) || (S.rb.n === 0 && kleeGain() >= 1));
  }

  /* ---------- Aufstieg ---------- */
  const REB_MIN = 1e6;
  const kleeGain = () => (S.rb.run >= REB_MIN ? Math.max(1, Math.floor(Math.pow(S.rb.run / 5e5, 0.55))) : 0);
  const startCoins = (l) => (l ? Math.round(500 * Math.pow(4, l - 1)) : 0);
  const KUP = {
    luck: { name: 'Klee-Glück', text: '+10 % Glück je Stufe, für immer.', max: 50, cost: (l) => Math.ceil(2 * Math.pow(1.3, l)), show: (l) => '+' + l * 10 + ' %' },
    coin: { name: 'Klee-Taler', text: '+20 % Derp-Taler je Stufe, für immer.', max: 50, cost: (l) => Math.ceil(2 * Math.pow(1.3, l)), show: (l) => '+' + l * 20 + ' %' },
    speed: { name: 'Klee-Tempo', text: 'Die Pause wird je Stufe 3 % kürzer.', max: 12, cost: (l) => Math.ceil(5 * Math.pow(1.5, l)), show: (l) => '−' + Math.round((1 - Math.pow(0.97, l)) * 100) + ' %' },
    start: { name: 'Startgeld', text: 'Neue Läufe beginnen mit Derp-Talern.', max: 10, cost: (l) => Math.ceil(4 * Math.pow(1.6, l)), show: (l) => (l ? fmtShort(startCoins(l)) : 'nichts') },
    auto: { name: 'Auto-Start', text: 'Der Auto-Würfler ist nach jedem Aufstieg gleich da.', max: 1, cost: () => 8, show: (l) => (l ? 'ja' : 'nein') },
    sleep: { name: 'Klee-Schlaf', text: 'Das Schlaf-Würfeln ist je Stufe 20 % fleißiger.', max: 5, cost: (l) => Math.ceil(10 * Math.pow(1.7, l)), show: (l) => '+' + l * 20 + ' %' },
  };
  function buyKup(k) {
    const u = KUP[k], lv = S.rb.up[k]; if (lv >= u.max) return; const c = u.cost(lv);
    if (S.rb.klee < c) { SFX.no(); toast('Zu wenig Klee'); return; }
    S.rb.klee -= c; S.rb.up[k]++; SFX.buy(); save(); renderSheet(); renderControls();
  }
  function doRebirth() {
    const g = kleeGain(); if (!g) return;
    S.rb.klee += g; S.rb.all += g; S.rb.n++; S.rb.run = 0;
    S.coins = startCoins(S.rb.up.start); S.up = { luck: 0, speed: 0, coin: 0, weather: 0, collect: 0, multi: 0, auto: S.rb.up.auto ? 1 : 0, sleep: 0 };
    S.pot = {}; S.act = {}; S.wpot = null; S.multi = 1; if (!S.up.auto) S.auto = false;
    S.tick = Date.now(); cdEnd = 0; showCoins(); renderControls(); closeSheet(); checkAch(); save(); flush();
    SFX.cinematic && SFX.cinematic(5, 0.6);
    openModal(h('div', { class: 'det set' }, h('h3', { text: 'Aufstieg!' }), h('div', { class: 'bigclover', html: ico('clover') }),
      h('p', { text: 'Dein Derp ist wiedergeboren und hat ' + fmt(g) + ' Glücksklee mitgebracht.' }),
      h('p', { text: 'Jedes Klee macht dich für immer ein bisschen glücklicher. Im Reiter „Derp“ kannst du Klee ausgeben.' }),
      h('div', { class: 'acts' }, h('button', { class: 'btn', text: 'Weiter', onclick: closeModal }))));
  }

  /* ---------- Rang und Tagesgeschenk ---------- */
  const RANKS = [[0, 'Würfel-Neuling'], [0.06, 'Aura-Lehrling'], [0.15, 'Derp-Kenner'], [0.28, 'Aura-Sammler'], [0.45, 'Derp-Experte'], [0.62, 'Aura-Meister'], [0.8, 'Derp-Legende'], [0.95, 'Aura-Gott'], [1, 'DERP-GOTT']];
  function rank() { const f = found() / AURAS.length; let r = RANKS[0]; RANKS.forEach((x) => { if (f >= x[0]) r = x; }); return r[1]; }
  const dayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const dayNum = (k) => { const a = k.split('-').map(Number); return Math.round(new Date(a[0], a[1] - 1, a[2], 12).getTime() / 864e5); };
  function dailyGift() {
    const k = dayKey(); if (S.daily.day === k) return;
    const gap = S.daily.day ? dayNum(k) - dayNum(S.daily.day) : 99;
    S.daily.streak = gap === 1 ? S.daily.streak + 1 : 1; S.daily.best = Math.max(S.daily.best, S.daily.streak); S.daily.day = k;
    const st = S.daily.streak, coins = Math.round(Math.max(500, S.rb.run * 0.03, S.total * 0.001) * (1 + 0.35 * Math.min(st - 1, 13)));
    addCoins(coins); let potTxt = '';
    if (st % 7 === 0) { S.pot.luck2 = (S.pot.luck2 || 0) + 1; potTxt = POTION_BY_ID.luck2.name; } else if (st % 3 === 0) { S.pot.luck1 = (S.pot.luck1 || 0) + 1; potTxt = POTION_BY_ID.luck1.name; }
    showCoins(); checkAch(); save(); flush();
    const days = h('div', { class: 'days' }); for (let i = 1; i <= 7; i++) days.append(h('span', { class: ((st - 1) % 7) + 1 >= i ? 'on' : '', text: i }));
    openModal(h('div', { class: 'det set' }, h('h3', { text: 'Tagesgeschenk!' }), h('div', { class: 'bigclover gold', html: ico('star') }), days,
      h('p', { text: st > 1 ? st + ' Tage in Folge. Weiter so!' : 'Schön, dass du da bist.' }),
      h('div', { class: 'stat' }, h('span', { text: 'Derp-Taler' }), h('b', { text: '+' + fmtShort(coins) })), potTxt ? h('div', { class: 'stat' }, h('span', { text: 'Trank' }), h('b', { text: potTxt })) : null,
      h('div', { class: 'acts' }, h('button', { class: 'btn', text: 'Abholen', onclick: closeModal }))));
    SFX.ach();
  }

  /* ---------- Fenster „Derp“ ---------- */
  let rbSure = false;
  function renderDerp(body) {
    qFill(); $('#sheet-sub').textContent = rank();
    const f = found(), tot = AURAS.length;
    body.append(h('div', { class: 'card rank' }, h('div', { class: 'rk' }, h('b', { text: rank() }), S.rb.n ? h('span', { text: '  ·  ' + S.rb.n + '× aufgestiegen' }) : null),
      h('div', { class: 'collbar' }, h('div', { class: 'prog big' }, h('i', { style: { width: (f / tot) * 100 + '%' } })), h('span', { class: 'mono', text: f + '/' + tot })),
      h('div', { class: 'ds', text: 'Tagesserie: ' + S.daily.streak + (S.daily.streak === 1 ? ' Tag' : ' Tage') + '  ·  Rekord: ' + S.daily.best })));
    body.append(h('h4', { class: 'sec', text: 'Missionen' }));
    body.append(h('div', { class: 'list' }, S.q.map((q, i) => {
      const T = QTYPES[q.k], done = q.p >= q.goal;
      return h('div', { class: 'rowx' + (done ? ' done' : '') }, h('div', { class: 'ico', html: '<span class="ic">' + ico(T.ic) + '</span>' }),
        h('div', { class: 'mid' }, h('div', { class: 'nm', text: T.text(q) }), h('div', null, h('div', { class: 'prog' }, h('i', { style: { width: (Math.min(q.p, q.goal) / q.goal) * 100 + '%' } })), h('div', { class: 'ds', text: fmtShort(Math.min(q.p, q.goal)) + ' / ' + fmtShort(q.goal) }))),
        h('button', { class: 'btn gold small' + (done ? '' : ' off'), onclick: () => qClaim(i) }, h('span', { class: 'ic', html: ico('coin') }), fmtShort(q.rew)));
    })));
    body.append(h('p', { class: 'hint', text: 'Jede fünfte erledigte Mission bringt einen Bonus-Trank.' }));
    body.append(h('h4', { class: 'sec', text: 'Aufstieg' }));
    const g = kleeGain(), need = Math.max(0, REB_MIN - S.rb.run);
    rbSure = false;
    const btn = h('button', { class: 'btn gold' + (g ? '' : ' off'), onclick: () => { if (!g) { SFX.no(); return; } if (!rbSure) { rbSure = true; btn.textContent = 'Sicher? Nochmal tippen'; return; } doRebirth(); } }, g ? 'Aufsteigen  (+' + fmt(g) + ' Klee)' : 'Noch ' + fmtShort(need) + ' Taler');
    body.append(h('div', { class: 'card' }, h('div', { class: 'ds', text: 'Setzt Taler, Upgrades und Tränke zurück. Du behältst alle Auren, Erfolge und dein Klee. Jedes Klee gibt dauerhaft +3 % Glück und lässt sich unten ausgeben.' }),
      h('div', { class: 'stat' }, h('span', { text: 'Glücksklee (frei)' }), h('b', { text: fmt(S.rb.klee) })), h('div', { class: 'stat' }, h('span', { text: 'Dauer-Glück durch Klee' }), h('b', { text: fmtLuck(kleeMul()) })),
      h('div', { class: 'stat' }, h('span', { text: 'Taler in diesem Lauf' }), h('b', { text: fmtShort(S.rb.run) })), h('div', { style: { textAlign: 'center', marginTop: '10px' } }, btn)));
    if (S.rb.all > 0) {
      body.append(h('h4', { class: 'sec', text: 'Klee-Shop' }));
      body.append(h('div', { class: 'list' }, Object.keys(KUP).map((k) => {
        const u = KUP[k], lv = S.rb.up[k], maxed = lv >= u.max, c = maxed ? 0 : u.cost(lv), can = !maxed && S.rb.klee >= c;
        return h('div', { class: 'rowx' }, h('div', { class: 'ico', style: { '--ic': '#3ddc84' }, html: '<span class="ic">' + ico('clover') + '</span>' }),
          h('div', { class: 'mid' }, h('div', { class: 'nm' }, u.name, u.max > 1 ? h('span', { class: 'lv', text: 'Stufe ' + lv + '/' + u.max }) : null), h('div', { class: 'ds', text: u.text }), h('div', { class: 'st', text: u.show(lv) + (maxed ? '  (Maximum)' : '  →  ' + u.show(lv + 1)) })),
          maxed ? h('div', { class: 'btn ghost small', text: 'Fertig' }) : h('button', { class: 'btn small' + (can ? '' : ' off'), onclick: () => buyKup(k) }, h('span', { class: 'ic', html: ico('clover') }), fmt(c)));
      })));
    }
  }

  /* ---------- Start und Hauptschleife ---------- */
  function init() {
    $('#coin-ic').innerHTML = ico('coin'); $('#btn-settings').innerHTML = ico('gear'); $('#auto-ic').innerHTML = ico('auto'); $('#roll-ic').innerHTML = ico('dice');
    $$('#tabs button').forEach((b) => { $('.ic', b).innerHTML = ico(b.dataset.tab); b.addEventListener('click', () => openSheet(b.dataset.tab)); });
    $('#sheet-close').innerHTML = ico('close'); $('#sheet-close').addEventListener('click', () => { SFX.click(); closeSheet(); });
    $('#btn-settings').addEventListener('click', openSettings);
    const roll = $('#btn-roll');
    roll.addEventListener('pointerdown', (e) => { e.preventDefault(); SFX.unlock(); holding = true; roll.classList.add('held'); roll.classList.remove('rip'); void roll.offsetWidth; roll.classList.add('rip'); tryRoll(true); });
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
    qFill(); updBadges(); startSplash();
    setTimeout(dailyGift, /nosplash/.test(location.search) ? 400 : (S.rolls ? 1300 : 2000));
    requestAnimationFrame(frame);
  }
  function startSplash() {
    const sp = $('#splash'); if (!sp) return;
    if (/nosplash/.test(location.search)) { sp.remove(); return; }
    let done = false; const end = () => { if (done) return; done = true; sp.classList.add('out'); setTimeout(() => sp.remove(), 600); };
    sp.addEventListener('pointerdown', () => { SFX.unlock(); end(); }); setTimeout(end, S.rolls ? 1100 : 1700);
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
      $('#w-time').textContent = fmtTime(wRest() / 1000); updBadges();
      $('#cd-text').textContent = prog < 1 ? 'Pause ' + ((cdEnd - ms) / 1000).toFixed(1).replace('.', ',') + ' s' : S.auto && S.up.auto ? 'Auto-Würfler läuft' : 'Halte den Knopf für Dauer-Würfeln';
      renderControls(); if (sheet === 'lab') renderSheet();
    }
  }
  window.__arng = { get S() { return S; }, doRebirth, dailyGift, qClaim, drink, buyPot, kleeGain, openSheet, tryRoll, openKino, force: (id) => { cdEnd = 0; return tryRoll(true, id); }, AURAS, setCoins: (n) => { S.coins = n; showCoins(); save(); }, stage };
  init();
})();

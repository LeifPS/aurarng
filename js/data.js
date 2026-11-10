'use strict';
/* Daten: Seltenheitsstufen, Auren, Wetter, Upgrades, Tränke */

const TIERS = [
  { id: 0, name: 'Gewöhnlich', min: 1, color: '#9aa3b5' },
  { id: 1, name: 'Meh', min: 10, color: '#7ed6a4' },
  { id: 2, name: 'Okay', min: 100, color: '#5bc0ff' },
  { id: 3, name: 'Selten', min: 1e3, color: '#b388ff' },
  { id: 4, name: 'Episch', min: 1e4, color: '#ff7ad9' },
  { id: 5, name: 'Legendär', min: 1e5, color: '#ffcf4a' },
  { id: 6, name: 'Mythisch', min: 1e6, color: '#ff6a4a' },
  { id: 7, name: 'Göttlich', min: 1e7, color: '#fff2a8' },
  { id: 8, name: 'Kosmisch', min: 1e8, color: '#6ae8ff' },
  { id: 9, name: 'Unmöglich', min: 1e9, color: '#ffffff' },
];
function tierOf(odds) { let t = 0; for (const x of TIERS) if (odds >= x.min) t = x.id; return t; }

/* Wetter. Wechselt alle 4 Minuten, hängt nur von der Uhrzeit ab (alle Geräte sehen dasselbe). */
const WETTER = [
  { id: 'normal', name: 'Derp-Wiese', w: 46, sky: ['#2a2350', '#120d28'], text: 'Ganz normaler Tag. Nichts Besonderes.' },
  { id: 'nacht', name: 'Dunkle Nacht', w: 11, sky: ['#101a3d', '#04081a'], text: 'Nachtaktive Auren trauen sich raus.' },
  { id: 'gewitter', name: 'Gewitter', w: 9, sky: ['#2b2f4d', '#0b0d1a'], text: 'Blitze liegen in der Luft.' },
  { id: 'regenbogen', name: 'Regenbogen-Schauer', w: 8, sky: ['#3b2a63', '#1a1233'], text: 'Bunte Auren sind unterwegs.' },
  { id: 'schnee', name: 'Schneegestöber', w: 8, sky: ['#27456b', '#0e1d33'], text: 'Eisige Auren frieren sich fest.' },
  { id: 'nebel', name: 'Dicker Nebel', w: 6, sky: ['#3a4a55', '#161e24'], text: 'Man sieht die Hand vor Augen nicht.' },
  { id: 'vollmond', name: 'Vollmond', w: 5, sky: ['#1e2a55', '#080c20'], text: 'Etwas heult in der Ferne.' },
  { id: 'glitch', name: 'Glitch-Stunde', w: 4, sky: ['#1b2a2a', '#061010'], text: 'Die Wirklichkeit hat einen Fehler.' },
  { id: 'singularitaet', name: 'Singularität', w: 2, sky: ['#2a1048', '#06020f'], text: 'Der Himmel hat ein Loch.' },
];
const WETTER_PERIODE = 4 * 60 * 1000;
function wetterNr(idx) {
  const tot = WETTER.reduce((s, x) => s + x.w, 0);
  let r = hash(idx * 7.31 + 1.7) * tot;
  for (const x of WETTER) { if (r < x.w) return x; r -= x.w; }
  return WETTER[0];
}
function wetterZu(ts) { return wetterNr(Math.floor(ts / WETTER_PERIODE)); }
function wetterRest(ts) { return WETTER_PERIODE - (ts % WETTER_PERIODE); }

/* Auren. pal = [Hintergrund innen, Hintergrund außen, Farbe 2, 3, 4]. fx = Effektebenen (siehe fx.js), f:1 = vor dem Derp */
const A = (id, name, odds, expr, pal, fx, desc, o) => Object.assign({ id, name, odds, expr, pal, fx, desc, tier: tierOf(odds) }, o || {});
const AURAS = [
  /* Gewöhnlich */
  A('nix', 'Gar nix', 1, 'flat', ['#1d1d28', '#0c0c14', '#6b6b7a', '#8a8a99', '#aaaabb'], [],
    'Du hast gewürfelt. Es ist nichts passiert. Herzlichen Glückwunsch.'),
  A('hust', 'Hust', 2, 'sad', ['#243026', '#0e140f', '#8fa88f', '#b9ccb9', '#dfeadf'], [['rise', { n: 7, c: 3, shape: 'dot', size: 7, speed: .18, dir: -1, spread: .5 }]],
    'Ein kleines Hüstelchen. Der Derp entschuldigt sich.'),
  A('pupswolke', 'Pups-Wolke', 3, 'smug', ['#2b2a1b', '#12110a', '#a99a5a', '#cdbf7a', '#e6dba0'], [['rise', { n: 9, c: 3, shape: 'dot', size: 11, speed: .2, dir: -1, spread: .45, sway: 1 }]],
    'Es war der Derp. Er gibt es aber nicht zu.'),
  A('schnarch', 'Schnarch', 4, 'sleep', ['#1c2447', '#0a0e22', '#7a9bff', '#a9bfff', '#d6e0ff'], [['rise', { n: 5, c: 3, shape: 'glyph', text: 'Z', size: 14, speed: .15, dir: -1, spread: .4, sway: 1.4 }]],
    'Zzz. Die Aura ist eingeschlafen, bevor sie angefangen hat.'),
  A('keksbroesel', 'Keksbrösel', 5, 'derp', ['#3a2a1b', '#17100a', '#c99a5a', '#e0b97a', '#f3d9a8'], [['rise', { n: 14, c: 3, shape: 'dot', size: 4, speed: .22, dir: 1, spread: .8 }]],
    'Krümel überall. Der Derp hat Keks gegessen, obwohl es verboten war.'),
  A('wackelpudding', 'Wackelpudding', 6, 'derp', ['#3a1a2b', '#14080f', '#ff6a8a', '#ff9fb4', '#ffd0dc'], [['glow', { c: 2, r: 1.05, a: .3, pulse: 2 }], ['rings', { n: 2, c: 3, speed: .35, max: .9, a: .5 }]],
    'Wabbel wabbel. Niemand weiß, wie es schmeckt, alle wollen es probieren.'),
  /* Meh */
  A('matschfleck', 'Matschfleck', 12, 'grin', ['#2e2418', '#120e09', '#9a7a4a', '#b8966a', '#d9bd94'], [['glow', { c: 2, r: 1, a: .3 }], ['rise', { n: 10, c: 3, shape: 'bubble', size: 6, speed: .2, dir: -1, spread: .6 }]],
    'Ein Matschfleck mit Selbstbewusstsein.'),
  A('schluckauf', 'Schluckauf', 20, 'shock', ['#17323a', '#08141a', '#4ad6d0', '#8ff0ec', '#d6fffd'], [['rings', { n: 3, c: 2, speed: .8, max: 1.2, a: .6 }], ['rise', { n: 4, c: 3, shape: 'glyph', text: 'HICK', size: 11, speed: .5, dir: -1, spread: .5, sway: 1 }]],
    'Hick! Hick! Und die Aura zuckt mit.'),
  A('gaehnglitzer', 'Gähn-Glitzer', 35, 'sleep', ['#2c2146', '#100b1e', '#b79cff', '#d9c9ff', '#f3ecff'], [['rise', { n: 16, c: 3, shape: 'star', size: 6, speed: .12, dir: -1, spread: .8, sway: .6 }]],
    'Glitzer, der beim Fallen gähnt.'),
  A('sockenduft', 'Socken-Duft', 50, 'sick', ['#1f3016', '#0b1308', '#7fcf4a', '#a8e67a', '#d4f5b0'], [['rise', { n: 9, c: 3, shape: 'glyph', text: '~', size: 22, speed: .2, dir: -1, spread: .5, sway: 1.5 }], ['glow', { c: 2, r: 1, a: .2 }]],
    'Man sieht den Duft. Man sollte es nicht.'),
  A('beuletta', 'Beuletta', 75, 'cross', ['#2b1a3d', '#10081a', '#c07aff', '#d9a8ff', '#efd6ff'], [['orbit', { n: 5, c: 3, rx: .95, ry: .3, tilt: .4, speed: .5, size: 8, trail: 5 }], ['glow', { c: 2, r: 1, a: .25 }]],
    'Eine Beule, die sich für eine Königin hält.'),
  /* Okay */
  A('funkenfurz', 'Funkenfurz', 120, 'shock', ['#3a1a0a', '#150804', '#ff8a2a', '#ffc04a', '#fff0b0'], [['rise', { n: 26, c: 3, c2: 4, shape: 'ember', size: 6, speed: .35, dir: -1, spread: .35, sway: 1.2 }], ['glow', { c: 2, r: 1.2, a: .3, pulse: 4 }]],
    'Funken sprühen. Das ist nicht gesund, aber hübsch.'),
  A('flauschwolke', 'Flauschwolke', 200, 'love', ['#2a4468', '#0f1d33', '#dff0ff', '#ffffff', '#bfe0ff'], [['rise', { n: 12, c: 3, shape: 'dot', size: 16, speed: .1, dir: -1, spread: .9, sway: 1.5, a: .5 }], ['glow', { c: 2, r: 1.1, a: .25 }]],
    'Weich wie ein Kissen, das ein Kissen umarmt.'),
  A('pfuetzenglanz', 'Pfützenglanz', 300, 'wink', ['#183a5c', '#09182b', '#4ab0ff', '#8fd0ff', '#d6efff'], [['rings', { n: 4, c: 2, speed: .3, max: 1.5, a: .7, squash: .3, y: .85 }], ['rise', { n: 12, c: 3, shape: 'bubble', size: 5, speed: .2, dir: -1, spread: .8 }]],
    'Jemand ist reingesprungen. Das war der Derp.', { mirror: true }),
  A('bananenblitz', 'Bananenblitz', 450, 'grin', ['#3a3510', '#171408', '#ffe14a', '#fff08a', '#fffbd0'], [['lightning', { rate: 2.5, c: 2, n: 2, from: 'sky', a: .9 }], ['rise', { n: 14, c: 3, shape: 'star', size: 6, speed: .3, dir: -1, spread: .7 }]],
    'Gelb, krumm und elektrisch. Fass sie nicht an.'),
  A('derpsonne', 'Derpsonne', 777, 'cool', ['#4a2a0a', '#1c0e04', '#ffb82a', '#ffd86a', '#fff2b0'], [['sun', { c: 2, c2: 3, r: .95 }], ['rays', { n: 14, c: 3, a: .45, speed: .15, len: 1.8, w: .5 }]],
    'Eine Sonne mit Sonnenbrille. Cooler geht es nicht.', { acc: ['shades'] }),
  /* Selten */
  A('nachtschwaermer', 'Nachtschwärmer', 1200, 'smug', ['#161d4a', '#06081f', '#7a8cff', '#b0baff', '#fff6c8'], [['stars', { n: 70, c: 4 }], ['moon', { c: 4, r: .6, x: .75, y: -.7 }], ['orbit', { n: 6, c: 3, rx: 1.1, ry: .5, tilt: -.3, speed: .4, size: 5, trail: 6 }]],
    'Nachts ist er wach. Tagsüber auch. Er schläft nie.', { biome: 'nacht', acc: ['nightcap'] }),
  A('eisbeule', 'Eisbeule', 2000, 'sad', ['#1c3a5c', '#08162b', '#7ad6ff', '#b0ecff', '#ffffff'], [['crystal', { c: 2, c2: 4, r: 1.15, n: 6, a: .7 }], ['rise', { n: 26, c: 4, shape: 'snow', size: 5, speed: .15, dir: 1, spread: 1, sway: 1 }]],
    'Brrr. Die Beule ist komplett gefroren, und der Derp auch.', { biome: 'schnee' }),
  A('gluehwuermchendisco', 'Glühwürmchen-Disco', 3000, 'grin', ['#0f2a1a', '#040e08', '#d6ff4a', '#9aff7a', '#fffbb0'], [['orbit', { n: 16, c: 2, rx: 1.3, ry: .8, tilt: .2, speed: .3, size: 7, trail: 4 }], ['rise', { n: 20, c: 3, shape: 'dot', size: 6, speed: .15, dir: -1, spread: .9, sway: 1.5 }], ['beams', { n: 6, a: .12, speed: .5, c: 2, c2: 3 }]],
    'Hier tanzen Glühwürmchen. Der Derp tanzt auch, aber schlecht.'),
  A('donnerpups', 'Donnerpups', 4500, 'shock', ['#1c2040', '#080a1c', '#ffe14a', '#8fb0ff', '#ffffff'], [['lightning', { rate: 2, c: 2, n: 3, from: 'sky', a: .95 }], ['rings', { n: 2, c: 3, speed: .5, max: 1.4, a: .4 }], ['rise', { n: 30, c: 3, shape: 'rain', size: 6, speed: .9, dir: 1, spread: 1.2 }]],
    'Erst ein Blitz, dann ein Knall, dann ein sehr peinlicher Moment.', { biome: 'gewitter' }),
  A('regenbogenruelpser', 'Regenbogenrülpser', 6666, 'grin', ['#2d2255', '#120c2a', '#ff6a9a', '#ffe14a', '#6ae8ff'], [['beams', { n: 7, a: .3, speed: .15, rainbow: true }], ['rise', { n: 22, rainbow: true, shape: 'dot', size: 7, speed: .25, dir: -1, spread: .5 }]],
    'Bunt, laut und überhaupt nicht damenhaft.', { biome: 'regenbogen' }),
  /* Episch */
  A('feuerkopf', 'Feuerkopf', 12000, 'rage', ['#3a0e04', '#140402', '#ff5a1a', '#ff9a2a', '#ffe08a'], [['glow', { c: 2, r: 1.4, a: .35, pulse: 3 }], ['rise', { n: 60, c: 3, c2: 4, shape: 'ember', size: 9, speed: .55, dir: -1, spread: .3, sway: 1.4, focus: 1 }], ['rise', { n: 22, c: 2, shape: 'ember', size: 6, speed: .7, dir: -1, spread: .22, sway: 1, f: 1, focus: 1 }]],
    'Sein Kopf brennt. Er findet das völlig normal.', { acc: ['horns'] }),
  A('wellenreiter', 'Wellenreiter', 20000, 'wink', ['#0c3a5c', '#04182b', '#2ad0e0', '#7aeaff', '#e0ffff'], [['waves', { n: 4, c: 2, c2: 3, y: .62, amp: .05, speed: 1.1, a: .5 }], ['rise', { n: 18, c: 4, shape: 'bubble', size: 6, speed: .2, dir: -1, spread: .9 }], ['rings', { n: 2, c: 3, speed: .3, max: 1.3, a: .4 }]],
    'Surft auf jeder Welle, auch auf der im Badewasser.', { acc: ['headband'] }),
  A('sakurasturm', 'Sakura-Sturm', 35000, 'zen', ['#3a1a35', '#140815', '#ff8ac0', '#ffc0dc', '#ffeaf4'], [['mandala', { n: 8, c: 2, c2: 3, layers: 3, r: 1.1, a: .25, speed: .05 }], ['rise', { n: 70, c: 3, c2: 4, shape: 'petal', size: 7, speed: .22, dir: 1, spread: 1.2, sway: 2.2 }]],
    'Kirschblüten wirbeln, der Derp meditiert, ihm ist ein Blatt ins Gesicht geflogen.'),
  A('nebelgeist', 'Nebelgeist', 50000, 'void', ['#2a3640', '#0c1216', '#b8d0e0', '#e0f0f8', '#ffffff'], [['glow', { c: 2, r: 1.8, a: .25 }], ['rise', { n: 14, c: 3, shape: 'dot', size: 30, speed: .08, dir: -1, spread: 1.2, sway: 3, a: .18 }], ['rise', { n: 10, c: 4, shape: 'dot', size: 16, speed: .12, dir: -1, spread: 1, sway: 2, a: .25, f: 1 }]],
    'Man sieht nur seine Augen. Und die schauen ein bisschen blöd.', { biome: 'nebel' }),
  A('matrixmurmel', 'Matrix-Murmel', 77777, 'cross', ['#04180c', '#010a05', '#2aff7a', '#8affb8', '#e0ffe8'], [['matrix', { n: 26, c: 2, a: .8 }], ['scan', { a: .22 }], ['glitch', { rate: 6, c: 2, f: 1, a: .22 }]],
    'Er sieht nur noch Nullen und Einsen. Und Kekse.', { biome: 'glitch', acc: ['shades'] }),
  /* Legendär */
  A('goldenerderp', 'Goldener Derp', 150000, 'smug', ['#4a3205', '#1a1002', '#ffc83a', '#ffe58a', '#fff8d0'], [['glow', { c: 2, r: 1.6, a: .35, pulse: 1 }], ['rays', { n: 16, c: 3, a: .5, speed: .1, len: 2, w: .45 }], ['rise', { n: 22, c: 3, shape: 'coin', size: 9, speed: .25, dir: 1, spread: 1, sway: 1 }], ['rise', { n: 20, c: 4, shape: 'star', size: 6, speed: .3, dir: -1, spread: .7 }]],
    'Er ist golden. Er weiß das. Er steht nur noch im Weg.', { acc: ['crown'], body: '#ffd54a' }),
  A('eisenherz', 'Eisenherz', 250000, 'rage', ['#2a1216', '#0d0507', '#ff4a5a', '#c8ced8', '#ffb0b8'], [['clock', { c: 3, a: .55, r: 1.3, gears: 3 }], ['glow', { c: 2, r: 1.3, a: .3, pulse: 1.6 }], ['rise', { n: 20, c: 2, shape: 'heart', size: 9, speed: .22, dir: -1, spread: .8, sway: 1 }]],
    'Ein Herz aus Eisen, Zahnrädern und einer ordentlichen Portion Trotz.', { acc: ['bolt'] }),
  A('polarlichtpups', 'Polarlicht-Pups', 400000, 'zen', ['#031a2a', '#010a12', '#2affb0', '#4ad0ff', '#b86aff'], [['stars', { n: 80, c: 4 }], ['aurora', { n: 4, c: 2, c2: 3, c3: 4, y: .18, h: .5, a: .6 }], ['rise', { n: 20, c: 2, shape: 'dot', size: 5, speed: .12, dir: -1, spread: .9 }]],
    'Der Himmel leuchtet grün, weil der Derp mal wieder gepupst hat. Magisch.'),
  A('vollmondwolf', 'Vollmond-Wolf', 600000, 'grin', ['#151e4a', '#05081c', '#c8d6ff', '#7a8cff', '#ffffff'], [['stars', { n: 90, c: 4 }], ['moon', { c: 4, r: 1.1, x: 0, y: -.1, glow: 1 }], ['rings', { n: 3, c: 2, speed: .25, max: 1.8, a: .35 }], ['rise', { n: 12, c: 4, shape: 'dot', size: 4, speed: .1, dir: -1, spread: 1 }]],
    'Aaaauuuuuh! Der Derp heult den Mond an. Der Mond heult zurück.', { biome: 'vollmond', acc: ['wolfears'], body: '#9aa8c8' }),
  A('kristallchaos', 'Kristall-Chaos', 888888, 'shock', ['#1a1040', '#07041a', '#ff7ad9', '#7ad6ff', '#fff29a'], [['beams', { n: 8, a: .22, speed: .2, rainbow: true }], ['polys', { n: [6, 6, 3, 5], c: 3, a: .6, speed: .15, lw: 2 }], ['crystal', { c: 2, c2: 3, r: 1, n: 8, a: .55, speed: .08 }], ['rise', { n: 40, rainbow: true, shape: 'star', size: 6, speed: .3, dir: -1, spread: .9 }]],
    'Es splittert, es funkelt, es ist zu viel. Genau richtig.'),
  /* Mythisch */
  A('supernova', 'Supernova-Schnupfen', 1.5e6, 'shock', ['#2a0e14', '#08030a', '#ff7a3a', '#ffe08a', '#7ad6ff'], [['glow', { c: 3, r: 2, a: .4, pulse: 2 }], ['shock', { c: 3, c2: 4, period: 3.2, a: .9 }], ['burst', { n: 36, c: 3, a: .6, speed: .6, len: 2.4 }], ['rise', { n: 60, c: 3, c2: 2, shape: 'ember', size: 7, speed: .5, dir: -1, spread: 1, radial: 1 }], ['rings', { n: 3, c: 4, speed: .4, max: 2.2, a: .5 }]],
    'Haaaa-TSCHÜ! Ein Stern ist explodiert. Der Derp wünscht Gesundheit.', { acc: ['tissue'] }),
  A('zeitstrudel', 'Zeitstrudel', 2.5e6, 'cross', ['#0a2a2a', '#020b0b', '#2ad6c0', '#ffd24a', '#c8fff6'], [['spiral', { arms: 3, n: 80, c: 2, c2: 3, twist: 7, speed: -.35, r: 1.7, size: 5, a: .8 }], ['clock', { c: 3, a: .5, r: 1.1, gears: 2, hands: 1 }], ['rings', { n: 4, c: 2, speed: -.35, max: 1.8, a: .35 }], ['rise', { n: 20, c: 3, shape: 'dot', size: 4, speed: .25, dir: -1, spread: .9 }]],
    'Gestern, heute, morgen, alles auf einmal. Der Derp hat keine Ahnung, wie spät es ist.'),
  A('phoenix', 'Phönix-Hintern', 4e6, 'smug', ['#3a0a04', '#120302', '#ff5a1a', '#ffb02a', '#fff0a0'], [['glow', { c: 2, r: 1.8, a: .35, pulse: 1.2 }], ['wings', { c: 2, c2: 3, span: 1.9, style: 'fire', flap: 1.2, a: .9 }], ['rise', { n: 70, c: 3, c2: 4, shape: 'ember', size: 9, speed: .5, dir: -1, spread: .8, sway: 1.5, focus: 1 }], ['rings', { n: 2, c: 3, speed: .25, max: 1.8, a: .35 }]],
    'Aus der Asche emporgestiegen. Er hat dabei leider seine Hose verbrannt.', { body: '#ff7a3a', acc: ['tailfire'] }),
  A('blitzgott', 'Blitzgott Zapp', 5e6, 'rage', ['#241a4a', '#07041a', '#ffe14a', '#8a6aff', '#ffffff'], [['rays', { n: 12, c: 2, a: .4, speed: .3, len: 2.2, w: .3 }], ['lightning', { rate: 3, c: 2, n: 4, from: 'sky', a: 1, w: 1.3 }], ['lightning', { rate: 2.2, c: 4, n: 3, from: 'center', a: .9, f: 1 }], ['rings', { n: 3, c: 3, speed: .5, max: 1.8, a: .45 }], ['rise', { n: 30, c: 2, shape: 'star', size: 6, speed: .5, dir: -1, spread: .8 }]],
    'Zappelt vor Kraft! Wer ihn ärgert, kriegt eine gewischt.', { biome: 'gewitter', acc: ['boltcrown'], body: '#ffe66a' }),
  A('glitchkoenig', 'Glitch-König', 7777777, 'cool', ['#150a2a', '#04010a', '#ff2ad1', '#2affee', '#ffffff'], [['matrix', { n: 22, c: 3, a: .55 }], ['glitch', { rate: 8, c: 2, c2: 3, a: .5 }], ['rings', { n: 3, c: 3, speed: .4, max: 1.6, a: .4 }], ['scan', { a: .25 }], ['glitch', { rate: 5, c: 3, c2: 2, f: 1, a: .35 }]],
    'Er regiert über kaputte Pixel. Sein Thron flackert.', { biome: 'glitch', acc: ['crown'], rgb: true, body: '#b46aff' }),
  /* Göttlich */
  A('schwarzesloch', 'Schwarzes-Loch-Hund', 1.5e7, 'void', ['#1a0a30', '#020106', '#ff9a3a', '#b86aff', '#ffe0a8'], [['stars', { n: 110, c: 4 }], ['blackhole', { r: .75, c: 2, c2: 3 }], ['rise', { n: 50, c: 2, shape: 'dot', size: 4, speed: .22, dir: -1, spread: 1, suck: 1 }]],
    'Wuff. Das Loch hat alles verschluckt: Licht, Socken, Hausaufgaben.', { biome: 'singularitaet', acc: ['dogears'], body: '#8a64e8', av: { s: .7, y: .62 } }),
  A('engel', 'Engel mit Schluckauf', 3e7, 'wink', ['#2a3a6a', '#0d1330', '#fff2a8', '#ffffff', '#bfe0ff'], [['beams', { n: 9, c: 2, c2: 3, a: .2, speed: .06 }], ['glow', { c: 3, r: 2, a: .3, pulse: 1 }], ['wings', { c: 3, c2: 4, span: 2, style: 'feather', flap: .7, a: .95 }], ['rings', { n: 3, c: 2, speed: .2, max: 2, a: .4 }], ['rise', { n: 40, c: 3, shape: 'dot', size: 5, speed: .12, dir: -1, spread: 1, sway: 1.2 }], ['rise', { n: 12, c: 3, shape: 'feather', size: 8, speed: .1, dir: 1, spread: .9, sway: 2 }]],
    'Heilig, heilig, HICK. Der Heiligenschein wackelt bei jedem Schluckauf.', { acc: ['halo'], body: '#fff6d8' }),
  A('drachenseele', 'Drachenseele', 5e7, 'rage', ['#0a2a22', '#02100c', '#2affa0', '#ffd24a', '#a8fff0'], [['mandala', { n: 12, c: 2, c2: 3, layers: 2, r: 1.2, a: .22, speed: .04 }], ['ribbon', { c: 2, c2: 3, n: 44, speed: .5, size: 1, ph: 0 }], ['ribbon', { c: 3, c2: 2, n: 34, speed: .42, size: .8, ph: 2.3 }], ['rise', { n: 40, c: 3, c2: 2, shape: 'ember', size: 6, speed: .4, dir: -1, spread: 1 }], ['rings', { n: 3, c: 2, speed: .3, max: 1.9, a: .4 }]],
    'Zwei Drachen, ein Derp. Er hat nicht um Hilfe gebeten, kriegt sie aber.', { acc: ['horns'], body: '#4ae8a0' }),
  A('prismaprinz', 'Prisma-Prinz', 7.7e7, 'smug', ['#241a4a', '#07041a', '#ff6a9a', '#6ae8ff', '#fff29a'], [['beams', { n: 12, a: .35, speed: .12, rainbow: true, len: 2.4 }], ['crystal', { c: 3, c2: 4, r: 1.3, n: 6, a: .6, speed: .1 }], ['rings', { n: 5, rainbow: true, speed: .22, max: 2, a: .5 }], ['rise', { n: 50, rainbow: true, shape: 'star', size: 7, speed: .3, dir: -1, spread: 1 }], ['lens', { c: 4, a: .6, y: 0 }]],
    'Bricht jedes Licht in alle Farben. Und jede Regel gleich mit.', { biome: 'regenbogen', acc: ['crown'], body: '#f2f6ff' }),
  /* Kosmisch */
  A('galaxie', 'Galaxie im Hirn', 1.5e8, 'star', ['#120a3a', '#020108', '#b86aff', '#ff7ad9', '#6ae8ff'], [['stars', { n: 130, c: 4 }], ['spiral', { arms: 4, n: 110, c: 3, c2: 4, twist: 5, speed: .12, r: 2, size: 6, a: .85 }], ['glow', { c: 2, r: 1.2, a: .4, pulse: 1 }], ['orbit', { n: 5, c: 4, rx: 1.6, ry: .5, tilt: .5, speed: .25, size: 6, trail: 8 }], ['spiral', { arms: 2, n: 50, c: 2, c2: 3, twist: 3, speed: .3, r: .8, size: 4, a: .9, f: 1 }]],
    'Eine ganze Galaxie passt in seinen Kopf. Der Rest ist leider leer.', { acc: ['thirdeye'] }),
  A('kosmauge', 'Kosmisches Auge', 3e8, 'void', ['#0a1a3a', '#01040e', '#6ae8ff', '#b86aff', '#ffd24a'], [['stars', { n: 120, c: 4 }], ['mandala', { n: 10, c: 3, c2: 2, layers: 3, r: 1.6, a: .22, speed: .03 }], ['eye', { c: 2, c2: 3, c3: 4, r: 1.35 }], ['rings', { n: 4, c: 2, speed: .18, max: 2.4, a: .35 }], ['rise', { n: 30, c: 2, shape: 'star', size: 6, speed: .2, dir: -1, spread: 1 }]],
    'Es sieht dich an. Es hat dich immer angesehen. Der Derp winkt höflich.', { biome: 'singularitaet', av: { s: .5, y: .8 }, body: '#7aa4ff' }),
  A('weltenbaecker', 'Weltenbäcker', 5e8, 'grin', ['#3a1a2a', '#10060c', '#ff8ac0', '#d9a066', '#fff2c8'], [['stars', { n: 70, c: 4 }], ['planet', { c: 3, c2: 2, r: 1.15, donuts: 5 }], ['rise', { n: 40, rainbow: true, shape: 'sprinkle', size: 5, speed: .25, dir: 1, spread: 1 }], ['rings', { n: 2, c: 2, speed: .2, max: 2, a: .3 }]],
    'Backt ganze Planeten. Mit Zuckerguss. Und Streuseln. Viel Streuseln.', { acc: ['chefhat'], av: { s: .62, y: -.15 } }),
  /* Unmöglich */
  A('derpgott', 'DERP-GOTT', 1e9, 'zen', ['#4a3a10', '#120d02', '#fff2a8', '#ffffff', '#ffd24a'], [['beams', { n: 18, c: 2, c2: 3, a: .22, speed: .04, len: 3.2 }], ['mandala', { n: 12, c: 4, c2: 2, layers: 4, r: 1.7, a: .28, speed: .035 }], ['rays', { n: 24, c: 3, a: .55, speed: -.08, len: 3, w: .25 }], ['wings', { c: 3, c2: 2, span: 2.4, style: 'feather', flap: .5, a: .95 }], ['glow', { c: 3, r: 2.6, a: .45, pulse: .8 }], ['rings', { n: 5, c: 3, speed: .16, max: 2.6, a: .5 }], ['rise', { n: 70, c: 3, c2: 4, shape: 'star', size: 8, speed: .15, dir: -1, spread: 1, sway: 1 }], ['lens', { c: 3, a: .9, y: -.1 }]],
    'Der Ursprung allen Derpens. Er hat die Würfel erfunden. Und er würfelt trotzdem nur Gar nix.', { acc: ['halo', 'crown'], body: '#ffffff' }),
  A('fehler404', '404: Aura nicht gefunden', 4040404040, 'dead', ['#2a0508', '#050102', '#ff2a3a', '#ffffff', '#2affee'], [['stars', { n: 40, c: 3 }], ['text404', { c: 2, c2: 4 }], ['windows', { n: 6, c: 2 }], ['glitch', { rate: 9, c: 2, c2: 4, a: .55 }], ['scan', { a: .3 }], ['glitch', { rate: 6, c: 4, c2: 2, f: 1, a: .4 }]],
    'Bitte versuchen Sie es erneut. Oder nicht. Der Derp ist auch nicht mehr da.', { biome: 'glitch', rgb: true, body: '#dd5566' }),
  A('urpfuetze', 'Die Ur-Pfütze', 1e10, 'wink', ['#10224a', '#02040f', '#7ad6ff', '#b86aff', '#fff2a8'], [['stars', { n: 150, c: 4 }], ['aurora', { n: 3, c: 2, c2: 3, c3: 4, y: .1, h: .4, a: .45 }], ['moon', { c: 4, r: .5, x: -.9, y: -.8 }], ['rings', { n: 6, c: 2, speed: .22, max: 2.4, a: .6, squash: .26, y: .92 }], ['orbit', { n: 4, c: 3, rx: 1.7, ry: .6, tilt: -.2, speed: .15, size: 7, trail: 8 }], ['rise', { n: 40, c: 4, shape: 'star', size: 6, speed: .12, dir: -1, spread: 1 }]],
    'Aus ihr kam alles. Sie ist nass. Sie ist uralt. Der Derp steht mittendrin und freut sich.', { mirror: true, av: { y: -.08 }, body: '#9adfff' }),
];
const AURA_BY_ID = {}; AURAS.forEach((a, i) => { AURA_BY_ID[a.id] = a; a.idx = i; a.seed = i + 1; });
const AURAS_RARE = AURAS.filter((a) => a.odds >= 10).sort((a, b) => b.odds - a.odds);
const AURAS_COMMON = AURAS.filter((a) => a.odds < 10);

/* Upgrades */
const UPS = {
  luck: { name: 'Glücks-Gurke', max: 50, text: 'Mehr Glück bei jedem Wurf.', cost: (l) => Math.round(30 * Math.pow(1.36, l)), val: (l) => 1 + 0.15 * l, show: (v) => 'Glück ' + fmtLuck(v), ic: 'clover' },
  speed: { name: 'Turbo-Daumen', max: 25, text: 'Kürzere Pause zwischen den Würfen.', cost: (l) => Math.round(50 * Math.pow(1.45, l)), val: (l) => Math.max(0.3, 1.5 * Math.pow(0.92, l)), show: (v) => v.toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' s Pause', ic: 'bolt' },
  coin: { name: 'Taler-Magnet', max: 25, text: 'Jeder Wurf bringt mehr Derp-Taler.', cost: (l) => Math.round(80 * Math.pow(1.5, l)), val: (l) => 1 + 0.25 * l, show: (v) => 'Taler ' + fmtLuck(v), ic: 'coin' },
  multi: { name: 'Mehrfachwurf', max: 4, text: 'Würfelt auf einen Schlag mehrere Male.', costs: [2000, 60000, 2000000, 80000000], vals: [1, 3, 5, 10, 20], cost: (l) => UPS.multi.costs[l], val: (l) => UPS.multi.vals[l], show: (v) => v + ' Würfe auf einmal', ic: 'dice' },
  auto: { name: 'Auto-Würfler', max: 1, text: 'Der Derp würfelt von selbst, solange du zuschaust.', costs: [500], cost: (l) => UPS.auto.costs[l], val: (l) => l, show: (v) => (v ? 'Freigeschaltet' : 'Gesperrt'), ic: 'auto' },
  sleep: { name: 'Schlaf-Würfeln', max: 5, text: 'Der Derp würfelt auch, wenn das Spiel zu ist. Je Stufe länger und fleißiger.', costs: [3000, 25000, 200000, 2000000, 20000000], cost: (l) => UPS.sleep.costs[l], val: (l) => l, show: (v) => (v ? v + ' Std. und ' + Math.round(v * 20) + ' % Fleiß' : 'Gesperrt'), ic: 'moon' },
};
const POTIONS = [
  { id: 'luck1', name: 'Glücks-Brühe', kind: 'luck', mult: 2, dur: 300, price: 800, color: '#7aff9a', text: 'Schmeckt nach Gurke und Hoffnung.' },
  { id: 'luck2', name: 'Super-Glückssaft', kind: 'luck', mult: 3, dur: 300, price: 20000, color: '#4ad6ff', text: 'Macht kurz sehr glücklich. Und klebrig.' },
  { id: 'luck3', name: 'Derp-Elixier', kind: 'luck', mult: 5, dur: 240, price: 600000, color: '#c07aff', text: 'Eine Dosis Glück für den Rest des Nachmittags.' },
  { id: 'luck4', name: 'Flüssiges Schicksal', kind: 'luck', mult: 8, dur: 180, price: 30000000, color: '#ffe14a', text: 'Das Schicksal hat sich verflüssigt. Bitte schütteln.' },
  { id: 'speed1', name: 'Zappel-Saft', kind: 'speed', mult: 2, dur: 300, price: 1200, color: '#ff9a4a', text: 'Halb so lange Pause. Doppelt so viel Zappeln.' },
  { id: 'speed2', name: 'Turbo-Limo', kind: 'speed', mult: 3, dur: 240, price: 40000, color: '#ff5a7a', text: 'Vorsicht, sprudelt in alle Richtungen.' },
  { id: 'coin1', name: 'Taler-Tee', kind: 'coin', mult: 3, dur: 300, price: 2000, color: '#ffd24a', text: 'Dreifache Taler. Mit einem Hauch Gold.' },
];
const POTION_BY_ID = {}; POTIONS.forEach((p) => (POTION_BY_ID[p.id] = p));
const MULTI_STEPS = [1, 3, 10, 25, 100];

/* Würfeln: von selten nach häufig prüfen. Glück zählt je Aura höchstens bis zur Wurzel ihrer Seltenheit (so bleibt es spannend). */
const COMMON_W = AURAS_COMMON.reduce((s, a) => s + 1 / a.odds, 0);
function auraChance(a, luck, wid) {
  if (a.biome) return a.biome === wid ? Math.min(luck * 3, Math.sqrt(a.odds) * 2) / a.odds : 0;
  return Math.min(luck, Math.sqrt(a.odds)) / a.odds;
}
function pickAura(luck, wid, rnd) {
  rnd = rnd || Math.random;
  for (let i = 0; i < AURAS_RARE.length; i++) {
    const a = AURAS_RARE[i];
    if (a.biome && a.biome !== wid) continue;
    if (rnd() < auraChance(a, luck, wid)) return a;
  }
  let r = rnd() * COMMON_W;
  for (const a of AURAS_COMMON) { r -= 1 / a.odds; if (r <= 0) return a; }
  return AURAS_COMMON[0];
}
function coinsFor(a, mult) { return Math.max(1, Math.round((1 + Math.pow(a.odds, 0.42)) * mult)); }
if (typeof module !== 'undefined') module.exports = { TIERS, AURAS, UPS, POTIONS, pickAura, coinsFor, auraChance, WETTER, wetterNr };

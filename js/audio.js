'use strict';
/* Ton: alles wird live mit Web Audio erzeugt (keine Dateien). Die Lautstärke vom Hub greift über das Vorlade-Skript automatisch. */
(function () {
  let ctx = null, master, dry, wet, comp, musicBus;
  const opt = { ton: true, musik: true };
  const SC = [0, 2, 4, 7, 9];                       // Pentatonik
  const note = (root, i) => root * Math.pow(2, (SC[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5)) / 12);

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(ctx.destination);
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(comp);
      dry = ctx.createGain(); dry.connect(master);
      wet = ctx.createGain(); wet.gain.value = 0.38;
      const conv = ctx.createConvolver(), len = Math.floor(ctx.sampleRate * 2.4), buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      conv.buffer = buf; wet.connect(conv); conv.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.55; musicBus.connect(dry); musicBus.connect(wet);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => { });
    return ctx;
  }
  function out(v, rev) { const g = ctx.createGain(); g.gain.value = v; g.connect(dry); if (rev) { const r = ctx.createGain(); r.gain.value = rev; g.connect(r); r.connect(wet); } return g; }

  function tone(f, dur, o) {
    if (!opt.ton || !ensure()) return; o = o || {};
    const t0 = ctx.currentTime + (o.at || 0), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t0); if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
    const a = o.attack || 0.005, v = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vib; lg.gain.value = f * 0.04; l.connect(lg); lg.connect(osc.frequency); l.start(t0); l.stop(t0 + dur + 0.05); }
    osc.connect(g); g.connect(out(1, o.rev == null ? 0.25 : o.rev)); osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  let noiseBuf;
  function noise(dur, o) {
    if (!opt.ton || !ensure()) return; o = o || {};
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const t0 = ctx.currentTime + (o.at || 0), s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q || 1.2; f.frequency.setValueAtTime(o.f0 || 800, t0); f.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1 || o.f0 || 800), t0 + dur);
    const g = ctx.createGain(); const v = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t0); if (o.rise) { g.gain.exponentialRampToValueAtTime(v, t0 + dur * 0.95); g.gain.linearRampToValueAtTime(0.0001, t0 + dur); } else { g.gain.linearRampToValueAtTime(v, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); }
    s.connect(f); f.connect(g); g.connect(out(1, o.rev == null ? 0.15 : o.rev)); s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
  }
  const root = 261.63;
  const S = {
    unlock() { ensure(); },
    set(o) { Object.assign(opt, o); if (musicBus) musicBus.gain.value = opt.musik ? 0.55 : 0; if (!opt.musik) stopMusic(); else if (ctx) startMusic(); },
    click() { tone(660, 0.07, { type: 'triangle', vol: 0.12, to: 880, rev: 0.1 }); },
    tab() { tone(520, 0.06, { type: 'sine', vol: 0.1, to: 640, rev: 0.1 }); },
    roll() { tone(300, 0.09, { type: 'square', vol: 0.05, to: 520, rev: 0.05 }); tone(520, 0.08, { type: 'square', vol: 0.04, to: 780, at: 0.05, rev: 0.05 }); noise(0.16, { f0: 500, f1: 2400, vol: 0.05, q: 0.8 }); },
    coin() { tone(1320, 0.07, { type: 'sine', vol: 0.06, rev: 0.1 }); tone(1760, 0.12, { type: 'sine', vol: 0.05, at: 0.05, rev: 0.1 }); },
    buy() { [0, 2, 4, 7].forEach((n, i) => tone(note(root * 2, n), 0.18, { type: 'triangle', vol: 0.1, at: i * 0.06 })); },
    no() { tone(180, 0.18, { type: 'sawtooth', vol: 0.07, to: 120, rev: 0.05 }); },
    drink() { for (let i = 0; i < 4; i++) tone(240 + i * 40, 0.1, { type: 'sine', vol: 0.1, to: 420 + i * 60, at: i * 0.09, vib: 20 }); tone(900, 0.3, { at: 0.4, vol: 0.08 }); },
    derp() { const f = 280 + Math.random() * 260; tone(f, 0.28, { type: 'sine', vol: 0.18, to: f * 2.2, vib: 14 + Math.random() * 6, rev: 0.15 }); tone(f * 1.5, 0.2, { type: 'triangle', vol: 0.07, to: f * 2.6, at: 0.03 }); },
    ach() { [0, 1, 2, 4, 5].forEach((n, i) => tone(note(root * 2, n), 0.22, { type: 'triangle', vol: 0.09, at: i * 0.07 })); },
    /* Würfeln gewonnen. Je seltener, desto mehr Ton. */
    pop(tier) {
      if (tier <= 0) { tone(note(root, 0), 0.18, { type: 'triangle', vol: 0.12 }); return; }
      const n = Math.min(8, 1 + tier);
      for (let i = 0; i < n; i++) tone(note(root * (tier > 4 ? 2 : 1), i * (tier > 2 ? 1 : 1)), 0.3 + tier * 0.03, { type: i % 2 ? 'triangle' : 'sine', vol: 0.09 + tier * 0.006, at: i * Math.max(0.045, 0.1 - tier * 0.008), rev: 0.3 });
      if (tier >= 3) this.sparkle(2 + tier, 0.15);
    },
    sparkle(n, at) { for (let i = 0; i < n; i++) tone(1600 + Math.random() * 2600, 0.25, { type: 'sine', vol: 0.045, at: (at || 0) + i * 0.06 + Math.random() * 0.05, rev: 0.5 }); },
    riser(dur, tier) {
      noise(dur, { type: 'bandpass', f0: 200, f1: 5200 + tier * 400, q: 2.2, vol: 0.14, rise: true, rev: 0.3 });
      tone(110, dur, { type: 'sawtooth', vol: 0.08, to: 110 * (2 + tier * 0.4), attack: dur * 0.9, rev: 0.4 });
      tone(220, dur, { type: 'triangle', vol: 0.06, to: 880 + tier * 60, attack: dur * 0.9, rev: 0.4, vib: 7 });
      const beats = Math.floor(dur * 3); for (let i = 0; i < beats; i++) tone(90, 0.1, { type: 'sine', vol: 0.12, to: 55, at: (i / beats) * dur * (1 - 0.4 * (i / beats)) + 0.05 * i * 0 });
    },
    boom(tier) {
      tone(140, 1.3, { type: 'sine', vol: 0.5, to: 28, rev: 0.4 }); noise(0.9, { type: 'lowpass', f0: 3000, f1: 80, vol: 0.4, q: 0.7, rev: 0.4 });
      noise(0.12, { type: 'highpass', f0: 4000, f1: 9000, vol: 0.12 });
      if (tier >= 7) tone(55, 2.4, { type: 'sine', vol: 0.45, to: 38, at: 0.1 });
    },
    choir(tier, at) {
      const ch = [0, 4, 7, 9, 12, 16], base = 130.81 * (tier >= 8 ? 1.26 : 1);
      ch.slice(0, 3 + Math.min(3, tier - 4)).forEach((semi, i) => {
        [-6, 0, 7].forEach((cents) => {
          if (!opt.ton || !ensure()) return;
          const t0 = ctx.currentTime + (at || 0), osc = ctx.createOscillator(), g = ctx.createGain(), bp = ctx.createBiquadFilter(), bp2 = ctx.createBiquadFilter();
          osc.type = 'sawtooth'; osc.frequency.value = base * Math.pow(2, semi / 12 + 1); osc.detune.value = cents + (i * 3);
          bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 5; bp2.type = 'bandpass'; bp2.frequency.value = 1250; bp2.Q.value = 6;
          g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.045, t0 + 0.5); g.gain.setValueAtTime(0.045, t0 + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.6 + tier * 0.15);
          osc.connect(bp); osc.connect(bp2); bp.connect(g); bp2.connect(g); g.connect(out(1, 0.9)); osc.start(t0); osc.stop(t0 + 4.4 + tier * 0.15);
        });
      });
    },
    /* Kino: Anlauf, dann Knall und Fanfare. Gibt die Anlaufzeit zurück. */
    cinematic(tier, intro) {
      this.riser(intro, tier);
      const at = intro;
      setTimeout(() => { this.boom(tier); this.choir(tier, 0.05); const n = Math.min(10, 4 + tier); for (let i = 0; i < n; i++) tone(note(root * 2, i + 2), 0.5 + tier * 0.05, { type: 'triangle', vol: 0.1, at: 0.15 + i * 0.075, rev: 0.6 }); this.sparkle(6 + tier * 2, 0.4); }, at * 1000);
    },
  };

  /* ---------- Musik: ruhige Zufallsmelodie ---------- */
  let mt = 0, mstep = 0;
  const PROG = [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]];
  function startMusic() {
    if (mt || !opt.musik || !ensure()) return;
    mstep = 0;
    mt = setInterval(() => {
      if (!ctx || document.hidden || !opt.musik || !opt.ton) return;
      const bar = Math.floor(mstep / 8) % 4, beat = mstep % 8, ch = PROG[bar], t0 = ctx.currentTime + 0.05;
      if (beat === 0) ch.forEach((semi, i) => { const f = 130.81 * Math.pow(2, semi / 12) * (i === 0 ? 1 : 2); pad(f, t0, 3.4); });
      if (Math.random() < 0.55) { const semi = ch[Math.floor(Math.random() * 3)] + [12, 19, 24, 16][Math.floor(Math.random() * 4)]; pluck(261.63 * Math.pow(2, semi / 12), t0 + Math.random() * 0.2); }
      mstep++;
    }, 420);
  }
  function stopMusic() { clearInterval(mt); mt = 0; }
  function pad(f, t0, dur) {
    const osc = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(); osc.type = 'triangle'; osc.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.035, t0 + 1.2); g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(lp); lp.connect(g); g.connect(musicBus); osc.start(t0); osc.stop(t0 + dur + 0.1);
  }
  function pluck(f, t0) {
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = 'sine'; osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.06, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
    osc.connect(g); g.connect(musicBus); osc.start(t0); osc.stop(t0 + 1.5);
  }
  S.startMusic = startMusic; S.stopMusic = stopMusic;
  window.SFX = S;
})();

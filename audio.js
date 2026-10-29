// Música de fondo y efectos generados con Web Audio (no hacen falta archivos de audio).
// Una melodía tipo caja de música sobre acordes suaves (Do – La menor – Fa – Sol).
const GameAudio = (() => {
  let ctx = null, master, musicBus, sfxBus, lp, reverb, delaySend;
  let started = false, timer = null, nextTime = 0, step = 0, melody = 6;
  let muted = false;
  try { muted = localStorage.getItem("panda-muted") === "1"; } catch (e) {}

  const BPM = 70, EIGHTH = 60 / BPM / 2;
  const chords = [
    { root: 48, tones: [0, 4, 7] },  // Do
    { root: 45, tones: [0, 3, 7] },  // La menor
    { root: 53, tones: [0, 4, 7] },  // Fa
    { root: 43, tones: [0, 4, 7] }   // Sol
  ];
  const penta = [0, 2, 4, 7, 9];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);

    lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 5200;
    lp.connect(master);

    musicBus = ctx.createGain(); musicBus.gain.value = 0.55;
    musicBus.connect(lp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8;
    sfxBus.connect(master);

    // reverb sencilla con ruido decreciente
    const len = Math.floor(ctx.sampleRate * 2.6);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    reverb = ctx.createConvolver(); reverb.buffer = buf;
    const rg = ctx.createGain(); rg.gain.value = 0.38;
    reverb.connect(rg); rg.connect(lp);

    // eco
    const delay = ctx.createDelay(1.5); delay.delayTime.value = EIGHTH * 3;
    const fb = ctx.createGain(); fb.gain.value = 0.3;
    const dg = ctx.createGain(); dg.gain.value = 0.35;
    delaySend = ctx.createGain(); delaySend.gain.value = 1;
    delaySend.connect(delay); delay.connect(fb); fb.connect(delay);
    delay.connect(dg); dg.connect(lp);
    return true;
  }

  function tone(f, t, dur, o = {}) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const a = o.attack || 0.01, v = o.vol || 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(o.dest || musicBus);
    if (o.rev) g.connect(reverb);
    if (o.echo) g.connect(delaySend);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(t, dur, freq, vol) {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = 1.2;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(bp); bp.connect(g); g.connect(sfxBus);
    src.start(t);
  }

  function playStep(s, t) {
    const ch = chords[Math.floor(s / 8) % 4], pos = s % 8;
    if (pos === 0) {
      ch.tones.forEach(tn => tone(mtof(ch.root + 12 + tn), t, EIGHTH * 8.5, { attack: 1.1, vol: 0.06, rev: true }));
      tone(mtof(ch.root), t, EIGHTH * 5, { type: "triangle", vol: 0.15, attack: 0.05 });
    }
    if (pos === 4) tone(mtof(ch.root), t, EIGHTH * 3, { type: "triangle", vol: 0.09, attack: 0.04 });

    const chance = pos % 2 === 0 ? 0.72 : 0.33;
    if (Math.random() < chance) {
      const moves = [-2, -1, -1, 0, 1, 1, 2];
      melody = Math.max(0, Math.min(9, melody + moves[Math.floor(Math.random() * moves.length)]));
      const n = 72 + penta[melody % 5] + 12 * (Math.floor(melody / 5) - 1);
      tone(mtof(n), t, 1.7, { type: "triangle", vol: 0.1, attack: 0.008, rev: true, echo: true });
      tone(mtof(n + 12), t, 0.8, { type: "sine", vol: 0.025, attack: 0.005, rev: true });
    }
  }

  function schedule() {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + 0.5) {
      playStep(step, nextTime);
      nextTime += EIGHTH;
      step = (step + 1) % 32;
    }
  }

  function ok() { return ctx && !muted && ctx.state !== "closed"; }

  return {
    start() {
      if (!ctx && !init()) return;
      if (ctx.state === "suspended") ctx.resume();
      if (!started) {
        started = true;
        nextTime = ctx.currentTime + 0.15;
        timer = setInterval(schedule, 120);
      }
    },
    isMuted() { return muted; },
    toggle() {
      muted = !muted;
      try { localStorage.setItem("panda-muted", muted ? "1" : "0"); } catch (e) {}
      if (ctx) master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.08);
      else if (!muted) this.start();
      return muted;
    },
    // música más suave y apagada mientras duerme
    setSleep(on) {
      if (!ctx) return;
      lp.frequency.setTargetAtTime(on ? 650 : 5200, ctx.currentTime, 0.5);
      musicBus.gain.setTargetAtTime(on ? 0.35 : 0.55, ctx.currentTime, 0.5);
    },
    sfx: {
      tap(n) {
        if (!ok()) return; const t = ctx.currentTime, f = 280 + n * 55;
        tone(f, t, 0.16, { type: "triangle", vol: 0.22, dest: sfxBus });
        tone(f * 1.5, t + 0.03, 0.12, { type: "sine", vol: 0.1, dest: sfxBus });
      },
      board() {
        if (!ok()) return; const t = ctx.currentTime;
        tone(220, t, 0.3, { to: 560, vol: 0.18, dest: sfxBus, attack: 0.03 });
      },
      dizzy() {
        if (!ok()) return; const t = ctx.currentTime;
        for (let i = 0; i < 6; i++) tone(780 - i * 90, t + i * 0.09, 0.22, { type: "sine", vol: 0.14, dest: sfxBus, rev: true });
      },
      chew() {
        if (!ok()) return; const t = ctx.currentTime;
        noise(t, 0.09, 1400, 0.45);
        noise(t + 0.17, 0.08, 1100, 0.4);
      },
      kick() {
        if (!ok()) return; const t = ctx.currentTime;
        tone(190, t, 0.18, { to: 60, vol: 0.32, dest: sfxBus });
      },
      lullaby() {
        if (!ok()) return; const t = ctx.currentTime;
        [659, 523, 392, 330].forEach((f, i) => tone(f, t + i * 0.55, 1.2, { vol: 0.12, dest: sfxBus, rev: true, attack: 0.05 }));
      },
      chime() {
        if (!ok()) return; const t = ctx.currentTime;
        [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.12, 0.9, { vol: 0.14, dest: sfxBus, rev: true }));
      }
    }
  };
})();

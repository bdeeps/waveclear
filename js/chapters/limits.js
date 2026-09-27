// Chapter 5: where the simple picture surprises. Four scenes.
// "ripple" (1 unit = 1 cm, a ripple tank): two dippers make circular ripples of wavelength λ. At each
//   point the two add: h = Σ A cos(k rᵢ − ωt) ÷ √rᵢ (circular waves spread and weaken as 1/√r). Where the
//   path difference r₁ − r₂ is a whole number of λ they add (constructive); where it is a half-number
//   they cancel (destructive): Young's principle of interference, 1801–1803. The number of quiet lines
//   is the number of half-integers m + ½ with |m + ½| λ < d.
// "beats": two tuning forks, 440 Hz and f₂. sin a + sin b = 2 cos((a − b)/2) sin((a + b)/2), so you hear
//   the average pitch getting loud and soft |f₁ − f₂| times a second. Musicians tune by slowing the beats.
// "tacoma" (1 unit = 50 m): the Tacoma Narrows Bridge, main span 853 m (2,800 ft), plate girders 2.4 m
//   (8 ft) deep, opened 1 July 1940, fell 7 November 1940 in a steady wind of about 64 km/h (40 mph)
//   while twisting at about 0.2 Hz (12 cycles a minute) with a node at mid-span (Washington State DOT;
//   Billah & Scanlan, Am. J. Phys. 59, 118, 1991). The textbook story of "resonance with the wind" is a
//   myth: the wind was steady, and the rhythm of vortices shed by the deck, f = St U ÷ D with a Strouhal
//   number St ≈ 0.12, is far from 0.2 Hz. The cause was torsional flutter: above a critical wind speed the
//   twisting deck changes the airflow so that the wind pushes with the motion, a negative damping.
//   Model: ζ_eff = ζ_s (1 − U ÷ U_c), ζ_s = 0.01, U_c = 55 km/h (chosen to match the day; illustrative), and
//   the twist grows or dies as e^(−ζ_eff ω t). The growth is drawn about 200× faster than the model's real pace (minutes).
// "vacuum": a ringing bell and a lamp in a bell jar (Boyle and Hooke's air-pump experiment, 1660). Sound
//   is a pressure wave in a medium, so as the air is pumped out the sound fades: the wave amplitude a
//   thinner gas can carry falls roughly in proportion to its density, about 20 log₁₀(P ÷ P₀) dB. Light
//   needs no medium and is unchanged. Sunlight crosses 150 million km of near-vacuum in 8 min 20 s.
import { THREE, M, box, beam, sphere, tube, approach, clamp } from '../kit.js';
import {
  TAU, C, COL, hex, fmtHz, fmt0, fmtL, tone, board, panelBg, axes, title, line, curve, dot, text, ropeLine,
  fitNarrow, reelPlace, focusView, inReel,
} from '../wave.js';

const TC = { span: 853, depth: 2.4, f: 0.2, zs: 0.01, Uc: 55, St: 0.12 };
const tacoma = (s) => {
  const U = s.wind / 3.6, zeff = TC.zs * (1 - s.wind / TC.Uc);
  return { U, zeff, fv: (TC.St * U) / TC.depth, grows: zeff < 0 };
};
const quiet = (d, lam) => { let n = 0; for (let m = 0; m < 50; m++) if ((m + 0.5) * lam < d) n += 2; return n; };
const VIEWS = {
  ripple: { pos: [2.6, 14.5, 15.5], target: [2.6, 0.6, 0.6] },
  beats: { pos: [1.2, 3.6, 10.5], target: [1.2, 2.6, 0] },
  tacoma: { pos: [6.0, 9.5, 16], target: [2.2, 2.6, 0] },
  vacuum: { pos: [1.4, 3.6, 10.5], target: [1.4, 2.6, 0] },
};

export default {
  id: 'limits',
  short: 'Surprises and myths',
  title: 'When waves meet, and a famous myth',
  subtitle: 'Waves add and cancel, beat, need (or don’t need) a medium, and one bridge wasn’t resonance.',
  view: VIEWS.ripple,
  learn: `<p>When two waves meet they simply <b>add</b>. Crest on crest makes a bigger crest; crest on trough makes nothing at all. This is <b>interference</b>. Drop two pebbles in a pond and you see calm lines fanning out between the ripples, where the waves cancel. In 1801 Thomas Young used exactly this to show that light is a wave: two slits make bright and dark bands. <b>Noise-cancelling headphones</b> do it on purpose, playing an upside-down copy of the noise.</p>
    <p>Two notes that are nearly the same pitch interfere in <b>time</b>. They drift in and out of step, so you hear a wah-wah-wah: <b>beats</b>, as many per second as the difference in frequency. Tune a guitar, a harmonium or a tanpura by listening for the beats to slow down and stop.</p>
    <p><b>Myth-buster.</b> In 1940 the Tacoma Narrows Bridge twisted itself apart in a 64 km/h wind, and many books say "resonance". But the wind was <b>steady</b>: there was no rhythm to match. The swirls of air shed by the deck came about 0.9 times a second, not the bridge's 0.2. What really happened is <b>flutter</b>: above a critical speed, the twisting deck bent the airflow so that the wind pushed <i>with</i> each twist. It is negative damping, and each twist fed the next.</p>
    <p>Last surprise. <b>Sound needs a medium</b>, something to squeeze. Pump the air out of a jar and a ringing bell goes silent, as Robert Boyle and Robert Hooke showed in 1660. <b>Light doesn't</b>: its electric and magnetic fields carry themselves. That is why sunlight reaches us across 150 million km of empty space, while space itself is silent.</p>
    <p class="tip"><b>Try it:</b> move the two dippers apart and count the calm lines. Tune the second fork until the beats stop. Push the wind past 55 km/h on the bridge. Then pump the jar empty.</p>`,
  terms: [
    { t: 'Interference', d: 'Two waves adding up where they overlap: bigger where crests meet, cancelled where crest meets trough.' },
    { t: 'Constructive and destructive', d: 'Waves in step add up (constructive); waves half a wave out of step cancel (destructive).' },
    { t: 'Beats', d: 'A regular loud-soft wobble when two close pitches play together, at the difference of their frequencies.' },
    { t: 'Flutter', d: 'A self-feeding vibration where the motion changes the airflow so the air pushes the motion further.' },
    { t: 'Vortex shedding', d: 'Swirls of air that peel off alternately behind an object in a wind, at a rhythm set by the speed and size.' },
    { t: 'Medium', d: 'The stuff a wave moves through. Sound needs one; light does not.' },
  ],
  defaults: { focus: 'ripple', d: 4, lamR: 1.5, one: false, f2: 443, wind: 40, air: 1 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'ripple', label: 'Ripples' }, { v: 'beats', label: 'Beats' }, { v: 'tacoma', label: 'Tacoma bridge' }, { v: 'vacuum', label: 'Bell jar' }] },
    { key: 'd', type: 'range', label: 'Ripples: distance between the dippers', min: 0, max: 8, step: 0.1, ends: ['0', '8 cm'], fmt: (v) => v.toFixed(1) + ' cm' },
    { key: 'lamR', type: 'range', label: 'Ripples: wavelength', min: 0.8, max: 3, step: 0.05, ends: ['0.8 cm', '3 cm'], fmt: (v) => v.toFixed(2) + ' cm' },
    { key: 'one', type: 'toggle', label: 'Ripples: switch one dipper off' },
    { key: 'f2', type: 'range', label: 'Beats: second fork (the first is 440 Hz)', min: 430, max: 450, step: 0.1, ends: ['430 Hz', '450 Hz'], fmt: (v) => `${v.toFixed(1)} Hz · ${Math.abs(v - 440).toFixed(1)} beats a second` },
    { key: 'hear', type: 'buttons', label: 'Beats', items: [{ label: 'Hear both forks', act: (s) => { s.focus = 'beats'; tone([440, s.f2], 3, 0.08); } }] },
    { key: 'wind', type: 'range', label: 'Tacoma: steady wind speed', min: 0, max: 80, step: 1, ends: ['0', '80 km/h'], fmt: (v) => `${v} km/h` },
    { key: 'tc', type: 'buttons', label: 'Tacoma', items: [{ label: 'Calm the bridge', act: (s, inst) => { s.focus = 'tacoma'; s.wind = 30; inst.calm?.(); } }] },
    { key: 'air', type: 'log', label: 'Bell jar: air left inside', min: 0.001, max: 1, ends: ['0.1 %', 'all'], fmt: (v) => (v >= 0.995 ? '100 %' : (v * 100).toPrecision(2) + ' %') },
  ],
  quiz: [
    { q: 'Two waves meet exactly out of step: one’s crest lands on the other’s trough. What happens?', options: ['They make a wave twice as big', 'They cancel out', 'They bounce off each other', 'They change colour'], answer: 1, why: 'Waves add. A crest plus an equal trough is zero: destructive interference. Noise-cancelling headphones use it.' },
    { q: 'You play 440 Hz and 444 Hz together. What do you hear?', options: ['Two separate notes', 'A note at 884 Hz', 'Silence', 'A note that throbs 4 times a second'], answer: 3, why: 'Close pitches drift in and out of step, making beats at the difference: 444 − 440 = 4 per second.' },
    { q: 'What really destroyed the Tacoma Narrows Bridge in 1940?', options: ['Soldiers marching in step', 'Simple resonance with gusts of wind', 'Aeroelastic flutter: the twisting deck made the steady wind push it harder', 'An earthquake'], answer: 2, why: 'The wind was steady and its vortex rhythm didn’t match the 0.2 Hz twist. Above a critical speed, the deck’s own motion made the wind feed the twist: flutter.' },
  ],
  reel: [
    { ms: 5600, caption: 'Myth-buster: Tacoma Narrows wasn’t simple resonance but flutter, a twist the steady wind kept feeding.', set: { focus: 'tacoma' }, act: (s, inst) => inst.calm?.(0.12), anim: { wind: [50, 70] }, spin: 0.06, view: { pos: [9.0, 8.0, 8.5], target: [1.5, 4.6, 0] } },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    // ================================================================ RIPPLES (1 unit = 1 cm)
    const R = new THREE.Group(); root.add(R);
    const RW = 16, RD = 11, NXr = 150, NZr = 104;
    const rg = new THREE.PlaneGeometry(RW, RD, NXr, NZr); rg.rotateX(-Math.PI / 2);
    const rcol = new Float32Array(rg.attributes.position.count * 3); rg.setAttribute('color', new THREE.BufferAttribute(rcol, 3));
    const water = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    water.position.set(1.2, 0.6, 0.6); R.add(water);
    const tank = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(RW, 1.2, RD)), new THREE.LineBasicMaterial({ color: 0x8fa0b8 })); tank.position.set(1.2, 0.3, 0.6); R.add(tank);
    const dips = [0, 1].map(() => { const g = new THREE.Group(); const rodM = beam([0, 0, 0], [0, 2.2, 0], 0.06, M.metal(0xc0c6d2)); const tip = sphere(0.18, M.plastic(0xff7a59)); g.add(rodM, tip); R.add(g); return g; });
    const lQuiet = stage.label('calm lines: the waves cancel', [1.2, 1.6, 5.4], R, 'hot'); lQuiet.element.style.setProperty('--c', COL.lam);
    const SRCZ = -4.2;

    // ================================================================ BEATS
    const B = new THREE.Group(); root.add(B);
    const base = box(7, 0.2, 2.6, M.matte(0x2b3039)); base.position.set(1.2, 0.1, 0); B.add(base);
    const forkMat = M.metal(0xd8dde6, { roughness: 0.2 });
    const forks = [-0.8, 3.2].map((x) => {
      const g = new THREE.Group(); g.position.set(x, 0.2, 0); B.add(g);
      const box0 = box(1.6, 0.9, 1.0, M.matte(0x8a5a32)); box0.position.y = 0.45; g.add(box0);
      g.add(beam([0, 0.9, 0], [0, 1.5, 0], 0.07, forkMat));
      const tines = [-0.18, 0.18].map((dx) => { const t = beam([0, 0, 0], [0, 2.2, 0], 0.06, forkMat); t.position.set(dx, 1.5, 0); g.add(t); return t; });
      g.add(beam([-0.18, 1.5, 0], [0.18, 1.5, 0], 0.06, forkMat));
      return { g, tines };
    });
    const lF1 = stage.label('440 Hz', [-0.8, 4.5, 0], B, 'hot'), lF2 = stage.label('', [3.2, 4.5, 0], B, 'hot');
    lF1.element.style.setProperty('--c', COL.f); lF2.element.style.setProperty('--c', COL.crest);
    const loud = sphere(0.5, new THREE.MeshBasicMaterial({ color: 0x5ce1a9, transparent: true, toneMapped: false })); loud.position.set(1.2, 2.2, 0); B.add(loud);
    const lLoud = stage.label('', [1.2, 3.5, 0], B, 'hot'); lLoud.element.style.setProperty('--c', COL.lam);
    let beatT = 0;

    // ================================================================ TACOMA (1 unit = 50 m)
    const T = new THREE.Group(); root.add(T);
    const SPAN = TC.span / 50, TX0 = 1.5 - SPAN / 2, DY = 3.0, NSEG = 64, DECKW = 0.24 * 4;   // deck 11.9 m wide, drawn 4× wider
    const water2 = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), M.matte(0x0f2233, { roughness: 0.6 })); water2.rotation.x = -Math.PI / 2; water2.position.set(1.5, 0.02, 0); T.add(water2);
    const towerM = M.metal(0x6a8a7a, { roughness: 0.5 });
    for (const x of [TX0, TX0 + SPAN]) for (const z of [-DECKW / 2, DECKW / 2]) T.add(beam([x, 0, z], [x, DY + 2.6, z], 0.1, towerM));
    for (const x of [TX0, TX0 + SPAN]) T.add(beam([x, DY + 2.5, -DECKW / 2], [x, DY + 2.5, DECKW / 2], 0.08, towerM));
    const segs = [];
    for (let i = 0; i < NSEG; i++) { const sg = box(SPAN / NSEG + 0.01, 0.1, DECKW, M.matte(0xc9b89a)); sg.position.set(TX0 + (SPAN * (i + 0.5)) / NSEG, DY, 0); T.add(sg); segs.push(sg); }
    const cables = [-1, 1].map((sz) => { const c = ropeLine(stage, 100, 0x9aa3b2); T.add(c); return { c, sz }; });
    const hangers = [];
    for (let i = 1; i < 16; i++) for (const sz of [-1, 1]) { const h = ropeLine(stage, 2, 0x6d7380); T.add(h); hangers.push({ h, u: i / 16, sz }); }
    const winds = [];
    for (let i = 0; i < 26; i++) { const a = box(0.9, 0.02, 0.02, M.ghost(0xdfe8f5, 0.5)); T.add(a); winds.push({ a, x: (i * 7.3) % 24 - 12, y: 1.5 + (i % 6) * 0.7, z: ((i * 3.1) % 6) - 3 }); }
    const lTwist = stage.label('', [TX0 + SPAN * 0.25, DY + 1.0, 0.8], T, 'hot');
    const lNode = stage.label('node: mid-span barely twists', [1.5, DY - 0.9, 1.2], T);
    let th = 0.02, tPh = 0;
    const calm = (v = 0.02) => { th = v; };

    // ================================================================ VACUUM
    const V = new THREE.Group(); root.add(V);
    const plateV = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, 0.3, 48), M.metal(0x8a909c)); plateV.position.y = 0.15; V.add(plateV);
    const jar = new THREE.Mesh(new THREE.SphereGeometry(1.9, 48, 24, 0, TAU, 0, Math.PI / 2), M.clear(0xe6f6ff, 0.16)); jar.position.y = 0.3; jar.scale.y = 1.6; V.add(jar);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 16, 0, TAU, 0, Math.PI / 2), M.metal(0xe0b050, { roughness: 0.25, side: THREE.DoubleSide })); bell.position.set(-0.6, 0.9, 0); V.add(bell);
    V.add(beam([-0.6, 0.3, 0], [-0.6, 0.9, 0], 0.05, M.metal(0x6d7380)));
    const clapper = sphere(0.1, M.metal(0x6d7380)); V.add(clapper);
    const bulb = sphere(0.35, new THREE.MeshBasicMaterial({ color: 0xffe28a, toneMapped: false })); bulb.position.set(0.8, 1.3, 0); V.add(bulb);
    V.add(beam([0.8, 0.3, 0], [0.8, 0.95, 0], 0.06, M.metal(0x6d7380)));
    const pipeV = tube([[2.2, 0.2, 0], [3.2, 0.2, 0], [3.6, 0.8, 0]], 0.1, M.matte(0x2b3039)); V.add(pipeV);
    const pump = box(1.2, 1.0, 1.0, M.plastic(0x3d7bd9)); pump.position.set(4.0, 0.8, 0); V.add(pump);
    const lPump = stage.label('vacuum pump', [4.0, 1.6, 0], V);
    const rings = [0, 1, 2, 3].map(() => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 48), M.ghost(0xffb547, 0.6)); V.add(r); return r; });
    const rays = [];
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; const r = box(1.4, 0.03, 0.03, M.glow(0xffe28a)); r.position.set(0.8 + Math.cos(a) * 1.3, 1.3 + Math.sin(a) * 1.3, 0); r.rotation.z = a; V.add(r); rays.push(r); }
    const lSound = stage.label('', [-2.8, 3.9, 0], V, 'hot'); lSound.element.style.setProperty('--c', COL.crest);
    const lLightV = stage.label('light: <b>100 %</b>', [3.4, 3.9, 0], V, 'hot'); lLightV.element.style.setProperty('--c', '#ffe28a');
    let vPh = 0;

    // ================================================================ board
    let S = {}, focus = '';
    const bd = board(root, 5.2, 3.4, 620, 400, (g, w, h) => {
      panelBg(g, w, h);
      if (!S.focus) return;
      if (focus === 'beats') {
        const df = Math.abs(S.f2 - 440);
        title(g, 'Two notes, one throb', `beats = |f₁ − f₂| = ${df.toFixed(1)} Hz`);
        // top: 25 ms of both waves; bottom: 2 s envelope
        const x0 = 20, x1 = w - 20;
        const lane = (y, fn, col, span) => { g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 600; i++) { const t = (i / 600) * span, x = x0 + (i / 600) * (x1 - x0), yy = y - fn(t) * 26; i ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); };
        text(g, 'first 25 ms', x0, 66, 'rgba(255,255,255,.55)', '15px sans-serif');
        lane(100, (t) => Math.sin(TAU * 440 * t), COL.f, 0.025); lane(158, (t) => Math.sin(TAU * S.f2 * t), COL.crest, 0.025);
        text(g, 'added together, over 2 seconds (the loudness)', x0, 214, 'rgba(255,255,255,.55)', '15px sans-serif');
        g.fillStyle = 'rgba(92,225,169,.35)'; g.beginPath();
        for (let i = 0; i <= 600; i++) { const t = (i / 600) * 2, x = x0 + (i / 600) * (x1 - x0), e = Math.abs(Math.cos(Math.PI * df * t)); g.lineTo(x, 300 - e * 60); }
        for (let i = 600; i >= 0; i--) { const t = (i / 600) * 2, x = x0 + (i / 600) * (x1 - x0), e = Math.abs(Math.cos(Math.PI * df * t)); g.lineTo(x, 300 + e * 60); }
        g.fill();
        text(g, df < 0.05 ? 'In tune: no beats.' : `${(df * 2).toFixed(df < 5 ? 1 : 0)} throbs in 2 s. Tune until they stop.`, x0, 390, COL.lam, 'bold 19px sans-serif');
      } else if (focus === 'tacoma') {
        const t = tacoma(S);
        title(g, 'Resonance or flutter?', 'steady wind');
        const { X, Y } = axes(g, w, h, { x0: 70, y1: 60, y0: h - 58, xMax: 80, yMax: 1.4, xTicks: [0, 20, 40, 60, 80], yTicks: [0, 0.2, 0.6, 1, 1.4], xFmt: (v) => v + '', yFmt: (v) => v.toFixed(1), xLabel: 'wind (km/h)', yLabel: 'Hz' });
        line(g, [[0, TC.f], [80, TC.f]], X, Y, COL.lam, 4);
        text(g, 'deck twist 0.2 Hz', X(2), Y(TC.f) - 10, COL.lam, '16px sans-serif');
        curve(g, (u) => (TC.St * u) / 3.6 / TC.depth, 0, 80, X, Y, COL.crest, 3, [7, 5]);
        text(g, 'vortex rhythm, St·U ÷ D', X(40), Y(0.62) - 8, COL.crest, '16px sans-serif');
        g.fillStyle = 'rgba(255,90,90,.14)'; g.fillRect(X(TC.Uc), Y(1.4), X(80) - X(TC.Uc), Y(0) - Y(1.4));
        text(g, 'flutter zone', X(TC.Uc) + 6, Y(1.3), '#ff7a7a', 'bold 16px sans-serif');
        dot(g, X(S.wind), Y(t.fv), COL.crest, 8);
        line(g, [[S.wind, 0], [S.wind, 1.4]], X, Y, 'rgba(255,255,255,.5)', 2, [4, 4]);
      } else if (focus === 'vacuum') {
        title(g, 'Sound needs something to squeeze', 'light does not');
        const { X, Y } = axes(g, w, h, { x0: 70, y1: 60, y0: h - 58, xMin: 0.001, xMax: 1, xLog: true, yMax: 100, xTicks: [0.001, 0.01, 0.1, 1], yTicks: [0, 25, 50, 75, 100], xFmt: (v) => v * 100 + '%', yFmt: (v) => v + '%', xLabel: 'air left' });
        curve(g, (p) => 100, 0.001, 1, X, Y, '#ffe28a', 4);
        const pts = []; for (let i = 0; i <= 100; i++) { const p = 0.001 * Math.pow(1000, i / 100); pts.push([p, 100 * p]); }
        line(g, pts, X, Y, COL.crest, 4);
        text(g, 'light getting out', X(0.002), Y(100) + 24, '#ffe28a', '16px sans-serif');
        text(g, 'sound wave strength', X(0.05), Y(30), COL.crest, '16px sans-serif');
        dot(g, X(S.air), Y(100 * S.air), COL.crest, 9);
      } else {
        const n = S.one ? 0 : quiet(S.d, S.lamR);
        title(g, 'Waves add up', 'crest + trough = calm');
        const x0 = 30, x1 = w - 30;
        const lane = (y, fn, col) => { g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 300; i++) { const x = x0 + (i / 300) * (x1 - x0), yy = y - fn(i / 300) * 24; i ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); };
        text(g, 'in step: they add', x0, 72, COL.lam, '16px sans-serif');
        lane(110, (u) => Math.sin(TAU * 3 * u), 'rgba(111,182,255,.6)'); lane(110, (u) => 2 * Math.sin(TAU * 3 * u) * 0.9, COL.lam);
        text(g, 'half a wave out of step: they cancel', x0, 180, '#ff7a7a', '16px sans-serif');
        lane(220, (u) => Math.sin(TAU * 3 * u), 'rgba(111,182,255,.6)'); lane(220, (u) => -Math.sin(TAU * 3 * u), 'rgba(255,122,89,.6)'); lane(220, () => 0, '#fff');
        text(g, S.one ? 'One dipper: no calm lines at all.' : `${S.d.toFixed(1)} cm apart, λ = ${S.lamR.toFixed(2)} cm → ${n} calm lines`, x0, 320, COL.text, 'bold 19px sans-serif');
        text(g, 'Farther apart or shorter waves: more lines.', x0, 356, 'rgba(255,255,255,.7)', '17px sans-serif');
      }
    }, [0, 0, 0]);
    const BPOS = { ripple: [12.5, 3.2, -3.5, -0.45], beats: [5.4, 5.6, -1.5, -0.25], tacoma: [9.0, 7.6, -2.5, -0.25], vacuum: [5.0, 5.4, -1.5, -0.3] };
    const BS = { ripple: 1.3, beats: 1, tacoma: 1.3, vacuum: 1 };

    let key = '', ph = 0;
    return {
      calm,
      update(dt, s) {
        dt = Math.max(0, dt); S = s;
        fitNarrow(stage, [lQuiet, lNode, lPump]);
        if (s.focus !== focus) {
          focus = s.focus; focusView(stage, VIEWS, focus); key = '';
          const p = BPOS[focus]; bd.mesh.position.set(p[0], p[1], p[2]); bd.mesh.rotation.y = p[3]; bd.home = null;
        }
        reelPlace([[bd, [1.5, 9.8, -1], 1.3]]);
        if (!inReel()) bd.mesh.scale.setScalar(BS[focus] || 1);
        R.visible = focus === 'ripple'; B.visible = focus === 'beats'; T.visible = focus === 'tacoma'; V.visible = focus === 'vacuum';
        ph += dt * TAU * 0.9;
        if (focus === 'ripple') {
          const k = TAU / s.lamR, srcs = s.one ? [[1.2, SRCZ]] : [[1.2 - s.d / 2, SRCZ], [1.2 + s.d / 2, SRCZ]];
          dips.forEach((dp, i) => { dp.visible = i < srcs.length; if (dp.visible) dp.position.set(srcs[i][0], 0.75 + 0.12 * Math.sin(ph), srcs[i][1]); });
          const pos = rg.attributes.position.array, c = new THREE.Color();
          for (let v = 0; v < pos.length / 3; v++) {
            const x = pos[v * 3] + 1.2, z = pos[v * 3 + 2] + 0.6;
            let hgt = 0;
            for (const [sx, sz] of srcs) { const r = Math.hypot(x - sx, z - sz) + 0.3; hgt += Math.cos(k * r - ph) / Math.sqrt(r); }
            hgt *= 0.3 * (s.one ? 1.4 : 1);
            pos[v * 3 + 1] = hgt;
            const q = clamp(0.5 + hgt * 1.6, 0, 1);
            c.setRGB(0.03 + 0.9 * q * q * q, 0.08 + 0.75 * q * q, 0.2 + 0.75 * q); rcol[v * 3] = c.r; rcol[v * 3 + 1] = c.g; rcol[v * 3 + 2] = c.b;
          }
          rg.attributes.position.needsUpdate = true; rg.attributes.color.needsUpdate = true;
          lQuiet.visible = !s.one && quiet(s.d, s.lamR) > 0 && !fitNarrow(stage);
        } else if (focus === 'beats') {
          beatT += dt;
          const df = Math.abs(s.f2 - 440), e = Math.abs(Math.cos(Math.PI * df * beatT));
          loud.scale.setScalar(0.3 + 0.9 * e); loud.material.opacity = 0.25 + 0.7 * e;
          forks.forEach((fk, i) => fk.tines.forEach((t, j) => { t.rotation.z = (j ? 1 : -1) * 0.03 * Math.sin(ph * 6 + i); }));
          lF2.element.innerHTML = `${s.f2.toFixed(1)} Hz`;
          lLoud.element.innerHTML = df < 0.05 ? 'steady: <b>in tune</b>' : `loud-soft <b>${df.toFixed(1)}</b> times a second`;
        } else if (focus === 'tacoma') {
          const t = tacoma(s), w = TAU * TC.f;
          th *= Math.exp(-t.zeff * w * dt * 200);         // growth or decay, drawn about 200× faster
          th = clamp(th, 0.004, 0.5);
          tPh += dt * w;
          const tw = th * Math.cos(tPh);
          segs.forEach((sg, i) => { const u = (i + 0.5) / NSEG; sg.rotation.x = tw * Math.sin(TAU * u); });
          cables.forEach(({ c, sz }) => c.set((u) => { const x = TX0 + SPAN * u, sag = 2.2 * (1 - 4 * (u - 0.5) ** 2); const rot = tw * Math.sin(TAU * u); return [x, DY + 2.5 - sag + 0.02 + sz * Math.sin(rot) * DECKW * 0.5 * (sag / 2.2), sz * DECKW / 2]; }));
          hangers.forEach(({ h, u, sz }) => { const x = TX0 + SPAN * u, rot = tw * Math.sin(TAU * u), sag = 2.2 * (1 - 4 * (u - 0.5) ** 2); h.set((k) => (k < 0.5 ? [x, DY + 2.5 - sag, sz * DECKW / 2] : [x, DY + sz * Math.sin(rot) * DECKW / 2, sz * Math.cos(rot) * DECKW / 2])); });
          winds.forEach((wd) => { wd.x += dt * (s.wind / 10); if (wd.x > 12) wd.x -= 24; wd.a.position.set(wd.x - 0.5, wd.y, wd.z); wd.a.visible = s.wind > 2; wd.a.scale.x = 0.3 + s.wind / 60; });
          const deg = (th * 180) / Math.PI;
          lTwist.element.innerHTML = t.grows ? `flutter! twist <b>${deg.toFixed(0)}°</b> and growing` : `twist <b>${deg.toFixed(1)}°</b>, dying away`;
          lTwist.element.style.setProperty('--c', t.grows ? '#ff5a5a' : COL.lam);
        } else {
          vPh += dt;
          const a = s.air, lvl = Math.max(0, 70 + 20 * Math.log10(a));
          clapper.position.set(-0.6 + 0.35 * Math.sin(vPh * 18), 0.55, 0);
          rings.forEach((r, i) => { const k = (vPh * 0.6 + i / 4) % 1; const Rr = 0.8 + k * 3.2; r.scale.set(Rr, Rr, Rr); r.position.set(-0.6, 1.2, 0); r.material.opacity = (1 - k) * 0.8 * a; r.visible = a > 0.004; });
          lSound.element.innerHTML = `bell: <b>${lvl.toFixed(0)} dB</b>${a < 0.01 ? ', almost silent' : ''}`;
        }
        const kk = `${focus}|${s.d}|${s.lamR}|${s.one}|${s.f2}|${s.wind}|${s.air.toPrecision(3)}`;
        if (kk !== key) { key = kk; bd.redraw(); }
      },
      readout(s) {
        if (s.focus === 'beats') {
          const df = Math.abs(s.f2 - 440);
          return `<div class="big">Beats = |440 − ${s.f2.toFixed(1)}| = ${df.toFixed(1)} Hz</div>
            <div class="row"><span>First fork</span><b style="color:${COL.f}">440.0 Hz</b></div>
            <div class="row"><span>Second fork</span><b style="color:${COL.crest}">${s.f2.toFixed(1)} Hz</b></div>
            <div class="row"><span>Pitch you hear (the average)</span><b>${((440 + s.f2) / 2).toFixed(1)} Hz</b></div>
            <div class="row"><span>Time from loud to loud</span><b>${df < 0.05 ? 'never: in tune' : (1 / df).toFixed(2) + ' s'}</b></div>`;
        }
        if (s.focus === 'tacoma') {
          const t = tacoma(s);
          return `<div class="big">Steady wind ${s.wind} km/h (${t.U.toFixed(1)} m/s)</div>
            <div class="row"><span>Deck’s twisting frequency</span><b style="color:${COL.lam}">0.20 Hz</b></div>
            <div class="row"><span>Vortex rhythm, St·U ÷ D</span><b style="color:${COL.crest}">${t.fv.toFixed(2)} Hz</b></div>
            <div class="row"><span>Do they match (resonance)?</span><b>${Math.abs(t.fv - TC.f) < 0.05 ? 'only at a gentle breeze' : 'no'}</b></div>
            <div class="row"><span>Net damping of the twist</span><b class="${t.grows ? 'no' : 'ok'}">${t.grows ? 'negative: the wind feeds it' : 'positive: it dies away'}</b></div>
            <small>Illustrative model: flutter starts near ${TC.Uc} km/h. Growth drawn ~200× faster.</small>`;
        }
        if (s.focus === 'vacuum') {
          const lvl = Math.max(0, 70 + 20 * Math.log10(s.air));
          return `<div class="big">Air left: ${s.air >= 0.995 ? '100' : (s.air * 100).toPrecision(2)} %</div>
            <div class="row"><span>Pressure inside</span><b>${fmt0(s.air * 101325)} Pa</b></div>
            <div class="row"><span>Bell loudness outside (about)</span><b style="color:${COL.crest}">${lvl.toFixed(0)} dB</b></div>
            <div class="row"><span>Light getting out</span><b style="color:#ffe28a">100 %</b></div>
            <div class="row"><span>Sunlight’s trip through space</span><b>8 min 20 s</b></div>
            <small>Some sound still leaks through the jar’s base, so real jars never go quite silent.</small>`;
        }
        const n = s.one ? 0 : quiet(s.d, s.lamR);
        return `<div class="big">${s.one ? 'One source: rings only' : `${n} calm lines`}</div>
          <div class="row"><span>Distance between dippers, d</span><b>${s.d.toFixed(1)} cm</b></div>
          <div class="row"><span>Wavelength, λ</span><b style="color:${COL.lam}">${s.lamR.toFixed(2)} cm</b></div>
          <div class="row"><span>Calm where the paths differ by</span><b>½λ, 1½λ, 2½λ…</b></div>
          <div class="row"><span>Loud where they differ by</span><b>0, λ, 2λ…</b></div>`;
      },
    };
  },
};

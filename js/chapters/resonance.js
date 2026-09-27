// Chapter 4: resonance. Push a system at its own natural frequency and small pushes add up.
// All three scenes are the driven, damped oscillator: m x'' + c x' + k x = F₀ cos ωt. Natural frequency
// f₀ = √(k/m) ÷ 2π; damping ratio ζ; frequency ratio r = f ÷ f₀; steady amplitude
// X = (F₀/k) ÷ √((1 − r²)² + (2ζr)²), which peaks near r = 1 at (F₀/k) ÷ 2ζ, i.e. Q = 1/(2ζ) times the
// off-resonance response (any vibrations textbook, e.g. Rao, Mechanical Vibrations, ch. 3).
// "swing" (1 unit = 1 m): a simple pendulum, chains L = 2.4 m, so f₀ = √(g/L) ÷ 2π = 0.32 Hz (a swing
//   every 3.1 s). Pushes are a smooth rhythmic force giving an angular acceleration of 0.35 rad/s².
//   Small-angle (linear) model, integrated step by step so you see the build-up.
// "washer" (1 unit = 10 cm): a front-loader's tub, drum and concrete counterweight (about 45 kg) hang on
//   springs and friction dampers. Typical suspension resonance is a few hertz; here 3.5 Hz (210 rpm),
//   ζ = 0.12. A lump of wet clothes of mass m at the drum radius e = 0.25 m spins with the drum and
//   pushes with m e ω². Tub shake X = (m e / M) r² ÷ √((1 − r²)² + (2ζr)²); force passed to the floor
//   F = m e ω² × √(1 + (2ζr)²) ÷ √((1 − r²)² + (2ζr)²) (transmissibility). The whole machine weighs
//   about 70 kg; with rubber feet on tile, friction μ ≈ 0.5 holds about 340 N sideways before it walks.
// "glass" (1 unit = 3 cm): a wine glass rings at about 660 Hz (typical: 500–900 Hz) with a quality factor
//   Q ≈ 1,000, so it rings for seconds and responds only within about ±0.3 Hz. Sound pushes it with a
//   force proportional to the sound pressure, 10^(dB/20). Glasses are broken this way on camera at about
//   100–105 dB within a few cents of the note; here it breaks when the rim flex, scaled so that 105 dB
//   exactly on the note is the limit, is exceeded. The build-up time constant is τ = Q ÷ (π f₀).
import { THREE, M, box, beam, sphere, latheX, rod, torus, arrow, approach, clamp } from '../kit.js';
import {
  TAU, G, COL, hex, fmtHz, fmt0, gain, phaseLag, oscStep, tone, board, panelBg, axes, title, line, curve, dot, text,
  fitNarrow, reelPlace, focusView, inReel,
} from '../wave.js';

const SW = { L: 2.4, a0: 0.35 };
SW.w0 = Math.sqrt(G / SW.L); SW.f0 = SW.w0 / TAU;
const WA = { M: 45, e: 0.25, fn: 3.5, zeta: 0.12, weight: 70, mu: 0.5 };
WA.hold = WA.mu * WA.weight * G;
const GL = { f0: 660, Q: 1000 };
GL.zeta = 1 / (2 * GL.Q); GL.tau = GL.Q / (Math.PI * GL.f0);

function washer(s) {
  const w = (s.rpm / 60) * TAU, r = s.rpm / 60 / WA.fn, me = s.lump * WA.e, g = gain(r, WA.zeta);
  const X = (me / WA.M) * r * r * g;                                    // m
  const F = me * w * w * Math.sqrt(1 + (2 * WA.zeta * r) ** 2) * g;     // N to the floor
  return { w, r, X, F, spin: me * w * w, walks: F > WA.hold };
}
const glassRel = (s) => Math.pow(10, (s.db - 105) / 20) * gain(s.fg / GL.f0, GL.zeta) / gain(1, GL.zeta);
const VIEWS = {
  swing: { pos: [4.6, 3.3, 8.6], target: [1.2, 2.1, 0] },
  washer: { pos: [4.2, 7.0, 21], target: [3.6, 5.2, 0] },
  glass: { pos: [1.4, 6.4, 17], target: [1.4, 4.7, 0] },
};

export default {
  id: 'resonance',
  short: 'Resonance',
  title: 'Push at the right rhythm and small pushes add up',
  subtitle: 'Everything that can wobble has a natural frequency. Drive it there and it resonates.',
  view: VIEWS.swing,
  learn: `<p>Pull a swing back and let go. It swings to and fro at its own pace, about once every 3 seconds for a 2.4 m swing. That pace is its <b>natural frequency</b>. Every object that can wobble has one: a guitar string, a bridge, a wine glass, a building.</p>
    <p>Now push it. Push at a random rhythm and your pushes fight each other. Push <b>in step</b> with the swing, once each time it comes back, and every push adds a little more. The swing climbs higher and higher. That is <b>resonance</b>: driving something at its natural frequency so small pushes build a big motion.</p>
    <p>What stops it growing forever? <b>Damping</b>: friction and air drag take a little energy each swing. At resonance the swing settles where the energy you add equals the energy lost. Less damping means a taller, sharper peak.</p>
    <p>A <b>washing machine</b> meets resonance every spin. The tub hangs on springs, so it has a natural frequency of a few hertz. A lump of wet clothes shakes it as the drum turns. As the drum spins up through about 200 rpm, it passes that frequency and the machine shudders, then calms down at full speed. A badly unbalanced load can make it <b>walk</b> across the floor (see WasherClear).</p>
    <p>A <b>wine glass</b> rings at one clear note when you tap it. Sing or play that exact note loudly enough and the rim flexes more and more until it cracks. Musical instruments use resonance on purpose: a <b>tabla</b>'s black spot, the syahi, tunes its drumhead so its overtones fall into a musical series, which C. V. Raman explained in 1920 (see TablaClear). Your inner ear uses it too: each part of the cochlea resonates with a different pitch (see EarClear). Even <b>MRI</b> is resonance: radio waves at exactly 64 MHz tip the hydrogen nuclei in your body in a 1.5 tesla magnet (see MRIClear).</p>
    <p class="tip"><b>Try it:</b> set the push rhythm to 0.32 Hz and watch the swing grow; then push at 0.5 Hz. Spin the washer up slowly and watch the shake peak. Tune the speaker to the glass, then turn it up.</p>`,
  terms: [
    { t: 'Natural frequency', d: 'The rate at which something wobbles on its own after a knock or a push.' },
    { t: 'Resonance', d: 'A big response when a system is pushed at its natural frequency, because each push adds to the last.' },
    { t: 'Damping', d: 'Anything that drains energy from a vibration: friction, air drag, rubber mounts.' },
    { t: 'Driving frequency', d: 'How often the outside push comes: your hand, the spinning drum, the loudspeaker.' },
    { t: 'Quality factor (Q)', d: 'How sharp and tall the resonance is. A wine glass has a Q in the thousands, so it rings for seconds.' },
    { t: 'Unbalanced load', d: 'Clothes bunched on one side of the drum, which shake the tub once every turn.' },
  ],
  defaults: { focus: 'swing', fd: 0.32, zeta: 0.06, rpm: 0, lump: 0.5, ramp: false, fg: 655, db: 100 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'swing', label: 'Swing' }, { v: 'washer', label: 'Washing machine' }, { v: 'glass', label: 'Wine glass' }] },
    { key: 'fd', type: 'range', label: 'Swing: how often you push', min: 0.1, max: 0.6, step: 0.005, ends: ['0.1 Hz', '0.6 Hz'], fmt: (v) => `${v.toFixed(3)} Hz (every ${(1 / v).toFixed(1)} s)` },
    { key: 'zeta', type: 'range', label: 'Swing: damping (friction and drag)', min: 0.02, max: 0.25, step: 0.005, ends: ['slippery', 'draggy'], fmt: (v) => `ζ = ${v.toFixed(3)}` },
    { key: 'rpm', type: 'range', label: 'Washer: drum speed', min: 0, max: 1400, step: 10, ends: ['0', '1,400 rpm'], fmt: (v) => `${fmt0(v)} rpm (${(v / 60).toFixed(1)} turns a second)` },
    { key: 'lump', type: 'range', label: 'Washer: lump of wet clothes on one side', min: 0.1, max: 2, step: 0.05, ends: ['0.1 kg', '2 kg'], fmt: (v) => v.toFixed(2) + ' kg' },
    { key: 'spin', type: 'buttons', label: 'Washer', items: [
      { label: 'Spin up slowly', act: (s) => { s.focus = 'washer'; s.rpm = 0; s.ramp = true; } },
      { label: 'Stop', act: (s) => { s.ramp = false; s.rpm = 0; } },
    ] },
    { key: 'fg', type: 'range', label: 'Glass: speaker pitch', min: 640, max: 680, step: 0.05, ends: ['640 Hz', '680 Hz'], fmt: (v) => fmtHz(v) + (Math.abs(v - GL.f0) < 0.3 ? ' · on the note!' : '') },
    { key: 'db', type: 'range', label: 'Glass: loudness', min: 70, max: 115, step: 1, ends: ['70 dB', '115 dB'], fmt: (v) => `${v} dB` },
    { key: 'gl', type: 'buttons', label: 'Glass', items: [
      { label: 'Tap it (hear its note)', act: (s) => { s.focus = 'glass'; tone(GL.f0, 1.8, 0.08); } },
      { label: 'Tune to its note', act: (s) => { s.focus = 'glass'; s.fg = GL.f0; } },
      { label: 'New glass', act: (s, inst) => { s.focus = 'glass'; inst.newGlass?.(); } },
    ] },
  ],
  onChange(s, key) { if (key === 'rpm') s.ramp = false; },
  quiz: [
    { q: 'A swing takes 3 seconds to go there and back. How often should you push to make it go highest?', options: ['Once every second', 'Once every 10 seconds', 'As fast as you can', 'Once every 3 seconds'], answer: 3, why: 'Its natural frequency is 1 ÷ 3 s ≈ 0.33 Hz. Pushing at that rhythm, in step with the swing, makes each push add to the motion: resonance.' },
    { q: 'Why does a washing machine often shudder briefly while spinning up, then calm down at full speed?', options: ['The motor struggles', 'The drum speed passes through the tub’s natural frequency', 'The water drains', 'The door locks'], answer: 1, why: 'The tub on its springs has a natural frequency of a few hertz. As the drum passes that speed, the unbalanced clothes drive it at resonance. Above it, the shaking falls again.' },
    { q: 'What limits how big a resonance gets?', options: ['Damping: energy lost each cycle', 'Nothing, it always breaks', 'The colour of the object', 'Gravity only'], answer: 0, why: 'At resonance the amplitude grows until the energy lost each cycle to friction and drag equals the energy added. Less damping gives a taller, sharper peak.' },
  ],
  reel: [
    { ms: 5400, caption: 'Push a swing in time with its own rhythm and every small push adds up: resonance.', set: { focus: 'swing', fd: 0.322, zeta: 0.05 }, act: (s, inst) => inst.resetSwing?.(), anim: {}, spin: 0.05, view: { pos: [1.4, 3.3, 7.4], target: [1.4, 2.5, 0] } },
    { ms: 5400, caption: 'A washing machine shudders as its drum spins up through the tub’s natural frequency.', set: { focus: 'washer', lump: 1.2, ramp: false }, anim: { rpm: [60, 420] }, spin: 0.05, view: { pos: [2.8, 5.5, 12], target: [2.8, 5.8, 0] } },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    // ================================================================ SWING (1 unit = 1 m)
    const SWG = new THREE.Group(); root.add(SWG);
    const PY = 2.8, legM = M.metal(0x6d7380);
    for (const z of [-0.9, 0.9]) { SWG.add(beam([-1.5, 0, z], [0, PY, z * 0.7], 0.05, legM)); SWG.add(beam([1.5, 0, z], [0, PY, z * 0.7], 0.05, legM)); }
    SWG.add(beam([0, PY, -0.63], [0, PY, 0.63], 0.06, legM));
    const pend = new THREE.Group(); pend.position.set(0, PY, 0); SWG.add(pend);
    const chainM = M.metal(0xc0c6d2);
    pend.add(beam([0, 0, -0.3], [0, -SW.L + 0.35, -0.3], 0.015, chainM), beam([0, 0, 0.3], [0, -SW.L + 0.35, 0.3], 0.015, chainM));
    const seat = box(0.45, 0.05, 0.7, M.plastic(0xff7a59)); seat.position.y = -SW.L + 0.35; pend.add(seat);
    const kid = new THREE.Group(); kid.position.y = -SW.L + 0.38; pend.add(kid);
    const kb = beam([0, 0, 0], [0, 0.5, 0], 0.13, M.plastic(0x5ce1a9)); kid.add(kb);
    const kh = sphere(0.12, M.plastic(0xf0c8a0)); kh.position.y = 0.66; kid.add(kh);
    const kl = beam([0, 0.02, 0], [0.3, -0.25, 0], 0.05, M.plastic(0x3d7bd9)); kid.add(kl);
    const push = arrow(hex(COL.crest), 0.6, 0.18, 0.04); push.rotation.z = -Math.PI / 2; SWG.add(push);
    const lPush = stage.label('push!', [0, 0, 0], SWG, 'hot'); lPush.element.style.setProperty('--c', COL.crest);
    const lSw = stage.label('', [0, PY + 0.45, 0], SWG, 'hot'); lSw.element.style.setProperty('--c', COL.lam);
    const st = { x: 0, v: 0 }; let tSw = 0, peak = 0, peakT = 0;
    const resetSwing = () => { st.x = 0; st.v = 0; tSw = 0; peak = 0; };

    // ================================================================ WASHER (1 unit = 10 cm)
    const WG = new THREE.Group(); WG.position.x = 2.8; root.add(WG);
    const cab = new THREE.Group(); WG.add(cab);
    const cabBox = new THREE.Mesh(new THREE.BoxGeometry(6, 8.5, 6), M.clear(0xe8ecf2, 0.14)); cabBox.position.y = 4.25; cab.add(cabBox);
    const cabEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(6, 8.5, 6)), new THREE.LineBasicMaterial({ color: 0xc8d0dc })); cabEdge.position.y = 4.25; cab.add(cabEdge);
    for (const x of [-2.6, 2.6]) for (const z of [-2.6, 2.6]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.3, 16), M.matte(0x1b1d22)); f.position.set(x, -0.15, z); cab.add(f); }
    const tub = new THREE.Group(); tub.position.set(0, 4.3, 0); cab.add(tub);
    const tubM = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 4.6, 48, 1, true), M.clear(0x9aa3b2, 0.35)); tubM.rotation.x = Math.PI / 2; tub.add(tubM);
    const drum = new THREE.Group(); tub.add(drum);
    const drumM = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 4.2, 40, 1, true), M.metal(0xc9ced8, { side: THREE.DoubleSide, roughness: 0.35 })); drumM.rotation.x = Math.PI / 2; drum.add(drumM);
    for (let i = 0; i < 3; i++) { const lf = box(0.5, 0.35, 4.0, M.plastic(0xdfe3ea)); const a = (i / 3) * TAU; lf.position.set(Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0); lf.rotation.z = a; drum.add(lf); }
    const lump = sphere(0.7, M.matte(0x3d7bd9)); lump.position.set(0, -1.8, 0.8); drum.add(lump);
    const cw = box(4.6, 0.8, 1.2, M.matte(0x8a8378)); cw.position.set(0, 2.9, -1.4); tub.add(cw);
    const springs = [-1.8, 1.8].map((x) => { const sp = beam([0, 0, 0], [0, 1, 0], 0.08, M.metal(0xd0b060)); cab.add(sp); return { sp, x }; });
    const dampers = [-1.5, 1.5].map((x) => { const d = beam([0, 0, 0], [0, 1, 0], 0.12, M.matte(0x2b3039)); cab.add(d); return { d, x }; });
    const lWash = stage.label('', [0, 9.3, 0], WG, 'hot');
    const lTub = stage.label('tub on springs (shake drawn 10× bigger)', [0, -0.9, 3.2], WG);
    const setStrut = (m, a, b) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); m.position.copy(A).add(B).multiplyScalar(0.5); m.scale.set(1, A.distanceTo(B), 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.sub(A).normalize()); };
    let wPh = 0, drumA = 0, walk = 0, shake = 0;

    // ================================================================ GLASS (1 unit = 3 cm)
    const GG = new THREE.Group(); root.add(GG);
    const table = box(12, 0.3, 5, M.matte(0x5a3a22)); table.position.set(1.5, 0.15, 0); GG.add(table);
    const glassMat = M.clear(0xe6f6ff, 0.28, { roughness: 0.05, metalness: 0.1 });
    const glass = new THREE.Group(); glass.position.set(0, 0.3, 0); GG.add(glass);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.3, 0.1, 48), glassMat); foot.position.y = 0.05; glass.add(foot);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.6, 16), glassMat); stem.position.y = 1.4; glass.add(stem);
    const bowlPts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; bowlPts.push(new THREE.Vector2(0.15 + 1.35 * Math.sin(Math.min(1, t * 1.25) * Math.PI / 2) - 0.25 * Math.max(0, t - 0.8), 2.7 + t * 3.6)); }
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlPts, 48), new THREE.MeshPhysicalMaterial({ color: 0xe6f6ff, transparent: true, opacity: 0.3, roughness: 0.05, side: THREE.DoubleSide, clearcoat: 1, depthWrite: false }));
    glass.add(bowl);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.03, 8, 64), M.glow(0xcfefff)); rim.rotation.x = Math.PI / 2; rim.position.y = 6.3; glass.add(rim);
    const shards = [];
    for (let i = 0; i < 40; i++) {
      const g = new THREE.BufferGeometry(); const s = 0.2 + (((i * 37) % 10) / 10) * 0.35;
      g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, s, 0.1, 0, 0.1, s, 0.05], 3)); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xcfefff, transparent: true, opacity: 0.6, side: THREE.DoubleSide })); m.visible = false; GG.add(m);
      shards.push({ m, p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Vector3() });
    }
    const spk = new THREE.Group(); spk.position.set(5.2, 0.3, 0); GG.add(spk);
    const sb = box(2.2, 3.6, 2.2, M.matte(0x1b1d22)); sb.position.y = 1.8; spk.add(sb);
    const scone = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.4, 32, 1, true), M.matte(0x4a4f5a, { side: THREE.DoubleSide })); scone.rotation.z = Math.PI / 2; scone.position.set(-1.2, 2.2, 0); spk.add(scone);
    const waves = [0, 1, 2].map(() => { const t = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 40, Math.PI * 0.6), M.ghost(0xffb547, 0.6)); t.rotation.z = Math.PI * 0.7; GG.add(t); return t; });
    const lGlass = stage.label('', [1.5, -0.7, 2.6], GG, 'hot');
    let env = 0, broken = false, gPh = 0;
    const newGlass = () => { broken = false; env = 0; bowl.visible = rim.visible = true; shards.forEach((s) => (s.m.visible = false)); };
    const breakGlass = () => {
      broken = true; bowl.visible = rim.visible = false;
      shards.forEach((s, i) => { const a = (i / shards.length) * TAU * 3, y = 3 + (i % 10) * 0.35; s.p.set(Math.cos(a) * 1.1, y + 0.3, Math.sin(a) * 1.1); s.v.set(Math.cos(a) * (0.8 + (i % 4) * 0.5), 2 + (i % 3), Math.sin(a) * (0.6 + (i % 5) * 0.3)); s.r.set(i * 0.7, i * 1.3, i * 0.4); s.m.visible = true; });
    };

    // ================================================================ board
    let S = {}, focus = '';
    const bd = board(root, 5.0, 3.4, 620, 420, (g, w, h) => {
      panelBg(g, w, h);
      if (!S.focus) return;
      if (focus === 'washer') {
        const r = washer(S);
        title(g, 'Shake and floor force vs spin', 'lump ' + S.lump.toFixed(2) + ' kg');
        const Fmax = 1500;
        const { X, Y } = axes(g, w, h, { x0: 80, y1: 60, y0: h - 58, xMax: 1400, yMax: Fmax, xTicks: [0, 200, 400, 800, 1200], yTicks: [0, 500, 1000, 1500], xFmt: (v) => v + '', yFmt: (v) => v + '', xLabel: 'rpm', yLabel: 'N' });
        g.save(); g.beginPath(); g.rect(X(0), Y(Fmax), X(1400) - X(0), Y(0) - Y(Fmax)); g.clip();
        g.fillStyle = 'rgba(255,90,90,.12)'; g.fillRect(X(0), Y(Fmax), X(1400) - X(0), Y(WA.hold) - Y(Fmax));
        line(g, [[0, WA.hold], [1400, WA.hold]], X, Y, '#ff5a5a', 2, [8, 6]);
        curve(g, (rpm) => washer({ rpm, lump: S.lump }).F, 0, 1400, X, Y, COL.v, 4);
        curve(g, (rpm) => washer({ rpm, lump: S.lump }).X * 1000 * 50, 0, 1400, X, Y, COL.lam, 3);
        g.restore();
        dot(g, X(S.rpm), Y(Math.min(Fmax, r.F)), COL.v, 9);
        text(g, 'force on the floor', X(700), Y(Math.min(1400, washer({ rpm: 700, lump: S.lump }).F)) - 12, COL.v, '16px sans-serif');
        text(g, 'tub shake (mm × 50)', X(260), Y(Math.min(1400, washer({ rpm: 210, lump: S.lump }).X * 5e4)) - 8, COL.lam, '16px sans-serif');
        text(g, 'walks above this', X(900), Y(WA.hold) - 8, '#ff5a5a', '16px sans-serif');
      } else if (focus === 'glass') {
        title(g, 'The glass only answers its own note', 'Q ≈ 1,000');
        const { X, Y } = axes(g, w, h, { x0: 70, y1: 60, y0: h - 58, xMin: 640, xMax: 680, yMax: 1.1, xTicks: [640, 650, 660, 670, 680], yTicks: [0, 0.5, 1], xFmt: (v) => v + '', yFmt: (v) => v + '', xLabel: 'Hz', yLabel: 'rim flex' });
        curve(g, (f) => gain(f / GL.f0, GL.zeta) / gain(1, GL.zeta), 640, 680, X, Y, COL.crest, 3, null, 800);
        const rel = gain(S.fg / GL.f0, GL.zeta) / gain(1, GL.zeta);
        dot(g, X(S.fg), Y(rel), COL.lam, 9);
        text(g, `${S.fg.toFixed(2)} Hz: ${(rel * 100).toFixed(rel < 0.1 ? 1 : 0)}% of the peak`, 90, 100, COL.lam, 'bold 19px sans-serif');
        text(g, 'Half a hertz off, and it barely moves.', 90, 128, 'rgba(255,255,255,.7)', '16px sans-serif');
      } else {
        title(g, 'Swing height vs push rhythm', `ζ = ${S.zeta.toFixed(3)}`);
        const deg = (a) => (a * 180) / Math.PI;
        const { X, Y } = axes(g, w, h, { x0: 70, y1: 60, y0: h - 58, xMin: 0.1, xMax: 0.6, yMax: 90, xTicks: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], yTicks: [0, 30, 60, 90], xFmt: (v) => v.toFixed(1), yFmt: (v) => v + '°', xLabel: 'pushes per second (Hz)' });
        g.save(); g.beginPath(); g.rect(X(0.1), Y(90), X(0.6) - X(0.1), Y(0) - Y(90)); g.clip();
        for (const z of [0.03, 0.1, 0.2]) curve(g, (f) => deg((SW.a0 / (SW.w0 * SW.w0)) * gain(f / SW.f0, z)), 0.1, 0.6, X, Y, 'rgba(255,255,255,.25)', 2, [6, 6]);
        curve(g, (f) => deg((SW.a0 / (SW.w0 * SW.w0)) * gain(f / SW.f0, S.zeta)), 0.1, 0.6, X, Y, COL.crest, 4, null, 400);
        g.restore();
        line(g, [[SW.f0, 0], [SW.f0, 90]], X, Y, COL.f, 2, [4, 4]);
        text(g, `natural ${SW.f0.toFixed(2)} Hz`, X(SW.f0) + 6, Y(84), COL.f, '16px sans-serif');
        dot(g, X(S.fd), Y(Math.min(88, deg(peak))), COL.lam, 9);
      }
    }, [0, 0, 0]);
    const BPOS = { swing: [3.6, 3.9, -2.2, -0.55], washer: [11.0, 6.2, -2, -0.3], glass: [6.4, 8.4, -2, -0.2] };
    const BSCALE = { swing: 0.7, washer: 1.4, glass: 1.45 };

    let key = '', redrawT = 0;
    return {
      resetSwing, newGlass,
      update(dt, s) {
        dt = Math.max(0, dt); S = s;
        fitNarrow(stage, [lTub, lPush]);
        if (s.focus !== focus) {
          focus = s.focus; focusView(stage, VIEWS, focus); key = '';
          const p = BPOS[focus]; bd.mesh.position.set(p[0], p[1], p[2]); bd.mesh.rotation.y = p[3]; bd.home = null;
        }
        reelPlace([[bd, focus === 'swing' ? [1.4, 5.3, -0.5] : [focus === 'washer' ? 2.8 : 1.4, 12.4, -1], focus === 'swing' ? 0.8 : 1.6]]);
        if (!inReel()) bd.mesh.scale.setScalar(BSCALE[focus] || 1);
        SWG.visible = focus === 'swing'; WG.visible = focus === 'washer'; GG.visible = focus === 'glass';
        if (focus === 'swing') {
          const wd = TAU * s.fd;
          oscStep(st, dt, SW.w0, s.zeta, (h) => SW.a0 * Math.cos(wd * (tSw + h)));
          tSw += dt;
          st.x = clamp(st.x, -1.3, 1.3);
          pend.rotation.z = st.x;
          // peak tracker (decays slowly so the chart dot follows the current height)
          peak = Math.max(Math.abs(st.x), peak * Math.exp(-dt / 4));
          const pushOn = Math.cos(wd * tSw);
          const sx = Math.sin(st.x) * (SW.L - 0.2), sy = PY - Math.cos(st.x) * (SW.L - 0.2) + 0.25;
          push.visible = pushOn > 0.3; push.set(0.2 + 0.6 * pushOn); push.position.set(sx - 1.0, sy, 0.45);
          lPush.visible = push.visible && !fitNarrow(stage); lPush.position.set(sx - 1.1, sy + 0.35, 0.45);
          lSw.element.innerHTML = `swing: <b>${((Math.abs(peak) * 180) / Math.PI).toFixed(0)}°</b>`;
          redrawT += dt; if (redrawT > 0.25) { redrawT = 0; key = ''; }
        } else if (focus === 'washer') {
          if (s.ramp) { s.rpm = Math.min(1400, s.rpm + dt * 90); if (s.rpm >= 1400) s.ramp = false; }
          const r = washer(s), phi = phaseLag(r.r, WA.zeta);
          wPh += r.w * dt; drumA += Math.min(r.w, 14) * dt;       // drum drawn at up to 2 turns a second
          drum.rotation.z = -drumA;
          shake = approach(shake, r.X, 3, dt);
          const vis = Math.min(1.2, shake * 10 * 10);            // m → scene units (10 per metre), ×10
          const shownPh = drumA - phi;
          tub.position.set(vis * Math.sin(shownPh), 4.3 - vis * Math.cos(shownPh), 0);
          const cabShake = r.walks ? 0.05 : Math.min(0.03, r.F / 20000);
          if (r.walks && s.rpm > 30) walk = Math.min(3, walk + dt * 0.25);
          cab.position.set(walk + cabShake * Math.sin(shownPh * 1.0), Math.abs(cabShake * Math.cos(shownPh)), 0);
          springs.forEach(({ sp, x }) => setStrut(sp, [x, 8.2, 0.5], [tub.position.x + x * 0.8, tub.position.y + 2.5, 0.5]));
          dampers.forEach(({ d, x }) => setStrut(d, [x, 0.4, 0.6], [tub.position.x + x * 0.9, tub.position.y - 2.5, 0.6]));
          lWash.position.set(cab.position.x, 9.3, 0);
          lWash.element.innerHTML = r.walks && s.rpm > 30 ? 'too much shake: it <b>walks!</b>' : Math.abs(r.r - 1) < 0.25 && s.rpm > 30 ? '<b>resonance:</b> the tub shudders' : s.rpm > 300 ? 'above resonance: calm' : 'spinning';
          lWash.element.style.setProperty('--c', r.walks ? '#ff5a5a' : Math.abs(r.r - 1) < 0.25 ? COL.crest : COL.lam);
          if (s.rpm < 5) walk = approach(walk, 0, 1, dt);
          redrawT += dt; if (redrawT > 0.2) { redrawT = 0; key = ''; }
        } else {
          const rel = glassRel(s);
          if (!broken) {
            env = approach(env, rel, 1 / GL.tau, dt);
            if (env >= 1) breakGlass();
          }
          gPh += dt * TAU * 3;                                    // wobble shown slowed to 3 Hz
          const e = broken ? 0 : clamp(env, 0, 1.2) * 0.07;
          bowl.scale.set(1 + e * Math.cos(gPh), 1, 1 - e * Math.cos(gPh)); rim.scale.set(1 + e * Math.cos(gPh), 1 - e * Math.cos(gPh), 1);
          shards.forEach((sh) => { if (!sh.m.visible) return; sh.v.y -= 30 * dt; sh.p.addScaledVector(sh.v, dt); if (sh.p.y < 0.35) { sh.p.y = 0.35; sh.v.set(0, 0, 0); } else sh.m.rotation.set(sh.r.x += dt * 5, sh.r.y += dt * 4, 0); sh.m.position.copy(sh.p); });
          const loud = clamp((s.db - 70) / 45, 0, 1);
          scone.position.x = -1.2 - 0.06 * loud * Math.sin(gPh * 4);
          waves.forEach((wv, i) => { const k = ((gPh / TAU) * 0.5 + i / 3) % 1; const R = 0.8 + k * 3.6; wv.scale.setScalar(R); wv.position.set(4.0 - 0.2, 2.5, 0); wv.material.opacity = (1 - k) * 0.7 * loud; });
          lGlass.element.innerHTML = broken ? '<b>Shattered!</b> Press New glass' : env > 0.6 ? `rim flexing hard: <b>${(env * 100).toFixed(0)}%</b> of breaking` : `rim flex: <b>${(env * 100).toFixed(env < 0.1 ? 1 : 0)}%</b> of breaking`;
          lGlass.element.style.setProperty('--c', broken || env > 0.6 ? '#ff5a5a' : COL.lam);
          redrawT += dt; if (redrawT > 0.3) { redrawT = 0; }
        }
        const kk = `${focus}|${s.fd}|${s.zeta}|${s.lump}|${Math.round(s.rpm)}|${s.fg}`;
        if (kk !== key) { key = kk; bd.redraw(); }
      },
      readout(s) {
        if (s.focus === 'washer') {
          const r = washer(s);
          return `<div class="big">Tub shake ${(r.X * 1000).toFixed(1)} mm at ${fmt0(s.rpm)} rpm</div>
            <div class="row"><span>Drum turns per second, f</span><b style="color:${COL.f}">${fmtHz(s.rpm / 60)}</b></div>
            <div class="row"><span>Tub’s natural frequency, f₀</span><b>${WA.fn} Hz (${WA.fn * 60} rpm)</b></div>
            <div class="row"><span>Ratio f ÷ f₀</span><b style="color:${Math.abs(r.r - 1) < 0.25 ? COL.crest : COL.text}">${r.r.toFixed(2)}</b></div>
            <div class="row"><span>Pull of the wet lump, m e ω²</span><b>${fmt0(r.spin)} N</b></div>
            <div class="row"><span>Force passed to the floor</span><b class="${r.walks ? 'no' : 'ok'}">${fmt0(r.F)} N</b></div>
            <div class="row"><span>Friction holding the 70 kg machine</span><b>${fmt0(WA.hold)} N</b></div>
            <small>Real washers sense a bad lump and tumble to spread it before spinning fast.</small>`;
        }
        if (s.focus === 'glass') {
          const rel = glassRel(s);
          return `<div class="big">Glass rings at ${GL.f0} Hz</div>
            <div class="row"><span>Speaker pitch</span><b style="color:${COL.f}">${s.fg.toFixed(2)} Hz</b></div>
            <div class="row"><span>Off the note by</span><b>${Math.abs(s.fg - GL.f0).toFixed(2)} Hz</b></div>
            <div class="row"><span>Loudness</span><b>${s.db} dB</b></div>
            <div class="row"><span>Rim flex it is driving towards</span><b class="${rel >= 1 ? 'no' : 'ok'}">${(rel * 100).toFixed(rel < 0.1 ? 1 : 0)}% of breaking</b></div>
            <div class="row"><span>Build-up time, Q ÷ π f₀</span><b>${GL.tau.toFixed(2)} s</b></div>
            <small>Protect your ears: 100 dB is as loud as a pneumatic drill.</small>`;
        }
        const r = s.fd / SW.f0, ss = (SW.a0 / (SW.w0 * SW.w0)) * gain(r, s.zeta);
        return `<div class="big">Push at ${s.fd.toFixed(3)} Hz, swing's own ${SW.f0.toFixed(3)} Hz</div>
          <div class="row"><span>Swing length, L</span><b>${SW.L} m</b></div>
          <div class="row"><span>Natural frequency, √(g ÷ L) ÷ 2π</span><b style="color:${COL.f}">${SW.f0.toFixed(3)} Hz</b></div>
          <div class="row"><span>One swing takes</span><b>${(1 / SW.f0).toFixed(2)} s</b></div>
          <div class="row"><span>Push ÷ natural frequency</span><b style="color:${Math.abs(r - 1) < 0.08 ? COL.crest : COL.text}">${r.toFixed(2)}</b></div>
          <div class="row"><span>Height it settles at</span><b style="color:${COL.lam}">${Math.min(75, (ss * 180) / Math.PI).toFixed(0)}°</b></div>
          <div class="row"><span>Swinging now</span><b>${((peak * 180) / Math.PI).toFixed(0)}°</b></div>`;
      },
    };
  },
};

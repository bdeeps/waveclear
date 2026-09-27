// Chapter 2: sound. Two scenes.
// "air" (1 scene unit = 0.3 m): a loudspeaker at the end of a 2.4 m clear tube pushes the air back and
// forth. Each parcel of air moves along x as ξ = a sin(ωt − kx), so the air bunches up (compression,
// higher pressure) and spreads out (rarefaction) in a pattern that travels at the speed of sound,
// v = 331.3 √(1 + T/273.15) ≈ 343 m/s at 20 °C. λ = v ÷ f. Pressure p ∝ −∂ξ/∂x, drawn as the orange line.
// The motion is slowed hugely (a 440 Hz wobble can't be seen); the spacing of the bunches is to scale.
// Pitch is frequency: equal temperament, A4 = 440 Hz (ISO 16), f = 440 × 2^(n/12).
// "string" (1 scene unit = 0.1 m): standing waves. A string fixed at both ends can only hold whole numbers
// of half-wavelengths: L = n λ ÷ 2, so fₙ = n v ÷ 2L (Mersenne; Sauveur named the harmonics in 1701).
//   Guitar low E (E2, 82.41 Hz) and high E (E4, 329.63 Hz) on a 648 mm (25.5 in) scale, so v = 2 L f₁:
//   106.8 m/s and 427.2 m/s. A fret shortens the string: L = L₀ × 2^(−fret/12).
//   Flute: a tube open at both ends has pressure nodes (displacement antinodes) at each end, so the
//   same rule holds with v = 343 m/s. An acoustic length of 0.656 m gives C4, 261.6 Hz (a concert flute's
//   lowest note; the tube's physical length is a little shorter because of end corrections).
import { THREE, M, box, beam, sphere, approach, clamp } from '../kit.js';
import {
  TAU, COL, V_AIR, hex, fmtL, fmtHz, fmt0, noteOf, tone, board, panelBg, axes, title, line, dot, text, dots, flexTube, ropeLine,
  fitNarrow, reelPlace, focusView, inReel,
} from '../wave.js';

const INST = {
  lowE: { name: 'Guitar, low E', L: 0.648, f1: 82.41, kind: 'string' },
  highE: { name: 'Guitar, high E', L: 0.648, f1: 329.63, kind: 'string' },
  flute: { name: 'Flute, air column', L: 0.656, f1: 261.63, kind: 'pipe' },
};
function harm(s) {
  const I = INST[s.inst] || INST.lowE, v = 2 * I.L * I.f1;
  const L = I.kind === 'string' ? I.L * Math.pow(2, -s.fret / 12) : I.L;
  const f1 = v / (2 * L), f = s.n * f1;
  return { I, v, L, f1, f, lam: (2 * L) / s.n };
}
const TUBE = 8, TX0 = -4.6, TY = 1.5;            // air tube: 8 units × 0.3 m = 2.4 m
const SU = 10;                                   // string scene: units per metre
const VIEWS = {
  air: { pos: [-0.6, 4.8, 12.2], target: [-0.6, 3.9, 0] },
  string: { pos: [0.2, 4.0, 9.4], target: [0.2, 3.1, 0] },
};

export default {
  id: 'sound',
  short: 'Sound and music',
  title: 'Sound is a push passed through the air',
  subtitle: 'Pitch is frequency, and a string or pipe only rings at certain notes.',
  view: VIEWS.air,
  learn: `<p>A loudspeaker cone jerks forward and squeezes the air in front of it. That squeezed layer pushes the next one, and so on. Then the cone pulls back and leaves a thinner patch behind. The result is a <b>pressure wave</b>: bunches of air (<b>compressions</b>) and gaps (<b>rarefactions</b>) running away at the <b>speed of sound</b>, about <b>343 m/s</b> in air at 20 °C. Each bit of air only jiggles back and forth. It is a longitudinal wave, like the slinky.</p>
    <p>Your ear hears the <b>frequency</b> as <b>pitch</b>. The A above middle C is <b>440 Hz</b>, so its wavelength is 343 ÷ 440 = <b>78 cm</b>. Go up an <b>octave</b> and the frequency doubles. People hear roughly <b>20 Hz to 20,000 Hz</b>: wavelengths from 17 m down to under 2 cm. Every piano key is 1.0595 times the one below it (see PianoClear).</p>
    <p>Now pin a string at both ends. Waves run along it, bounce off the ends and overlap. Only certain patterns survive: those that fit a whole number of <b>half-wavelengths</b> into the string. They are <b>standing waves</b>. Some points never move (<b>nodes</b>); others swing the most (<b>antinodes</b>).</p>
    <p>That gives the <b>harmonics</b>: <b>fₙ = n × v ÷ 2L</b>. A guitar's low E string, 648 mm long, rings at 82 Hz, 165 Hz, 247 Hz… all at once, and the mix is its tone. Press a <b>fret</b> and you shorten L, so the pitch rises; the 12th fret halves the string and plays an octave (see GuitarClear).</p>
    <p>A <b>flute</b> does the same with a column of air. Open at both ends, it follows the same rule with v = 343 m/s. Blow harder and it jumps to the second harmonic, an octave up (see FluteClear).</p>
    <p class="tip"><b>Try it:</b> in <b>Air</b>, sweep the pitch and watch the bunches crowd together; press <b>Hear it</b>. In <b>Strings and pipes</b>, step through the harmonics and count the nodes, then press the 12th fret.</p>`,
  terms: [
    { t: 'Sound wave', d: 'A travelling pattern of squeezed and stretched air: a longitudinal pressure wave.' },
    { t: 'Pitch', d: 'How high or low a note sounds. It is set by the frequency.' },
    { t: 'Octave', d: 'Twice the frequency. Every C on a piano is double the C below it.' },
    { t: 'Standing wave', d: 'Two waves running opposite ways that add up to a pattern that swings in place.' },
    { t: 'Node and antinode', d: 'A node never moves; an antinode swings the most.' },
    { t: 'Harmonics', d: 'The notes a string or pipe can ring at: whole-number multiples of the lowest, the fundamental.' },
  ],
  defaults: { focus: 'air', fs: 440, temp: 20, inst: 'lowE', n: 1, fret: 0 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'air', label: 'Air' }, { v: 'string', label: 'Strings and pipes' }] },
    { key: 'fs', type: 'log', label: 'Air: pitch of the speaker', min: 60, max: 2000, ends: ['60 Hz', '2,000 Hz'], fmt: (v) => { const n = noteOf(v); return `${fmtHz(v)} · ${n.name}${Math.abs(n.cents) > 4 ? (n.cents > 0 ? ' +' : ' ') + n.cents + '¢' : ''}`; } },
    { key: 'temp', type: 'range', label: 'Air: temperature', min: -10, max: 45, step: 1, ends: ['−10 °C', '45 °C'], fmt: (v) => `${v} °C · sound at ${(331.3 * Math.sqrt(1 + v / 273.15)).toFixed(0)} m/s` },
    { key: 'inst', type: 'seg', label: 'Strings: instrument', options: Object.entries(INST).map(([v, o]) => ({ v, label: o.name })) },
    { key: 'n', type: 'seg', label: 'Strings: harmonic, n', options: [1, 2, 3, 4, 5, 6].map((v) => ({ v, label: String(v) })), fmt: (v, s) => { const h = harm(s); return `${fmtHz(h.f)} · ${noteOf(h.f).name}`; } },
    { key: 'fret', type: 'range', label: 'Strings: guitar fret pressed', min: 0, max: 12, step: 1, ends: ['open', '12th'], fmt: (v) => (v ? `fret ${v}` : 'open string') },
    { key: 'hear', type: 'buttons', label: 'Listen', items: [
      { label: 'Hear it', act: (s) => { const f = s.focus === 'air' ? s.fs : harm(s).f; tone(f, 1.2); } },
      { label: 'Hear the octave', act: (s) => { const f = s.focus === 'air' ? s.fs : harm(s).f; tone(f * 2, 1.2); } },
    ] },
  ],
  onChange(s, key) { s.n = clamp(Math.round(s.n), 1, 6); s.fret = Math.round(s.fret); if (key === 'inst' && s.inst === 'flute') s.fret = 0; if (key === 'fret' && s.inst === 'flute') s.fret = 0; },
  quiz: [
    { q: 'The A above middle C is 440 Hz. With sound at 343 m/s, what is its wavelength?', options: ['7.8 cm', '1.28 m', '440 m', '78 cm'], answer: 3, why: 'λ = v ÷ f = 343 ÷ 440 ≈ 0.78 m. A low bass note has wavelengths of several metres; a whistle, a few centimetres.' },
    { q: 'A guitar string’s fundamental is 110 Hz. What is its third harmonic?', options: ['36.7 Hz', '220 Hz', '330 Hz', '990 Hz'], answer: 2, why: 'Harmonics are whole-number multiples: fₙ = n × f₁, so 3 × 110 = 330 Hz. Three half-waves fit on the string, with two nodes between the ends.' },
    { q: 'You press a guitar string at the 12th fret, halfway along. What happens to the note?', options: ['It drops an octave', 'It rises an octave', 'It stays the same', 'It goes quiet'], answer: 1, why: 'f₁ = v ÷ 2L. Halving L doubles the frequency, and doubling the frequency is one octave up.' },
  ],
  reel: [
    { ms: 5400, caption: 'Sound is air squeezed and stretched, a pressure wave racing out at 343 metres a second.', set: { focus: 'air', temp: 20 }, anim: { fs: [110, 1200, true] }, spin: 0.05, view: { pos: [-0.4, 3.9, 7.8], target: [-0.4, 3.4, 0] } },
    { ms: 5400, caption: 'A string pinned at both ends only rings where whole half-waves fit: fₙ = n × v ÷ 2L.', set: { focus: 'string', inst: 'lowE', fret: 0 }, anim: { n: [1, 6] }, spin: 0.06, view: { pos: [0.3, 3.9, 7.4], target: [0.3, 3.2, 0] } },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    // ================================================================ AIR (1 unit = 0.3 m)
    const A = new THREE.Group(); root.add(A);
    const stand = box(TUBE + 2.2, 0.15, 1.6, M.matte(0x2b3039)); stand.position.set(TX0 + TUBE / 2 - 0.4, 0.08, 0); A.add(stand);
    const tubeG = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, TUBE, 40, 1, true), M.clear(0xcfe8ff, 0.1));
    tubeG.rotation.z = Math.PI / 2; tubeG.position.set(TX0 + TUBE / 2, TY, 0); A.add(tubeG);
    // speaker: a box with a cone that moves in and out
    const spk = box(0.7, 1.7, 1.7, M.matte(0x1b1d22)); spk.position.set(TX0 - 0.45, TY, 0); A.add(spk);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.35, 32, 1, true), M.matte(0x4a4f5a, { side: THREE.DoubleSide }));
    cone.rotation.z = Math.PI / 2; A.add(cone);
    const cap = sphere(0.14, M.matte(0x2a2d33)); A.add(cap);
    const lSpk = stage.label('loudspeaker', [TX0 - 0.45, TY + 1.15, 0], A);
    const ear = box(0.2, 1.3, 1.3, M.matte(0x3a3f4a)); ear.position.set(TX0 + TUBE + 0.1, TY, 0); A.add(ear);
    const lEar = stage.label('microphone', [TX0 + TUBE + 0.1, TY + 1.0, 0], A);
    // air parcels
    const NX = 100, NY = 5, NZ = 2, NA = NX * NY * NZ;
    const air = dots(NA, 0.04, 0xdfe8f5); A.add(air);
    const seed = [];
    let rs = 7; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < NA; i++) {
      const ix = i % NX, iy = Math.floor(i / NX) % NY, iz = Math.floor(i / (NX * NY));
      seed.push([TX0 + 0.1 + ((ix + rnd() * 0.6) / NX) * (TUBE - 0.2), TY - 0.45 + (iy + rnd()) * (0.9 / NY), -0.4 + (iz + rnd()) * (0.8 / NZ)]);
    }
    const pLine = ropeLine(stage, 200, hex(COL.crest)); A.add(pLine);
    const pBase = box(TUBE, 0.01, 0.01, M.ghost(0xffffff, 0.35)); pBase.position.set(TX0 + TUBE / 2, TY + 1.25, 0); A.add(pBase);
    const lP = stage.label('pressure: high in the bunches', [TX0 + TUBE - 1.4, TY + 1.95, 0], A, 'hot'); lP.element.style.setProperty('--c', COL.crest);
    const brk = new THREE.Group(); A.add(brk);
    const bm = M.glow(hex(COL.lam)), bBar = box(1, 0.03, 0.03, bm), bL = box(0.03, 0.3, 0.03, bm), bR = box(0.03, 0.3, 0.03, bm); brk.add(bBar, bL, bR);
    const lLam = stage.label('', [0, 0, 0], A, 'hot'); lLam.element.style.setProperty('--c', COL.lam);
    const lRule = stage.label('2.4 m tube', [TX0 + TUBE / 2, 0.35, 0.95], A);

    // ================================================================ STRINGS (1 unit = 0.1 m)
    const Sg = new THREE.Group(); root.add(Sg);
    const L0 = 0.648 * SU, SX0 = -L0 / 2, SX1 = L0 / 2, SY = 1.6;
    const FB = new THREE.Group(); Sg.add(FB);
    const neck = box(L0 + 0.8, 0.22, 0.9, M.matte(0x5a3a22)); neck.position.set(0, SY - 0.35, 0); FB.add(neck);
    const nut = box(0.12, 0.3, 0.9, M.plastic(0xf2ead8)); nut.position.set(SX0, SY - 0.12, 0); FB.add(nut);
    const bridge = box(0.2, 0.3, 0.9, M.matte(0x2b1c12)); bridge.position.set(SX1, SY - 0.12, 0); FB.add(bridge);
    const frets = [];
    for (let k = 1; k <= 12; k++) {
      const x = SX0 + L0 * (1 - Math.pow(2, -k / 12));
      const fr = box(0.04, 0.06, 0.9, M.metal(0xd8d0b8)); fr.position.set(x, SY - 0.22, 0); FB.add(fr); frets.push(x);
      if ([3, 5, 7, 9, 12].includes(k)) { const d = sphere(0.05, M.plastic(0xf2ead8)); d.position.set(x - (k > 1 ? (x - (SX0 + L0 * (1 - Math.pow(2, -(k - 1) / 12)))) / 2 : 0), SY - 0.23, 0); FB.add(d); }
    }
    const finger = sphere(0.17, M.plastic(0xe8b89a)); Sg.add(finger);
    const str = flexTube(160, 0.035, M.metal(0xd9dde6, { roughness: 0.25 })); Sg.add(str);
    const envMat = hex(COL.wave);
    const envA = ropeLine(stage, 120, envMat), envB = ropeLine(stage, 120, envMat); Sg.add(envA, envB);
    envA.material.transparent = envB.material.transparent = true; envA.material.opacity = envB.material.opacity = 0.45;
    const NN = 8, nodeM = [];
    for (let i = 0; i < NN; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 8, 24), M.glow(0xffffff)); Sg.add(r); nodeM.push(r); }
    const lNode = stage.label('node', [0, 0, 0], Sg), lAnti = stage.label('antinode', [0, 0, 0], Sg);
    // flute: a tube with air dots (displacement ξ ∝ cos(nπx/L): antinodes at the open ends)
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.656 * SU, 32, 1, true), M.clear(0xe8e4d8, 0.22));
    pipe.rotation.z = Math.PI / 2; pipe.position.set(0, SY, 0); Sg.add(pipe);
    const lip = box(0.14, 0.05, 0.1, M.metal(0xd8d0b8)); lip.position.set(-0.656 * SU / 2 + 0.3, SY + 0.2, 0); Sg.add(lip);
    const NPA = 90 * 5, pAir = dots(NPA, 0.028, 0xdfe8f5); Sg.add(pAir);
    const pSeed = [];
    for (let i = 0; i < NPA; i++) { const ix = i % 90, ir = Math.floor(i / 90); pSeed.push([-3.28 + ((ix + rnd() * 0.7) / 90) * 6.56, SY - 0.12 + (ir + rnd()) * (0.24 / 5), (rnd() - 0.5) * 0.24]); }
    const lInst = stage.label('', [0, SY + 1.3, 0], Sg, 'hot'); lInst.element.style.setProperty('--c', COL.lam);

    // ================================================================ board
    let S = {}, focus = '';
    const bd = board(root, 5.2, 3.5, 640, 432, (g, w, h) => {
      panelBg(g, w, h);
      if (!S.focus) return;
      if (focus !== 'string') {
        const f = S.fs, nt = noteOf(f), v = 331.3 * Math.sqrt(1 + S.temp / 273.15);
        title(g, 'Pitch is frequency', '88 piano keys, A0 to C8');
        // keyboard strip: 52 white keys
        const x0 = 20, x1 = w - 20, wk = (x1 - x0) / 52, y0 = 60, hW = 120, hB = 74;
        const keyX = []; let wi = 0;
        for (let k = 1; k <= 88; k++) { const pc = (k + 8) % 12; const black = [1, 3, 6, 8, 10].includes(pc); keyX.push({ black, x: black ? x0 + wi * wk - wk * 0.3 : x0 + wi * wk }); if (!black) wi++; }
        keyX.forEach((kk, i) => { if (kk.black) return; g.fillStyle = i + 1 === nt.key ? COL.lam : '#eef1f6'; g.fillRect(kk.x + 0.5, y0, wk - 1, hW); });
        keyX.forEach((kk, i) => { if (!kk.black) return; g.fillStyle = i + 1 === nt.key ? COL.lam : '#15171c'; g.fillRect(kk.x, y0, wk * 0.6, hB); });
        text(g, 'A0 27.5 Hz', x0, y0 + hW + 24, 'rgba(255,255,255,.6)', '16px sans-serif');
        text(g, 'C8 4,186 Hz', x1 - 96, y0 + hW + 24, 'rgba(255,255,255,.6)', '16px sans-serif');
        text(g, 'A4 440', x0 + 30.5 * wk - 20, y0 + hW + 24, 'rgba(255,255,255,.6)', '16px sans-serif');
        // wavelength bar (log): 1 cm to 20 m
        const bx0 = 20, bx1 = w - 20, by = 262, X = (m) => bx0 + (Math.log10(m / 0.01) / Math.log10(2000)) * (bx1 - bx0);
        text(g, 'Wavelength in air, λ = v ÷ f', 20, by - 12, COL.text, 'bold 19px sans-serif');
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(bx0, by, bx1 - bx0, 26);
        [[0.017, '1.7 cm (20 kHz)'], [0.78, '78 cm (A4)'], [17, '17 m (20 Hz)']].forEach(([m, l]) => { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(X(m), by - 4, 2, 34); text(g, l, clamp(X(m) - 40, 20, w - 150), by + 50, 'rgba(255,255,255,.6)', '16px sans-serif'); });
        const lam = v / f; dot(g, X(lam), by + 13, COL.lam, 11);
        text(g, `${nt.name}: ${fmtHz(f)} → λ = ${fmtL(lam)}`, 20, 370, COL.lam, 'bold 22px sans-serif');
        text(g, 'Up an octave: double f, half λ.', 20, 404, 'rgba(255,255,255,.7)', '18px sans-serif');
      } else {
        const hh = harm(S);
        title(g, 'The harmonic series', 'fₙ = n × f₁');
        const { X, Y } = axes(g, w, h, { x0: 70, y1: 70, y0: h - 60, xMin: 0.4, xMax: 8.6, yMax: 8, xTicks: [1, 2, 3, 4, 5, 6, 7, 8], yTicks: [0, 2, 4, 6, 8], xFmt: (v) => 'n=' + v, yFmt: (v) => v + '×', yLabel: 'f ÷ f₁' });
        for (let n = 1; n <= 8; n++) {
          const on = n === S.n;
          g.fillStyle = on ? COL.lam : 'rgba(111,182,255,.45)'; g.fillRect(X(n) - 22, Y(n), 44, Y(0) - Y(n));
          const f = n * hh.f1;
          g.save(); g.translate(X(n) + 6, Y(n) - 8); g.rotate(-Math.PI / 2); text(g, `${fmt0(f)} Hz ${noteOf(f).name}`, 0, 0, on ? '#fff' : 'rgba(255,255,255,.65)', (on ? 'bold ' : '') + '16px sans-serif'); g.restore();
        }
        text(g, `${hh.I.name}${hh.I.kind === 'string' && S.fret ? `, fret ${S.fret}` : ''}: f₁ = ${fmtHz(hh.f1)}`, 90, 100, COL.text, 'bold 19px sans-serif');
      }
    }, [0.9, 5.7, -1.2]);

    let ph = 0, key = '', amp = 0.4, nS = 1;
    return {
      update(dt, s) {
        dt = Math.max(0, dt); S = s;
        fitNarrow(stage, [lSpk, lEar, lRule, lNode, lAnti, lP]);
        reelPlace([[bd, [0.2, 7.4, 0], 1.25]]);
        if (s.focus !== focus) { focus = s.focus; focusView(stage, VIEWS, focus); key = ''; if (!inReel()) bd.mesh.position.set(focus === 'string' ? 2.9 : 0.9, focus === 'string' ? 4.5 : 5.7, -1.4); bd.home = null; }
        if (!inReel()) bd.mesh.scale.setScalar(focus === 'string' ? 0.8 : 1);
        A.visible = focus !== 'string'; Sg.visible = focus === 'string';
        ph += dt * TAU * 0.9;                  // shown vastly slowed: about one cycle a second on screen
        if (focus !== 'string') {
          const v = 331.3 * Math.sqrt(1 + s.temp / 273.15), lam = v / s.fs, k = TAU / (lam / 0.3);   // scene units
          const a = Math.min(0.5, 0.65 / k);   // parcel swing, exaggerated so the bunching is easy to see
          for (let i = 0; i < NA; i++) { const p = seed[i]; air.place(i, p[0] + a * Math.sin(ph - k * (p[0] - TX0)), p[1], p[2]); }
          air.done();
          cone.position.set(TX0 - 0.1 + 0.08 * Math.sin(ph), TY, 0); cap.position.set(TX0 - 0.02 + 0.08 * Math.sin(ph), TY, 0);
          // pressure ∝ −dξ/dx = a k cos(ph − kx): plot as a line above the tube
          pLine.set((u) => { const x = TX0 + u * TUBE; return [x, TY + 1.25 + 0.45 * Math.cos(ph - k * (x - TX0)), 0]; });
          const lamU = lam / 0.3, showB = lamU < TUBE - 0.3;
          // bracket between two pressure peaks
          const base = (ph / k) % lamU, c0 = TX0 + base + (base < 0.4 ? lamU : 0);
          brk.visible = showB && c0 + lamU < TX0 + TUBE;
          if (brk.visible) { const y = TY + 1.9; bBar.scale.x = lamU; bBar.position.set(c0 + lamU / 2, y, 0); bL.position.set(c0, y, 0); bR.position.set(c0 + lamU, y, 0); }
          lLam.position.set(brk.visible ? c0 + lamU / 2 : TX0 + TUBE / 2, TY + 2.25, 0);
          lLam.element.innerHTML = `λ = <b>${fmtL(lam)}</b>${showB ? '' : ', longer than this tube'}`;
        } else {
          const h = harm(s), I = h.I, pipeMode = I.kind === 'pipe';
          nS = s.n; amp = approach(amp, 0.42 / Math.sqrt(s.n), 5, dt);
          const Lu = h.L * SU, x0 = pipeMode ? -3.28 : SX1 - Lu, x1 = pipeMode ? 3.28 : SX1;
          str.visible = envA.visible = envB.visible = !pipeMode; pipe.visible = pAir.visible = lip.visible = pipeMode;
          FB.visible = !pipeMode;
          finger.visible = !pipeMode && s.fret > 0;
          if (!pipeMode) {
            if (s.fret > 0) finger.position.set(frets[s.fret - 1] - 0.18, SY + 0.12, 0);
            const c = Math.cos(ph);
            str.set((u) => { const x = SX0 + (SX1 - SX0) * u; if (x < x0) return [x, SY, 0]; const w = (x - x0) / Lu; return [x, SY + amp * Math.sin(s.n * Math.PI * w) * c, 0]; });
            envA.set((u) => [x0 + Lu * u, SY + amp * Math.sin(s.n * Math.PI * u), -0.01]);
            envB.set((u) => [x0 + Lu * u, SY - amp * Math.sin(s.n * Math.PI * u), -0.01]);
          } else {
            const c = Math.cos(ph);
            for (let i = 0; i < NPA; i++) { const p = pSeed[i], w = (p[0] + 3.28) / 6.56; pAir.place(i, p[0] + 0.16 * Math.cos(s.n * Math.PI * w) * c, p[1], p[2]); }
            pAir.done();
          }
          // node rings: string nodes at w = k/n (k = 0…n); pipe displacement nodes at w = (k + ½)/n
          const nodes = [];
          if (!pipeMode) for (let k = 0; k <= s.n; k++) nodes.push(x0 + (Lu * k) / s.n); else for (let k = 0; k < s.n; k++) nodes.push(x0 + (Lu * (k + 0.5)) / s.n);
          nodeM.forEach((r, i) => { r.visible = i < nodes.length; if (r.visible) { r.position.set(nodes[i], SY, 0); r.rotation.y = Math.PI / 2; } });
          const anti = pipeMode ? x0 : x0 + Lu / (2 * s.n);
          lNode.position.set(nodes[pipeMode ? 0 : Math.min(1, nodes.length - 1)], SY - 0.55, 0.2);
          lAnti.position.set(anti, SY + amp + 0.4, 0);
          lInst.element.innerHTML = `${I.name}: n = ${s.n}, <b>${fmtHz(h.f)}</b> (${noteOf(h.f).name})`;
        }
        const kk = `${focus}|${Math.round(s.fs)}|${s.temp}|${s.inst}|${s.n}|${s.fret}`;
        if (kk !== key) { key = kk; bd.redraw(); }
      },
      readout(s) {
        if (s.focus === 'string') {
          const h = harm(s), nt = noteOf(h.f), pipeMode = h.I.kind === 'pipe';
          return `<div class="big">fₙ = n v ÷ 2L = ${fmtHz(h.f)}</div>
            <div class="row"><span>${pipeMode ? 'Speed of sound in the air column' : 'Wave speed on the string'}, v</span><b style="color:${COL.v}">${h.v.toFixed(1)} m/s</b></div>
            <div class="row"><span>${pipeMode ? 'Air column length (acoustic)' : 'Vibrating length'}, L</span><b>${fmt0(h.L * 1000)} mm</b></div>
            <div class="row"><span>Harmonic number, n</span><b>${s.n}</b></div>
            <div class="row"><span>Wavelength on it, λ = 2L ÷ n</span><b style="color:${COL.lam}">${fmtL(h.lam)}</b></div>
            <div class="row"><span>Note</span><b style="color:${COL.f}">${nt.name}${Math.abs(nt.cents) > 4 ? ` (${nt.cents > 0 ? '+' : ''}${nt.cents} cents)` : ''}</b></div>
            <div class="row"><span>Wavelength of that note in the room</span><b>${fmtL(V_AIR / h.f)}</b></div>
            <small>${pipeMode ? 'The dots are air: they swing most at the open ends.' : 'Motion slowed down hundreds of times. The shape is to scale.'}</small>`;
        }
        const v = 331.3 * Math.sqrt(1 + s.temp / 273.15), nt = noteOf(s.fs);
        return `<div class="big">λ = v ÷ f = ${fmtL(v / s.fs)}</div>
          <div class="row"><span>Speed of sound at ${s.temp} °C</span><b style="color:${COL.v}">${v.toFixed(1)} m/s</b></div>
          <div class="row"><span>Frequency, f</span><b style="color:${COL.f}">${fmtHz(s.fs)}</b></div>
          <div class="row"><span>Nearest note</span><b>${nt.name}, piano key ${nt.key}</b></div>
          <div class="row"><span>Pushes each second by the cone</span><b>${fmt0(s.fs)}</b></div>
          <div class="row"><span>Time for the sound to cross 10 m</span><b>${((10 / v) * 1000).toFixed(1)} ms</b></div>
          <small>Slowed down hundreds of times so you can see it. The spacing of the bunches is to scale.</small>`;
      },
    };
  },
};

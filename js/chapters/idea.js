// Chapter 1: v = f × λ as a live experiment. 1 scene unit = 1 m.
// A heavy rope (a gym "battle rope", about 0.5 kg per metre) lies stretched along x. A hand at the left
// end shakes it up and down f times a second; the far end runs into an absorber so nothing reflects.
// The wave on it is y(x, t) = A sin(2π f t − 2π (x − x₀) ÷ λ), which moves right at v = f λ.
// On a stretched rope the speed is set by the rope, not by the hand: v = √(T ÷ μ) (tension over mass per
// metre; Mersenne 1636, Taylor 1713). So the slider sets v and shows the tension it needs, T = μ v².
// Shaking faster (more f) cannot make the wave go faster; it only packs the crests closer: λ = v ÷ f.
// Slinky mode shows the same travelling wave as a longitudinal one: each coil moves along x instead.
import { THREE, M, box, beam, sphere, approach, clamp } from '../kit.js';
import { TAU, COL, hex, fmtL, fmtHz, board, panelBg, axes, title, line, curve, dot, text, flexTube, fitNarrow, reelPlace, focusView, inReel } from '../wave.js';

const MU = 0.5;                  // kg/m: a 38 mm battle rope is roughly 0.5–0.8 kg per metre (sellers' specs)
const X0 = -6, X1 = 6, Y = 1.2;  // the rope's ends and height (m)
const N = 180;                   // points along the rope
const VIEWS = {
  rope: { pos: [0.4, 4.2, 13], target: [0.4, 3.3, 0] },
  slinky: { pos: [0.4, 4.2, 13], target: [0.4, 3.3, 0] },
};
const lamOf = (s) => s.v / s.f;

export default {
  id: 'idea',
  short: 'Speed = frequency × wavelength',
  title: 'A wave carries a shape, not the stuff',
  subtitle: 'Shake one end of a rope and a wave runs along it at v = f × λ.',
  view: VIEWS.rope,
  learn: `<p>Flick one end of a long rope and a bump runs away from your hand. Keep shaking and you send a whole train of bumps. That moving pattern is a <b>wave</b>. Watch the red bead: it only goes <b>up and down</b>. The rope stays where it is. What travels is the <b>shape</b>, and the <b>energy</b> it carries.</p>
    <p>Three numbers describe it. The <b>frequency, f</b>, is how many times a second your hand shakes, in <b>hertz (Hz)</b>. The <b>wavelength, λ</b> (lambda), is the distance from one crest to the next. The <b>speed, v</b>, is how fast a crest moves.</p>
    <p>Each shake sends out one wavelength, and you make f of them every second. So in one second the wave moves f wavelengths: <b>v = f × λ</b>. That one line works for ropes, sound, light and ripples on a pond.</p>
    <p>Here is the surprise. <b>You can't make the wave faster by shaking faster.</b> The speed belongs to the rope: pull it tighter, or use a lighter rope, and waves run faster, v = √(tension ÷ mass per metre). Shake faster and the crests just crowd closer together. The wavelength is the thing that gives: <b>λ = v ÷ f</b>.</p>
    <p>A rope wave is <b>transverse</b>: the rope moves across the way the wave goes. Switch to the <b>slinky</b> and the coils move back and forth <b>along</b> the wave, bunching and spreading. That is a <b>longitudinal</b> wave, and it is exactly how sound moves through air.</p>
    <p class="tip"><b>Try it:</b> double the frequency and watch the orange crest markers crowd in while their speed stays the same. Then pull the rope tighter and watch λ stretch out.</p>`,
  terms: [
    { t: 'Wave', d: 'A pattern of movement that travels, carrying energy but not the material it moves through.' },
    { t: 'Frequency (f)', d: 'How many waves pass each second, measured in hertz (Hz). 1 Hz is one per second.' },
    { t: 'Wavelength (λ)', d: 'The distance from one crest to the next.' },
    { t: 'Wave speed (v)', d: 'How fast a crest travels. v = f × λ.' },
    { t: 'Amplitude', d: 'How far the rope moves from its rest line. Bigger means more energy, not more speed.' },
    { t: 'Transverse and longitudinal', d: 'Transverse: the medium moves across the wave’s path (rope, light). Longitudinal: it moves along it (sound, slinky).' },
  ],
  defaults: { mode: 'rope', f: 2, v: 9, A: 0.3, slow: 0.5 },
  controls: [
    { key: 'mode', type: 'seg', label: 'Wave on a', options: [{ v: 'rope', label: 'Rope (transverse)' }, { v: 'slinky', label: 'Slinky (longitudinal)' }] },
    { key: 'f', type: 'range', label: 'Frequency: shakes per second, f', min: 0.5, max: 5, step: 0.05, ends: ['0.5 Hz', '5 Hz'], fmt: (v) => `${v.toFixed(2)} Hz (one every ${(1 / v).toFixed(2)} s)` },
    { key: 'v', type: 'range', label: 'Wave speed, v (pull the rope tighter to raise it)', min: 3, max: 15, step: 0.1, ends: ['3 m/s', '15 m/s'], fmt: (v) => `${v.toFixed(1)} m/s · needs ${Math.round(MU * v * v)} N of tension` },
    { key: 'A', type: 'range', label: 'Amplitude: how big the shake is', min: 0.05, max: 0.5, step: 0.01, ends: ['5 cm', '50 cm'], fmt: (v) => fmtL(v) },
    { key: 'slow', type: 'seg', label: 'Show time at', options: [{ v: 1, label: 'Real speed' }, { v: 0.5, label: '½' }, { v: 0.25, label: '¼' }] },
  ],
  quiz: [
    { q: 'A wave on a rope travels at 8 m/s and you shake the end 4 times a second. What is its wavelength?', options: ['2 m', '32 m', '0.5 m', '12 m'], answer: 0, why: 'λ = v ÷ f = 8 ÷ 4 = 2 m. Each shake sends out one wavelength, and four of them fit into the 8 m the wave travels each second.' },
    { q: 'You start shaking the rope twice as fast. What happens?', options: ['The wave goes twice as fast', 'The wavelength halves; the speed stays the same', 'The wavelength doubles', 'Nothing changes'], answer: 1, why: 'The speed is set by the rope’s tension and weight. Shaking faster packs the crests closer: λ = v ÷ f halves.' },
    { q: 'As a wave passes, what does a bead tied to the rope do?', options: ['Travels along with the wave', 'Moves backwards', 'Moves up and down, and stays in place', 'Stays perfectly still'], answer: 2, why: 'The rope only moves across; the pattern and the energy travel along. The same is true of air in a sound wave, which only jiggles back and forth.' },
  ],
  reel: [
    { ms: 5600, caption: 'A wave carries a shape and energy along a rope, while the rope itself only moves up and down.', set: { mode: 'rope', v: 9, A: 0.35, slow: 0.5 }, anim: { f: [1, 3.2] }, spin: 0.05, view: { pos: [0.5, 3.6, 13], target: [0.5, 3.2, 0] } },
    { ms: 5200, caption: 'Pull it tighter and the wave speeds up, so each wavelength stretches: λ = v ÷ f.', set: { mode: 'rope', f: 2, A: 0.3, slow: 0.5 }, anim: { v: [4, 14] }, spin: 0.05, view: { pos: [0.5, 3.6, 13], target: [0.5, 3.2, 0] } },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    // ---------------------------------------------------------------- the set
    const deck = box(13.6, 0.12, 2.4, M.matte(0x2b3039)); deck.position.set(0, 0.06, 0); root.add(deck);
    // metre ruler along the front edge
    for (let m = 0; m <= 12; m++) {
      const t = box(0.03, 0.02, m % 5 === 0 ? 0.36 : 0.2, M.glow(0x8fa0b8)); t.position.set(X0 + m, 0.13, 1.0); root.add(t);
    }
    [0, 5, 10].forEach((m) => stage.label(`${m} m`, [X0 + m, 0.2, 1.45], root));
    // the hand: a post and a handle that slides up and down
    const post = box(0.16, 2.6, 0.16, M.metal(0x6d7380)); post.position.set(X0 - 0.35, 1.3, 0); root.add(post);
    const hand = new THREE.Group(); root.add(hand);
    const grip = box(0.34, 0.26, 0.5, M.plastic(0xff7a59)); hand.add(grip);
    // the absorber at the far end
    const absorb = box(0.8, 1.9, 1.1, M.matte(0x3a3f4a)); absorb.position.set(X1 + 0.4, 1.0, 0); root.add(absorb);
    const lAbs = stage.label('absorber: no echo', [X1 + 0.4, 2.2, 0], root);
    // rope and slinky
    const ropeMat = M.matte(0x6fb6ff, { roughness: 0.7 });
    const rope = flexTube(N, 0.045, ropeMat); root.add(rope);
    const NR = 110, ringGeo = new THREE.TorusGeometry(0.17, 0.018, 6, 20); ringGeo.rotateY(Math.PI / 2);
    const rings = new THREE.InstancedMesh(ringGeo, M.metal(0xc0c6d2, { roughness: 0.35 }), NR);
    rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage); rings.frustumCulled = false; root.add(rings);
    const o3 = new THREE.Object3D();
    // the marker bead that shows the medium stays put
    const XB = 0;
    const bead = sphere(0.1, M.plastic(0xff4d5e)); root.add(bead);
    const beadTrail = box(0.02, 1, 0.02, M.ghost(0xff4d5e, 0.5)); root.add(beadTrail);
    const lBead = stage.label('this bit only moves up and down', [0, 0, 0], root);
    // crest markers: cones that ride on each crest
    const NC = 12, cones = [];
    for (let i = 0; i < NC; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.26, 16), M.glow(hex(COL.crest))); c.rotation.z = Math.PI; root.add(c); cones.push(c); }
    // the λ bracket
    const brk = new THREE.Group(); root.add(brk);
    const bm = M.glow(hex(COL.lam));
    const bar = box(1, 0.035, 0.035, bm), tl = box(0.035, 0.34, 0.035, bm), tr = box(0.035, 0.34, 0.035, bm);
    brk.add(bar, tl, tr);
    const lLam = stage.label('', [0, 0, 0], root, 'hot'); lLam.element.style.setProperty('--c', COL.lam);
    const lV = stage.label('', [0, 0, 0], root, 'hot'); lV.element.style.setProperty('--c', COL.v);
    const lHand = stage.label('', [X0 - 0.35, 2.95, 0], root, 'hot'); lHand.element.style.setProperty('--c', COL.f);

    // ---------------------------------------------------------------- the chart
    let S = {};
    const bd = board(root, 5.4, 3.65, 640, 432, (g, w, h) => {
      panelBg(g, w, h);
      if (!S.v) return;
      title(g, 'Wavelength vs frequency', 'λ = v ÷ f');
      const { X, Y } = axes(g, w, h, { x0: 70, y1: 64, y0: h - 58, xMax: 5, yMax: 12, xTicks: [0, 1, 2, 3, 4, 5], yTicks: [0, 3, 6, 9, 12], xFmt: (v) => v + '', yFmt: (v) => v + '', xLabel: 'f (Hz)', yLabel: 'λ (m)' });
      g.save(); g.beginPath(); g.rect(X(0), Y(12), X(5) - X(0), Y(0) - Y(12)); g.clip();
      for (const vv of [4, 8, 12]) {
        curve(g, (f) => vv / Math.max(f, 0.01), 0.3, 5, X, Y, 'rgba(255,255,255,.28)', 2, [6, 6]);
        text(g, `${vv} m/s`, X(vv / 11) + 6, Y(11) + 4, 'rgba(255,255,255,.5)', '16px sans-serif');
      }
      curve(g, (f) => S.v / Math.max(f, 0.01), 0.3, 5, X, Y, COL.v, 5);
      g.restore();
      const lam = lamOf(S);
      if (lam <= 12) dot(g, X(S.f), Y(lam), COL.lam, 10);
      text(g, `v = ${S.v.toFixed(1)} m/s:  ${S.f.toFixed(2)} Hz × ${lam.toFixed(2)} m`, 90, h - 12 - 100 + 10, COL.lam, 'bold 20px sans-serif');
      text(g, 'Double f, halve λ. The speed stays.', 90, h - 12 - 70 + 10, 'rgba(255,255,255,.7)', '17px sans-serif');
    }, [3.9, 5.1, -1.0]);

    let phase = 0, mode = '', key = '', A = 0.3;
    return {
      update(dt, s) {
        dt = Math.max(0, dt); S = s;
        fitNarrow(stage, [lAbs, lBead]);
        reelPlace([[bd, [0.5, 7.9, 0], 1.6]]);
        if (s.mode !== mode) { mode = s.mode; focusView(stage, VIEWS, mode); }
        const slinky = mode === 'slinky';
        rope.visible = !slinky; rings.visible = slinky;
        const T = dt * s.slow;
        phase = (phase + TAU * s.f * T) % (TAU * 1000);
        A = approach(A, s.A, 6, dt);
        const lam = lamOf(s), k = TAU / lam;
        const y = (x) => A * Math.sin(phase - k * (x - X0));
        if (!slinky) {
          rope.set((u) => { const x = X0 + (X1 - X0) * u; return [x, Y + y(x), 0]; });
          hand.position.set(X0 - 0.35, Y + y(X0), 0);
        } else {
          const a = Math.min(A, 0.4) * 0.6;
          for (let i = 0; i < NR; i++) {
            const x = X0 + ((X1 - X0) * i) / (NR - 1);
            o3.position.set(x + a * Math.sin(phase - k * (x - X0)), Y, 0); o3.rotation.set(0, 0, 0); o3.scale.setScalar(1); o3.updateMatrix(); rings.setMatrixAt(i, o3.matrix);
          }
          rings.instanceMatrix.needsUpdate = true;
          hand.position.set(X0 - 0.35 + a * Math.sin(phase), Y, 0);
        }
        // the bead
        if (!slinky) { bead.position.set(XB, Y + y(XB), 0); beadTrail.scale.y = 2 * A + 0.001; beadTrail.position.set(XB, Y, 0); }
        else { const a = Math.min(A, 0.4) * 0.6; bead.position.set(XB + a * Math.sin(phase - k * (XB - X0)), Y + 0.22, 0); beadTrail.scale.y = 0.001; }
        lBead.position.set(XB, Y - (slinky ? 0.6 : A + 0.45), 0.3);
        // crests: where phase − k(x − X0) = π/2 + 2πn (slinky: compressions, where the coils bunch)
        const crestX = [];
        const base = (phase - Math.PI / 2) / k;                     // a crest sits at X0 + base − n λ
        for (let x = X0 + (((base % lam) + lam) % lam); x <= X1 && crestX.length < NC; x += lam) crestX.push(x);
        cones.forEach((c, i) => {
          const x = crestX[i];
          c.visible = x !== undefined && !slinky;
          if (c.visible) c.position.set(x, Y + A + 0.3, 0);
        });
        // the λ bracket spans the first crest past x = −4 and the next one
        const c0 = crestX.find((x) => x > -4.5);
        const showB = !slinky && c0 !== undefined && c0 + lam <= X1 + 0.01;
        brk.visible = showB;
        const by = Y + Math.max(A, 0.2) + 0.85;
        if (showB) { bar.scale.x = lam; bar.position.set(c0 + lam / 2, by, 0); tl.position.set(c0, by, 0); tr.position.set(c0 + lam, by, 0); }
        lLam.position.set(showB ? c0 + lam / 2 : 0, by + 0.35, 0);
        lLam.element.innerHTML = showB || slinky ? `λ = <b>${fmtL(lam)}</b>` : `λ = <b>${fmtL(lam)}</b>, longer than this rope`;
        if (slinky) lLam.position.set(0, Y + 1.2, 0);
        const cv = crestX.find((x) => x > 1.5) ?? 3;
        lV.position.set(slinky ? 3 : cv, slinky ? Y - 0.7 : Y + A + 0.7, 0);
        lV.element.innerHTML = `→ v = <b>${s.v.toFixed(1)} m/s</b>`;
        lHand.element.innerHTML = `f = <b>${s.f.toFixed(2)} Hz</b>`;
        const kk = `${s.f.toFixed(2)}|${s.v.toFixed(2)}`;
        if (kk !== key) { key = kk; bd.redraw(); }
      },
      readout(s) {
        const lam = lamOf(s);
        return `<div class="big">λ = v ÷ f = ${s.v.toFixed(1)} ÷ ${s.f.toFixed(2)} = ${fmtL(lam)}</div>
          <div class="row"><span>Frequency, f</span><b style="color:${COL.f}">${fmtHz(s.f)}</b></div>
          <div class="row"><span>Period, one shake (1 ÷ f)</span><b>${(1 / s.f).toFixed(2)} s</b></div>
          <div class="row"><span>Wave speed, v = √(T ÷ μ)</span><b style="color:${COL.v}">${s.v.toFixed(1)} m/s</b></div>
          <div class="row"><span>Tension on a 0.5 kg/m rope</span><b>${Math.round(MU * s.v * s.v)} N</b></div>
          <div class="row"><span>Wavelength, λ</span><b style="color:${COL.lam}">${fmtL(lam)}</b></div>
          <div class="row"><span>Waves on the 12 m rope</span><b>${(12 / lam).toFixed(1)}</b></div>
          <small>${s.slow < 1 ? `Shown at ${s.slow === 0.5 ? 'half' : 'quarter'} speed. ` : ''}Amplitude changes the energy, not the speed.</small>`;
      },
    };
  },
};

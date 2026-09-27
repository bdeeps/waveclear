// Chapter 3: electromagnetic waves. Three scenes.
// Every electromagnetic wave travels at c = 299,792,458 m/s in a vacuum, so λ = c ÷ f (Maxwell 1865,
// Hertz 1887). Photon energy E = h f, h = 6.626 × 10⁻³⁴ J s, 1 eV = 1.602 × 10⁻¹⁹ J.
// "oven" (1 scene unit = 5 cm): a domestic microwave oven runs at 2.45 GHz (the ISM band, ITU Radio
//   Regulations 5.150), so λ = c ÷ f = 12.24 cm. Waves bouncing off the metal walls form a standing wave;
//   its peaks of heating (where |E|² is largest) sit about λ/2 = 6.1 cm apart. The heat pattern drawn
//   is sin²(πx/d) sin²(πz/d) with d = λ/2: a simplified single mode, enough to show the spacing. With the
//   turntable stopped, a slab of chocolate melts in spots; measure them and c = 2 d f (a classic class
//   experiment). The cavity is 30 × 20 × 30 cm.
// "door" (1 scene unit = 2 cm): the window's metal mesh has holes about 1–2 mm wide. A hole passes waves
//   freely only when it is wider than about half a wavelength (the cut-off of a square waveguide is
//   λc = 2a). Below that, its shielding is estimated with the standard EMC rule of thumb for one aperture
//   of width a in a sheet t thick: SE ≈ 20 log₁₀(λ ÷ 2a) + 27.3 t ÷ a dB (e.g. Ott, Electromagnetic
//   Compatibility Engineering, 2009, ch. 6). Real doors add a choke seal; this is the mesh alone.
//   Light (λ ≈ 0.5 µm) is thousands of times smaller than the holes, so it passes straight through.
// "spectrum" (the 3D wave's wavelength is drawn on a log scale; the numbers are real):
//   MRI 1.5 T proton resonance 63.9 MHz (γ/2π = 42.58 MHz/T), FM radio 100 MHz, Wi-Fi and ovens
//   2.45 GHz, TV remote infrared LED 940 nm, TV sub-pixels about 630 nm red, 530 nm green, 460 nm blue,
//   UV-A 365 nm, medical X-rays about 0.02 nm (≈ 60 keV).
import { THREE, M, box, beam, sphere, approach, clamp } from '../kit.js';
import {
  TAU, C, COL, hex, fmtL, fmtHz, fmt0, nmColor, board, panelBg, axes, title, line, dot, text, dots, ropeLine,
  fitNarrow, reelPlace, focusView, inReel,
} from '../wave.js';

const F_OVEN = 2.45e9, LAM_OVEN = C / F_OVEN;          // 0.1224 m
const H = 6.62607015e-34, EV = 1.602176634e-19;
const PRESETS = [
  { id: 'mri', name: 'MRI radio pulse', lam: C / 63.87e6, box: 'MRIClear' },
  { id: 'fm', name: 'FM radio', lam: C / 100e6 },
  { id: 'micro', name: 'Microwave oven, Wi-Fi', lam: LAM_OVEN, box: 'MicrowaveClear' },
  { id: 'ir', name: 'TV remote (infrared)', lam: 940e-9, box: 'TVClear' },
  { id: 'red', name: 'Red sub-pixel', lam: 630e-9, box: 'TVClear' },
  { id: 'green', name: 'Green sub-pixel', lam: 530e-9, box: 'TVClear' },
  { id: 'blue', name: 'Blue sub-pixel', lam: 460e-9, box: 'TVClear' },
  { id: 'uv', name: 'Ultraviolet (UV-A)', lam: 365e-9 },
  { id: 'xray', name: 'Medical X-ray', lam: 0.02e-9, box: 'XRayClear' },
];
function band(l) {
  if (l >= 1e-3) return l >= 1 ? 'radio' : 'microwave';
  if (l >= 750e-9) return 'infrared';
  if (l >= 380e-9) return 'visible light';
  if (l >= 10e-9) return 'ultraviolet';
  if (l >= 1e-12) return 'X-ray';
  return 'gamma ray';
}
const LMIN = 1e-11, LMAX = 10;
const VIEWS = {
  oven: { pos: [0.4, 8.4, 11.6], target: [0.4, 3.9, 0] },
  door: { pos: [4.6, 5.4, 12.4], target: [1.4, 4.1, 0] },
  spectrum: { pos: [0.6, 4.2, 12.5], target: [0.6, 3.5, 0] },
};
function door(s) {
  const a = s.hole / 1000, t = 0.001;                  // m
  const cut = a > LAM_OVEN / 2;
  const se = cut ? 0 : Math.max(0, 20 * Math.log10(LAM_OVEN / (2 * a)) + 27.3 * (t / a));
  return { a, cut, se, pass: Math.pow(10, -se / 10), ratio: LAM_OVEN / a };
}

export default {
  id: 'light',
  short: 'Light, microwaves, radio',
  title: 'Light is a wave too, and so is your microwave',
  subtitle: 'Electromagnetic waves all travel at c, so λ = c ÷ f.',
  view: VIEWS.oven,
  learn: `<p>In 1865 James Clerk Maxwell worked out that a wobbling electric field makes a wobbling magnetic field, which makes an electric field again, and the pair can travel on their own through empty space. His maths said they go at about <b>300,000 km/s</b>: the speed of light. So light is an <b>electromagnetic wave</b>. In 1887 Heinrich Hertz made invisible ones with sparks, and radio was born.</p>
    <p>All of them obey the same line as the rope: <b>c = f × λ</b>, with the same speed <b>c</b>. Only the frequency changes, and with it the wavelength and the name: radio, microwaves, infrared, <b>visible light</b>, ultraviolet, X-rays.</p>
    <p>A <b>microwave oven</b> works at <b>2.45 GHz</b>, so λ = 3 × 10⁸ ÷ 2.45 × 10⁹ = <b>12.2 cm</b>. The waves bounce off the metal walls and form a <b>standing wave</b>, with hot spots about half a wavelength, <b>6.1 cm</b>, apart. That's why the turntable turns (see MicrowaveClear). Stop it, melt a bar of chocolate, measure the gap between melted spots and you can work out the speed of light.</p>
    <p>Why can you see through the door but the microwaves can't get out? The metal mesh has holes about <b>1–2 mm</b> wide. A hole lets a wave through only if it is wider than about <b>half a wavelength</b>. Microwaves are 12 cm long, so they bounce back. Light is 0.0005 mm long and sails through.</p>
    <p>Your <b>TV</b> makes every colour from tiny red, green and blue <b>sub-pixels</b>, about 630, 530 and 460 nanometres (see TVClear). The <b>camera</b> sorts light by the same wavelengths with red, green and blue filters, and its lens bends light because light slows down in glass (see CameraClear).</p>
    <p class="tip"><b>Try it:</b> in <b>Oven</b>, stop the turntable and watch the chocolate melt in spots. In <b>Door</b>, make the holes bigger than 6 cm. In <b>Spectrum</b>, jump from an MRI scanner's radio pulse to an X-ray.</p>`,
  terms: [
    { t: 'Electromagnetic wave', d: 'Linked electric and magnetic fields that travel through space, even empty space, at the speed of light.' },
    { t: 'Speed of light (c)', d: '299,792,458 m/s in a vacuum, the same for every electromagnetic wave.' },
    { t: 'Spectrum', d: 'The whole family of electromagnetic waves, from long radio waves to tiny X-rays and gamma rays.' },
    { t: 'Nanometre (nm)', d: 'A billionth of a metre. Visible light is about 380 to 750 nm.' },
    { t: 'Standing wave', d: 'Waves bouncing back and forth that settle into a fixed pattern of strong and weak spots.' },
    { t: 'Photon energy', d: 'Light comes in packets with energy E = h × f. Higher frequency means more energetic packets.' },
  ],
  defaults: { focus: 'oven', turn: true, hole: 1.5, lam: 530e-9 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'oven', label: 'Oven' }, { v: 'door', label: 'Door mesh' }, { v: 'spectrum', label: 'Spectrum' }] },
    { key: 'turn', type: 'toggle', label: 'Oven: turntable on', hint: 'Stop it and the chocolate melts in spots.' },
    { key: 'oven', type: 'buttons', label: 'Oven', items: [{ label: 'New bar of chocolate', act: (s, inst) => { s.focus = 'oven'; inst.resetChoc?.(); } }] },
    { key: 'hole', type: 'log', label: 'Door: width of each hole in the mesh', min: 0.5, max: 150, ends: ['0.5 mm', '15 cm'], fmt: (v) => (v < 10 ? v.toFixed(1) + ' mm' : (v / 10).toFixed(1) + ' cm') },
    { key: 'lam', type: 'log', label: 'Spectrum: wavelength', min: LMIN, max: LMAX, ends: ['0.01 nm', '10 m'], fmt: (v) => `${fmtL(v)} · ${band(v)}` },
    { key: 'pre', type: 'buttons', label: 'Spectrum: jump to', items: PRESETS.map((p) => ({ label: p.name, act: (s) => { s.focus = 'spectrum'; s.lam = p.lam; } })) },
  ],
  quiz: [
    { q: 'A microwave oven runs at 2.45 GHz. Roughly how long are its waves?', options: ['1.2 mm', '1.2 m', '12 cm', '120 m'], answer: 2, why: 'λ = c ÷ f = 3 × 10⁸ ÷ 2.45 × 10⁹ ≈ 0.12 m. The hot spots are half of that, about 6 cm apart.' },
    { q: 'Why does the metal mesh on the oven door let light out but not microwaves?', options: ['The holes are much smaller than the microwaves’ wavelength but huge compared with light’s', 'The glass absorbs microwaves', 'Microwaves only travel in straight lines', 'The mesh is magnetic'], answer: 0, why: 'A hole narrower than about half a wavelength reflects the wave. 1–2 mm holes stop 12 cm microwaves, while 0.0005 mm light waves pass easily.' },
    { q: 'What do radio waves, microwaves, light and X-rays have in common?', options: ['The same frequency', 'The same wavelength', 'The same speed in a vacuum', 'They all need air to travel'], answer: 2, why: 'They are all electromagnetic waves and travel at c, about 300,000 km/s. Only f and λ differ, with c = f × λ.' },
  ],
  reel: [
    { ms: 5400, caption: 'A microwave oven’s 12 cm waves bounce into a standing wave with hot spots 6 cm apart.', set: { focus: 'oven', turn: false }, act: (s, inst) => inst.resetChoc?.(), anim: {}, spin: 0.08, view: { pos: [0.4, 7.2, 8.4], target: [0.4, 3.4, 0] } },
    { ms: 5200, caption: 'Radio, microwaves, light and X-rays are one family of waves, all moving at the speed of light.', set: { focus: 'spectrum' }, anim: { lam: [3, 0.03e-9, true] }, spin: 0.05, view: { pos: [0.3, 4.0, 10], target: [0.3, 3.6, 0] } },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    // ================================================================ OVEN (1 unit = 5 cm)
    const O = new THREE.Group(); root.add(O);
    const CW = 6, CH = 4, CD = 6, OY = 0.3;              // 30 × 20 × 30 cm cavity
    const shell = new THREE.Mesh(new THREE.BoxGeometry(CW, CH, CD), M.clear(0xcfd6e2, 0.12)); shell.position.set(0, OY + CH / 2, 0); O.add(shell);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(CW, CH, CD)), new THREE.LineBasicMaterial({ color: 0x9aa3b2 })); edges.position.copy(shell.position); O.add(edges);
    const floor = box(CW, 0.08, CD, M.metal(0x8a909c, { roughness: 0.5 })); floor.position.set(0, OY - 0.04, 0); O.add(floor);
    const guide = box(1.2, 0.8, 0.5, M.metal(0xb87333)); guide.position.set(CW / 2 - 0.9, OY + CH - 0.4, -CD / 2 + 0.3); O.add(guide);
    const lGuide = stage.label('waveguide from the magnetron', [CW / 2 - 0.9, OY + CH + 0.3, -CD / 2 + 0.3], O);
    // standing-wave heat map, a glowing sheet at plate height
    const d = (LAM_OVEN / 2) / 0.05;                     // half-wavelength in scene units: 2.45
    const heat = (x, z) => Math.pow(Math.sin((Math.PI * (x + 1.1)) / d) * Math.sin((Math.PI * (z + 0.6)) / d), 2);
    const hm = document.createElement('canvas'); hm.width = hm.height = 128;
    { const g = hm.getContext('2d'), im = g.createImageData(128, 128); for (let j = 0; j < 128; j++) for (let i = 0; i < 128; i++) { const x = -CW / 2 + (i / 127) * CW, z = -CD / 2 + (j / 127) * CD, v = heat(x, z), k = (j * 128 + i) * 4; im.data[k] = 255; im.data[k + 1] = 90 + 120 * v; im.data[k + 2] = 40; im.data[k + 3] = 200 * v; } g.putImageData(im, 0, 0); }
    const hmTex = new THREE.CanvasTexture(hm); hmTex.colorSpace = THREE.SRGBColorSpace;
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(CW, CD), new THREE.MeshBasicMaterial({ map: hmTex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
    sheet.rotation.x = -Math.PI / 2; sheet.position.set(0, OY + 2.7, 0); O.add(sheet);
    const lSheet = stage.label('standing wave: hot spots (seen from above)', [0, OY + 2.85, CD / 2 + 0.2], O);
    // turntable and chocolate
    const plate = new THREE.Group(); plate.position.set(0, OY + 0.12, 0); O.add(plate);
    const glassP = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.6, 0.12, 64), M.clear(0xe6f6ff, 0.35)); plate.add(glassP);
    const CB = 128, choc = document.createElement('canvas'); choc.width = choc.height = CB;
    const cg = choc.getContext('2d'), chocTex = new THREE.CanvasTexture(choc); chocTex.colorSpace = THREE.SRGBColorSpace;
    const SL = 4.2;                                       // slab 21 cm square
    const slab = new THREE.Mesh(new THREE.BoxGeometry(SL, 0.14, SL), [M.matte(0x4a2a18), M.matte(0x4a2a18), new THREE.MeshStandardMaterial({ map: chocTex, roughness: 0.6 }), M.matte(0x4a2a18), M.matte(0x4a2a18), M.matte(0x4a2a18)]);
    slab.position.y = 0.13; plate.add(slab);
    const melt = new Float32Array(CB * CB);
    const drawChoc = () => {
      const im = cg.createImageData(CB, CB);
      for (let i = 0; i < CB * CB; i++) { const m = clamp(melt[i], 0, 1), k = i * 4; im.data[k] = 70 + 150 * m; im.data[k + 1] = 38 + 95 * m; im.data[k + 2] = 20 + 50 * m; im.data[k + 3] = 255; }
      cg.putImageData(im, 0, 0); chocTex.needsUpdate = true;
    };
    const resetChoc = () => { melt.fill(0); drawChoc(); };
    resetChoc();
    const lChoc = stage.label('', [0, 0, 0], O, 'hot'); lChoc.element.style.setProperty('--c', COL.crest);
    const ruler = new THREE.Group(); O.add(ruler);
    const rb = box(d, 0.04, 0.06, M.glow(hex(COL.lam))); ruler.add(rb);
    const rl = box(0.04, 0.3, 0.06, M.glow(hex(COL.lam))), rr = rl.clone(); rl.position.x = -d / 2; rr.position.x = d / 2; ruler.add(rl, rr);
    const lRul = stage.label('λ/2 = 6.1 cm', [0, 0.35, 0], ruler, 'hot'); lRul.element.style.setProperty('--c', COL.lam);

    // ================================================================ DOOR (1 unit = 1 cm)
    const D = new THREE.Group(); root.add(D);
    const MESH_H = 6, MESH_W = 3.4;
    const meshG = new THREE.Group(); meshG.position.set(0, 3, 0); D.add(meshG);
    const meshMat = M.metal(0x5d6470, { roughness: 0.45 });
    const frameM = new THREE.Group(); meshG.add(frameM);
    const lIn = stage.label('inside the oven', [-3.5, 0.2, 0], D), lOut = stage.label('your kitchen', [3.8, 0.2, 0], D);
    // incoming, reflected and leaking microwaves as wavy lines; light as straight rays
    const NW = 4, waves = [];
    for (let i = 0; i < NW; i++) {
      const inc = ropeLine(stage, 120, 0xff5a5a), ref = ropeLine(stage, 120, 0xff5a5a), out = ropeLine(stage, 120, 0xff5a5a);
      ref.material = ref.material.clone(); ref.material.transparent = true; ref.material.opacity = 0.5;
      out.material = out.material.clone(); out.material.transparent = true;
      D.add(inc, ref, out); waves.push({ inc, ref, out, y: 1.3 + i * 1.15 });
    }
    const rays = [];
    for (let i = 0; i < 3; i++) { const r = box(10.5, 0.03, 0.03, M.glow(0xffe28a)); r.position.set(0, 1.9 + i * 1.3, 0.25); D.add(r); rays.push(r); }
    const lMw = stage.label('microwaves, λ = 12.2 cm', [-4.5, 6.3, 0], D, 'hot'); lMw.element.style.setProperty('--c', '#ff5a5a');
    const lLight = stage.label('light, λ ≈ 0.0005 mm', [4.4, 6.3, 0.25], D, 'hot'); lLight.element.style.setProperty('--c', '#ffe28a');
    let meshKey = '';
    const buildMesh = (aMm) => {
      frameM.children.forEach((c) => c.geometry.dispose()); frameM.clear();
      // draw the mesh to scale when holes are big; when they are tiny, draw one bar in every few (it is a picture)
      const a = aMm / 20, bar = Math.max(0.05, a * 0.35), pitch = a + bar;
      const nX = Math.ceil(MESH_W / pitch), nY = Math.ceil(MESH_H / pitch), skip = Math.max(1, Math.ceil(Math.max(nX, nY) / 60));
      for (let i = 0; i <= nY; i += skip) { const b = box(0.12, bar * (skip > 1 ? 1.5 : 1), MESH_W, meshMat); b.position.set(0, -MESH_H / 2 + i * pitch, 0); if (Math.abs(b.position.y) <= MESH_H / 2 + 0.01) frameM.add(b); }
      for (let i = 0; i <= nX; i += skip) { const b = box(0.12, MESH_H, bar * (skip > 1 ? 1.5 : 1), meshMat); b.position.set(0, 0, -MESH_W / 2 + i * pitch); if (Math.abs(b.position.z) <= MESH_W / 2 + 0.01) frameM.add(b); }
      const rim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.14, MESH_H, MESH_W)), new THREE.LineBasicMaterial({ color: 0xaab2c0 })); frameM.add(rim);
    };

    // ================================================================ SPECTRUM
    const SP = new THREE.Group(); root.add(SP);
    const EX0 = -5, EX1 = 4.2, EY = 2.2;
    const eLine = ropeLine(stage, 400, 0xffffff), bLine = ropeLine(stage, 400, 0x6fb6ff); SP.add(eLine, bLine);
    eLine.material.toneMapped = false;
    const axisL = box(EX1 - EX0, 0.02, 0.02, M.ghost(0xffffff, 0.4)); axisL.position.set((EX0 + EX1) / 2, EY, 0); SP.add(axisL);
    const lE = stage.label('electric field', [EX0 + 0.8, EY + 1.2, 0], SP), lB = stage.label('magnetic field', [EX0 + 0.8, EY - 0.25, 1.15], SP);
    const lBand = stage.label('', [-0.4, EY + 1.45, 0], SP, 'hot');
    // a TV pixel: three sub-pixels that light when the wavelength is near their colour
    const pix = new THREE.Group(); pix.position.set(5.6, EY, 0); SP.add(pix);
    const subs = [[630, -0.42], [530, 0], [460, 0.42]].map(([nm, x]) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(nmColor(nm)), toneMapped: false }); const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.2, 0.08), m); b.position.x = x; pix.add(b); return { nm, m }; });
    const pixBack = box(1.4, 1.5, 0.05, M.matte(0x15171c)); pixBack.position.z = -0.06; pix.add(pixBack);
    const lPix = stage.label('one TV pixel', [5.6, EY + 1.1, 0], SP);

    // ================================================================ board
    let S = {}, focus = '';
    const bd = board(root, 5.4, 3.4, 640, 400, (g, w, h) => {
      panelBg(g, w, h);
      if (!S.focus) return;
      if (focus === 'door') {
        const r = door(S);
        title(g, 'Hole size vs wavelength', 'log scale');
        const X = (mm) => 30 + (Math.log10(mm / 0.0001) / Math.log10(1e6)) * (w - 60);
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(30, 90, w - 60, 30);
        [[0.0005, 'light 0.5 µm'], [LAM_OVEN * 1000 / 2, 'λ/2 = 61 mm'], [LAM_OVEN * 1000, 'microwave 122 mm']].forEach(([mm, l], i) => { g.fillStyle = i ? '#ff5a5a' : '#ffe28a'; g.fillRect(X(mm) - 1, 80, 3, 50); text(g, l, clamp(X(mm) - 50, 20, w - 170), 150 + i * 22, i ? '#ff9a9a' : '#ffe28a', '16px sans-serif'); });
        dot(g, X(S.hole), 105, COL.lam, 11);
        text(g, `hole ${S.hole < 10 ? S.hole.toFixed(1) + ' mm' : (S.hole / 10).toFixed(1) + ' cm'}`, clamp(X(S.hole) - 40, 20, w - 140), 76, COL.lam, 'bold 17px sans-serif');
        text(g, r.cut ? 'Wider than λ/2: microwaves pour through!' : `Holes ${fmt0(r.ratio)}× smaller than the microwaves`, 20, 250, r.cut ? '#ff5a5a' : COL.lam, 'bold 21px sans-serif');
        text(g, r.cut ? 'No oven door could use holes this big.' : `Mesh blocks about ${r.se.toFixed(0)} dB: about 1 part in ${Number((1 / r.pass).toPrecision(2)).toLocaleString('en-US')} gets out`, 20, 286, 'rgba(255,255,255,.8)', '18px sans-serif');
        text(g, 'Light passes either way: its waves are tiny.', 20, 322, '#ffe28a', '18px sans-serif');
      } else if (focus === 'spectrum') {
        title(g, 'The electromagnetic spectrum', 'c = f × λ');
        const X = (l) => 30 + (Math.log10(LMAX / l) / Math.log10(LMAX / LMIN)) * (w - 60);
        const y0 = 70, hh = 60;
        [['radio', 1, LMAX], ['microwave', 1e-3, 1], ['IR', 750e-9, 1e-3], ['UV', 10e-9, 380e-9], ['X-ray', LMIN, 10e-9]].forEach(([n, a, b], i) => { g.fillStyle = `hsla(${220 - i * 30},40%,40%,.55)`; g.fillRect(X(b), y0, X(a) - X(b), hh); text(g, n, X(b) + 4, y0 + hh + 20, 'rgba(255,255,255,.7)', '15px sans-serif'); });
        const gr = g.createLinearGradient(X(750e-9), 0, X(380e-9), 0); [750, 650, 580, 530, 480, 420, 380].forEach((nm) => gr.addColorStop((750 - nm) / 370, nmColor(nm)));
        g.fillStyle = gr; g.fillRect(X(750e-9), y0, Math.max(3, X(380e-9) - X(750e-9)), hh);
        PRESETS.forEach((p, i) => { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(X(p.lam) - 1, y0 + hh, 2, 14 + (i % 3) * 30); });
        g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(S.lam), y0 - 8); g.lineTo(X(S.lam), y0 + hh + 8); g.stroke();
        const f = C / S.lam, E = (H * f) / EV, pre = PRESETS.find((p) => Math.abs(Math.log10(p.lam / S.lam)) < 0.02);
        text(g, `λ = ${fmtL(S.lam)}   f = ${fmtHz(f)}`, 20, 250, COL.lam, 'bold 22px sans-serif');
        text(g, `${band(S.lam)}${pre ? ': ' + pre.name + (pre.box ? ` (${pre.box})` : '') : ''}`, 20, 288, COL.text, '19px sans-serif');
        text(g, `photon energy ${E < 0.01 ? E.toExponential(1) : E < 1000 ? E.toPrecision(3) : fmt0(E)} eV`, 20, 324, 'rgba(255,255,255,.7)', '18px sans-serif');
        text(g, 'Shorter wave, higher frequency, more energy per photon.', 20, 360, 'rgba(255,255,255,.55)', '16px sans-serif');
      } else {
        title(g, 'Measure the speed of light', 'with chocolate');
        text(g, 'f = 2.45 GHz, printed on the oven', 20, 90, COL.f, 'bold 20px sans-serif');
        text(g, 'melted spots d = 6.1 cm apart', 20, 128, COL.lam, 'bold 20px sans-serif');
        text(g, 'd is half a wavelength, so λ = 2d = 12.2 cm', 20, 172, COL.text, '19px sans-serif');
        text(g, 'c = f × λ = 2.45 × 10⁹ × 0.122', 20, 214, COL.text, '19px sans-serif');
        text(g, '  = 3.0 × 10⁸ m/s', 20, 250, COL.v, 'bold 26px sans-serif');
        text(g, S.turn ? 'Turntable on: every bit passes through hot spots.' : 'Turntable off: the pattern cooks in place.', 20, 318, 'rgba(255,255,255,.75)', '18px sans-serif');
      }
    }, [0, 0, 0]);
    const BPOS = { oven: [4.9, 6.3, -3.2, -0.3], door: [5.2, 7.2, -2.0, -0.3], spectrum: [3.4, 5.6, -1.5, 0] };

    let ph = 0, key = '', rot = 0, chocT = 0;
    return {
      resetChoc,
      update(dt, s) {
        dt = Math.max(0, dt); S = s;
        fitNarrow(stage, [lGuide, lSheet, lIn, lOut, lE, lB, lPix]);
        if (s.focus !== focus) {
          focus = s.focus; focusView(stage, VIEWS, focus); key = '';
          const p = BPOS[focus] || BPOS.oven; bd.mesh.position.set(p[0], p[1], p[2]); bd.mesh.rotation.y = p[3]; bd.home = null;
        }
        reelPlace([[bd, focus === 'oven' ? [0.4, 8.9, -1] : [0.3, 7.6, -1], 1.2]]);
        if (!inReel()) bd.mesh.scale.setScalar(focus === 'oven' ? 0.8 : 1);
        O.visible = focus === 'oven'; D.visible = focus === 'door'; SP.visible = focus === 'spectrum';
        ph += dt * TAU * 0.8;
        if (focus === 'oven') {
          if (s.turn) rot += dt * TAU / 10;              // turntables turn about once every 10 s
          plate.rotation.y = rot;
          sheet.material.opacity = 0.55 + 0.45 * Math.abs(Math.cos(ph));
          // melt: accumulate heat at each chocolate texel from where it is now in the oven
          const cs = Math.cos(rot), sn = Math.sin(rot), rate = dt * 0.35;
          for (let j = 0; j < CB; j += 1) for (let i = 0; i < CB; i += 1) {
            const lx = -SL / 2 + ((i + 0.5) / CB) * SL, lz = -SL / 2 + ((j + 0.5) / CB) * SL;
            const x = lx * cs + lz * sn, z = -lx * sn + lz * cs;
            melt[j * CB + i] += rate * heat(x, z);
          }
          chocT += dt; if (chocT > 0.12) { chocT = 0; drawChoc(); }
          lChoc.position.set(0, OY + 1.0, CD / 2 - 0.2);
          lChoc.element.innerHTML = s.turn ? 'turntable on: melting evenly' : 'turntable off: <b>melted spots</b>';
          ruler.visible = !s.turn; ruler.position.set(0.125 + d / 2, OY + 0.62, 0.625);   // between two hot-spot peaks
        } else if (focus === 'door') {
          const r = door(s);
          const mk = s.hole.toFixed(2); if (mk !== meshKey) { meshKey = mk; buildMesh(s.hole); }
          const k = TAU / 6.12, amp = 0.32, tr = Math.sqrt(r.pass);
          waves.forEach((wv) => {
            wv.inc.set((u) => { const x = -6 + u * 6; return [x, wv.y + amp * Math.sin(k * x - ph), -0.6]; });
            wv.ref.set((u) => { const x = -6 + u * 6; return [x, wv.y + amp * (1 - tr) * Math.sin(-k * x - ph), -0.9]; });
            wv.out.set((u) => { const x = u * 6; return [x, wv.y + amp * tr * Math.sin(k * x - ph), -0.6]; });
            wv.out.material.opacity = clamp(0.15 + tr, 0, 1);
          });
        } else {
          const l = clamp(s.lam, LMIN, LMAX), t = Math.log10(l / LMIN) / Math.log10(LMAX / LMIN);   // 0 (X-ray) … 1 (radio)
          const lamU = 0.18 + 5.5 * Math.pow(t, 1.3);    // drawn wavelength in scene units (log mapping)
          const nm = l * 1e9, vis = nm >= 380 && nm <= 750;
          const col = vis ? new THREE.Color(nmColor(nm)) : new THREE.Color(t > 0.55 ? 0xff8a8a : t > 0.45 ? 0xffb0d0 : 0xc9a8ff);
          eLine.material.color.copy(col);
          const kk = TAU / lamU;
          eLine.set((u) => { const x = EX0 + u * (EX1 - EX0); return [x, EY + 0.9 * Math.sin(kk * x - ph * 1.2), 0]; });
          bLine.set((u) => { const x = EX0 + u * (EX1 - EX0); return [x, EY, 0.9 * Math.sin(kk * x - ph * 1.2)]; });
          lBand.element.innerHTML = `<b>${band(l)}</b> · λ = ${fmtL(l)}`;
          lBand.element.style.setProperty('--c', vis ? nmColor(nm) : '#c9a8ff');
          subs.forEach((sp) => { const on = vis ? Math.exp(-(((nm - sp.nm) / 35) ** 2)) : 0; sp.m.color.set(nmColor(sp.nm)).multiplyScalar(0.12 + 0.88 * on); });
        }
        const kk = `${focus}|${s.turn}|${s.hole.toFixed(2)}|${s.lam.toExponential(3)}`;
        if (kk !== key) { key = kk; bd.redraw(); }
      },
      readout(s) {
        if (s.focus === 'door') {
          const r = door(s);
          return `<div class="big">Hole ${s.hole < 10 ? s.hole.toFixed(1) + ' mm' : (s.hole / 10).toFixed(1) + ' cm'} vs λ = 12.2 cm</div>
            <div class="row"><span>Microwave wavelength, c ÷ 2.45 GHz</span><b style="color:#ff7a7a">${fmtL(LAM_OVEN)}</b></div>
            <div class="row"><span>Passes freely once holes exceed λ/2</span><b>${fmtL(LAM_OVEN / 2)}</b></div>
            <div class="row"><span>Shielding of the mesh (rule of thumb)</span><b class="${r.cut ? 'no' : 'ok'}">${r.cut ? 'none' : r.se.toFixed(0) + ' dB'}</b></div>
            <div class="row"><span>Light’s wavelength vs the hole</span><b style="color:#ffe28a">${fmt0(s.hole / 0.0005)}× smaller</b></div>
            <small>Real doors also have a choke seal round the edge. This shows the mesh alone.</small>`;
        }
        if (s.focus === 'spectrum') {
          const f = C / s.lam, E = (H * f) / EV;
          return `<div class="big">f = c ÷ λ = ${fmtHz(f)}</div>
            <div class="row"><span>Wavelength, λ</span><b style="color:${COL.lam}">${fmtL(s.lam)}</b></div>
            <div class="row"><span>Speed, c (always)</span><b style="color:${COL.v}">299,792 km/s</b></div>
            <div class="row"><span>Kind of wave</span><b>${band(s.lam)}</b></div>
            <div class="row"><span>Energy of one photon, E = h f</span><b>${E < 0.01 ? E.toExponential(2) : E.toPrecision(3)} eV</b></div>
            <small>The 3D wave is drawn on a log scale so every band fits.</small>`;
        }
        return `<div class="big">λ = c ÷ f = 12.2 cm</div>
          <div class="row"><span>Oven frequency, f</span><b style="color:${COL.f}">2.45 GHz</b></div>
          <div class="row"><span>Speed of light, c</span><b style="color:${COL.v}">299,792 km/s</b></div>
          <div class="row"><span>Hot spots apart, λ ÷ 2</span><b style="color:${COL.lam}">${fmtL(LAM_OVEN / 2)}</b></div>
          <div class="row"><span>Wave crests passing a point each second</span><b>2,450,000,000</b></div>
          <div class="row"><span>Turntable</span><b>${s.turn ? 'on, evens out the spots' : 'off, spots cook in place'}</b></div>`;
      },
    };
  },
};

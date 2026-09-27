// Shared parts for WaveClear: wave constants and maths, number formats, chart boards, bead strings,
// a driven-oscillator model, a colour for any wavelength of light, a small tone player, and the layout
// helpers every chapter uses. +x right, +y up. Each chapter says what one scene unit is.
import { THREE, M, canvasTexture, clamp } from './kit.js';
import { audio } from './ui.js';

// ---------------------------------------------------------------- constants
export const TAU = Math.PI * 2;
export const G = 9.81;                 // m/s²
export const C = 299792458;            // m/s, speed of light in a vacuum (exact, SI definition)
// Speed of sound in dry air: v ≈ 331.3 × √(1 + T/273.15) m/s, so 343 m/s at 20 °C.
export const soundSpeed = (T = 20) => 331.3 * Math.sqrt(1 + T / 273.15);
export const V_AIR = 343;
// Speed of sound in other media (typical handbook values, Kaye & Laby / Engineering Toolbox):
// water about 1,480 m/s, steel about 5,960 m/s (longitudinal, bulk), wood (along the grain) about 3,800 m/s.
export const V_MEDIA = { air: 343, water: 1480, steel: 5960 };
// Wave on a stretched string or rope: v = √(T ÷ μ) (tension over mass per metre).
export const stringSpeed = (T, mu) => Math.sqrt(T / mu);

// Equal temperament from A4 = 440 Hz: note n semitones away has f = 440 × 2^(n/12).
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export function noteOf(f) {
  if (!(f > 0)) return '';
  const n = Math.round(12 * Math.log2(f / 440)) + 57;   // semitones above C0
  const oct = Math.floor(n / 12), name = NAMES[((n % 12) + 12) % 12];
  const exact = 440 * Math.pow(2, (n - 57) / 12), cents = Math.round(1200 * Math.log2(f / exact));
  return { name: name + oct, cents, key: n - 8, exact };   // piano key number: A0 = 1 … C8 = 88
}

// ---------------------------------------------------------------- number formats
export const fmt0 = (v) => Math.round(v).toLocaleString('en-IN');
export function fmtHz(f) {
  const a = Math.abs(f);
  if (a >= 1e18) return (f / 1e18).toPrecision(3) + ' EHz';
  if (a >= 1e15) return (f / 1e15).toPrecision(3) + ' PHz';
  if (a >= 1e12) return (f / 1e12).toPrecision(3) + ' THz';
  if (a >= 1e9) return (f / 1e9).toPrecision(3) + ' GHz';
  if (a >= 1e6) return (f / 1e6).toPrecision(3) + ' MHz';
  if (a >= 1e4) return (f / 1e3).toFixed(1) + ' kHz';
  if (a >= 100) return fmt0(f) + ' Hz';
  if (a >= 10) return f.toFixed(1) + ' Hz';
  return f.toFixed(2) + ' Hz';
}
// Length in metres → "0.40 nm", "530 nm", "12.2 cm", "3.4 m", "1.2 km".
export function fmtL(m) {
  const a = Math.abs(m);
  if (a < 1e-9) return (m * 1e12).toPrecision(3) + ' pm';
  if (a < 1e-6) return (m * 1e9).toPrecision(3) + ' nm';
  if (a < 1e-3) return (m * 1e6).toPrecision(3) + ' µm';
  if (a < 0.01) return (m * 1000).toFixed(1) + ' mm';
  if (a < 1) return (m * 100).toFixed(1) + ' cm';
  if (a < 1000) return m.toFixed(a < 10 ? 2 : 1) + ' m';
  return (m / 1000).toFixed(1) + ' km';
}
export const fmtV = (v) => (v >= 1e6 ? '300,000 km/s' : v >= 100 ? fmt0(v) + ' m/s' : v.toFixed(1) + ' m/s');

// ---------------------------------------------------------------- colours
export const COL = {
  wave: '#6fb6ff',     // the wave itself
  crest: '#ffb547',    // crest markers
  lam: '#5ce1a9',      // wavelength
  f: '#c49bff',        // frequency
  v: '#ff7a59',        // speed
  hot: '#ff5a5a',
  node: '#ffffff',
  air: '#dfe8f5',
  text: '#e8eef8',
};
export const hex = (c) => new THREE.Color(c).getHex();

// Approximate colour of light of wavelength nm (380–750), after Dan Bruton's widely used piecewise fit.
export function nmColor(nm) {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm <= 750) { r = 1; }
  let k = 1;
  if (nm < 420) k = 0.3 + (0.7 * (nm - 380)) / 40; else if (nm > 700) k = 0.3 + (0.7 * (750 - nm)) / 50;
  const c = (x) => Math.round(255 * Math.pow(clamp(x * k, 0, 1), 0.8));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}

// ---------------------------------------------------------------- driven, damped oscillator
// m x'' + c x' + k x = F₀ cos(ω t). With ω₀ = √(k/m), ζ = c ÷ (2 m ω₀) and r = ω ÷ ω₀, the steady
// amplitude is X = (F₀/k) ÷ √((1 − r²)² + (2ζr)²), peaking near r = 1 at about (F₀/k) ÷ (2ζ); Q = 1 ÷ (2ζ).
export const gain = (r, zeta) => 1 / Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2);
export const phaseLag = (r, zeta) => Math.atan2(2 * zeta * r, 1 - r * r);
// Integrate x'' = −ω₀² x − 2ζω₀ x' + a(t) with small semi-implicit Euler steps. st = { x, v }.
export function oscStep(st, dt, w0, zeta, acc) {
  const n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;
  for (let i = 0; i < n; i++) { const a = -w0 * w0 * st.x - 2 * zeta * w0 * st.v + acc(h * i); st.v += a * h; st.x += st.v * h; }
  return st;
}

// ---------------------------------------------------------------- sound
// A short sine tone (or two, for beats) through Web Audio. Honours the box's sound switch.
let ac = null;
export function tone(freqs, sec = 1.2, vol = 0.12) {
  if (audio.muted) return false;
  try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); } catch { return false; }
  if (ac.state === 'suspended') ac.resume();
  const t = ac.currentTime, g = ac.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.03); g.gain.setValueAtTime(vol, t + sec - 0.15); g.gain.linearRampToValueAtTime(0, t + sec);
  g.connect(ac.destination);
  [].concat(freqs).forEach((f) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = clamp(f, 20, 20000); o.connect(g); o.start(t); o.stop(t + sec + 0.05); });
  return true;
}

// ---------------------------------------------------------------- boards (live charts in 3D)
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const tex = canvasTexture(pxW, pxH, draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return Object.assign(tex, { mesh: m });
}
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', xLog = false, yLog = false }) {
  const X = xLog ? (x) => x0 + (Math.log(x / xMin) / Math.log(xMax / xMin)) * (x1 - x0) : (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = yLog ? (y) => y0 - (Math.log(y / yMin) / Math.log(yMax / yMin)) * (y0 - y1) : (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function title(g, text, sub = '') {
  g.fillStyle = COL.text; g.font = 'bold 24px sans-serif'; g.fillText(text, 20, 34);
  if (sub) { const x = 34 + g.measureText(text).width; g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 34); }
}
export function line(g, pts, X, Y, col, wdt = 4, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.lineJoin = 'round'; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
// Plot y = fn(x) from a to b in n steps.
export function curve(g, fn, a, b, X, Y, col, wdt = 4, dash = null, n = 240) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; pts.push([x, fn(x)]); }
  line(g, pts, X, Y, col, wdt, dash);
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function text(g, s, x, y, col = COL.text, font = '18px sans-serif') { g.fillStyle = col; g.font = font; g.fillText(s, x, y); }

// ---------------------------------------------------------------- 3D pieces
// n glowing (or lit) spheres placed each frame with place(i, x, y, z, s).
export function dots(n, r, color = 0xffffff, lit = false, seg = 10) {
  const mat = lit ? M.plastic(color, { roughness: 0.35 }) : new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 3)), mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false; mesh.castShadow = lit;
  const o = new THREE.Object3D();
  mesh.place = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.rotation.set(0, 0, 0); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.color = (i, c) => { mesh.setColorAt(i, c); };
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; };
  return mesh;
}
// A flexible line through points, drawn as a thick screen-space line. set(points as flat [x,y,z,…]).
export function ropeLine(stage, n, color, width = 6) {
  const pos = new Float32Array(n * 3);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({ color, toneMapped: false });
  const ln = new THREE.Line(geo, mat); ln.frustumCulled = false;
  ln.set = (fn) => { for (let i = 0; i < n; i++) { const p = fn(i / (n - 1), i); pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2]; } geo.attributes.position.needsUpdate = true; };
  return ln;
}
// A tube of fixed segment count whose centre line is rewritten every frame (a rope, a string, a deck edge).
// set(fn) with fn(u) → [x, y, z] for u from 0 to 1.
export function flexTube(n, r, mat, radial = 8) {
  const geo = new THREE.CylinderGeometry(r, r, 1, radial, n - 1, true);
  const base = geo.attributes.position.array.slice();
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.castShadow = true;
  const P = Array.from({ length: n }, () => new THREE.Vector3());
  const T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 0, 1);
  mesh.set = (fn) => {
    for (let i = 0; i < n; i++) P[i].set(...fn(i / (n - 1)));
    const pos = geo.attributes.position.array;
    for (let v = 0; v < pos.length / 3; v++) {
      const by = base[v * 3 + 1], bx = base[v * 3], bz = base[v * 3 + 2];
      const i = clamp(Math.round((0.5 - by) * (n - 1)), 0, n - 1);   // CylinderGeometry rows go top (+0.5) to bottom
      const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
      T.subVectors(b, a).normalize();
      N.crossVectors(up, T); if (N.lengthSq() < 1e-6) N.set(0, 1, 0); N.normalize();
      B.crossVectors(T, N);
      const rr = Math.hypot(bx, bz) > 0 ? 1 : 0, ang = Math.atan2(bz, bx);
      const c = Math.cos(ang) * r * rr, s = Math.sin(ang) * r * rr;
      pos[v * 3] = P[i].x + N.x * c + B.x * s; pos[v * 3 + 1] = P[i].y + N.y * c + B.y * s; pos[v * 3 + 2] = P[i].z + N.z * c + B.z * s;
    }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
  };
  return mesh;
}

// ---------------------------------------------------------------- layout
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.12 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Boards sit beside the model on a wide screen. In the tall reel video they move to `pos` instead.
export function reelPlace(boards) {
  const r = inReel();
  boards.forEach(([b, pos, scale = 1.25]) => {
    if (!b.home) b.home = { p: b.mesh.position.clone(), r: b.mesh.rotation.y };
    if (r) { b.mesh.position.set(...pos); b.mesh.scale.setScalar(scale); b.mesh.rotation.y = 0; }
    else { b.mesh.position.copy(b.home.p); b.mesh.scale.setScalar(1); b.mesh.rotation.y = b.home.r; }
  });
}
// Switch the camera when a chapter's "focus" changes (not during the reel, which sets its own views).
export function focusView(stage, views, focus) {
  if (inReel()) return;
  const v = views[focus]; if (v) stage.setView(v.pos, v.target, 1.0);
}
export { clamp };

/**
 * Генератор SVG-постеров для видео-сетки хиро и карточек.
 *
 * Это ВРЕМЕННЫЕ плейсхолдеры в стилистике CGI/VFX: тёмные кадры с
 * wireframe-графикой. Владелец заменяет их реальными постерами
 * (кадрами из работ) с теми же именами файлов — раскладка не меняется.
 *
 * Запуск: npm run posters
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "media", "posters");
mkdirSync(OUT, { recursive: true });

const W = 800;
const H = 1000;

/** Детерминированный PRNG — постеры не «прыгают» между генерациями. */
function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STROKE = "#E8E8E8";
const EMBER = "#FF5A1F";
const WOOD = "#D9C7A6";

function frame(inner, { index, tag, from = "#191A1E", to = "#0C0D10" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.42" r="0.9">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.5"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${inner}
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="3" rx="2"/>
  <text x="36" y="${H - 40}" font-family="'JetBrains Mono', monospace" font-size="24" letter-spacing="4" fill="#8F8F93">AMG_${index} / ${tag}</text>
  <circle cx="${W - 52}" cy="${H - 48}" r="7" fill="${EMBER}"/>
</svg>`;
}

/* ── Мотивы ─────────────────────────────────────────────────────── */

function wireSphere() {
  const cx = 400;
  const cy = 430;
  const r = 265;
  let out = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${STROKE}" stroke-opacity="0.6" stroke-width="2"/>`;
  for (const k of [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75]) {
    const ry = Math.sqrt(1 - k * k) * r;
    out += `<ellipse cx="${cx}" cy="${(cy + r * k).toFixed(1)}" rx="${ry.toFixed(1)}" ry="${(ry * 0.16).toFixed(1)}" fill="none" stroke="${STROKE}" stroke-opacity="0.35" stroke-width="1.5"/>`;
  }
  for (const t of [0.25, 0.55, 0.85]) {
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${(r * t).toFixed(1)}" ry="${r}" fill="none" stroke="${STROKE}" stroke-opacity="0.35" stroke-width="1.5"/>`;
  }
  out += `<circle cx="${cx + r * 0.72}" cy="${cy - r * 0.4}" r="8" fill="${EMBER}"/>`;
  return out;
}

function particles(seed) {
  const rand = rng(seed);
  let out = "";
  for (let i = 0; i < 150; i++) {
    const x = (60 + rand() * (W - 120)).toFixed(1);
    const y = (60 + rand() * (H - 200)).toFixed(1);
    const r = (0.8 + rand() * 2.8).toFixed(1);
    const o = (0.15 + rand() * 0.75).toFixed(2);
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${STROKE}" fill-opacity="${o}"/>`;
  }
  for (let i = 0; i < 4; i++) {
    const x = (120 + rand() * 560).toFixed(1);
    const y = (120 + rand() * 640).toFixed(1);
    const len = (40 + rand() * 120).toFixed(1);
    out += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - len}" stroke="${EMBER}" stroke-opacity="0.8" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  return out;
}

function fluid() {
  let out = "";
  const blobs = [
    "M170 620 C 120 460, 260 330, 420 360 C 600 395, 680 520, 610 650 C 540 780, 250 790, 170 620 Z",
    "M230 600 C 200 480, 300 390, 430 420 C 570 452, 620 540, 565 630 C 505 730, 280 720, 230 600 Z",
    "M300 580 C 285 500, 355 450, 445 470 C 540 492, 565 555, 520 615 C 470 680, 320 660, 300 580 Z",
  ];
  const ops = [0.65, 0.45, 0.3];
  blobs.forEach((d, i) => {
    out += `<path d="${d}" fill="none" stroke="${STROKE}" stroke-opacity="${ops[i]}" stroke-width="2.5"/>`;
  });
  out += `<circle cx="430" cy="540" r="6" fill="${EMBER}"/>`;
  out += `<path d="M540 300 C 580 260, 640 260, 668 300" fill="none" stroke="${WOOD}" stroke-opacity="0.5" stroke-width="2"/>`;
  return out;
}

function topo(seed) {
  const rand = rng(seed);
  let out = "";
  const cx = 400;
  const cy = 460;
  for (let ring = 1; ring <= 8; ring++) {
    const base = ring * 42;
    const pts = [];
    for (let a = 0; a <= 26; a++) {
      const ang = (a / 26) * Math.PI * 2;
      const wobble = Math.sin(ang * 3 + ring * 1.4) * 16 + rand() * 6;
      const r = base + wobble;
      pts.push(
        `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r * 0.86).toFixed(1)}`,
      );
    }
    out += `<polygon points="${pts.join(" ")}" fill="none" stroke="${STROKE}" stroke-opacity="${(0.55 - ring * 0.05).toFixed(2)}" stroke-width="1.6"/>`;
  }
  out += `<circle cx="${cx}" cy="${cy}" r="5" fill="${EMBER}"/>`;
  return out;
}

function gridHorizon() {
  const hy = 560;
  let out = `<line x1="0" y1="${hy}" x2="${W}" y2="${hy}" stroke="${STROKE}" stroke-opacity="0.7" stroke-width="2"/>`;
  for (let i = -8; i <= 8; i++) {
    out += `<line x1="400" y1="${hy}" x2="${400 + i * 160}" y2="${H}" stroke="${STROKE}" stroke-opacity="0.3" stroke-width="1.5"/>`;
  }
  let gap = 14;
  let y = hy + gap;
  while (y < H) {
    out += `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="${STROKE}" stroke-opacity="0.25" stroke-width="1.2"/>`;
    gap *= 1.45;
    y += gap;
  }
  out += `<circle cx="400" cy="${hy - 130}" r="72" fill="none" stroke="${EMBER}" stroke-opacity="0.9" stroke-width="2.5"/>`;
  out += `<circle cx="400" cy="${hy - 130}" r="34" fill="${EMBER}" fill-opacity="0.22"/>`;
  return out;
}

function glitch(seed) {
  const rand = rng(seed);
  let out = "";
  for (let i = 0; i < 26; i++) {
    const y = (40 + rand() * (H - 160)).toFixed(1);
    const h = (5 + rand() * 26).toFixed(1);
    const x = (rand() * 300).toFixed(1);
    const w = (140 + rand() * 500).toFixed(1);
    const ember = rand() > 0.85;
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ember ? EMBER : STROKE}" fill-opacity="${ember ? 0.5 : (0.05 + rand() * 0.14).toFixed(2)}"/>`;
  }
  out += `<rect x="120" y="430" width="560" height="4" fill="${STROKE}" fill-opacity="0.7"/>`;
  return out;
}

function torus() {
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += `<ellipse cx="400" cy="440" rx="280" ry="104" fill="none" stroke="${STROKE}" stroke-opacity="0.3" stroke-width="1.5" transform="rotate(${i * 15} 400 440)"/>`;
  }
  out += `<circle cx="400" cy="440" r="6" fill="${EMBER}"/>`;
  return out;
}

function bokeh(seed) {
  const rand = rng(seed);
  let out = "";
  for (let i = 0; i < 16; i++) {
    const x = (80 + rand() * (W - 160)).toFixed(1);
    const y = (100 + rand() * (H - 300)).toFixed(1);
    const r = (18 + rand() * 78).toFixed(1);
    const filled = rand() > 0.4;
    out += filled
      ? `<circle cx="${x}" cy="${y}" r="${r}" fill="${STROKE}" fill-opacity="${(0.04 + rand() * 0.09).toFixed(2)}"/>`
      : `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${STROKE}" stroke-opacity="${(0.15 + rand() * 0.25).toFixed(2)}" stroke-width="1.6"/>`;
  }
  out += `<circle cx="560" cy="330" r="46" fill="${EMBER}" fill-opacity="0.28"/>`;
  return out;
}

function spline() {
  let out = `<path d="M90 810 C 210 560, 300 780, 420 520 C 520 300, 620 420, 700 210" fill="none" stroke="${STROKE}" stroke-opacity="0.85" stroke-width="3"/>`;
  const anchors = [
    [90, 810],
    [420, 520],
    [700, 210],
  ];
  const handles = [
    [210, 560],
    [300, 780],
    [520, 300],
    [620, 420],
  ];
  for (const [x, y] of handles) {
    out += `<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="${STROKE}" stroke-opacity="0.5" stroke-width="1.6"/>`;
  }
  out += `<line x1="90" y1="810" x2="210" y2="560" stroke="${STROKE}" stroke-opacity="0.25" stroke-width="1.2" stroke-dasharray="5 6"/>`;
  out += `<line x1="420" y1="520" x2="300" y2="780" stroke="${STROKE}" stroke-opacity="0.25" stroke-width="1.2" stroke-dasharray="5 6"/>`;
  out += `<line x1="420" y1="520" x2="520" y2="300" stroke="${STROKE}" stroke-opacity="0.25" stroke-width="1.2" stroke-dasharray="5 6"/>`;
  out += `<line x1="700" y1="210" x2="620" y2="420" stroke="${STROKE}" stroke-opacity="0.25" stroke-width="1.2" stroke-dasharray="5 6"/>`;
  for (const [x, y] of anchors) {
    out += `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" fill="#0C0D10" stroke="${STROKE}" stroke-width="2"/>`;
  }
  out += `<circle cx="420" cy="520" r="10" fill="none" stroke="${EMBER}" stroke-width="2.5"/>`;
  return out;
}

function voxel() {
  let out = "";
  const s = 74;
  const dx = s * 0.87;
  const dy = s * 0.5;
  const cube = (x, y) => {
    const top = `${x},${y - s} ${x + dx},${y - s + dy} ${x},${y - s + 2 * dy} ${x - dx},${y - s + dy}`;
    return (
      `<polygon points="${top}" fill="${STROKE}" fill-opacity="0.07" stroke="${STROKE}" stroke-opacity="0.55" stroke-width="1.6"/>` +
      `<line x1="${x - dx}" y1="${y - s + dy}" x2="${x - dx}" y2="${y + dy - s / 2}" stroke="${STROKE}" stroke-opacity="0.45" stroke-width="1.6"/>` +
      `<line x1="${x + dx}" y1="${y - s + dy}" x2="${x + dx}" y2="${y + dy - s / 2}" stroke="${STROKE}" stroke-opacity="0.45" stroke-width="1.6"/>` +
      `<line x1="${x}" y1="${y - s + 2 * dy}" x2="${x}" y2="${y + s / 2}" stroke="${STROKE}" stroke-opacity="0.45" stroke-width="1.6"/>`
    );
  };
  const positions = [
    [400, 330],
    [400 - dx, 330 + dy + s / 2],
    [400 + dx, 330 + dy + s / 2],
    [400, 330 + 2 * dy + s],
    [400 - 2 * dx, 330 + 2 * dy + s],
    [400 + 2 * dx, 330 + 2 * dy + s],
  ];
  for (const [x, y] of positions) out += cube(x, y);
  out += `<circle cx="${400 + 2 * dx}" cy="${330 + dy}" r="7" fill="${EMBER}"/>`;
  return out;
}

function waves() {
  let out = "";
  for (let row = 0; row < 11; row++) {
    const baseY = 220 + row * 58;
    const pts = [];
    for (let x = 60; x <= W - 60; x += 12) {
      const t = (x - 60) / (W - 120);
      const envelope = Math.exp(-Math.pow((t - 0.5) * 3.1, 2));
      const y =
        baseY -
        Math.abs(Math.sin(t * Math.PI * 5 + row * 1.15)) * 92 * envelope;
      pts.push(`${x},${y.toFixed(1)}`);
    }
    out += `<polyline points="${pts.join(" ")}" fill="none" stroke="${STROKE}" stroke-opacity="${(0.7 - row * 0.045).toFixed(2)}" stroke-width="1.8"/>`;
  }
  out += `<circle cx="400" cy="180" r="5" fill="${EMBER}"/>`;
  return out;
}

function hud() {
  let out = "";
  out += `<line x1="120" y1="470" x2="330" y2="470" stroke="${STROKE}" stroke-opacity="0.6" stroke-width="1.6"/>`;
  out += `<line x1="470" y1="470" x2="680" y2="470" stroke="${STROKE}" stroke-opacity="0.6" stroke-width="1.6"/>`;
  out += `<line x1="400" y1="260" x2="400" y2="400" stroke="${STROKE}" stroke-opacity="0.6" stroke-width="1.6"/>`;
  out += `<line x1="400" y1="540" x2="400" y2="680" stroke="${STROKE}" stroke-opacity="0.6" stroke-width="1.6"/>`;
  out += `<circle cx="400" cy="470" r="64" fill="none" stroke="${STROKE}" stroke-opacity="0.75" stroke-width="2"/>`;
  out += `<circle cx="400" cy="470" r="4" fill="${EMBER}"/>`;
  const b = 44;
  const corners = [
    [70, 90, 1, 1],
    [W - 70, 90, -1, 1],
    [70, H - 150, 1, -1],
    [W - 70, H - 150, -1, -1],
  ];
  for (const [x, y, sx, sy] of corners) {
    out += `<path d="M ${x} ${y + b * sy} L ${x} ${y} L ${x + b * sx} ${y}" fill="none" stroke="${STROKE}" stroke-opacity="0.8" stroke-width="3"/>`;
  }
  out += `<circle cx="118" cy="150" r="9" fill="${EMBER}"/>`;
  out += `<rect x="140" y="139" width="66" height="22" fill="none" stroke="${STROKE}" stroke-opacity="0.5" stroke-width="1.4"/>`;
  out += `<line x1="0" y1="${H / 3}" x2="${W}" y2="${H / 3}" stroke="${STROKE}" stroke-opacity="0.12" stroke-width="1"/>`;
  out += `<line x1="0" y1="${(2 * H) / 3}" x2="${W}" y2="${(2 * H) / 3}" stroke="${STROKE}" stroke-opacity="0.12" stroke-width="1"/>`;
  out += `<line x1="${W / 3}" y1="0" x2="${W / 3}" y2="${H}" stroke="${STROKE}" stroke-opacity="0.12" stroke-width="1"/>`;
  out += `<line x1="${(2 * W) / 3}" y1="0" x2="${(2 * W) / 3}" y2="${H}" stroke="${STROKE}" stroke-opacity="0.12" stroke-width="1"/>`;
  return out;
}

/* ── Сборка ─────────────────────────────────────────────────────── */

const POSTERS = [
  { tag: "WIRE", inner: wireSphere() },
  { tag: "PART", inner: particles(7) },
  { tag: "FLUID", inner: fluid() },
  { tag: "TOPO", inner: topo(13) },
  { tag: "GRID", inner: gridHorizon() },
  { tag: "GLITCH", inner: glitch(21) },
  { tag: "TORUS", inner: torus() },
  { tag: "BOKEH", inner: bokeh(29) },
  { tag: "SPLINE", inner: spline() },
  { tag: "VOXEL", inner: voxel() },
  { tag: "WAVE", inner: waves() },
  { tag: "HUD", inner: hud() },
];

POSTERS.forEach((poster, i) => {
  const index = String(i + 1).padStart(2, "0");
  const svg = frame(poster.inner, { index, tag: poster.tag });
  writeFileSync(join(OUT, `p${index}.svg`), svg, "utf8");
});

/* Аватар преподавателя (плейсхолдер до реального фото). */
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="abg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1B1C20"/>
      <stop offset="1" stop-color="#0C0D10"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#abg)"/>
  <circle cx="400" cy="330" r="150" fill="#26282C"/>
  <path d="M170 800 C 170 620, 280 540, 400 540 C 520 540, 630 620, 630 800 Z" fill="#26282C"/>
  <ellipse cx="400" cy="330" rx="150" ry="150" fill="none" stroke="#E8E8E8" stroke-opacity="0.28" stroke-width="2"/>
  <ellipse cx="400" cy="330" rx="66" ry="150" fill="none" stroke="#E8E8E8" stroke-opacity="0.2" stroke-width="1.5"/>
  <ellipse cx="400" cy="330" rx="118" ry="150" fill="none" stroke="#E8E8E8" stroke-opacity="0.14" stroke-width="1.5"/>
  <line x1="250" y1="330" x2="550" y2="330" stroke="#E8E8E8" stroke-opacity="0.2" stroke-width="1.5"/>
  <circle cx="475" cy="290" r="8" fill="#FF5A1F"/>
  <text x="60" y="746" font-family="'JetBrains Mono', monospace" font-size="26" letter-spacing="5" fill="#8F8F93">AMIGO_KIZ</text>
</svg>`;
writeFileSync(join(OUT, "avatar-amir.svg"), avatar, "utf8");

console.log(`OK: ${POSTERS.length} постеров + аватар → ${OUT}`);

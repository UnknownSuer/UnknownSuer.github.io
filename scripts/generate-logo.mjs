/**
 * Генерация SVG-логотипа «AmigoKiz PRODUCTION» из шрифта в кривые.
 *
 * Логотип нарисован путями (paths), поэтому не зависит от шрифтов на
 * устройстве пользователя и одинаково выглядит везде.
 *
 * Перегенерация (нужны только для этого скрипта, в рантайм не попадают):
 *   npm i -D opentype.js @fontsource/oswald
 *   node scripts/generate-logo.mjs
 *
 * Если у владельца есть оригинальный файл логотипа — проще положить его
 * вместо результата: public/media/brand/amigokiz-logo.svg
 */
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "media", "brand", "amigokiz-logo.svg");

const FONT_DIR =
  process.env.OSWALD_DIR ??
  path.join(ROOT, "node_modules", "@fontsource", "oswald", "files");

function loadFont(weight) {
  const file = path.join(FONT_DIR, `oswald-latin-${weight}-normal.woff`);
  const buf = fs.readFileSync(file);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/** Путь строки + её реальные габариты. `squeeze` дожимает по горизонтали. */
function textPath(font, text, fontSize, { tracking = 0, squeeze = 1 } = {}) {
  const scale = fontSize / font.unitsPerEm;
  const commands = [];
  let x = 0;
  // charToGlyph вместо stringToGlyphs: минуя шейпинг (в Oswald есть
  // GSUB-фичи, которые opentype.js не разбирает), латиница берётся 1:1.
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));

  glyphs.forEach((glyph, i) => {
    const p = glyph.getPath(x, 0, fontSize);
    commands.push(...p.commands);
    x += glyph.advanceWidth * scale + tracking;
    if (i === glyphs.length - 1) x -= tracking;
  });

  const p = new opentype.Path();
  p.commands = commands;
  if (squeeze !== 1) {
    for (const c of p.commands) {
      for (const k of ["x", "x1", "x2"]) if (k in c) c[k] *= squeeze;
    }
  }
  const bb = p.getBoundingBox();
  return { d: p.toPathData(2), bb };
}

/** Сдвиг path-данных так, чтобы левый-верхний угол оказался в (tx, ty). */
function place(d, bb, tx, ty) {
  const dx = (tx - bb.x1).toFixed(2);
  const dy = (ty - bb.y1).toFixed(2);
  return { d, transform: `translate(${dx} ${dy})` };
}

const W = 1456;
const H = 711;

// ── Строка 1: «AmigoKiz» — сверхжирный узкий гротеск ──────────────
const bold = loadFont(700);
const line1 = textPath(bold, "AmigoKiz", 620, { tracking: -14, squeeze: 0.93 });

// ── Строка 2: «PRODUCTION» — контурные буквы вразрядку ────────────
const mid = loadFont(500);
const line2 = textPath(mid, "PRODUCTION", 250, { tracking: 22, squeeze: 0.95 });

// Обе строки центрируем по горизонтали, ширину строки 1 держим по макету.
const l1w = line1.bb.x2 - line1.bb.x1;
const l1h = line1.bb.y2 - line1.bb.y1;
const l1scale = (W - 40) / l1w;
const l1 = place(line1.d, line1.bb, 0, 0);

const l2w = line2.bb.x2 - line2.bb.x1;
const l2h = line2.bb.y2 - line2.bb.y1;
const l2scale = (W * 0.66) / l2w;
const l2 = place(line2.d, line2.bb, 0, 0);

const l1Top = 8;
const l1DrawH = l1h * l1scale;
const l2Top = l1Top + l1DrawH + 46;
const l2DrawH = l2h * l2scale;
const l2Left = (W - l2w * l2scale) / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Math.round(l2Top + l2DrawH + 10)}" role="img" aria-label="AmigoKiz Production" fill="none" style="color:#17181a">
  <title>AmigoKiz Production</title>
  <g transform="translate(20 ${l1Top}) scale(${l1scale.toFixed(4)})">
    <path transform="${l1.transform}" d="${l1.d}" fill="currentColor"/>
  </g>
  <g transform="translate(${l2Left.toFixed(2)} ${l2Top.toFixed(2)}) scale(${l2scale.toFixed(4)})">
    <path transform="${l2.transform}" d="${l2.d}" fill="none" stroke="currentColor" stroke-width="${(9 / l2scale).toFixed(2)}"/>
  </g>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg, "utf8");
console.log(`✓ ${path.relative(ROOT, OUT)} — ${(svg.length / 1024).toFixed(1)} КБ`);

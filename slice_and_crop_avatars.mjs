/**
 * slice_and_crop_avatars.mjs
 *
 * Slices a sprite sheet of avatars into individual square images.
 *
 * Layout: 6 columns × 5 rows = 30 avatars (B&W line art, white background)
 * Input:  /home/CHHENG/Downloads/avatar-no-frame.png  (1536×1024px)
 * Output: src/avatars/  — 30 files, each 200×200px square
 *
 * Algorithm:
 *   1. Project pixels onto X and Y axes to find content bands (non-white runs)
 *   2. Each content band = one row/column of avatars  →  exact cell boundaries
 *   3. Extract each cell, then content-aware square-crop:
 *        detect non-white bounding box → center avatar → extend canvas with
 *        white → extract square → resize to OUTPUT_SIZE
 *
 * Usage:
 *   node slice_and_crop_avatars.mjs [input_image] [output_dir]
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT_IMAGE = process.argv[2] ?? '/home/CHHENG/Downloads/avatar-no-frame.png';
const OUTPUT_DIR  = process.argv[3] ?? path.join(__dirname, 'src/avatars');
const COLS        = 6;
const ROWS        = 5;
const OUTPUT_SIZE = 200;   // final square px
const PADDING_PCT = 0.10;  // padding around detected content
const BG_THRESH   = 238;   // above this → near-white background

// ── Pixel helpers ────────────────────────────────────────────────────────────

const isBg = (r, g, b) => r > BG_THRESH && g > BG_THRESH && b > BG_THRESH;

/**
 * Find the tight bounding box of non-white content in a raw RGB/RGBA buffer.
 */
function contentBounds(buf, w, h, ch) {
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const a = ch === 4 ? buf[i + 3] : 255;
      if (a > 15 && !isBg(buf[i], buf[i + 1], buf[i + 2])) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return (x0 > x1 || y0 > y1)
    ? { x0: 0, y0: 0, x1: w - 1, y1: h - 1 }
    : { x0, y0, x1, y1 };
}

/**
 * Project pixels onto one axis and find contiguous runs of non-white content.
 * axis: 'x' → project onto Y (find row bands)
 *       'y' → project onto X (find column bands)  [unused here, kept for clarity]
 *
 * Returns array of { start, end } content ranges, sorted by position.
 */
function findContentBands(buf, W, H, CH, axis) {
  const size = axis === 'y' ? H : W;
  const count = new Int32Array(size);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * CH;
      const a = CH === 4 ? buf[i + 3] : 255;
      if (a > 15 && !isBg(buf[i], buf[i + 1], buf[i + 2])) {
        if (axis === 'y') count[y]++;
        else              count[x]++;
      }
    }
  }

  const bands = [];
  let inBand = false, start = 0;
  for (let i = 0; i <= size; i++) {
    const has = i < size && count[i] > 0;
    if (has && !inBand)  { inBand = true; start = i; }
    if (!has && inBand)  { bands.push({ start, end: i - 1 }); inBand = false; }
  }
  return bands;
}

// ── Square-crop pipeline ────────────────────────────────────────────────────

/**
 * Given a PNG buffer of a cell, return a square PNG buffer centered on content.
 */
async function squareCrop(cellBuf) {
  // Raw RGBA for analysis
  const { data, info } = await sharp(cellBuf)
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const { x0, y0, x1, y1 } = contentBounds(data, info.width, info.height, 4);

  const cx = Math.round((x0 + x1) / 2);
  const cy = Math.round((y0 + y1) / 2);
  const contentSize = Math.max(x1 - x0, y1 - y0);
  const pad = Math.round(contentSize * PADDING_PCT);
  const sq  = contentSize + pad * 2;

  const halfSq = Math.ceil(sq / 2);
  const extL = Math.max(0, halfSq - cx);
  const extR = Math.max(0, cx + halfSq - info.width + 1);
  const extT = Math.max(0, halfSq - cy);
  const extB = Math.max(0, cy + halfSq - info.height + 1);

  // Step 1: extend canvas → intermediate buffer
  const extended = await sharp(cellBuf)
    .extend({
      top: extT, bottom: extB, left: extL, right: extR,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toBuffer();

  // Step 2: extract square from extended image
  const newCX = cx + extL;
  const newCY = cy + extT;
  const cropL = newCX - Math.floor(sq / 2);
  const cropT = newCY - Math.floor(sq / 2);

  return sharp(extended)
    .extract({ left: cropL, top: cropT, width: sq, height: sq })
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, { kernel: sharp.kernel.lanczos3, fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎨 Sprite Sheet → Square Avatars');
  console.log('==================================\n');
  console.log(`📄 Input:   ${INPUT_IMAGE}`);
  console.log(`📁 Output:  ${OUTPUT_DIR}`);
  console.log(`🔢 Grid:    ${COLS} cols × ${ROWS} rows = ${COLS * ROWS} avatars`);
  console.log(`📐 Output:  ${OUTPUT_SIZE}×${OUTPUT_SIZE}px each\n`);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Load full sheet as raw RGB
  const { data, info } = await sharp(INPUT_IMAGE)
    .raw().toBuffer({ resolveWithObject: true });

  const { width: W, height: H, channels: CH } = info;
  console.log(`🖼  Sheet:   ${W}×${H}px  (${CH}ch)\n`);

  // Detect grid using pixel projection
  console.log('🔍 Detecting content bands...');
  const rowBands = findContentBands(data, W, H, CH, 'y');  // scan rows → Y bands
  const colBands = findContentBands(data, W, H, CH, 'x');  // scan cols → X bands

  if (rowBands.length !== ROWS) {
    console.warn(`⚠️  Expected ${ROWS} row bands, found ${rowBands.length}. Check image.`);
  }
  if (colBands.length !== COLS) {
    console.warn(`⚠️  Expected ${COLS} col bands, found ${colBands.length}. Check image.`);
  }

  console.log(`   Row bands (${rowBands.length}):`);
  rowBands.forEach((b, i) =>
    console.log(`     row ${i + 1}: y ${b.start}–${b.end}  (${b.end - b.start + 1}px tall)`)
  );
  console.log(`   Col bands (${colBands.length}):`);
  colBands.forEach((b, i) =>
    console.log(`     col ${i + 1}: x ${b.start}–${b.end}  (${b.end - b.start + 1}px wide)`)
  );
  console.log();

  let index = 1, success = 0, failed = 0;

  for (let row = 0; row < rowBands.length; row++) {
    for (let col = 0; col < colBands.length; col++) {
      const rb = rowBands[row];
      const cb = colBands[col];

      // Add a small margin so we don't cut edge pixels
      const margin = 4;
      const left   = Math.max(0, cb.start - margin);
      const top    = Math.max(0, rb.start - margin);
      const width  = Math.min(W - left, cb.end - left + 1 + margin);
      const height = Math.min(H - top,  rb.end - top  + 1 + margin);

      const filename = `avatar_${String(index).padStart(2, '0')}.png`;
      const outPath  = path.join(OUTPUT_DIR, filename);

      try {
        // Extract this cell from the sheet
        const cellBuf = await sharp(INPUT_IMAGE)
          .extract({ left, top, width, height })
          .png()
          .toBuffer();

        // Content-aware square crop
        const squareBuf = await squareCrop(cellBuf);
        await fs.writeFile(outPath, squareBuf);

        console.log(`✅ ${filename}  row ${row + 1}, col ${col + 1}  [${width}×${height}] → ${OUTPUT_SIZE}×${OUTPUT_SIZE}`);
        success++;
      } catch (err) {
        console.error(`❌ ${filename}: ${err.message}`);
        failed++;
      }

      index++;
    }
  }

  console.log('\n' + '='.repeat(52));
  console.log(`✅ Success: ${success}   ❌ Failed: ${failed}`);
  console.log(`📂 Saved to: ${OUTPUT_DIR}`);
}

main().catch(console.error);

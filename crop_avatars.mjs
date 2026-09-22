/**
 * crop_avatars.mjs  (v2 – centered square crop)
 *
 * Image: 1024 x 682 px
 * Grid : 5 rows × 6 cols = 30 avatars
 *
 * Strategy:
 *  1. Subtract the outer white margin (~10 px each side) to get the
 *     "content zone".
 *  2. Divide content zone into 6 × 5 equal cells.
 *  3. For each cell, compute its exact center.
 *  4. Crop a SQUARE whose side = cellH (the shorter dimension) centered
 *     on that cell center.
 *  5. Save as PNG to kapp-api/src/avatars/.
 */

import sharp from 'sharp';
import path  from 'path';
import fs    from 'fs';

const INPUT      = '/home/CHHENG/.gemini/antigravity-ide/brain/6c239123-a556-40d3-b086-b689752c6305/.user_uploaded/media_1789960259918.jpg';
const OUTPUT_DIR = '/home/CHHENG/project/game-api/kapp-api/src/avatars';

// ── Measured values from the 1024 × 682 source image ──────────────────────
const IMG_W = 1024;
const IMG_H = 682;

// White border around the whole sprite sheet (pixels)
const MARGIN_TOP    = 10;
const MARGIN_BOTTOM = 10;
const MARGIN_LEFT   = 10;
const MARGIN_RIGHT  = 10;

const COLS = 6;
const ROWS = 5;

// Usable area after stripping margins
const contentW = IMG_W - MARGIN_LEFT - MARGIN_RIGHT;  // 1004
const contentH = IMG_H - MARGIN_TOP  - MARGIN_BOTTOM; // 662

// Each cell's width and height inside the content zone
const cellW = contentW / COLS;  // ≈ 167.3
const cellH = contentH / ROWS;  // ≈ 132.4

// Use the shorter dimension as the square side so no clipping occurs.
// A small padding (4px) is subtracted to keep white gap out of the frame.
const PADDING  = 4;
const squareSz = Math.floor(Math.min(cellW, cellH)) - PADDING * 2;  // ≈ 124

console.log(`Content zone : ${contentW} × ${contentH}`);
console.log(`Cell size    : ${cellW.toFixed(1)} × ${cellH.toFixed(1)}`);
console.log(`Square crop  : ${squareSz} × ${squareSz} px (centered per cell)`);

// ── Recreate output directory ───────────────────────────────────────────────
fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Crop all 30 avatars ─────────────────────────────────────────────────────
const promises = [];
let count = 0;

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    count++;
    const num      = String(count).padStart(2, '0');
    const outPath  = path.join(OUTPUT_DIR, `avatar_${num}.png`);

    // Center of this cell in image coordinates
    const centerX = MARGIN_LEFT + (col + 0.5) * cellW;
    const centerY = MARGIN_TOP  + (row + 0.5) * cellH;

    // Top-left corner of the square crop
    const cropLeft = Math.round(centerX - squareSz / 2);
    const cropTop  = Math.round(centerY - squareSz / 2);

    // Clamp to image bounds (safety)
    const safeLeft = Math.max(0, cropLeft);
    const safeTop  = Math.max(0, cropTop);
    const safeW    = Math.min(squareSz, IMG_W - safeLeft);
    const safeH    = Math.min(squareSz, IMG_H - safeTop);

    const p = sharp(INPUT)
      .extract({ left: safeLeft, top: safeTop, width: safeW, height: safeH })
      .png()
      .toFile(outPath)
      .then(() => console.log(`✅  avatar_${num}.png  [row ${row+1} col ${col+1}]  center=(${Math.round(centerX)},${Math.round(centerY)})  crop=(${safeLeft},${safeTop})`))
      .catch(err => console.error(`❌  avatar_${num} – ${err.message}`));

    promises.push(p);
  }
}

await Promise.all(promises);
console.log(`\n🎉  Done! ${count} avatars → ${OUTPUT_DIR}`);

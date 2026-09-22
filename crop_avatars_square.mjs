/**
 * crop_avatars_square.mjs
 *
 * Crops all avatar images into square frames with the avatar centered.
 * Uses smart content-aware detection to find avatar bounds, pads with white
 * background, and produces uniform 200x200px square outputs.
 *
 * Usage: node crop_avatars_square.mjs
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT_DIR = path.join(__dirname, 'src/avatars');
const OUTPUT_DIR = path.join(__dirname, 'src/avatars/square');
const OUTPUT_SIZE = 200; // Final square size in pixels
const PADDING_RATIO = 0.10; // Extra padding around detected content (10%)

/**
 * Analyze pixel data to find the bounding box of non-background content.
 * Background = transparent or near-white pixels.
 */
function findContentBounds(data, width, height, channels) {
  let minX = width, maxX = 0;
  let minY = height, maxY = 0;

  const isBackground = (r, g, b, a) => {
    if (a < 15) return true;           // Transparent
    return r > 238 && g > 238 && b > 238; // Near-white
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = channels === 4 ? data[idx + 3] : 255;

      if (!isBackground(r, g, b, a)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Fallback: full image bounds
  if (minX > maxX || minY > maxY) {
    return { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1 };
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Process a single avatar: detect content center, pad and crop to square.
 * Uses two-step pipeline (extend → toBuffer → extract) to work around
 * sharp's limitation where extract() uses original (pre-extend) dimensions.
 */
async function processAvatar(inputPath, outputPath) {
  const metadata = await sharp(inputPath).metadata();
  const origW = metadata.width;
  const origH = metadata.height;

  // Get raw RGBA pixel data for content detection
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { minX, minY, maxX, maxY } = findContentBounds(
    data, info.width, info.height, info.channels
  );

  // Content center (integer)
  const cx = Math.round((minX + maxX) / 2);
  const cy = Math.round((minY + maxY) / 2);

  // Square size = largest content dimension + padding on each side
  const contentSize = Math.max(maxX - minX, maxY - minY);
  const padding = Math.round(contentSize * PADDING_RATIO);
  const sq = contentSize + padding * 2;

  // Compute how much to extend each edge so the square fits around the center
  const halfSq = Math.ceil(sq / 2);
  const extL = Math.max(0, halfSq - cx);
  const extR = Math.max(0, cx + halfSq - origW + 1);
  const extT = Math.max(0, halfSq - cy);
  const extB = Math.max(0, cy + halfSq - origH + 1);

  // Step 1: Extend the canvas with white padding → intermediate buffer
  const extended = await sharp(inputPath)
    .extend({
      top: extT,
      bottom: extB,
      left: extL,
      right: extR,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toBuffer();

  // Step 2: Extract square centered on avatar, then resize to target
  const newCX = cx + extL;
  const newCY = cy + extT;
  const cropL = newCX - Math.floor(sq / 2);
  const cropT = newCY - Math.floor(sq / 2);

  await sharp(extended)
    .extract({ left: cropL, top: cropT, width: sq, height: sq })
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  return {
    file: path.basename(inputPath),
    original: `${origW}x${origH}`,
    bounds: `(${minX},${minY})→(${maxX},${maxY})`,
    center: `(${cx},${cy})`,
    squareSize: sq,
    extend: `L${extL} R${extR} T${extT} B${extB}`,
    crop: `(${cropL},${cropT}) ${sq}x${sq}`,
    output: `${OUTPUT_SIZE}x${OUTPUT_SIZE}`
  };
}

async function main() {
  console.log('🎨 Avatar Square Crop Tool');
  console.log('==========================\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Pick only avatar_XX.png files (skip subdirectories)
  const files = (await fs.readdir(INPUT_DIR))
    .filter(f => /^avatar_\d+\.png$/.test(f))
    .sort((a, b) => {
      return parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]);
    });

  if (files.length === 0) {
    console.error('❌ No avatar PNG files found in', INPUT_DIR);
    process.exit(1);
  }

  console.log(`📁 Input:  ${INPUT_DIR}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`🖼️  Found ${files.length} avatars`);
  console.log(`📐 Output: ${OUTPUT_SIZE}x${OUTPUT_SIZE}px each\n`);

  let success = 0, failed = 0;

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);

    try {
      const info = await processAvatar(inputPath, outputPath);
      console.log(`✅ ${info.file}`);
      console.log(`   ${info.original} → bounds ${info.bounds} | center ${info.center} | sq ${info.squareSize}px`);
      console.log(`   extend: ${info.extend} | crop: ${info.crop} → ${info.output}`);
      success++;
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${success}  ❌ Failed: ${failed}`);
  console.log(`📂 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);

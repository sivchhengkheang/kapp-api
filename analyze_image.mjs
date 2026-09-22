import sharp from 'sharp';

const INPUT = '/home/CHHENG/.gemini/antigravity-ide/brain/6c239123-a556-40d3-b086-b689752c6305/.user_uploaded/media_1789960259918.jpg';

const img = sharp(INPUT);
const meta = await img.metadata();
const { width, height } = meta;
console.log(`Image: ${width} x ${height}`);

// Get raw pixel data (RGB)
const { data } = await img.raw().toBuffer({ resolveWithObject: true });

const WHITE_THRESH = 240;

// Find first non-white pixel from each edge
let topMargin = 0, bottomMargin = 0, leftMargin = 0, rightMargin = 0;

// Top
topLoop: for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 3;
    if (data[i] < WHITE_THRESH || data[i+1] < WHITE_THRESH || data[i+2] < WHITE_THRESH) {
      topMargin = y; break topLoop;
    }
  }
}
// Bottom
botLoop: for (let y = height - 1; y >= 0; y--) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 3;
    if (data[i] < WHITE_THRESH || data[i+1] < WHITE_THRESH || data[i+2] < WHITE_THRESH) {
      bottomMargin = height - 1 - y; break botLoop;
    }
  }
}
// Left
leftLoop: for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    const i = (y * width + x) * 3;
    if (data[i] < WHITE_THRESH || data[i+1] < WHITE_THRESH || data[i+2] < WHITE_THRESH) {
      leftMargin = x; break leftLoop;
    }
  }
}
// Right
rightLoop: for (let x = width - 1; x >= 0; x--) {
  for (let y = 0; y < height; y++) {
    const i = (y * width + x) * 3;
    if (data[i] < WHITE_THRESH || data[i+1] < WHITE_THRESH || data[i+2] < WHITE_THRESH) {
      rightMargin = width - 1 - x; break rightLoop;
    }
  }
}

console.log(`Margins: top=${topMargin} bottom=${bottomMargin} left=${leftMargin} right=${rightMargin}`);

const usableW = width  - leftMargin - rightMargin;
const usableH = height - topMargin  - bottomMargin;
const COLS = 6, ROWS = 5;
const cellW = usableW / COLS;
const cellH = usableH / ROWS;
console.log(`Usable area: ${usableW} x ${usableH}`);
console.log(`Cell: ${cellW.toFixed(1)} w x ${cellH.toFixed(1)} h`);
console.log(`Square size (min dim): ${Math.min(cellW, cellH).toFixed(1)}`);

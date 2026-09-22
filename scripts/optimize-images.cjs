const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const directories = [
  path.join(__dirname, '../public/assets/products'),
  path.join(__dirname, '../public/assets'),
];

async function optimizeDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  let originalTotal = 0;
  let optimizedTotal = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    originalTotal += stat.size;

    try {
      const buffer = fs.readFileSync(filePath);
      const baseName = path.basename(file, ext);
      const webpPath = path.join(dir, `${baseName}.webp`);

      // 1. Generate WebP version (max width/height 640px)
      await sharp(buffer)
        .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(webpPath);

      // 2. Re-optimize the original file in place with max width 640px and high quality
      if (ext === '.jpg' || ext === '.jpeg') {
        const optimizedJpg = await sharp(buffer)
          .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true })
          .toBuffer();
        fs.writeFileSync(filePath, optimizedJpg);
        optimizedTotal += optimizedJpg.length;
      } else if (ext === '.png') {
        // If it was a photo disguised as PNG, convert compression
        const optimizedPng = await sharp(buffer)
          .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
          .png({ compressionLevel: 8, palette: true })
          .toBuffer();
        fs.writeFileSync(filePath, optimizedPng);
        optimizedTotal += optimizedPng.length;
      }
    } catch (err) {
      console.error(`Error optimizing ${file}:`, err.message);
      optimizedTotal += stat.size;
    }
  }

  console.log(`Directory ${path.basename(dir)}: ${(originalTotal / (1024 * 1024)).toFixed(2)} MB -> ${(optimizedTotal / (1024 * 1024)).toFixed(2)} MB`);
}

async function main() {
  console.log('Starting image optimization...');
  for (const dir of directories) {
    await optimizeDirectory(dir);
  }
  console.log('Optimization complete!');
}

main();

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDirs = [
  path.join(__dirname, '../public/assets/products'),
  path.join(__dirname, '../public/assets')
];

async function hyperCompressDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  console.log(`\n========================================`);
  console.log(`Optimizing: ${path.basename(dir)}`);
  console.log(`========================================`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    if (!['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const baseName = path.basename(file, ext);
    totalBefore += stat.size;

    try {
      const inputBuffer = fs.readFileSync(fullPath);

      // Generate ultra-compressed WebP version
      const webpPath = path.join(dir, `${baseName}.webp`);
      const compressedWebp = await sharp(inputBuffer)
        .resize({ width: 540, height: 540, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 74, effort: 6, smartSubsample: true })
        .toBuffer();

      fs.writeFileSync(webpPath, compressedWebp);

      // If original is JPG/JPEG, compress JPG in place
      if (ext === '.jpg' || ext === '.jpeg') {
        const compressedJpg = await sharp(inputBuffer)
          .resize({ width: 540, height: 540, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 74, mozjpeg: true })
          .toBuffer();
        fs.writeFileSync(fullPath, compressedJpg);
      }

      // If original is PNG, compress PNG in place
      if (ext === '.png') {
        const compressedPng = await sharp(inputBuffer)
          .resize({ width: 540, height: 540, fit: 'inside', withoutEnlargement: true })
          .png({ compressionLevel: 9, palette: true, quality: 74 })
          .toBuffer();
        fs.writeFileSync(fullPath, compressedPng);
      }

      const newStat = fs.statSync(fullPath);
      totalAfter += newStat.size;

      const webpStat = fs.existsSync(webpPath) ? fs.statSync(webpPath).size : 0;
      console.log(`✔ ${file.padEnd(28)} | Orig: ${(stat.size / 1024).toFixed(1)} KB -> WebP: ${(webpStat / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(`✖ Failed to compress ${file}:`, err.message);
      totalAfter += stat.size;
    }
  }

  const savedKB = (totalBefore - totalAfter) / 1024;
  const pct = totalBefore > 0 ? ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1) : 0;
  console.log(`Directory Total: ${(totalBefore / 1024).toFixed(1)} KB -> ${(totalAfter / 1024).toFixed(1)} KB (Saved ${savedKB.toFixed(1)} KB / ${pct}%)`);
}

async function run() {
  console.log('🚀 Starting Maximum Image Compression...');
  for (const dir of targetDirs) {
    await hyperCompressDir(dir);
  }
  console.log('\n🎉 Image compression complete! All images optimized.');
}

run();
